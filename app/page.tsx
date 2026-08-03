import Sidebar from "@/components/Sidebar";
import QuickActions from "@/components/QuickActions";
import Header from "@/components/Header";
import StatsCard from "@/components/StatsCard";
import {
  AgentsIcon,
  CustomersIcon,
  ProjectsIcon,
  TasksIcon,
} from "@/components/dashboard/DashboardIcons";
import ProjectStatusOverview from "@/components/dashboard/ProjectStatusOverview";
import RecentCustomersPanel from "@/components/dashboard/RecentCustomersPanel";
import RecentProjectsPanel from "@/components/dashboard/RecentProjectsPanel";
import TaskInsightsPanel from "@/components/dashboard/TaskInsightsPanel";
import UpcomingTasksPanel from "@/components/dashboard/UpcomingTasksPanel";
import { getDashboardData } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const dashboard = await getDashboardData();

  return (
    <main className="flex min-h-screen bg-[#09090B]">
      <Sidebar />

      <section className="flex-1 overflow-auto">
        <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-6 lg:px-12 lg:py-10">
          <Header />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatsCard
              title="Kunden gesamt"
              value={dashboard.stats.crm.total}
              icon={<CustomersIcon className="h-5 w-5" />}
            />
            <StatsCard
              title="Offene Leads"
              value={dashboard.stats.crm.openLeads}
              icon={<CustomersIcon className="h-5 w-5" />}
            />
            <StatsCard
              title="Angebote"
              value={dashboard.stats.crm.proposals}
              icon={<CustomersIcon className="h-5 w-5" />}
            />
            <StatsCard
              title="Gewonnen"
              value={dashboard.stats.crm.won}
              icon={<CustomersIcon className="h-5 w-5" />}
            />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatsCard
              title="Projekte"
              value={dashboard.stats.projects}
              icon={<ProjectsIcon className="h-5 w-5" />}
            />
            <StatsCard
              title="KI-Agenten"
              value={dashboard.stats.aiAgents}
              icon={<AgentsIcon className="h-5 w-5" />}
            />
            <StatsCard
              title="Aufgaben"
              value={dashboard.stats.tasks}
              icon={<TasksIcon className="h-5 w-5" />}
            />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <RecentCustomersPanel customers={dashboard.recentCustomers} />
              <RecentProjectsPanel projects={dashboard.recentProjects} />
              <UpcomingTasksPanel tasks={dashboard.upcomingTasks} />
            </div>

            <div className="lg:col-span-1 space-y-6">
              <QuickActions />
              <TaskInsightsPanel insights={dashboard.taskInsights} />
            </div>
          </div>

          <div className="mt-8">
            <ProjectStatusOverview counts={dashboard.projectStatusCounts} />
          </div>
        </div>
      </section>
    </main>
  );
}
