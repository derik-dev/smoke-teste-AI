"use client";

import gsap from "gsap";
import { useLayoutEffect, useRef } from "react";

const URL_TEXT = "meusite.com.br";
const STEPS = [
  { label: "Página inicial carrega", ok: true },
  { label: "Layout no celular", ok: true },
  { label: "Botão do WhatsApp abre a conversa", ok: true },
  { label: "Formulário de contato envia", ok: false },
];

/** Mini-teste em loop: o estado vazio mostra o produto trabalhando. */
export function EmptyPreview() {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = root.current!;
    const ctx = gsap.context(() => {
      const urlEl = root.current!.querySelector<HTMLElement>("[data-url]")!;
      const scoreEl = root.current!.querySelector<HTMLElement>("[data-score]")!;
      const typed = { n: 0 };
      const score = { v: 0 };
      const labels = STEPS.map((_, i) => root.current!.querySelector<HTMLElement>(`[data-label="${i}"]`)!);

      const tl = gsap.timeline({ repeat: -1, repeatDelay: 2.6 });
      tl.set("[data-step]", { opacity: 0, y: 12 })
        .set("[data-res]", { opacity: 0, scale: 0.6 })
        .set("[data-spin]", { opacity: 1 })
        .set("[data-final]", { opacity: 0, y: 10 })
        .set(typed, { n: 0 })
        .set(score, { v: 0 })
        .call(() => {
          urlEl.textContent = "";
          scoreEl.textContent = "0.0";
          labels.forEach((l) => (l.textContent = ""));
        })
        .set("[data-scan]", { top: "0%", opacity: 1 })
        .to(typed, {
          n: URL_TEXT.length,
          duration: 1,
          ease: "none",
          onUpdate: () => {
            urlEl.textContent = URL_TEXT.slice(0, Math.round(typed.n));
          },
        })
        .to("[data-scan]", { top: "96%", duration: 8.5, ease: "none" }, "<0.3");

      STEPS.forEach((step, i) => {
        const t = { n: 0 };
        tl.to(`[data-step="${i}"]`, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, i === 0 ? ">0.1" : ">0.35")
          .to(t, {
            n: step.label.length,
            duration: step.label.length * 0.03,
            ease: "none",
            onUpdate: () => {
              labels[i].textContent = step.label.slice(0, Math.round(t.n));
            },
          })
          .to(`[data-step="${i}"] [data-spin]`, { opacity: 0, duration: 0.15 }, ">0.3")
          .to(`[data-step="${i}"] [data-res]`, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(3)" }, "<");
      });

      tl.to("[data-final]", { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, ">0.3").to(
        score,
        {
          v: 6.5,
          duration: 1.1,
          ease: "power2.out",
          onUpdate: () => {
            scoreEl.textContent = score.v.toFixed(1);
          },
        },
        "<",
      );
    }, root);
    return () => {
      ctx.revert();
      STEPS.forEach((s, i) => {
        const label = el.querySelector<HTMLElement>(`[data-label="${i}"]`);
        if (label) label.textContent = s.label;
      });
    };
  }, []);

  return (
    <div ref={root} className="mx-auto w-full max-w-3xl">
      <div className="overflow-hidden rounded-[16px] border border-line bg-surface-2">
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-line-strong" />
            <span className="size-2.5 rounded-full bg-line-strong" />
            <span className="size-2.5 rounded-full bg-line-strong" />
          </div>
          <div className="flex h-7 min-w-0 flex-1 items-center rounded-[8px] bg-bg px-3 font-mono text-xs text-muted">
            <span className="text-accent/70">https://</span>
            <span data-url>{URL_TEXT}</span>
            <span className="ml-px h-3.5 w-px animate-pulse bg-accent" />
          </div>
        </div>

        <div className="grid gap-0 md:grid-cols-[0.9fr_1.1fr]">
          {/* página fictícia sendo varrida */}
          <div className="relative hidden overflow-hidden border-r border-line p-5 md:block">
            <div className="h-3 w-2/5 rounded bg-white/10" />
            <div className="mt-5 h-7 w-4/5 rounded bg-white/15" />
            <div className="mt-2 h-7 w-3/5 rounded bg-white/15" />
            <div className="mt-4 h-2.5 w-11/12 rounded bg-white/8" />
            <div className="mt-2 h-2.5 w-9/12 rounded bg-white/8" />
            <div className="mt-6 h-9 w-32 rounded-lg bg-accent/30" />
            <div className="mt-8 grid grid-cols-3 gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-16 rounded-lg bg-white/6" />
              ))}
            </div>
            <div
              data-scan
              className="absolute inset-x-0 h-12 -translate-y-1/2"
              style={{ background: "linear-gradient(to bottom, transparent, color-mix(in oklab, var(--accent) 22%, transparent), transparent)" }}
            >
              <div className="absolute inset-x-0 top-1/2 h-px bg-accent shadow-[0_0_14px_var(--accent)]" />
            </div>
          </div>

          {/* passos */}
          <ul className="space-y-3.5 p-5 text-sm">
            {STEPS.map((s, i) => (
              <li key={s.label} data-step={i} className="flex items-center justify-between gap-3">
                <span data-label={i}>{s.label}</span>
                <span className="relative grid size-5 shrink-0 place-items-center">
                  <span
                    data-spin
                    className="absolute size-4 animate-spin rounded-full border-2 border-muted/40 border-t-accent"
                  />
                  <span
                    data-res
                    className={`absolute grid size-5 place-items-center rounded-full text-[11px] font-bold text-accent-ink ${s.ok ? "bg-accent" : "bg-danger"}`}
                  >
                    {s.ok ? "✓" : "✕"}
                  </span>
                </span>
              </li>
            ))}
            <li data-final className="flex items-end justify-between border-t border-line pt-4">
              <span className="text-muted">Clareza em 5 segundos</span>
              <span className="text-stat text-warn">
                <span data-score>6.5</span>
                <span className="text-lg text-muted"> /10</span>
              </span>
            </li>
          </ul>
        </div>
      </div>
      <p className="mt-5 text-center text-sm text-muted">
        Seu primeiro relatório aparece aqui.
      </p>
    </div>
  );
}
