import type { DashboardData } from "@/lib/dashboard-data";
import { Sparkline } from "./sparkline";

function Metric({
  label,
  value,
  unit,
  caption,
  series,
  count,
  decimals = 0,
}: {
  label: string;
  value: string;
  unit?: string;
  caption: string;
  series: (number | null)[];
  count?: number;
  decimals?: number;
}) {
  const spark = <Sparkline values={series} />;
  return (
    <div data-reveal className="card card-hover flex min-w-0 flex-col justify-between gap-6 overflow-hidden p-6">
      <p className="text-sm text-muted">{label}</p>
      <div className="flex items-end justify-between gap-4">
        <p className="text-stat min-w-0 truncate">
          <span data-count={count} data-decimals={decimals}>{value}</span>
          {unit && <span className="ml-1.5 font-sans text-sm text-muted">{unit}</span>}
        </p>
        <div className="shrink-0">{spark}</div>
      </div>
      <p className="-mt-3 text-xs text-muted">{caption}</p>
    </div>
  );
}

export function OverviewPanel({ d, className = "" }: { d: DashboardData; className?: string }) {
  const empty = d.used === 0;
  const hasClarity = d.avgClarity !== null;

  return (
    <section className={`grid gap-6 md:grid-cols-3 ${className}`}>
      <Metric
        label="Testes no mês"
        value={empty ? "—" : String(d.used)}
        unit={empty ? undefined : `de ${d.limit}`}
        count={empty ? undefined : d.used}
        caption={empty ? "Rode um teste para começar a contar." : "Evolução das últimas 4 semanas."}
        series={empty ? [] : d.weeks.map((w) => w.count)}
      />
      <Metric
        label="Clareza média"
        value={hasClarity ? d.avgClarity!.toFixed(1) : "—"}
        unit={hasClarity ? "/10" : undefined}
        count={hasClarity ? d.avgClarity! : undefined}
        decimals={1}
        caption={hasClarity ? "Quão rápido o site se explica." : "A nota aparece após o primeiro relatório."}
        series={d.weeks.map((w) => w.clarity)}
      />
      <Metric
        label="Problemas"
        value={empty ? "—" : String(d.issuesTotal)}
        unit={empty ? undefined : "achados"}
        count={empty ? undefined : d.issuesTotal}
        caption={empty ? "Os achados dos testes aparecem aqui." : "Somados em todos os testes do mês."}
        series={empty ? [] : d.weeks.map((w) => w.issues)}
      />
    </section>
  );
}
