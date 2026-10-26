import type { Report } from "@/lib/runner/types";
import { SeverityBadge, StatusBadge, screenshotUrl } from "./ui";

export type StepRow = {
  idx: number;
  device: "desktop" | "mobile";
  title: string;
  description: string | null;
  status: "ok" | "warn" | "fail";
  screenshot_path: string | null;
};

const ORDER = ["critical", "high", "medium", "low"] as const;

function scoreColor(score: number) {
  return score >= 8 ? "text-accent" : score >= 5 ? "text-warn" : "text-danger";
}

export function ReportView({ url, report, steps }: { url: string; report: Report; steps: StepRow[] }) {
  const issues = [...report.issues].sort((a, b) => ORDER.indexOf(a.severity) - ORDER.indexOf(b.severity));
  const failed = steps.filter((s) => s.status === "fail").length;

  return (
    <div className="space-y-10">
      <header>
        <p className="text-sm text-muted">Relatório de teste</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{report.product.name}</h1>
        <a href={url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-sm text-muted hover:text-fg">
          {url}
        </a>
        <p className="mt-4 max-w-2xl text-fg/80">{report.summary}</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-surface p-5">
          <p className="text-sm text-muted">Clareza em 5 segundos</p>
          <p className={`mt-2 text-5xl font-semibold ${scoreColor(report.clarity.score)}`}>
            {report.clarity.score.toFixed(1)}
            <span className="text-lg text-muted">/10</span>
          </p>
          <p className="mt-3 text-sm font-medium">{report.clarity.verdict}</p>
          <p className="mt-1 text-sm text-muted">{report.clarity.reason}</p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-5">
          <p className="text-sm text-muted">Problemas encontrados</p>
          <p className={`mt-2 text-5xl font-semibold ${issues.length ? "text-danger" : "text-accent"}`}>{issues.length}</p>
          <p className="mt-3 text-sm text-muted">
            {issues.filter((i) => i.severity === "critical" || i.severity === "high").length} graves
          </p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-5">
          <p className="text-sm text-muted">Etapas testadas</p>
          <p className="mt-2 text-5xl font-semibold">{steps.length}</p>
          <p className="mt-3 text-sm text-muted">{failed} com falha</p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">O que é o produto</h2>
        <dl className="mt-4 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
          {[
            ["O que é", report.product.summary],
            ["Para quem", report.product.audience],
            ["Como cobra", report.product.pricing],
            ["Fluxo principal", report.product.main_flow],
          ].map(([k, v]) => (
            <div key={k} className="bg-surface p-5">
              <dt className="text-sm text-muted">{k}</dt>
              <dd className="mt-1 text-sm">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Problemas priorizados</h2>
        {issues.length === 0 ? (
          <p className="mt-4 rounded-xl border border-line bg-surface p-5 text-sm text-accent">
            Nenhum problema encontrado nos fluxos testados.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {issues.map((i, n) => (
              <li key={n} className="rounded-xl border border-line bg-surface p-5">
                <div className="flex items-center gap-3">
                  <SeverityBadge level={i.severity} />
                  <h3 className="font-medium">{i.title}</h3>
                </div>
                <p className="mt-2 text-sm text-fg/80">{i.detail}</p>
                <p className="mt-2 text-xs text-muted">Onde: {i.where}</p>
                <p className="mt-3 rounded-lg bg-surface-2 p-3 text-sm">
                  <span className="text-accent">Como corrigir: </span>
                  {i.fix}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {report.works.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold">O que funcionou</h2>
          <ul className="mt-4 space-y-2">
            {report.works.map((w, n) => (
              <li key={n} className="flex gap-2 text-sm text-fg/80">
                <span className="text-accent">✓</span>
                {w}
              </li>
            ))}
          </ul>
        </section>
      )}

      <Gallery steps={steps} />
    </div>
  );
}

export function Gallery({ steps }: { steps: StepRow[] }) {
  if (steps.length === 0) return null;
  return (
    <section>
      <h2 className="text-lg font-semibold">Prints de cada etapa</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {steps.map((s) => (
          <figure key={s.idx} className="overflow-hidden rounded-xl border border-line bg-surface">
            {s.screenshot_path && (
              <div className={`bg-surface-2 ${s.device === "mobile" ? "flex justify-center py-4" : ""}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={screenshotUrl(s.screenshot_path)}
                  alt={s.title}
                  loading="lazy"
                  className={s.device === "mobile" ? "h-72 w-auto rounded-md border border-line" : "w-full"}
                />
              </div>
            )}
            <figcaption className="p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{s.title}</span>
                <StatusBadge status={s.status} />
              </div>
              <p className="mt-1 text-xs text-muted">
                {s.device === "mobile" ? "Celular" : "Desktop"} · {s.description}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
