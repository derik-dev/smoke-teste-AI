import { Logo } from "@/components/ui";
import { AuthForm } from "./auth-form";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ modo?: string }> }) {
  const signup = (await searchParams).modo === "cadastro";
  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-5">
      <div className="card w-full max-w-sm p-8">
        <Logo />
        <h1 className="font-display mt-8 text-[32px] leading-tight">
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
