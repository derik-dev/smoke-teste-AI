import Link from "next/link";
import { signOut } from "@/app/login/actions";
import { Logo } from "@/components/ui";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <nav className="border-b border-line print:hidden">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
          <div className="flex items-center gap-6">
            <Logo href="/dashboard" />
            <Link href="/dashboard" className="text-sm text-muted transition hover:text-fg">Testes</Link>
            <Link href="/plans" className="text-sm text-muted transition hover:text-fg">Planos</Link>
          </div>
          <form action={signOut}>
            <button className="text-sm text-muted transition hover:text-fg">Sair</button>
          </form>
        </div>
      </nav>
      <main className="mx-auto max-w-5xl px-5 py-10">{children}</main>
    </div>
  );
}
