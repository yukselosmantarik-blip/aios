import Sidebar from "@/components/Sidebar";
import QuickActions from "@/components/QuickActions";
import Header from "@/components/Header";
import StatsCard from "@/components/StatsCard";
import ProjectList from "@/components/ProjectList";
import CreateProjectForm from "@/components/CreateProjectForm";
import { getProjects } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default async function Home() {
  const projects = await getProjects();

  return (
    <main className="min-h-screen bg-gray-100 flex">
      <Sidebar />

      <section className="flex-1 p-10">
        <Header />

        <div className="grid grid-cols-3 gap-6">
          <StatsCard title="Projekte" value={projects.length} />
          <StatsCard title="Kunden" value={0} />
          <StatsCard title="KI-Agenten" value={0} />
        </div>

        <CreateProjectForm />

        <div className="mt-8">
          <QuickActions />
        </div>
        <div className="mt-8">
          <ProjectList projects={projects} />
        </div>
      </section>
    </main>
  );
}
