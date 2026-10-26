"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function UrlForm({ remaining }: { remaining: number }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/tests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
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
    <form onSubmit={submit}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://seusite.com.br"
          inputMode="url"
          required
          className="h-12 flex-1 rounded-xl border border-line bg-surface px-4 text-sm outline-none transition placeholder:text-muted focus:border-accent"
        />
        <button
          disabled={loading || remaining <= 0}
          className="h-12 rounded-xl bg-accent px-6 text-sm font-medium text-bg transition hover:brightness-110 disabled:opacity-50"
        >
          {loading ? "Iniciando..." : "Testar agora"}
        </button>
      </div>
      <p className="mt-2 text-xs text-muted">
        {remaining > 0 ? `${remaining} teste(s) restante(s) neste mês` : "Você usou todos os testes do mês."}
      </p>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </form>
  );
}
