import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-semibold tracking-tight">
      <span className="grid size-7 place-items-center rounded-[10px] bg-accent text-accent-ink">
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
  return (
    <Link href={href} className={`btn ${variant === "primary" ? "btn-primary" : "btn-ghost"} ${className}`}>
      {children}
    </Link>
  );
}

export function ActionButton({
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" }) {
  return <button {...props} className={`btn ${variant === "primary" ? "btn-primary" : "btn-ghost"} ${className}`} />;
}

export function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`input ${className}`} />;
}

export function Card({
  children,
  className = "",
  hover = false,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return <div className={`card ${hover ? "card-hover" : ""} ${className}`}>{children}</div>;
}

const TONE = {
  ok: "bg-accent/12 text-accent",
  warn: "bg-warn/12 text-warn",
  danger: "bg-danger/12 text-danger",
  neutral: "bg-surface-2 text-muted",
} as const;

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: keyof typeof TONE;
  children: React.ReactNode;
}) {
  return <span className={`badge ${TONE[tone]}`}>{children}</span>;
}

const SEVERITY = {
  critical: { label: "Crítico", tone: "danger" },
  high: { label: "Alto", tone: "danger" },
  medium: { label: "Médio", tone: "warn" },
  low: { label: "Baixo", tone: "neutral" },
} as const;

export function SeverityBadge({ level }: { level: keyof typeof SEVERITY }) {
  const s = SEVERITY[level];
  return <Badge tone={s.tone}>{s.label}</Badge>;
}

const STATUS = {
  ok: { label: "OK", tone: "ok" },
  warn: { label: "Atenção", tone: "warn" },
  fail: { label: "Falhou", tone: "danger" },
} as const;

export function StatusBadge({ status }: { status: keyof typeof STATUS }) {
  const s = STATUS[status];
  return <Badge tone={s.tone}>{s.label}</Badge>;
}

export function screenshotUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/screenshots/${path}`;
}
