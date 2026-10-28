import { PageHeader } from "@/components/shell/page-header";
import { PLANS, planOf } from "@/lib/plans";

export default function PlansPage() {
  const current = planOf();
  return (
    <div>
      <PageHeader title="Planos" actions={false} />
      <div className="grid gap-6 sm:grid-cols-2">
        {(Object.entries(PLANS) as [keyof typeof PLANS, (typeof PLANS)[keyof typeof PLANS]][]).map(([id, p]) => (
          <div
            key={id}
            data-reveal
            className={`card card-hover flex flex-col p-6 sm:p-8 ${id === "pro" ? "!border-line-strong bg-surface-2" : ""}`}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-medium">{p.name}</h2>
              {id === current && <span className="badge">Seu plano</span>}
            </div>
            <p className="text-stat mt-6">
              {p.price}
              <span className="ml-1.5 font-sans text-sm text-muted">/mês</span>
            </p>
            <p className="mt-2 text-sm text-muted">{p.tests} testes por mês</p>
            <ul className="mt-6 flex-1 space-y-3 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2.5">
                  <span className="text-accent">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <button disabled className="btn btn-ghost mt-8 w-full">
              {id === current ? "Seu plano atual" : "Em breve"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
