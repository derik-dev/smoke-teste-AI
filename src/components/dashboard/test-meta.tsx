import { Badge } from "@/components/ui";
import type { TestItem } from "@/lib/dashboard-data";

export function rel(iso: string) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "agora";
  if (mins < 60) return `há ${mins} min`;
  const h = Math.round(mins / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.round(h / 24);
  return `há ${d} dia${d === 1 ? "" : "s"}`;
}

export function TestStatusBadge({ t }: { t: Pick<TestItem, "status" | "issues"> }) {
  if (t.status === "failed") return <Badge tone="danger">Falhou</Badge>;
  if (t.status === "running" || t.status === "queued")
    return <Badge>{t.status === "running" ? "Rodando" : "Na fila"}</Badge>;
  if ((t.issues ?? 0) > 0)
    return (
      <Badge tone="warn">
        {t.issues} {t.issues === 1 ? "problema" : "problemas"}
      </Badge>
    );
  return <Badge tone="ok">Sem problemas</Badge>;
}

export function scoreTone(s: number) {
  return s >= 8 ? "text-accent" : s >= 5 ? "text-warn" : "text-danger";
}
