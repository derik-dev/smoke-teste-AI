import { PageHeader } from "@/components/shell/page-header";
import { PLANS, planOf } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  return (
    <div>
      <PageHeader title="Configurações" actions={false} />
      <div className="glass max-w-2xl divide-y divide-white/8">
        <div className="p-6">
          <p className="text-xs uppercase tracking-wider text-muted">E-mail</p>
          <p className="mt-1">{data.user?.email}</p>
        </div>
        <div className="p-6">
          <p className="text-xs uppercase tracking-wider text-muted">Plano</p>
          <p className="mt-1">{PLANS[planOf()].name}</p>
        </div>
        {/* TODO: nome da agência, logo e cores do relatório white-label (plano Pro) */}
        <div className="p-6">
          <p className="text-xs uppercase tracking-wider text-muted">Marca da agência (white-label)</p>
          <p className="mt-1 text-sm text-muted">Em breve, no plano Pro.</p>
        </div>
      </div>
    </div>
  );
}
