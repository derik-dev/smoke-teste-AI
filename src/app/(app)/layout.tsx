import { AppShell } from "@/components/shell/app-shell";
import { PLANS, planOf } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email ?? "";

  return (
    <AppShell user={{ name: email.split("@")[0] || "Você", email, plan: PLANS[planOf()].name }}>
      {children}
    </AppShell>
  );
}
