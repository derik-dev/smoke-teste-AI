"use client";

import { ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { screenshotUrl } from "@/components/ui";
import type { TestItem } from "@/lib/dashboard-data";
import { EmptyPreview } from "./empty-preview";
import { SiteAvatar } from "./site-avatar";
import { rel, scoreTone, TestStatusBadge } from "./test-meta";

const TABS = [
  { id: "all", label: "Todos" },
  { id: "live", label: "Em andamento" },
  { id: "issues", label: "Com problemas" },
  { id: "clean", label: "Sem problemas" },
] as const;
type Tab = (typeof TABS)[number]["id"];

const isLive = (i: TestItem) => i.status === "running" || i.status === "queued";

function path(url: string) {
  try {
    const u = new URL(url);
    return u.pathname === "/" ? "" : u.pathname;
  } catch {
    return "";
  }
}

export function Workspace({ items, onlyDone = false }: { items: TestItem[]; onlyDone?: boolean }) {
  const router = useRouter();
  const base = useMemo(() => (onlyDone ? items.filter((i) => i.status === "done") : items), [items, onlyDone]);
  const tabs = onlyDone ? TABS.filter((t) => t.id !== "live") : TABS;

  const [q, setQ] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [site, setSite] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [pop, setPop] = useState(false);

  // testes em andamento: atualiza a lista sozinha até terminarem
  const hasLive = base.some(isLive);
  useEffect(() => {
    if (!hasLive) return;
    const t = setInterval(() => router.refresh(), 5000);
    return () => clearInterval(t);
  }, [hasLive, router]);

  const sites = useMemo(() => [...new Set(base.map((i) => i.host))].sort(), [base]);
  const activeFilters = [site, from, to].filter(Boolean).length;

  const filtered = useMemo(
    () =>
      base.filter((i) => {
        if (site && i.host !== site) return false;
        const day = i.created_at.slice(0, 10);
        if (from && day < from) return false;
        if (to && day > to) return false;
        if (q && !i.url.toLowerCase().includes(q.toLowerCase())) return false;
        return true;
      }),
    [base, site, from, to, q],
  );

  const counts: Record<Tab, number> = {
    all: filtered.length,
    live: filtered.filter(isLive).length,
    issues: filtered.filter((i) => i.status === "done" && (i.issues ?? 0) > 0).length,
    clean: filtered.filter((i) => i.status === "done" && i.issues === 0).length,
  };
  const list = filtered.filter((i) => {
    if (tab === "live") return isLive(i);
    if (tab === "issues") return i.status === "done" && (i.issues ?? 0) > 0;
    if (tab === "clean") return i.status === "done" && i.issues === 0;
    return true;
  });

  function clear() {
    setSite("");
    setFrom("");
    setTo("");
    setQ("");
  }

  if (base.length === 0) {
    return (
      <div data-reveal className="card overflow-hidden px-4 py-10 sm:px-8 sm:py-14">
        <EmptyPreview />
        <div className="mt-8 flex justify-center">
          <Link href="/dashboard#novo" className="btn btn-primary">
            Rodar meu primeiro teste
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div data-reveal className="card overflow-hidden">
      {/* toolbar única: busca + abas de status + filtros */}
      <div className="flex flex-wrap items-center gap-3 border-b border-line p-3">
        <label className="relative w-full lg:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por URL"
            aria-label="Buscar por URL"
            className="input pl-9"
          />
        </label>

        <div
          role="tablist"
          className="no-scrollbar flex h-10 max-w-full items-center gap-0.5 overflow-x-auto rounded-[10px] border border-line bg-surface-2 p-0.5"
        >
          {tabs.map((t) => {
            const on = tab === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={on}
                onClick={() => setTab(t.id)}
                className={`relative flex h-9 shrink-0 items-center gap-2 rounded-[8px] px-3 text-[13px] transition ${
                  on ? "bg-surface font-medium text-fg ring-1 ring-line-strong" : "text-muted hover:text-fg"
                }`}
              >
                {on && <span className="absolute inset-x-3 -bottom-px h-px bg-accent" />}
                {t.label}
                <span className="text-[11px] tabular-nums text-muted">{counts[t.id]}</span>
              </button>
            );
          })}
        </div>

        <div className="relative ml-auto">
          <button onClick={() => setPop((p) => !p)} aria-expanded={pop} className="btn btn-ghost">
            <SlidersHorizontal className="size-4" />
            Filtros
            {activeFilters > 0 && (
              <span className="grid size-5 place-items-center rounded-full bg-surface-2 text-[11px] text-fg ring-1 ring-line-strong">
                {activeFilters}
              </span>
            )}
          </button>

          {pop && (
            <>
              <button aria-label="Fechar filtros" className="fixed inset-0 z-30 cursor-default" onClick={() => setPop(false)} />
              <div className="card absolute right-0 top-12 z-40 w-72 space-y-4 p-4 shadow-2xl shadow-black/60">
                <label className="block">
                  <span className="text-xs text-muted">Site</span>
                  <select value={site} onChange={(e) => setSite(e.target.value)} className="input mt-1.5">
                    <option value="">Todos os sites</option>
                    {sites.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-xs text-muted">De</span>
                    <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input mt-1.5 px-2" />
                  </label>
                  <label className="block">
                    <span className="text-xs text-muted">Até</span>
                    <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input mt-1.5 px-2" />
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <button onClick={clear} className="text-xs text-muted underline underline-offset-4 hover:text-fg">
                    Limpar tudo
                  </button>
                  <button onClick={() => setPop(false)} className="btn btn-ghost h-9">
                    Fechar
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className="text-sm font-medium">Nenhum teste com esses filtros</p>
          <p className="mt-1 text-sm text-muted">Tente outra aba ou busque por outra URL.</p>
          <button onClick={() => { clear(); setTab("all"); }} className="btn btn-ghost mt-5">
            Limpar filtros
          </button>
        </div>
      ) : (
        <ul className="divide-y divide-line">
          <li className="hidden grid-cols-[56px_minmax(0,1fr)_56px_128px_96px_16px] items-center gap-4 px-4 py-2.5 text-[11px] uppercase tracking-wider text-muted sm:grid">
            <span />
            <span>Site</span>
            <span className="text-right">Nota</span>
            <span>Status</span>
            <span>Data</span>
            <span />
          </li>
          {list.map((t) => (
            <li key={t.id}>
              <Link
                href={`/tests/${t.id}`}
                className="group grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 transition hover:bg-surface-2/60 sm:grid-cols-[56px_minmax(0,1fr)_56px_128px_96px_16px]"
              >
                {t.thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={screenshotUrl(t.thumb)}
                    alt=""
                    loading="lazy"
                    className="h-10 w-12 rounded-[8px] object-cover object-top ring-1 ring-line sm:w-14"
                  />
                ) : (
                  <SiteAvatar host={t.host} size={40} className="sm:w-14" />
                )}
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">
                    {t.host}
                    <span className="font-normal text-muted">{path(t.url)}</span>
                  </span>
                  <span className="mt-0.5 flex items-center gap-2 text-xs text-muted sm:hidden" suppressHydrationWarning>
                    <TestStatusBadge t={t} />
                    {rel(t.created_at)}
                  </span>
                </span>
                <span className={`text-right text-sm font-medium tabular-nums ${t.score !== null ? scoreTone(t.score) : "text-muted"}`}>
                  {t.score !== null ? t.score.toFixed(1) : "—"}
                </span>
                <span className="hidden sm:block">
                  <TestStatusBadge t={t} />
                </span>
                <span className="hidden text-xs text-muted sm:block" suppressHydrationWarning>
                  {rel(t.created_at)}
                </span>
                <ChevronRight className="hidden size-4 text-muted transition group-hover:translate-x-0.5 group-hover:text-fg sm:block" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
