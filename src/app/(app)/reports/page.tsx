import { Workspace } from "@/components/dashboard/workspace";
import { PageHeader } from "@/components/shell/page-header";
import { getDashboardData } from "@/lib/dashboard-data";

export default async function ReportsPage() {
  const { items } = await getDashboardData();
  return (
    <div>
      <PageHeader title="Relatórios" />
      <Workspace items={items} onlyDone />
    </div>
  );
}
