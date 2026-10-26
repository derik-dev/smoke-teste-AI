"use client";

import { ArrowLeft, Plus, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function PageHeader({
  title,
  back = true,
  actions = true,
  filters = true,
}: {
  title: string;
  back?: boolean;
  actions?: boolean;
  filters?: boolean;
}) {
  const router = useRouter();
  return (
    <div className="mb-6 flex items-center gap-4 print:hidden">
      {back && (
        <button
          onClick={() => router.back()}
          className="grid size-11 shrink-0 place-items-center rounded-full border border-white/12 bg-white/5 transition hover:bg-white/10"
          aria-label="Voltar"
        >
          <ArrowLeft className="size-[18px]" />
        </button>
      )}
      <h1 className="font-display text-4xl sm:text-6xl">{title}</h1>
      {actions && (
        <div className="ml-auto flex items-center gap-2">
          {filters && (
            <Link
              href="#filtros"
              className="grid size-11 place-items-center rounded-full border border-white/12 bg-white/5 transition hover:bg-white/10"
              aria-label="Filtros"
            >
              <SlidersHorizontal className="size-[18px]" />
            </Link>
          )}
          <Link
            href="/dashboard#novo"
            className="flex h-11 items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 text-sm transition hover:bg-white/10"
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">Novo teste</span>
          </Link>
        </div>
      )}
    </div>
  );
}
