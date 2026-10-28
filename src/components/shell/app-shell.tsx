"use client";

import {
  Bell,
  CreditCard,
  FileText,
  FlaskConical,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/app/login/actions";
import { AppMotion } from "@/components/motion/app-motion";
import { Logo } from "@/components/ui";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tests", label: "Testes", icon: FlaskConical },
  { href: "/reports", label: "Relatórios", icon: FileText },
  { href: "/plans", label: "Planos", icon: CreditCard },
  { href: "/settings", label: "Configurações", icon: Settings },
];

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name: string; email: string; plan: string };
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const initial = (user.name[0] ?? "U").toUpperCase();

  return (
    <div className="min-h-dvh bg-bg">
      <AppMotion />
      {open && (
        <button
          aria-label="Fechar menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/70 md:hidden"
        />
      )}

      <aside
        data-shell="sidebar"
        className={`print:hidden fixed inset-y-0 left-0 z-40 flex w-[var(--sidebar-w)] flex-col border-r border-line bg-surface transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Logo href="/dashboard" />
          <button onClick={() => setOpen(false)} className="text-muted md:hidden" aria-label="Fechar">
            <X className="size-5" />
          </button>
        </div>

        <nav className="mt-2 flex-1 space-y-1 px-3">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`relative flex h-10 items-center gap-3 rounded-[10px] px-3 text-sm transition-colors ${
                  active ? "bg-surface-2 font-medium text-fg" : "text-muted hover:bg-surface-2/60 hover:text-fg"
                }`}
              >
                {active && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-accent" />}
                <Icon className={`size-[18px] shrink-0 ${active ? "text-accent" : ""}`} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-line p-3">
          <div className="flex items-center gap-3 rounded-[10px] p-2">
            <div className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-2 text-sm font-medium text-fg ring-1 ring-line-strong">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted">Plano {user.plan}</p>
            </div>
            <form action={signOut}>
              <button className="text-muted transition hover:text-fg" title="Sair" aria-label="Sair">
                <LogOut className="size-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="md:pl-[var(--sidebar-w)] print:pl-0">
        <header
          data-shell="topbar"
          className="print:hidden mx-auto flex h-16 max-w-[var(--content-max)] items-center gap-3 px-4 sm:px-6"
        >
          <button
            onClick={() => setOpen(true)}
            className="grid size-10 place-items-center rounded-[10px] border border-line bg-surface md:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="size-[18px]" />
          </button>
          <div className="md:hidden">
            <Logo href="/dashboard" />
          </div>

          <div className="relative ml-auto flex items-center gap-2">
            <button
              className="relative grid size-10 place-items-center rounded-[10px] border border-line bg-surface text-muted transition hover:border-line-strong hover:text-fg"
              aria-label="Notificações"
            >
              <Bell className="size-[18px]" />
            </button>
            <button
              onClick={() => setMenu((m) => !m)}
              className="grid size-10 place-items-center rounded-[10px] border border-line bg-surface text-sm font-medium transition hover:border-line-strong"
              aria-label="Conta"
            >
              {initial}
            </button>

            {menu && (
              <>
                <button aria-label="Fechar" className="fixed inset-0 z-30 cursor-default" onClick={() => setMenu(false)} />
                <div className="card absolute right-0 top-12 z-40 w-60 p-2">
                  <div className="px-3 py-2">
                    <p className="truncate text-sm font-medium">{user.name}</p>
                    <p className="truncate text-xs text-muted">{user.email}</p>
                  </div>
                  <form action={signOut}>
                    <button className="flex h-10 w-full items-center gap-2 rounded-[10px] px-3 text-sm text-muted transition hover:bg-surface-2 hover:text-fg">
                      <LogOut className="size-4" />
                      Sair
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </header>

        <main className="mx-auto max-w-[var(--content-max)] px-4 pb-16 pt-2 sm:px-6 print:max-w-none">{children}</main>
      </div>
    </div>
  );
}
