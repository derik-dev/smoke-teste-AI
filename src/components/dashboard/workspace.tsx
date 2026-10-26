"use client";

import { ArrowUpRight, Check, Link2, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { screenshotUrl } from "@/components/ui";
import type { TestItem } from "@/lib/dashboard-data";
import { EmptyPreview } from "./empty-preview";
import { LiveLog } from "./live-log";
import { SiteAvatar } from "./site-avatar";

const STATUS = {
  done: { label: "Concluído", dot: "#16a34a" },
  failed: { label: "Falhou", dot: "#dc2626" },
  running: { label: "Rodando", dot: "#d97706" },
  queued: { label: "Na fila", dot: "#6b7280" },
} as const;

const TABS = [
  { id: "all", label: "Todos" },
  { id: "live", label: "Em andamento" },
  { id: "issues", label: "Com problemas" },
  { id: "clean", label: "Sem problemas" },
] as const;
type Tab = (typeof TABS)[number]["id"];

const SEV_COLOR: Record<string, string> = {
  critical: "#f87171",
  high: "#fb923c",
  medium: "#fbbf24",
  low: "#8b8b94",
};

function rel(iso: string) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "agora";
  if (mins < 60) return `há ${mins} min`;
  const h = Math.round(mins / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.round(h / 24);
  return `há ${d} dia${d === 1 ? "" : "s"}`;
}

function scoreColor(s: number) {
  return s >= 8 ? "#a6ff3d" : s >= 5 ? "#fbbf24" : "#f87171";
}

const field =
  "h-12 min-w-0 rounded-full border border-white/10 bg-white/5 px-4 text-[13px] text-fg outline-none transition placeholder:text-muted focus:border-accent/60";

export function Workspace({ items, onlyDone = false }: { items: TestItem[]; onlyDone?: boolean }) {
  const base = useMemo(() => (onlyDone ? items.filter((i) => i.status === "done") : items), [items, onlyDone]);

  const [site, setSite] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const sites = useMemo(() => [...new Set(base.map((i) => i.host))].sort(), [base]);
  const activeFilters = [site, status, from, to, q].filter(Boolean).length;

  const filtered = useMemo(
    () =>
      base.filter((i) => {
        if (site && i.host !== site) return false;
        if (status === "running" ? !["running", "queued"].includes(i.status) : status && i.status !== status) return false;
        const day = i.created_at.slice(0, 10);
        if (from && day < from) return false;
        if (to && day > to) return false;
        if (q && !i.url.toLowerCase().includes(q.toLowerCase())) return false;
        return true;
      }),
    [base, site, status, from, to, q],
  );

  const counts = {
    all: filtered.length,
    live: filtered.filter((i) => i.status === "running" || i.status === "queued").length,
    issues: filtered.filter((i) => i.status === "done" && (i.issues ?? 0) > 0).length,
    clean: filtered.filter((i) => i.status === "done" && i.issues === 0).length,
  };
  const list = filtered.filter((i) => {
    if (tab === "live") return i.status === "running" || i.status === "queued";
    if (tab === "issues") return i.status === "done" && (i.issues ?? 0) > 0;
    if (tab === "clean") return i.status === "done" && i.issues === 0;
    return true;
  });
  const sel = list.find((i) => i.id === selectedId) ?? list[0] ?? null;

  function clear() {
    setSite("");
    setStatus("");
    setFrom("");
    setTo("");
    setQ("");
  }

  async function copy(token: string) {
    try {
      await navigator.clipboard.writeText(`${location.origin}/r/${token}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <>
      {/* filtros */}
      <div id="filtros" className="mt-5 flex scroll-mt-24 flex-wrap items-center gap-2.5">
        <div className="mr-1 flex items-center gap-2 text-[15px]">
          Filtros ativos
          <span className="grid size-6 place-items-center rounded-full bg-white text-xs font-semibold text-black">
            {activeFilters}
          </span>
          {activeFilters > 0 && (
            <button onClick={clear} className="text-xs text-muted underline underline-offset-4 hover:text-fg">
              limpar
            </button>
          )}
        </div>
        <select value={site} onChange={(e) => setSite(e.target.value)} className={`${field} w-full sm:w-44`}>
          <option value="">Todos os sites</option>
          {sites.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${field} w-[48%] sm:w-44`}>
          <option value="">Todos os status</option>
          <option value="done">Concluído</option>
          <option value="failed">Falhou</option>
          <option value="running">Em andamento</option>
        </select>
        <input type="date" aria-label="De" value={from} onChange={(e) => setFrom(e.target.value)} className={`${field} w-[48%] sm:w-40`} />
        <input type="date" aria-label="Até" value={to} onChange={(e) => setTo(e.target.value)} className={`${field} w-[48%] sm:w-40`} />
        <label className="relative w-full sm:w-auto sm:min-w-52 sm:flex-1">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por URL"
            className={`${field} w-full pr-11`}
          />
          <Search className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
        </label>
      </div>

      {/* painel claro: lista + detalhe */}
      <section className="relative mt-12 rounded-[2rem] bg-[#f3f4f1] p-3 pt-10 text-[#0b0f1a] shadow-[0_40px_100px_-40px_#000] sm:p-5 sm:pt-12">
        <div className="no-scrollbar absolute left-1/2 top-0 flex max-w-[92%] -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 overflow-x-auto rounded-full bg-[#0c1224] p-1.5 shadow-[0_0_0_6px_#f3f4f1]">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-[13px] transition ${
                tab === t.id ? "bg-accent font-medium text-black" : "bg-white/6 text-fg/80 hover:bg-white/12"
              }`}
            >
              {t.label}
              {t.id !== "all" && (
                <span
                  className={`grid min-w-5 place-items-center rounded-full px-1 text-[11px] ${
                    tab === t.id ? "bg-black text-white" : "bg-white/12"
                  }`}
                >
                  {counts[t.id]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="mb-3 flex items-center justify-between px-2 sm:px-3">
          <h2 className="font-display text-lg">Seus testes</h2>
          <Link
            href="/dashboard#novo"
            className="grid size-10 place-items-center rounded-full border border-black/10 bg-white transition hover:bg-black hover:text-white"
            aria-label="Novo teste"
          >
            <Plus className="size-4" />
          </Link>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          {/* lista */}
          <ul className="max-h-[640px] space-y-2 overflow-y-auto pr-1 lg:max-h-[620px]">
            {list.length === 0 && (
              <li className="rounded-2xl border border-dashed border-black/15 p-8 text-center text-sm text-black/50">
                {base.length === 0 ? "Nenhum teste ainda." : "Nenhum teste com esses filtros."}
              </li>
            )}
            {list.map((t) => {
              const on = sel?.id === t.id;
              const st = STATUS[t.status];
              return (
                <li key={t.id}>
                  <button
                    onClick={() => setSelectedId(t.id)}
                    className={`flex w-full items-center gap-3 rounded-[1.4rem] p-2.5 pr-4 text-left transition ${
                      on ? "bg-[#0c1224] text-white" : "bg-white hover:bg-white/70"
                    }`}
                  >
                    {t.thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={screenshotUrl(t.thumb)}
                        alt=""
                        loading="lazy"
                        className="size-12 shrink-0 rounded-full object-cover object-top"
                      />
                    ) : (
                      <SiteAvatar host={t.host} size={48} />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-medium">{t.host}</span>
                      <span className={`block text-xs ${on ? "text-white/55" : "text-black/50"}`} suppressHydrationWarning>
                        {rel(t.created_at)}
                      </span>
                    </span>
                    <span
                      className={`hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs sm:flex ${
                        on ? "bg-white text-black" : "stripe-soft bg-black/[0.04]"
                      }`}
                    >
                      <span className="size-1.5 rounded-full" style={{ background: st.dot }} />
                      {st.label}
                    </span>
                    <span className="w-14 shrink-0 text-right text-[17px] font-medium">
                      {t.score !== null ? (
                        t.score.toFixed(1)
                      ) : (
                        <span className={on ? "text-white/40" : "text-black/30"}>—</span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* detalhe */}
          <div className="rounded-[1.75rem] bg-[#1b2134] p-4 text-white sm:p-6">
            {!sel ? (
              <EmptyPreview />
            ) : (
              <Detail t={sel} copied={copied} onCopy={() => copy(sel.shareToken)} />
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function Detail({ t, copied, onCopy }: { t: TestItem; copied: boolean; onCopy: () => void }) {
  const live = t.status === "running" || t.status === "queued";
  const st = STATUS[t.status];
  const sev = t.sev;
  const grave = sev ? sev.critical + sev.high : 0;
  const leve = sev ? sev.medium + sev.low : 0;

  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-[1.2fr_1fr_1fr]">
        <div className="min-w-0">
          <p className="text-[13px] text-white/60">Detalhes do teste</p>
          <p className="font-display mt-1 flex items-center gap-3 text-3xl sm:text-4xl">
            <span className="truncate">{t.host}</span>
          </p>
          <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1 text-xs">
            <span className="size-1.5 rounded-full" style={{ background: st.dot }} />
            {st.label}
          </span>
        </div>
        <div>
          <p className="text-[13px] text-white/60">Site</p>
          <div className="mt-2 flex items-center gap-2.5">
            <SiteAvatar host={t.host} size={40} />
            <a href={t.url} target="_blank" rel="noreferrer" className="min-w-0 truncate text-sm text-white/80 hover:text-accent">
              {t.url.replace(/^https?:\/\//, "")}
            </a>
          </div>
        </div>
        <div>
          <p className="text-[13px] text-white/60">Clareza em 5 segundos</p>
          {t.score !== null ? (
            <>
              <p className="font-display mt-1 text-4xl" style={{ color: scoreColor(t.score) }}>
                {t.score.toFixed(1)}
                <span className="text-base text-white/40"> /10</span>
              </p>
              <p className="line-clamp-2 text-xs text-white/60">{t.verdict}</p>
            </>
          ) : (
            <p className="font-display mt-1 text-4xl text-white/30">—</p>
          )}
        </div>
      </div>

      {live ? (
        <div className="mt-6">
          <LiveLog id={t.id} initialPhase={t.phase} />
        </div>
      ) : t.status === "failed" ? (
        <div className="mt-6 rounded-2xl border border-danger/30 bg-danger/10 p-5 text-sm">
          <p className="font-medium text-danger">O teste não terminou</p>
          <p className="mt-1 text-white/70">{t.error || "Erro inesperado."}</p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { n: grave, label: "Problemas graves", tone: grave ? "#f87171" : undefined },
              { n: leve, label: "Problemas leves", tone: leve ? "#fbbf24" : undefined },
              { n: t.works ?? 0, label: "O que funcionou", tone: "#a6ff3d" },
            ].map((x) => (
              <Link
                key={x.label}
                href={`/tests/${t.id}`}
                className="group flex min-h-28 flex-col justify-between rounded-2xl bg-white/[0.07] p-4 transition hover:bg-white/12"
              >
                <ArrowUpRight className="ml-auto size-4 text-white/50 transition group-hover:text-accent" />
                <div>
                  <p className="font-display text-3xl" style={{ color: x.tone }}>
                    {x.n}
                  </p>
                  <p className="mt-1 text-xs text-white/60">{x.label}</p>
                </div>
              </Link>
            ))}
            <button
              onClick={onCopy}
              className="stripe-dark flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 text-xs text-white/70 transition hover:border-accent/60 hover:text-accent"
            >
              {copied ? <Check className="size-5" /> : <Link2 className="size-5" />}
              {copied ? "Link copiado!" : "Copiar link público"}
            </button>
          </div>

          {t.top.length > 0 && (
            <ul className="mt-4 space-y-2">
              {t.top.map((i) => (
                <li key={i.title} className="flex items-center gap-3 rounded-xl bg-white/[0.05] px-4 py-2.5 text-sm">
                  <span className="size-2 shrink-0 rounded-full" style={{ background: SEV_COLOR[i.severity] }} />
                  <span className="truncate">{i.title}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-[1.4rem] bg-white/[0.08] p-3 pl-5 sm:gap-6">
        <div className="flex gap-6 sm:gap-8">
          <div>
            <p className="text-[11px] text-white/55">Problemas</p>
            <p className="font-display text-xl">{t.issues ?? "—"}</p>
          </div>
          <div>
            <p className="text-[11px] text-white/55">Clareza</p>
            <p className="font-display text-xl">{t.score !== null ? t.score.toFixed(1) : "—"}</p>
          </div>
          <div className="hidden sm:block">
            <p className="text-[11px] text-white/55">Rodado</p>
            <p className="font-display text-xl" suppressHydrationWarning>
              {rel(t.created_at)}
            </p>
          </div>
        </div>
        <Link
          href={`/tests/${t.id}`}
          className="btn-glow flex h-12 items-center rounded-full bg-accent px-6 text-sm font-semibold text-black"
        >
          {live ? "Acompanhar ao vivo" : "Abrir relatório"}
        </Link>
      </div>
    </div>
  );
}
