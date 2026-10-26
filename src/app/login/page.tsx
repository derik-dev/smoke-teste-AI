import { Logo } from "@/components/ui";
import { AuthForm } from "./auth-form";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ modo?: string }> }) {
  const signup = (await searchParams).modo === "cadastro";
  return (
    <main className="glow grid min-h-dvh place-items-center px-5">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-8">
        <Logo />
        <h1 className="mt-8 text-2xl font-semibold tracking-tight">
          {signup ? "Crie sua conta" : "Bem-vindo de volta"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {signup ? "3 testes grátis por mês, sem cartão." : "Entre para ver seus testes."}
        </p>
        <AuthForm signup={signup} />
      </div>
    </main>
  );
}
