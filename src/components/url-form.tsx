"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const DEVICES = [
  { id: "desktop", label: "Desktop", hint: "1366×768" },
  { id: "mobile", label: "Mobile", hint: "390×844" },
  { id: "both", label: "Ambos", hint: "Recomendado" },
] as const;

const FOCUS = ["Formulários", "WhatsApp", "Checkout", "Navegação"];

export function UrlForm({ remaining, plan, className = "" }: { remaining: number; plan: string; className?: string }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [device, setDevice] = useState<(typeof DEVICES)[number]["id"]>("both");
  const [focus, setFocus] = useState<string[]>(["Formulários", "WhatsApp", "Navegação"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <form
      onSubmit={submit}
      id="novo"
      className={`glass flex scroll-mt-24 flex-col overflow-hidden pt-6 sm:pt-7 ${className}`}
    >
      <div className="px-6 sm:px-7">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[13px] text-fg/70">Qual site vamos testar?</p>
          <Link
            href="/plans"
            className="flex items-center gap-1 rounded-full border border-white/15 px-3 py-1 text-xs transition hover:border-accent/60 hover:text-accent"
          >
            {remaining} restantes · {plan}
            <ArrowUpRight className="size-3" />
          </Link>
        </div>

        <div className="url-shell mt-3">
          <div className="rounded-[1.05rem] bg-[#0d1220] p-1.5">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://seusite.com.br"
              inputMode="url"
              autoComplete="off"
              spellCheck={false}
              required
              className="font-display h-[52px] w-full min-w-0 rounded-xl bg-transparent px-4 text-xl outline-none placeholder:text-muted/60 sm:text-2xl"
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {FOCUS.map((f) => {
            const on = focus.includes(f);
            return (
              <button
                key={f}
                type="button"
                aria-pressed={on}
                onClick={() => setFocus((c) => (on ? c.filter((x) => x !== f) : [...c, f]))}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  on
                    ? "border-accent/50 bg-accent/10 text-accent"
                    : "border-white/10 text-muted hover:border-white/25 hover:text-fg"
                }`}
              >
                {on && "✓ "}
                {f}
              </button>
            );
          })}
        </div>

        {remaining <= 0 && (
          <p className="mt-3 text-sm text-warn">
            Você usou todos os testes do mês.{" "}
            <Link href="/plans" className="underline underline-offset-4">
              Ver planos
            </Link>
          </p>
        )}
        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      </div>

      {/* abas de dispositivo: a selecionada sobe e vira lima */}
      <div className="mt-auto flex items-end gap-2 px-6 pt-5 sm:px-7">
        <div role="radiogroup" aria-label="Dispositivo" className="grid flex-1 grid-cols-3 items-end gap-2">
          {DEVICES.map(({ id, label, hint }) => {
            const on = device === id;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setDevice(id)}
                className={`flex flex-col justify-between rounded-t-2xl px-3 pb-2.5 pt-3 text-left transition-all duration-300 ${
                  on
                    ? "h-[88px] bg-accent text-black shadow-[0_-8px_30px_-8px_#a6ff3d]"
                    : "h-[68px] bg-white/8 text-fg/70 hover:bg-white/12"
                }`}
              >
                <span className={`text-[11px] ${on ? "text-black/60" : "text-muted"}`}>{hint}</span>
                <span className="text-sm font-medium">{label}</span>
              </button>
            );
          })}
        </div>
        <button
          data-magnetic
          disabled={loading || remaining <= 0}
          className="mb-3 h-12 shrink-0 rounded-full bg-white px-5 text-sm font-semibold text-black shadow-[0_0_30px_-6px_#ffffff80] transition hover:shadow-[0_0_40px_-2px_#ffffffb0] active:scale-95 disabled:opacity-50"
        >
          {loading ? "Iniciando..." : "Testar agora"}
        </button>
      </div>
    </form>
  );
}
