import Sidebar from "@/components/Sidebar";
import ProjectsPageContent from "@/components/projects/ProjectsPageContent";
import { getCustomers } from "@/lib/customers";
import { getProjects } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const [projects, customers] = await Promise.all([
    getProjects(),
    getCustomers(),
  ]);

  const customerOptions = customers.map((customer) => ({
    id: customer.id,
    company_name: customer.company_name,
  }));

  return (
    <main className="min-h-screen flex bg-[#09090B]">
      <Sidebar />

      <section className="flex-1 overflow-auto">
        <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-6 lg:px-12 lg:py-10">
          <ProjectsPageContent
            projects={projects}
            customers={customerOptions}
          />
        </div>
      </section>
    </main>
  );
}
