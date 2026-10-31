import { NewTestForm } from "@/components/new-test/new-test-form";
import { PageHeader } from "@/components/shell/page-header";
import { getDashboardData } from "@/lib/dashboard-data";

export default async function NewTestPage() {
  const { remaining } = await getDashboardData();

  return (
    <div>
      <PageHeader title="Novo teste" actions={false} />
      <NewTestForm remaining={remaining} />
    </div>
  );
}
