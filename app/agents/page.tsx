import Sidebar from "@/components/Sidebar";
import AgentsPageContent from "@/components/agents/AgentsPageContent";
import { getAgents } from "@/lib/agents";

export const dynamic = "force-dynamic";

export default async function AgentsPage() {
  const agents = await getAgents();

  return (
    <main className="min-h-screen flex bg-[#09090B]">
      <Sidebar />

      <section className="flex-1 overflow-auto">
        <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-6 lg:px-12 lg:py-10">
          <AgentsPageContent agents={agents} />
        </div>
      </section>
    </main>
  );
}
