import { Check } from "lucide-react";
import Link from "next/link";

type Flags = { account: boolean; firstTest: boolean; openedReport: boolean; shared: boolean };

export function onboardingComplete(flags: Flags) {
  return Object.values(flags).every(Boolean);
}

export function Onboarding({ flags, className = "" }: { flags: Flags; className?: string }) {
  const steps = [
    { label: "Criar sua conta", hint: "Feito. Bem-vindo!", done: flags.account, href: "/dashboard" },
    { label: "Rodar o primeiro teste", hint: "Cole uma URL no campo acima.", done: flags.firstTest, href: "/dashboard#novo" },
    { label: "Abrir um relatório completo", hint: "Veja nota, problemas e prints.", done: flags.openedReport, href: "/reports" },
    { label: "Compartilhar com um cliente", hint: "Copie o link público do relatório.", done: flags.shared, href: "/reports" },
  ];
  const done = steps.filter((s) => s.done).length;
  if (done === steps.length) return null; // some quando concluído

  return (
    <section data-reveal className={`card min-w-0 p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-medium">Primeiros passos</h2>
          <p className="mt-0.5 text-xs text-muted">
            {done} de {steps.length} concluídos
          </p>
        </div>
        <svg viewBox="0 0 40 40" className="size-10 -rotate-90" aria-hidden>
          <circle cx="20" cy="20" r="16" fill="none" stroke="var(--surface-2)" strokeWidth="4" />
          {done > 0 && (
            <circle
              data-ring
              cx="20"
              cy="20"
              r="16"
              pathLength={1}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${done / steps.length} 1`}
            />
          )}
        </svg>
      </div>
      <ul className="mt-4 space-y-0.5">
        {steps.map((s) => (
          <li key={s.label}>
            <Link href={s.href} className="-mx-2 flex items-start gap-3 rounded-[10px] px-2 py-2.5 transition hover:bg-surface-2/60">
              <span
                className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border ${
                  s.done ? "border-accent bg-accent text-accent-ink" : "border-line-strong"
                }`}
              >
                {s.done && <Check className="size-3" strokeWidth={3} />}
              </span>
              <span className="min-w-0">
                <span className={`block text-sm ${s.done ? "text-muted line-through" : ""}`}>{s.label}</span>
                <span className="block text-xs text-muted">{s.hint}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
