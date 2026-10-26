import { PageHeader } from "@/components/shell/page-header";
import { PLANS, planOf } from "@/lib/plans";

export default function PlansPage() {
  const current = planOf();
  return (
    <div>
      <PageHeader title="Planos" actions={false} />
      <div className="grid gap-4 sm:grid-cols-2">
        {(Object.entries(PLANS) as [keyof typeof PLANS, (typeof PLANS)[keyof typeof PLANS]][]).map(([id, p]) => (
          <div
            key={id}
            className={`glass p-6 ${id === "pro" ? "!border-accent/40" : ""}`}
          >
            <h2 className="font-semibold">{p.name}</h2>
            <p className="mt-3 text-4xl font-semibold">
              {p.price}
              <span className="text-base font-normal text-muted">/mês</span>
            </p>
            <p className="mt-2 text-sm text-muted">{p.tests} testes por mês</p>
            <ul className="mt-5 space-y-2 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="text-accent">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              disabled
              className="mt-6 h-10 w-full rounded-lg border border-line text-sm text-muted"
            >
              {id === current ? "Seu plano atual" : "Em breve"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
