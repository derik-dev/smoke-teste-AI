import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { screenshotUrl } from "@/components/ui";
import type { TestItem } from "@/lib/dashboard-data";
import { SiteAvatar } from "./site-avatar";
import { rel, TestStatusBadge } from "./test-meta";

const GHOST = [0, 1, 2];

export function RecentTests({ items, className = "" }: { items: TestItem[]; className?: string }) {
  const list = items.slice(0, 6);

  return (
    <section data-reveal className={`card flex min-w-0 flex-col overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-6 pb-4 pt-6">
        <h2 className="text-base font-medium">Testes recentes</h2>
        {list.length > 0 && (
          <Link href="/tests" className="flex items-center gap-1 text-xs text-muted transition hover:text-fg">
            Ver todos
            <ArrowUpRight className="size-3" />
          </Link>
        )}
      </div>

      {list.length === 0 ? (
        <div className="flex flex-1 flex-col px-6 pb-6">
          <ul className="space-y-2" aria-hidden>
            {GHOST.map((i) => (
              <li key={i} className="flex items-center gap-3 rounded-[10px] border border-dashed border-line p-3" style={{ opacity: 1 - i * 0.28 }}>
                <span className="size-10 shrink-0 rounded-[10px] bg-surface-2" />
                <span className="flex-1 space-y-2">
                  <span className="block h-2.5 w-2/5 rounded-full bg-surface-2" />
                  <span className="block h-2 w-1/4 rounded-full bg-surface-2/70" />
                </span>
                <span className="h-5 w-16 rounded-md bg-surface-2" />
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <p className="text-sm font-medium">Nenhum teste por aqui ainda</p>
            <p className="mt-1 text-sm text-muted">
              Cole a URL de um site no campo acima. O resultado aparece nesta lista assim que o teste começar.
            </p>
          </div>
        </div>
      ) : (
        <ul className="divide-y divide-line border-t border-line">
          {list.map((t) => (
            <li key={t.id}>
              <Link href={`/tests/${t.id}`} className="flex items-center gap-3 px-6 py-3.5 transition hover:bg-surface-2/60">
                {t.thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={screenshotUrl(t.thumb)}
                    alt=""
                    loading="lazy"
                    className="size-10 shrink-0 rounded-[10px] object-cover object-top ring-1 ring-line"
                  />
                ) : (
                  <SiteAvatar host={t.host} size={40} />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{t.host}</span>
                  <span className="block text-xs text-muted">{rel(t.created_at)}</span>
                </span>
                <span className="hidden sm:block">
                  <TestStatusBadge t={t} />
                </span>
                <span className="w-10 shrink-0 text-right text-sm tabular-nums">
                  {t.score !== null ? t.score.toFixed(1) : <span className="text-muted">—</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
