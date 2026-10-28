"use client";

import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function PageHeader({
  title,
  back = true,
  actions = true,
}: {
  title: string;
  back?: boolean;
  actions?: boolean;
  /** mantido por compatibilidade: filtros agora ficam na toolbar de cada página */
  filters?: boolean;
}) {
  const router = useRouter();
  return (
    <div className="mb-8 flex items-center gap-4 print:hidden">
      {back && (
        <button
          onClick={() => router.back()}
          className="grid size-10 shrink-0 place-items-center rounded-[10px] border border-line bg-surface transition hover:border-line-strong"
          aria-label="Voltar"
        >
          <ArrowLeft className="size-[18px]" />
        </button>
      )}
      <h1 className="text-page-title">{title}</h1>
      {actions && (
        <div className="ml-auto">
          <Link href="/dashboard#novo" className="btn btn-primary">
            <Plus className="size-4" />
            <span className="hidden sm:inline">Novo teste</span>
          </Link>
        </div>
      )}
    </div>
  );
}
