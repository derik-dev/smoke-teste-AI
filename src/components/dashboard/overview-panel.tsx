import type { DashboardData } from "@/lib/dashboard-data";
import { SiteAvatar } from "./site-avatar";

function Stat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div>
      <p className="text-[13px] text-fg/70">{label}</p>
      <p className="font-display mt-2 text-4xl sm:text-[2.6rem]">
        {value}
        {unit && <span className="ml-1.5 text-base text-muted">{unit}</span>}
      </p>
    </div>
  );
}

export function OverviewPanel({ d, className = "" }: { d: DashboardData; className?: string }) {
  const max = Math.max(...d.weeks.map((w) => w.count), 1);

  return (
    <section className={`glass p-6 sm:p-7 ${className}`}>
      <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
        <Stat label="Testes no mês" value={String(d.used)} unit={`de ${d.limit}`} />
        <Stat
          label="Clareza média"
          value={d.avgClarity === null ? "—" : d.avgClarity.toFixed(1)}
          unit={d.avgClarity === null ? undefined : "/10"}
        />
        <Stat label="Problemas no mês" value={String(d.issuesTotal)} unit="achados" />
      </div>

      <div className="mt-8 grid grid-cols-4 gap-3 sm:gap-4">
        {d.weeks.map((w) => (
          <div key={w.label} className="min-w-0">
            <div className="flex items-baseline justify-between text-[12px] text-fg/70">
              <span>{w.label}</span>
              <span className="text-muted">{w.count || "—"}</span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/10">
              <div
                data-week-bar
                className={`h-full rounded-full ${w.current ? "bg-accent shadow-[0_0_14px_#a6ff3d]" : "stripe-lime"}`}
                style={{ width: `${(w.count / max) * 100}%` }}
              />
            </div>
            <div className="mt-4 flex h-9 items-center -space-x-2">
              {w.sites.slice(0, 3).map((h) => (
                <SiteAvatar key={h} host={h} size={34} />
              ))}
              {w.sites.length > 3 && (
                <span className="grid size-[34px] place-items-center rounded-full bg-white/10 text-[11px] ring-2 ring-[#0d1220]">
                  +{w.sites.length - 3}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
