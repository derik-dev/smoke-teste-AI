import { Workspace } from "@/components/dashboard/workspace";
import { PageHeader } from "@/components/shell/page-header";
import { getDashboardData } from "@/lib/dashboard-data";

export default async function TestsPage() {
  const { items } = await getDashboardData();
  return (
    <div>
      <PageHeader title="Testes" />
      <Workspace items={items} />
    </div>
  );
}
