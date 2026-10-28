"use client";

import { Globe } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const DEVICES = [
  { id: "desktop", label: "Desktop" },
  { id: "mobile", label: "Mobile" },
  { id: "both", label: "Ambos" },
] as const;

const FOCUS = ["Formulários", "WhatsApp", "Checkout", "Navegação"];

export function UrlForm({ remaining, className = "" }: { remaining: number; plan?: string; className?: string }) {
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
      data-hero
      data-reveal
      className={`card scroll-mt-24 overflow-hidden p-6 sm:p-8 ${className}`}
    >
      <span aria-hidden className="hero-glow" />
      <h1 className="font-display relative text-[32px] leading-tight sm:text-[40px]">Qual site vamos testar?</h1>
      <p className="relative mt-2 text-sm text-muted">Cole a URL. Uma IA navega como um usuário real e entrega o relatório.</p>

      <div className="url-shell relative mt-6">
        <div className="flex h-[60px] items-center gap-3 rounded-[15px] bg-surface-2 pl-4 pr-2">
          <Globe className="size-5 shrink-0 text-muted" aria-hidden />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://seusite.com.br"
            aria-label="URL do site"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            required
            className="h-full min-w-0 flex-1 bg-transparent text-base text-fg outline-none placeholder:text-muted/70 sm:text-lg"
          />
          <button data-magnetic disabled={loading || remaining <= 0} className="btn btn-primary h-11 shrink-0 px-5">
            {loading ? "Iniciando..." : "Testar agora"}
          </button>
        </div>
      </div>

      <div className="relative mt-4 flex flex-wrap items-center gap-x-4 gap-y-3">
        <div
          role="radiogroup"
          aria-label="Dispositivo"
          className="flex h-8 items-center rounded-[10px] border border-line bg-surface-2 p-0.5"
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
                className={`h-7 rounded-[8px] px-3 text-xs transition ${
                  on ? "bg-surface font-medium text-fg ring-1 ring-line-strong" : "text-muted hover:text-fg"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="O que testar">
          <span className="mr-1 text-xs text-muted">O que testar</span>
          {FOCUS.map((f) => {
            const on = focus.includes(f);
            return (
              <button
                key={f}
                type="button"
                aria-pressed={on}
                onClick={() => setFocus((c) => (on ? c.filter((x) => x !== f) : [...c, f]))}
                className={`h-7 rounded-full border px-3 text-xs transition ${
                  on
                    ? "border-accent/40 bg-accent/10 text-accent"
                    : "border-line text-muted hover:border-line-strong hover:text-fg"
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>

        <Link href="/plans" className="text-xs text-muted transition hover:text-fg sm:ml-auto">
          {remaining} {remaining === 1 ? "teste restante" : "testes restantes"}
        </Link>
      </div>

      {remaining <= 0 && (
        <p className="mt-4 text-sm text-warn">
          Você usou todos os testes do mês.{" "}
          <Link href="/plans" className="underline underline-offset-4">
            Ver planos
          </Link>
        </p>
      )}
      {error && <p className="mt-4 text-sm text-danger">{error}</p>}
    </form>
  );
}
