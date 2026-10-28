import type { BrowserContext, Page } from "playwright-core";
import type { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { launchBrowser } from "./browser";
import { askJson, type Shot } from "./llm";
import { isPublicHost } from "./ssrf";
import { scanPage, type PageScan } from "./scan";
import { actionSchema, finalSchema, understandSchema, type Report } from "./types";

const MAX_STEPS = Number(process.env.MAX_STEPS_PER_TEST || 8);
const TOTAL_TIMEOUT_MS = 240_000;
const DESKTOP = { width: 1366, height: 768 };
const MOBILE = { width: 390, height: 844 };

const SYSTEM = `Você é o Smoke Tester, um QA que testa sites como um usuário real. Escreva em português do Brasil, direto e sem enrolação. Nunca invente o que não viu na página ou nos prints.`;

type StepLog = { title: string; status: "ok" | "warn" | "fail"; note: string; device: string };

export async function runTest(testId: string) {
  const db = createAdminClient();
  const { data: test } = await db.from("tests").select("url").eq("id", testId).single();
  if (!test) return;

  const setPhase = (phase: string) =>
    db.from("tests").update({ status: "running", phase }).eq("id", testId);

  const browser = await launchBrowser().catch(async (e) => {
    await db.from("tests").update({ status: "failed", error: `Navegador indisponível: ${e.message}` }).eq("id", testId);
    return null;
  });
  if (!browser) return;

  const timer = setTimeout(() => browser.close().catch(() => {}), TOTAL_TIMEOUT_MS);
  let idx = 0;
  const log: StepLog[] = [];
  const consoleErrors: string[] = [];
  const failedRequests: string[] = [];

  async function shot(page: Page): Promise<Shot & { buf: Buffer }> {
    const buf = await page.screenshot({ type: "jpeg", quality: 70 });
    return { buf, base64: buf.toString("base64") };
  }

  async function record(
    page: Page,
    device: "desktop" | "mobile",
    title: string,
    status: "ok" | "warn" | "fail",
    description: string,
    image?: Buffer,
  ) {
    const buf = image ?? (await shot(page)).buf;
    const path = `${testId}/${idx}-${device}.jpg`;
    await db.storage.from("screenshots").upload(path, buf, { contentType: "image/jpeg", upsert: true });
    await db.from("test_steps").insert({
      test_id: testId,
      idx: idx++,
      device,
      title,
      description,
      status,
      screenshot_path: path,
    });
    log.push({ title, status, note: description, device });
  }

  async function newContext(viewport: { width: number; height: number }, mobile: boolean): Promise<BrowserContext> {
    const ctx = await browser!.newContext({
      viewport,
      isMobile: mobile,
      hasTouch: mobile,
      deviceScaleFactor: mobile ? 2 : 1,
      locale: "pt-BR",
    });
    // bloqueia qualquer requisição que resolva para rede interna (SSRF)
    await ctx.route("**/*", async (route) => {
      const host = new URL(route.request().url()).hostname;
      if (await isPublicHost(host)) return route.continue();
      return route.abort("blockedbyclient");
    });
    return ctx;
  }

  try {
    // 1. Desktop: carrega e escaneia
    await setPhase("Abrindo o site no desktop");
    const desktop = await newContext(DESKTOP, false);
    const page = await desktop.newPage();
    page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text().slice(0, 200)));
    page.on("pageerror", (e) => consoleErrors.push(e.message.slice(0, 200)));
    page.on("response", (r) => {
      if (r.status() >= 400) failedRequests.push(`${r.status()} ${r.url().slice(0, 150)}`);
    });

    const response = await page.goto(test.url, { waitUntil: "load", timeout: 30_000 });
    await page.waitForTimeout(1500);
    const first = await shot(page);
    const home = await scanPage(page);
    const loadOk = !!response && response.status() < 400;
    await record(
      page,
      "desktop",
      "Página inicial (desktop)",
      loadOk ? "ok" : "fail",
      loadOk ? `Carregou com status ${response!.status()}.` : `Falhou ao carregar (status ${response?.status() ?? "sem resposta"}).`,
      first.buf,
    );
    if (!loadOk) throw new Error("O site não carregou.");

    // 2. Mobile
    await setPhase("Testando no celular");
    const mobileCtx = await newContext(MOBILE, true);
    const mPage = await mobileCtx.newPage();
    await mPage.goto(test.url, { waitUntil: "load", timeout: 30_000 });
    await mPage.waitForTimeout(1200);
    const mScan = await scanPage(mPage);
    await record(
      mPage,
      "mobile",
      "Página inicial (celular)",
      mScan.horizontalOverflow ? "fail" : "ok",
      mScan.horizontalOverflow ? "Layout estoura a largura da tela (scroll horizontal)." : "Layout se ajusta à tela do celular.",
    );
    await mobileCtx.close();

    // 3. Entendimento + nota de clareza (só o que aparece nos primeiros 5s)
    await setPhase("Entendendo o produto");
    const understand = await askJson({
      system: SYSTEM,
      schema: understandSchema,
      shots: [first],
      prompt: `Abaixo está o print da primeira tela do site e um resumo da página.
Descreva o produto (nome, resumo de 1-2 frases, público, como cobra — "não informado" se não achar —, fluxo principal).
Depois dê a nota de clareza de 0 a 10: "em 5 segundos, dá pra entender o que o site vende?". Julgue principalmente pelo print e pelo título principal.
JSON: {"product":{"name","summary","audience","pricing","main_flow"},"clarity":{"score","verdict","reason"}}

Título: ${home.title}
Meta description: ${home.metaDescription}
Títulos: ${home.headings.join(" | ")}
Texto: ${home.text.slice(0, 1500)}`,
    });

    // 4. Agente: explora o fluxo principal com limite de passos
    let state: PageScan = home;
    let current = first;
    let last: { action: string; result: string } | null = null;
    for (let i = 0; i < MAX_STEPS; i++) {
      await setPhase(`Navegando pelo site (passo ${i + 1} de ${MAX_STEPS})`);
      const decision: z.infer<typeof actionSchema> = await askJson({
        system: SYSTEM,
        schema: actionSchema,
        shots: [current],
        maxTokens: 700,
        prompt: `Você está testando o fluxo principal deste site: ${understand.product.main_flow}.
${last ? `Ação anterior: ${last.action}\nResultado observado: ${last.result}\nAvalie se a ação anterior funcionou (previous_outcome ok/warn/fail + previous_note curta).` : "Esta é a primeira ação: previous_outcome e previous_note = null."}
Escolha a próxima ação mais útil para validar o que um cliente faria (abrir menu, clicar no CTA, abrir WhatsApp, preencher formulário com dados fictícios, etc.). Use "done" quando já cobriu o essencial. Não faça logout, compra real nem exclusões.
Para "type": informe index do campo e text fictício (ex.: nome "Teste QA", email "qa+teste@example.com").
JSON: {"previous_outcome","previous_note","action":"click|type|done","index","text","title":"o que está sendo testado, curto","reason"}

URL atual: ${state.url}
Formulários: ${state.forms}
Elementos interativos:
${state.interactive.map((e) => `[${e.idx}] <${e.tag}${e.type ? ` type=${e.type}` : ""}> "${e.text}"${e.href ? ` → ${e.href.slice(0, 80)}` : ""}${e.required ? " (obrigatório)" : ""}`).join("\n")}`,
      });

      if (decision.previous_outcome && log.length > 0) {
        const prev = log[log.length - 1];
        prev.status = decision.previous_outcome;
        prev.note = decision.previous_note || prev.note;
        await db
          .from("test_steps")
          .update({ status: prev.status, description: prev.note })
          .eq("test_id", testId)
          .eq("idx", idx - 1);
      }
      if (decision.action === "done" || decision.index == null) break;

      const target = page.locator(`[data-st-idx="${decision.index}"]`).first();
      const popupPromise = desktop.waitForEvent("page", { timeout: 4000 }).catch(() => null);
      const beforeUrl = page.url();
      const errorsBefore = consoleErrors.length;
      let result: string;
      try {
        if (decision.action === "type") {
          await target.fill(decision.text ?? "teste", { timeout: 5000 });
          result = "Campo preenchido.";
        } else {
          await target.click({ timeout: 5000 });
          result = "Clique executado.";
        }
        await page.waitForTimeout(1500);
        const popup = await popupPromise;
        if (popup) {
          result += ` Abriu nova aba: ${popup.url().slice(0, 120)}.`;
          await popup.close().catch(() => {});
        }
        if (page.url() !== beforeUrl) result += ` Navegou para ${page.url().slice(0, 120)}.`;
        const newErrors = consoleErrors.length - errorsBefore;
        if (newErrors > 0) result += ` ${newErrors} erro(s) no console: ${consoleErrors.slice(-1)[0]}`;
      } catch (e) {
        result = `Falhou: ${(e instanceof Error ? e.message : String(e)).split("\n")[0].slice(0, 160)}`;
      }

      current = await shot(page);
      state = await scanPage(page).catch(() => state);
      await record(page, "desktop", decision.title, result.startsWith("Falhou") ? "fail" : "ok", result, current.buf);
      last = { action: `${decision.action} no elemento ${decision.index} (${decision.title})`, result };
    }

    // 5. Relatório final
    await setPhase("Montando o relatório");
    const final = await askJson({
      system: SYSTEM,
      schema: finalSchema,
      maxTokens: 2500,
      prompt: `Monte o relatório de QA do site ${test.url}. Use apenas as evidências abaixo.
Liste "works" (o que funcionou) e "issues" priorizados da mais grave (critical) à mais leve (low). Cada issue com: severity, title curto, detail (o que aconteceu), where (página/elemento), fix (sugestão prática). Se nada quebrou, devolva issues vazio — não invente problemas.
JSON: {"summary":"2-3 frases","works":[string],"issues":[{"severity":"critical|high|medium|low","title","detail","where","fix"}]}

Produto: ${understand.product.summary}
Clareza: ${understand.clarity.score}/10 — ${understand.clarity.reason}
Passos executados:
${log.map((l, n) => `${n + 1}. [${l.device}] ${l.title} → ${l.status}: ${l.note}`).join("\n")}
Overflow horizontal no mobile: ${mScan.horizontalOverflow ? "SIM" : "não"}
Imagens quebradas (desktop/mobile): ${home.brokenImages}/${mScan.brokenImages}
Links de contato encontrados: ${home.contactLinks.join(", ") || "nenhum"}
Formulários na home: ${home.forms}
Erros de console: ${consoleErrors.slice(0, 8).join(" || ") || "nenhum"}
Requisições com erro: ${failedRequests.slice(0, 8).join(" || ") || "nenhuma"}`,
    });

    const report: Report = { ...understand, ...final };
    await db
      .from("tests")
      .update({ status: "done", phase: null, report, finished_at: new Date().toISOString() })
      .eq("id", testId);
  } catch (e) {
    await db
      .from("tests")
      .update({
        status: "failed",
        phase: null,
        error: e instanceof Error ? e.message.slice(0, 300) : "Erro inesperado",
        finished_at: new Date().toISOString(),
      })
      .eq("id", testId);
  } finally {
    clearTimeout(timer);
    await browser.close().catch(() => {});
  }
}
