import { notFound } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import AgentDetailPageContent from "@/components/agents/detail/AgentDetailPageContent";
import { getAgent } from "@/lib/agents";
import { createClient } from "@/lib/supabase/server";
import { listWebsiteBriefsByAgent } from "@/lib/website-briefs";
import { getWebsiteBlueprintByBrief } from "@/lib/website-blueprints";

export const dynamic = "force-dynamic";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type AgentDetailPageProps = {
  params: Promise<{ agentId: string }>;
};

export default async function AgentDetailPage({ params }: AgentDetailPageProps) {
  const { agentId } = await params;

  if (!UUID_PATTERN.test(agentId)) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const agent = await getAgent(agentId);

  if (!agent || agent.user_id !== user.id) {
    notFound();
  }

  const briefs = await listWebsiteBriefsByAgent(agentId);
  const brief = briefs[0] ?? null;
  const blueprint = brief
    ? await getWebsiteBlueprintByBrief(brief.id, user.id)
    : null;

  return (
    <main className="min-h-screen flex bg-[#09090B]">
      <Sidebar />

      <section className="flex-1 overflow-auto">
        <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-6 lg:px-12 lg:py-10">
          <AgentDetailPageContent
            agent={agent}
            brief={brief}
            blueprint={blueprint}
          />
        </div>
      </section>
    </main>
  );
}
