import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import StatsCards from "@/components/dashboard/StatsCards";
import QuickActions from "@/components/dashboard/QuickActions";
import StoreSetup from "@/components/dashboard/StoreSetup";
import RecentOrders from "@/components/dashboard/RecentOrders";
export default function DashboardPage() {
  return (
    <main className="flex min-h-screen bg-pink-50">
      <Sidebar />

      <div className="flex-1 p-8">
        <TopBar />

        <div className="mt-8">
          <StatsCards />
        </div>

        <div className="mt-8">
          <QuickActions />
        </div>

        <div className="mt-8">
          <RecentOrders />
        </div>
      </div>
    </main>
  );
}