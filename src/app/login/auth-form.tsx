"use client";

import Link from "next/link";
import { useActionState } from "react";
import { authenticate } from "./actions";

export function AuthForm({ signup }: { signup: boolean }) {
  const [state, action, pending] = useActionState(authenticate, undefined);
  const input = "input h-11";

  return (
    <form action={action} className="mt-8 space-y-4">
      <input type="hidden" name="mode" value={signup ? "cadastro" : "entrar"} />
      <input name="email" type="email" placeholder="voce@email.com" required autoComplete="email" className={input} />
      <input
        name="password"
        type="password"
        placeholder="Senha (mín. 6 caracteres)"
        required
        minLength={6}
        autoComplete={signup ? "new-password" : "current-password"}
        className={input}
      />
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      {state?.info && <p className="text-sm text-accent">{state.info}</p>}
      <button
        disabled={pending}
        className="btn btn-primary h-11 w-full"
      >
        {pending ? "Aguarde..." : signup ? "Criar conta" : "Entrar"}
      </button>
      <p className="text-center text-sm text-muted">
        {signup ? "Já tem conta?" : "Ainda não tem conta?"}{" "}
        <Link href={signup ? "/login" : "/login?modo=cadastro"} className="text-fg underline underline-offset-4">
          {signup ? "Entrar" : "Cadastre-se"}
        </Link>
      </p>
    </form>
  );
}
