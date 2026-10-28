import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // RLS garante que só o dono enxerga o teste
  const { data: test } = await supabase
    .from("tests")
    .select("id,url,status,phase,report,error,share_token,created_at")
    .eq("id", id)
    .single();
  if (!test) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });

  const { data: steps } = await supabase
    .from("test_steps")
    .select("idx,device,title,description,status,screenshot_path")
    .eq("test_id", id)
    .order("idx");

  return NextResponse.json({ test, steps: steps ?? [] });
}
