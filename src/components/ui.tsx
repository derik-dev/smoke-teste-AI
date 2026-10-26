import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-semibold tracking-tight">
      <span className="grid size-7 place-items-center rounded-lg bg-accent text-bg">
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12l5 5 9-10" />
        </svg>
      </span>
      Smoke Tester
    </Link>
  );
}

export function Button({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
}) {
  const base = "inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium transition";
  const styles =
    variant === "primary"
      ? "bg-accent text-bg hover:brightness-110"
      : "border border-line text-fg hover:bg-surface-2";
  return (
    <Link href={href} className={`${base} ${styles} ${className}`}>
      {children}
    </Link>
  );
}

const SEVERITY = {
  critical: { label: "Crítico", cls: "bg-danger/15 text-danger" },
  high: { label: "Alto", cls: "bg-orange-400/15 text-orange-300" },
  medium: { label: "Médio", cls: "bg-warn/15 text-warn" },
  low: { label: "Baixo", cls: "bg-white/8 text-muted" },
} as const;

export function SeverityBadge({ level }: { level: keyof typeof SEVERITY }) {
  const s = SEVERITY[level];
  return <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${s.cls}`}>{s.label}</span>;
}

const STATUS = {
  ok: { label: "OK", cls: "bg-accent/15 text-accent" },
  warn: { label: "Atenção", cls: "bg-warn/15 text-warn" },
  fail: { label: "Falhou", cls: "bg-danger/15 text-danger" },
} as const;

export function StatusBadge({ status }: { status: keyof typeof STATUS }) {
  const s = STATUS[status];
  return <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${s.cls}`}>{s.label}</span>;
}

export function screenshotUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/screenshots/${path}`;
}
