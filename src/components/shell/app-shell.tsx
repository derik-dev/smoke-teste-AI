"use client";

import {
  Bell,
  ChevronsLeft,
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
import { useState, useSyncExternalStore } from "react";
import { signOut } from "@/app/login/actions";
import { SmokeBg } from "@/components/dashboard/smoke-bg";
import { Logo } from "@/components/ui";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tests", label: "Testes", icon: FlaskConical },
  { href: "/reports", label: "Relatórios", icon: FileText },
  { href: "/plans", label: "Planos", icon: CreditCard },
  { href: "/settings", label: "Configurações", icon: Settings },
];

const SIDEBAR_KEY = "st:sidebar";
const subscribeSidebar = (cb: () => void) => {
  window.addEventListener(SIDEBAR_KEY, cb);
  return () => window.removeEventListener(SIDEBAR_KEY, cb);
};
const readSidebar = () => {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === "1";
  } catch {
    return false;
  }
};

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name: string; email: string; plan: string };
}) {
  const pathname = usePathname();
  const collapsed = useSyncExternalStore(subscribeSidebar, readSidebar, () => false);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const initial = (user.name[0] ?? "U").toUpperCase();

  function toggle() {
    try {
      localStorage.setItem(SIDEBAR_KEY, collapsed ? "0" : "1");
    } catch {}
    window.dispatchEvent(new Event(SIDEBAR_KEY));
  }

  return (
    <div className="min-h-dvh">
      <SmokeBg />

      {open && (
        <button
          aria-label="Fechar menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`print:hidden fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/8 bg-[#090d1a]/85 backdrop-blur-xl transition-[transform,width] duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 ${collapsed ? "md:w-[84px]" : "md:w-64"}`}
      >
        <div className={`flex h-[72px] items-center justify-between px-5 ${collapsed ? "md:justify-center md:px-0" : ""}`}>
          {collapsed && (
            <Link href="/dashboard" className="hidden size-9 place-items-center rounded-xl bg-accent text-black md:grid">
              <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12l5 5 9-10" />
              </svg>
            </Link>
          )}
          <div className={collapsed ? "md:hidden" : ""}>
            <Logo href="/dashboard" />
          </div>
          <button onClick={() => setOpen(false)} className="text-muted md:hidden" aria-label="Fechar">
            <X className="size-5" />
          </button>
        </div>

        <nav className="mt-2 flex-1 space-y-1.5 px-3">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                title={collapsed ? label : undefined}
                className={`flex h-12 items-center gap-3 rounded-full px-4 text-sm transition ${
                  active
                    ? "bg-accent font-medium text-black shadow-[0_0_24px_-6px_#a6ff3d]"
                    : "text-fg/65 hover:bg-white/6 hover:text-fg"
                } ${collapsed ? "md:justify-center md:px-0" : ""}`}
              >
                <Icon className="size-[18px] shrink-0" />
                <span className={collapsed ? "md:hidden" : ""}>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 p-3">
          <button
            onClick={toggle}
            className="hidden h-10 w-full items-center justify-center gap-2 rounded-full text-xs text-muted transition hover:bg-white/6 hover:text-fg md:flex"
          >
            <ChevronsLeft className={`size-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
            <span className={collapsed ? "hidden" : ""}>Recolher</span>
          </button>

          <div className={`rounded-3xl border border-white/8 bg-white/[0.04] p-3 ${collapsed ? "md:border-0 md:bg-transparent md:p-0" : ""}`}>
            <div className={`flex items-center gap-3 ${collapsed ? "md:justify-center" : ""}`}>
              <div className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent to-cyan-300 text-sm font-semibold text-black">
                {initial}
              </div>
              <div className={`min-w-0 flex-1 ${collapsed ? "md:hidden" : ""}`}>
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="text-xs text-accent">Plano {user.plan}</p>
              </div>
              <form action={signOut} className={collapsed ? "md:hidden" : ""}>
                <button className="text-muted transition hover:text-fg" title="Sair" aria-label="Sair">
                  <LogOut className="size-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      <div className={`print:pl-0 transition-[padding] duration-300 ${collapsed ? "md:pl-[84px]" : "md:pl-64"}`}>
        <header className="print:hidden mx-auto flex max-w-[1400px] items-center gap-3 px-4 pb-2 pt-5 sm:px-6">
          <button
            onClick={() => setOpen(true)}
            className="grid size-11 place-items-center rounded-full border border-white/10 bg-white/5 md:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="size-[18px]" />
          </button>
          <div className="md:hidden">
            <Logo href="/dashboard" />
          </div>

          <div className="relative ml-auto flex items-center gap-2">
            <button
              className="relative grid size-11 place-items-center rounded-full border border-white/10 bg-white/5 text-fg/80 transition hover:bg-white/10"
              aria-label="Notificações"
            >
              <Bell className="size-[18px]" />
              <span className="absolute right-3 top-3 size-2 rounded-full bg-accent shadow-[0_0_8px_#a6ff3d]" />
            </button>
            <button
              onClick={() => setMenu((m) => !m)}
              className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-accent to-cyan-300 text-sm font-semibold text-black ring-2 ring-white/10"
              aria-label="Conta"
            >
              {initial}
            </button>

            {menu && (
              <>
                <button aria-label="Fechar" className="fixed inset-0 z-30 cursor-default" onClick={() => setMenu(false)} />
                <div className="glass absolute right-0 top-14 z-40 w-60 bg-[#0e1426]/95 p-2">
                  <div className="px-3 py-2">
                    <p className="truncate text-sm font-medium">{user.name}</p>
                    <p className="truncate text-xs text-muted">{user.email}</p>
                  </div>
                  <form action={signOut}>
                    <button className="flex h-10 w-full items-center gap-2 rounded-xl px-3 text-sm text-muted transition hover:bg-white/5 hover:text-fg">
                      <LogOut className="size-4" />
                      Sair
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </header>

        <main className="mx-auto max-w-[1400px] px-4 pb-16 pt-4 sm:px-6 print:max-w-none">{children}</main>
      </div>
    </div>
  );
}
