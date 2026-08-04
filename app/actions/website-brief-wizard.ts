"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAgent } from "@/lib/agents";
import { uploadWebsiteBriefLogo } from "@/lib/website-brief-assets";
import {
  buildCreateWebsiteBriefInputFromWizard,
  buildUpdateWebsiteBriefInputFromWizard,
} from "@/lib/website-brief-wizard/build-website-brief-input";
import type { WebsiteBriefWizardState } from "@/lib/website-brief-wizard/types";
import { validateWebsiteBriefWizardStep } from "@/lib/website-brief-wizard/validate-step";
import { normalizeWebsiteBriefWizardState } from "@/lib/website-brief-wizard/normalize-state";
import {
  createWebsiteBrief,
  getWebsiteBrief,
  updateWebsiteBrief,
} from "@/lib/website-briefs";
import { createClient } from "@/lib/supabase/server";

export type SaveWebsiteBriefWizardState = {
  error?: string;
  success?: boolean;
  briefId?: string;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

function parseWizardState(raw: string): WebsiteBriefWizardState | null {
  try {
    const parsed = JSON.parse(raw) as WebsiteBriefWizardState;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }
    return normalizeWebsiteBriefWizardState(parsed);
  } catch {
    return null;
  }
}

function revalidateAgentPaths(agentId: string) {
  revalidatePath("/agents");
  revalidatePath(`/agents/${agentId}`);
  revalidatePath(`/agents/${agentId}/wizard`);
}

export async function saveWebsiteBriefWizardAction(
  _prevState: SaveWebsiteBriefWizardState,
  formData: FormData,
): Promise<SaveWebsiteBriefWizardState> {
  const user = await requireUser();
  const agentId = formData.get("agent_id")?.toString().trim() ?? "";
  const briefIdRaw = formData.get("brief_id")?.toString().trim() ?? "";
  const wizardRaw = formData.get("wizard_state")?.toString() ?? "";
  const logoEntry = formData.get("logo");
  const logoFile =
    logoEntry instanceof File && logoEntry.size > 0 ? logoEntry : null;

  if (!agentId || !UUID_PATTERN.test(agentId)) {
    return { error: "Ungültiger Agent." };
  }

  const agent = await getAgent(agentId);
  if (!agent || agent.user_id !== user.id) {
    return { error: "Agent wurde nicht gefunden." };
  }

  const state = parseWizardState(wizardRaw);
  if (!state) {
    return { error: "Wizard-Daten konnten nicht gelesen werden." };
  }

  const validationError = validateWebsiteBriefWizardStep("review", state);
  if (validationError) {
    return { error: validationError };
  }

  const isUpdate = Boolean(briefIdRaw);
  if (isUpdate && !UUID_PATTERN.test(briefIdRaw)) {
    return { error: "Ungültiger Website Brief." };
  }

  try {
    let briefId: string;
    let customerId: string | null = null;
    let projectId: string | null = null;
    let logoPath: string | null = null;

    if (isUpdate) {
      const existing = await getWebsiteBrief(briefIdRaw, user.id);
      if (!existing || existing.agent_id !== agentId) {
        return { error: "Website Brief wurde nicht gefunden." };
      }
      briefId = existing.id;
      customerId = existing.customer_id;
      projectId = existing.project_id;
      logoPath = existing.logo_storage_path;
    } else {
      const createInput = buildCreateWebsiteBriefInputFromWizard(state, {
        user_id: user.id,
        agent_id: agentId,
        status: "ready",
      });
      const created = await createWebsiteBrief(createInput);
      briefId = created.id;
      customerId = created.customer_id;
      projectId = created.project_id;
      logoPath = created.logo_storage_path;
    }

    if (logoFile) {
      const upload = await uploadWebsiteBriefLogo(user.id, briefId, logoFile);
      if ("error" in upload) {
        return { error: upload.error };
      }
      logoPath = upload.path;
    }

    const updateInput = buildUpdateWebsiteBriefInputFromWizard(state, {
      customer_id: customerId,
      project_id: projectId,
      logo_storage_path: logoPath,
      status: "ready",
    });

    await updateWebsiteBrief(briefId, user.id, updateInput);

    revalidateAgentPaths(agentId);

    return {
      success: true,
      briefId,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Website Brief konnte nicht gespeichert werden.";
    return { error: message };
  }
}
