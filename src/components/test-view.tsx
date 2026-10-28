"use client";

import { useEffect, useState } from "react";
import type { Report } from "@/lib/runner/types";
import { Gallery, ReportView, type StepRow } from "./report-view";

type TestRow = {
  id: string;
  url: string;
  status: "queued" | "running" | "done" | "failed";
  phase: string | null;
  report: Report | null;
  error: string | null;
  share_token: string;
};

export function TestView({ id }: { id: string }) {
  const [test, setTest] = useState<TestRow | null>(null);
  const [steps, setSteps] = useState<StepRow[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let stop = false;
    async function tick() {
      const res = await fetch(`/api/tests/${id}`, { cache: "no-store" });
      if (!res.ok || stop) return;
      const data = await res.json();
      setTest(data.test);
      setSteps(data.steps);
      if (!stop && ["queued", "running"].includes(data.test.status)) setTimeout(tick, 2000);
    }
    tick();
    return () => {
      stop = true;
    };
  }, [id]);

  if (!test) return <p className="text-sm text-muted">Carregando...</p>;

  if (test.status === "failed") {
    return (
      <div className="rounded-[16px] border border-danger/30 bg-danger/10 p-6">
        <h1 className="font-semibold text-danger">O teste não terminou</h1>
        <p className="mt-2 text-sm text-fg/80">{test.error || "Erro inesperado."}</p>
        <p className="mt-1 text-xs text-muted">{test.url}</p>
      </div>
    );
  }

  if (test.status === "done" && test.report) {
    const shareUrl = `${location.origin}/r/${test.share_token}`;
    return (
      <div>
        <div className="mb-8 flex flex-wrap items-center justify-end gap-3">
          <button
            onClick={() => {
              navigator.clipboard.writeText(shareUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="btn btn-ghost"
          >
            {copied ? "Link copiado!" : "Copiar link público"}
          </button>
          <button
            onClick={() => window.print()}
            className="btn btn-primary"
          >
            Baixar PDF
          </button>
        </div>
        <ReportView url={test.url} report={test.report} steps={steps} />
      </div>
    );
  }

  return (
    <div>
      <div className="card p-6">
        <div className="flex items-center gap-3">
          <span className="relative flex size-3">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex size-3 rounded-full bg-accent" />
          </span>
          <h1 className="font-semibold">Testando {test.url}</h1>
        </div>
        <p className="mt-3 text-sm text-muted">{test.phase || "Na fila..."}</p>
      </div>
      <div className="mt-8">
        <Gallery steps={steps} />
      </div>
    </div>
  );
}
