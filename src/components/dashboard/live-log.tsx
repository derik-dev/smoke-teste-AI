"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Step = { idx: number; device: string; title: string; description: string | null; status: "ok" | "warn" | "fail" };

/** Acompanha um teste em andamento: busca o status a cada 2s e mostra os passos num log estilo terminal. */
export function LiveLog({ id, initialPhase }: { id: string; initialPhase: string | null }) {
  const router = useRouter();
  const [phase, setPhase] = useState(initialPhase);
  const [steps, setSteps] = useState<Step[]>([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let stop = false;
    let timer: ReturnType<typeof setTimeout>;
    async function tick() {
      try {
        const res = await fetch(`/api/tests/${id}`, { cache: "no-store" });
        if (res.ok && !stop) {
          const data = await res.json();
          setPhase(data.test.phase);
          setSteps(data.steps);
          if (data.test.status === "done" || data.test.status === "failed") {
            router.refresh();
            return;
          }
          setFailed(false);
        }
      } catch {
        if (!stop) setFailed(true);
      }
      if (!stop) timer = setTimeout(tick, 2000);
    }
    tick();
    return () => {
      stop = true;
      clearTimeout(timer);
    };
  }, [id, router]);

  const pct = Math.min(94, 8 + steps.length * 11);

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="relative flex size-2.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
          <span className="relative inline-flex size-2.5 rounded-full bg-accent" />
        </span>
        <p className="text-sm">{phase || "Na fila..."}</p>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-accent shadow-[0_0_12px_#a6ff3d] transition-[width] duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-4 min-h-40 rounded-xl border border-white/8 bg-black/50 p-4 font-mono text-[12.5px] leading-relaxed">
        {steps.length === 0 && <p className="text-muted">› iniciando navegador...</p>}
        {steps.map((s) => (
          <p key={s.idx} className="text-muted">
            <span className={s.status === "ok" ? "text-accent" : s.status === "warn" ? "text-warn" : "text-danger"}>
              {s.status === "ok" ? "✓" : s.status === "warn" ? "!" : "✕"}
            </span>{" "}
            <span className="text-fg">[{s.device === "mobile" ? "mobile" : "desktop"}]</span> {s.title}
            {s.description ? ` — ${s.description}` : ""}
          </p>
        ))}
        <p className="text-fg">
          <span className="text-warn">›</span> {phase || "aguardando"}
          <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse bg-accent" />
        </p>
        {failed && <p className="mt-2 text-danger">Sem conexão com o servidor. Tentando de novo...</p>}
      </div>
    </div>
  );
}
