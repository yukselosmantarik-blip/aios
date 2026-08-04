import "server-only";

import { createAgent, getAgents } from "@/lib/agents";
import type { Agent } from "@/lib/agents.types";

const WEBSITE_WIZARD_AGENT_NAME = "Website Wizard";

export async function getOrCreateWebsiteWizardAgent(
  userId: string,
): Promise<Agent> {
  const agents = await getAgents();
  const existing = agents.find(
    (agent) =>
      agent.user_id === userId && agent.name === WEBSITE_WIZARD_AGENT_NAME,
  );

  if (existing) {
    return existing;
  }

  return createAgent({
    user_id: userId,
    name: WEBSITE_WIZARD_AGENT_NAME,
    description:
      "Automatisch angelegter Agent für Website Briefs aus dem Website Wizard.",
    provider: "openai",
    model: "gpt-4o-mini",
    system_prompt:
      "Du unterstützt bei der Erstellung professioneller Business-Websites auf Basis strukturierter Website Briefs.",
    status: "active",
  });
}
