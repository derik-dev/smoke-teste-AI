import { after, NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { PLANS, planOf, startOfMonthISO } from "@/lib/plans";
import { runTest } from "@/lib/runner/run";
import { isPublicHost, normalizeUrl } from "@/lib/runner/ssrf";

export const maxDuration = 300;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Faça login para testar." }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const url = normalizeUrl(String(body.url ?? ""));
  if (!url) return NextResponse.json({ error: "URL inválida." }, { status: 400 });
  if (!(await isPublicHost(url.hostname))) {
    return NextResponse.json({ error: "Esse endereço não é acessível publicamente." }, { status: 400 });
  }

  const db = createAdminClient();

  const { count: running } = await db
    .from("tests")
    .select("id", { count: "exact", head: true })
    .eq("user_id", auth.user.id)
    .in("status", ["queued", "running"])
    .gte("created_at", new Date(Date.now() - 6 * 60_000).toISOString());
  if ((running ?? 0) > 0) {
    return NextResponse.json({ error: "Você já tem um teste em andamento." }, { status: 429 });
  }

  const limit = PLANS[planOf()].tests;
  const { count: used } = await db
    .from("tests")
    .select("id", { count: "exact", head: true })
    .eq("user_id", auth.user.id)
    .gte("created_at", startOfMonthISO());
  if ((used ?? 0) >= limit) {
    return NextResponse.json(
      { error: `Você usou os ${limit} testes do mês. Veja os planos.` },
      { status: 402 },
    );
  }

  const { data: test, error } = await db
    .from("tests")
    .insert({ user_id: auth.user.id, url: url.toString() })
    .select("id")
    .single();
  if (error || !test) return NextResponse.json({ error: "Não foi possível criar o teste." }, { status: 500 });

  after(() => runTest(test.id));
  return NextResponse.json({ id: test.id });
}
