"use client";

import { Check, Compass, Globe, MessageCircle, ShoppingCart, TextCursorInput } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CAPTION, type FocusId, ScreenPreview } from "./screen-preview";

const DEVICES = [
  { id: "desktop", label: "Desktop" },
  { id: "mobile", label: "Mobile" },
  { id: "both", label: "Ambos" },
] as const;

const FOCUS: { id: FocusId; icon: typeof Globe; text: string }[] = [
  { id: "Formulários", icon: TextCursorInput, text: "Preenche e envia contato, cadastro e busca." },
  { id: "WhatsApp", icon: MessageCircle, text: "Confere se o botão abre a conversa certa." },
  { id: "Checkout", icon: ShoppingCart, text: "Segue do carrinho até o pagamento, sem pagar." },
  { id: "Navegação", icon: Compass, text: "Clica no menu e nos links atrás de páginas quebradas." },
];

const CYCLE_MS = 4000;

export function NewTestForm({ remaining }: { remaining: number }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [device, setDevice] = useState<(typeof DEVICES)[number]["id"]>("both");
  const [focus, setFocus] = useState<FocusId[]>(["Formulários", "WhatsApp", "Navegação"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // pré-visualização: uma tela por vez
  const [tick, setTick] = useState(0);
  const [hovered, setHovered] = useState<FocusId | null>(null);
  const [view, setView] = useState<"desktop" | "mobile">("desktop");

  const playlist: (FocusId | "inicio")[] = focus.length ? FOCUS.filter((f) => focus.includes(f.id)).map((f) => f.id) : ["inicio"];
  const current = hovered ?? playlist[tick % playlist.length];
  const mobile = device === "both" ? view === "mobile" : device === "mobile";

  useEffect(() => {
    if (hovered || playlist.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setTick((n) => n + 1), CYCLE_MS);
    return () => clearInterval(t);
  }, [hovered, playlist.length]);

  const host = url.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/tests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // TODO: a API ainda ignora device e focus; o runner sempre testa desktop + mobile
      body: JSON.stringify({ url, device, focus }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Erro ao iniciar o teste.");
      setLoading(false);
      return;
    }
    router.push(`/tests/${data.id}`);
  }

  const caption = CAPTION[current];

  return (
    <form onSubmit={submit} className="grid items-stretch gap-6 lg:grid-cols-2">
      {/* esquerda: o que a IA deve fazer */}
      <section data-reveal className="card min-w-0 space-y-6 p-6 sm:p-8">
        <div>
          <label htmlFor="site-url" className="text-sm font-medium">
            Qual site vamos testar?
          </label>
          <div className="url-shell mt-3">
            <div className="flex h-14 items-center gap-3 rounded-[15px] bg-surface-2 px-4">
              <Globe className="size-5 shrink-0 text-muted" aria-hidden />
              <input
                id="site-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://seusite.com.br"
                inputMode="url"
                autoComplete="off"
                spellCheck={false}
                required
                className="h-full min-w-0 flex-1 bg-transparent text-base text-fg outline-none placeholder:text-muted/70"
              />
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium">Dispositivo</p>
          <div
            role="radiogroup"
            aria-label="Dispositivo"
            className="mt-3 grid grid-cols-3 gap-1 rounded-[10px] border border-line bg-surface-2 p-1"
          >
            {DEVICES.map(({ id, label }) => {
              const on = device === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setDevice(id)}
                  className={`h-9 rounded-[8px] text-sm transition ${
                    on ? "bg-surface font-medium text-fg ring-1 ring-line-strong" : "text-muted hover:text-fg"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-medium">O que a IA deve testar</p>
            <button
              type="button"
              onClick={() => setFocus(focus.length === FOCUS.length ? [] : FOCUS.map((f) => f.id))}
              className="text-xs text-muted transition hover:text-fg"
            >
              {focus.length === FOCUS.length ? "Limpar" : "Marcar todos"}
            </button>
          </div>
          <ul className="mt-3 space-y-2" onMouseLeave={() => setHovered(null)}>
            {FOCUS.map(({ id, icon: Icon, text }) => {
              const on = focus.includes(id);
              return (
                <li key={id}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    onClick={() => {
                      setFocus((c) => (on ? c.filter((x) => x !== id) : [...c, id]));
                      setTick(playlist.indexOf(id));
                    }}
                    onMouseEnter={() => setHovered(id)}
                    onFocus={() => setHovered(id)}
                    onBlur={() => setHovered(null)}
                    className={`flex w-full items-center gap-3 rounded-[12px] border p-3 text-left transition ${
                      on ? "border-accent/40 bg-accent/5" : "border-line hover:border-line-strong"
                    }`}
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-surface-2 text-muted ring-1 ring-line">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm">{id}</span>
                      <span className="block text-xs text-muted">{text}</span>
                    </span>
                    <span
                      className={`grid size-5 shrink-0 place-items-center rounded-md border ${
                        on ? "border-accent bg-accent text-accent-ink" : "border-line-strong"
                      }`}
                    >
                      {on && <Check className="size-3" strokeWidth={3} />}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
          <Link href="/plans" className="text-xs text-muted transition hover:text-fg">
            {remaining} {remaining === 1 ? "teste restante" : "testes restantes"}
          </Link>
          <button data-magnetic disabled={loading || remaining <= 0} className="btn btn-primary h-11 px-6">
            {loading ? "Iniciando..." : "Testar agora"}
          </button>
        </div>
        {remaining <= 0 && (
          <p className="text-sm text-warn">
            Você usou todos os testes do mês.{" "}
            <Link href="/plans" className="underline underline-offset-4">
              Ver planos
            </Link>
          </p>
        )}
        {error && <p className="text-sm text-danger">{error}</p>}
      </section>

      {/* direita: uma tela por vez */}
      <section data-reveal className="card flex min-w-0 flex-col p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-base font-medium">{caption.title}</h2>
            <p className="mt-0.5 text-xs text-muted">{caption.text}</p>
          </div>
          {device === "both" && (
            <div className="flex h-8 shrink-0 items-center rounded-[10px] border border-line bg-surface-2 p-0.5">
              {(["desktop", "mobile"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  className={`h-7 rounded-[8px] px-3 text-xs transition ${
                    view === v ? "bg-surface font-medium text-fg ring-1 ring-line-strong" : "text-muted hover:text-fg"
                  }`}
                >
                  {v === "desktop" ? "Desktop" : "Mobile"}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-1 flex-col">
          <ScreenPreview id={current} host={host} mobile={mobile} />
        </div>

        {playlist.length > 1 && (
          <div className="mt-5 flex justify-center gap-1.5" role="tablist" aria-label="Telas do teste">
            {playlist.map((p, i) => (
              <button
                key={p}
                type="button"
                role="tab"
                aria-selected={p === current}
                aria-label={CAPTION[p].title}
                onClick={() => setTick(i)}
                className={`h-1.5 rounded-full transition-all ${
                  p === current ? "w-6 bg-accent" : "w-1.5 bg-line-strong hover:bg-muted"
                }`}
              />
            ))}
          </div>
        )}
      </section>
    </form>
  );
}
