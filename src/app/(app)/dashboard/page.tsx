import Link from "next/link";
import { UrlForm } from "@/components/url-form";
import { PLANS, planOf, startOfMonthISO } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";

const STATUS_LABEL = {
  queued: ["Na fila", "text-muted"],
  running: ["Rodando", "text-warn"],
  done: ["Concluído", "text-accent"],
  failed: ["Falhou", "text-danger"],
} as const;

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: tests } = await supabase
    .from("tests")
    .select("id,url,status,created_at,report")
    .order("created_at", { ascending: false })
    .limit(50);

  const since = startOfMonthISO();
  const used = (tests ?? []).filter((t) => t.created_at >= since).length;
  const remaining = Math.max(0, PLANS[planOf()].tests - used);

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Qual site vamos testar?</h1>
      <p className="mt-2 text-muted">Cole a URL e acompanhe o teste rodando.</p>
      <div className="mt-6">
        <UrlForm remaining={remaining} />
      </div>

      <h2 className="mt-14 text-lg font-semibold">Histórico</h2>
      {!tests?.length ? (
        <p className="mt-4 rounded-xl border border-dashed border-line p-8 text-center text-sm text-muted">
          Nenhum teste ainda. Rode o primeiro acima.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
          {tests.map((t) => {
            const [label, color] = STATUS_LABEL[t.status as keyof typeof STATUS_LABEL];
            const issues = t.report?.issues?.length;
            return (
              <li key={t.id}>
                <Link href={`/tests/${t.id}`} className="flex items-center justify-between gap-4 p-4 transition hover:bg-surface-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{t.url}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {new Date(t.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                      {issues !== undefined && ` · ${issues} problema(s)`}
                      {t.report?.clarity && ` · clareza ${t.report.clarity.score}/10`}
                    </p>
                  </div>
                  <span className={`shrink-0 text-xs font-medium ${color}`}>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
