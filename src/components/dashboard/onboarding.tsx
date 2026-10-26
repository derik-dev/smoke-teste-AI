import { Check } from "lucide-react";
import Link from "next/link";

type Flags = { account: boolean; firstTest: boolean; openedReport: boolean; shared: boolean };

export function Onboarding({ flags, className = "" }: { flags: Flags; className?: string }) {
  const steps = [
    { label: "Criar sua conta", hint: "Feito. Bem-vindo!", done: flags.account, href: "/dashboard" },
    { label: "Rodar o primeiro teste", hint: "Cole uma URL no campo acima.", done: flags.firstTest, href: "/dashboard#novo" },
    { label: "Abrir um relatório completo", hint: "Veja nota, problemas e prints.", done: flags.openedReport, href: "/reports" },
    { label: "Compartilhar o link com um cliente", hint: "Copie o link público do relatório.", done: flags.shared, href: "/reports" },
  ];
  const done = steps.filter((s) => s.done).length;
  if (done === steps.length) return null; // some quando concluído

  return (
    <div data-reveal className={`glass p-5 ${className}`}>
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-xl">Primeiros passos</h2>
        <span className="text-xs text-muted">
          {done} de {steps.length}
        </span>
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full bg-accent shadow-[0_0_10px_#a6ff3d]"
          style={{ width: `${(done / steps.length) * 100}%` }}
        />
      </div>
      <ul className="mt-3 grid gap-1 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s) => (
          <li key={s.label}>
            <Link
              href={s.href}
              className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-white/5"
            >
              <span
                className={`grid size-6 shrink-0 place-items-center rounded-full border ${
                  s.done ? "border-accent bg-accent text-bg" : "border-white/20"
                }`}
              >
                {s.done && <Check className="size-3.5" strokeWidth={3} />}
              </span>
              <span className="min-w-0">
                <span className={`block text-sm ${s.done ? "text-muted line-through" : ""}`}>{s.label}</span>
                <span className="block text-xs text-muted">{s.hint}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
