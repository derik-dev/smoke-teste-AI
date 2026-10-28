import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReportView, type StepRow } from "@/components/report-view";
import { Logo } from "@/components/ui";
import { createAdminClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Relatório — Smoke Tester", robots: { index: false } };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function PublicReport({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!UUID.test(token)) notFound();

  const db = createAdminClient();
  const { data: test } = await db
    .from("tests")
    .select("id,url,report,status")
    .eq("share_token", token)
    .single();
  if (!test || test.status !== "done" || !test.report) notFound();

  const { data: steps } = await db
    .from("test_steps")
    .select("idx,device,title,description,status,screenshot_path")
    .eq("test_id", test.id)
    .order("idx");

  return (
    <div className="min-h-dvh">
      <nav className="border-b border-line print:hidden">
        <div className="mx-auto flex h-14 max-w-5xl items-center px-5">
          <Logo />
        </div>
      </nav>
      <main className="mx-auto max-w-5xl px-5 py-10">
        <ReportView url={test.url} report={test.report} steps={(steps ?? []) as StepRow[]} />
      </main>
      <footer className="border-t border-line py-6 text-center text-xs text-muted">
        Gerado por Smoke Tester
      </footer>
    </div>
  );
}
