import { PLANS, planOf, startOfMonthISO } from "@/lib/plans";
import type { Report } from "@/lib/runner/types";
import { createClient } from "@/lib/supabase/server";

const DAY = 86_400_000;

export type TestItem = {
  id: string;
  url: string;
  host: string;
  status: "queued" | "running" | "done" | "failed";
  phase: string | null;
  error: string | null;
  created_at: string;
  score: number | null;
  verdict: string | null;
  summary: string | null;
  issues: number | null;
  sev: { critical: number; high: number; medium: number; low: number } | null;
  works: number | null;
  top: { severity: string; title: string }[];
  shareToken: string;
  thumb: string | null;
};

export function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export async function getDashboardData() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const { data: tests } = await supabase
    .from("tests")
    .select("id,url,status,phase,error,created_at,report,share_token")
    .order("created_at", { ascending: false })
    .limit(200);
  const rows = (tests ?? []).map((t) => ({ ...t, report: t.report as Report | null }));

  // miniatura = print da primeira etapa de cada teste
  const ids = rows.slice(0, 80).map((t) => t.id);
  const { data: firstSteps } = ids.length
    ? await supabase.from("test_steps").select("test_id,screenshot_path").in("test_id", ids).eq("idx", 0)
    : { data: [] };
  const thumbs = new Map((firstSteps ?? []).map((s) => [s.test_id, s.screenshot_path as string | null]));

  const items: TestItem[] = rows.map((t) => {
    const issues = t.report?.issues;
    const count = (s: string) => issues?.filter((i) => i.severity === s).length ?? 0;
    return {
      id: t.id,
      url: t.url,
      host: hostOf(t.url),
      status: t.status,
      phase: t.phase,
      error: t.error,
      created_at: t.created_at,
      score: t.report?.clarity?.score ?? null,
      verdict: t.report?.clarity?.verdict ?? null,
      summary: t.report?.summary ?? null,
      issues: issues ? issues.length : null,
      sev: issues ? { critical: count("critical"), high: count("high"), medium: count("medium"), low: count("low") } : null,
      works: t.report?.works?.length ?? null,
      top: (issues ?? []).slice(0, 3).map((i) => ({ severity: i.severity, title: i.title })),
      shareToken: t.share_token,
      thumb: thumbs.get(t.id) ?? null,
    };
  });

  // ---- visão do mês ----
  const since = startOfMonthISO();
  const month = rows.filter((t) => t.created_at >= since);
  const scored = rows.filter((t) => t.report?.clarity);
  const avgClarity = scored.length ? scored.reduce((a, t) => a + t.report!.clarity.score, 0) / scored.length : null;
  const issuesTotal = month.reduce((a, t) => a + (t.report?.issues?.length ?? 0), 0);

  // 4 janelas de 7 dias terminando hoje (da mais antiga para a atual)
  const now = Date.now();
  const weeks = [3, 2, 1, 0].map((back) => {
    const end = now - back * 7 * DAY;
    const start = end - 7 * DAY;
    const inWeek = items.filter((t) => {
      const ts = new Date(t.created_at).getTime();
      return ts > start && ts <= end;
    });
    return {
      label: new Date(end).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", ""),
      count: inWeek.length,
      issues: inWeek.reduce((a, t) => a + (t.issues ?? 0), 0),
      clarity: (() => {
        const sc = inWeek.map((t) => t.score).filter((v): v is number => v !== null);
        return sc.length ? sc.reduce((a, v) => a + v, 0) / sc.length : null;
      })(),
      sites: [...new Set(inWeek.map((t) => t.host))],
      current: back === 0,
    };
  });

  const limit = PLANS[planOf()].tests;
  const email = auth.user?.email ?? "";

  return {
    items,
    email,
    name: email.split("@")[0] || "Você",
    plan: PLANS[planOf()].name,
    limit,
    used: month.length,
    remaining: Math.max(0, limit - month.length),
    avgClarity,
    issuesTotal,
    weeks,
    onboarding: {
      account: true,
      firstTest: rows.length > 0,
      openedReport: rows.some((t) => t.status === "done"), // TODO: registrar abertura real do relatório
      shared: false, // TODO: registrar quando o link público for copiado
    },
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;
