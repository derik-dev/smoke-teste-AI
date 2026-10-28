import { Onboarding, onboardingComplete } from "@/components/dashboard/onboarding";
import { OverviewPanel } from "@/components/dashboard/overview-panel";
import { RecentTests } from "@/components/dashboard/recent-tests";
import { UrlForm } from "@/components/url-form";
import { getDashboardData } from "@/lib/dashboard-data";

export default async function Dashboard() {
  const d = await getDashboardData();
  const showOnboarding = !onboardingComplete(d.onboarding);

  return (
    <div className="space-y-6">
      <UrlForm remaining={d.remaining} />
      <OverviewPanel d={d} />

      <div className={`grid items-start gap-6 ${showOnboarding ? "lg:grid-cols-3" : ""}`}>
        <RecentTests items={d.items} className={showOnboarding ? "lg:col-span-2" : ""} />
        {showOnboarding && <Onboarding flags={d.onboarding} />}
      </div>
    </div>
  );
}
