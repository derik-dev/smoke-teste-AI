import { Onboarding } from "@/components/dashboard/onboarding";
import { OverviewPanel } from "@/components/dashboard/overview-panel";
import { PageHeader } from "@/components/shell/page-header";
import { UrlForm } from "@/components/url-form";
import { getDashboardData } from "@/lib/dashboard-data";

export default async function Dashboard() {
  const d = await getDashboardData();

  return (
    <div>
      <PageHeader title="Dashboard" back={false} filters={false} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <OverviewPanel d={d} />
        <UrlForm remaining={d.remaining} plan={d.plan} />
      </div>

      <Onboarding flags={d.onboarding} className="mt-4" />
    </div>
  );
}
