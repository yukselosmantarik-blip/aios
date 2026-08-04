"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { uploadWebsiteBriefLogo } from "@/lib/website-brief-assets";
import { buildCreateWebsiteBriefInputFromStandaloneWizard } from "@/lib/website-wizard/build-brief-input";
import { getOrCreateWebsiteWizardAgent } from "@/lib/website-wizard/default-agent";
import type { StandaloneWebsiteWizardState } from "@/lib/website-wizard/types";
import { validateStandaloneWebsiteWizardStep } from "@/lib/website-wizard/validate-step";
import { normalizeStandaloneWebsiteWizardState } from "@/lib/website-wizard/normalize-state";
import { createWebsiteBrief, updateWebsiteBrief } from "@/lib/website-briefs";
import { createClient } from "@/lib/supabase/server";
import { getCustomerById } from "@/lib/customers";

export type SaveStandaloneWebsiteWizardState = {
  error?: string;
  success?: boolean;
  briefId?: string;
  agentId?: string;
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

function parseWizardState(raw: string): StandaloneWebsiteWizardState | null {
  try {
    const parsed = JSON.parse(raw) as StandaloneWebsiteWizardState;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }
    return normalizeStandaloneWebsiteWizardState(parsed);
  } catch {
    return null;
  }
}

export async function saveStandaloneWebsiteWizardAction(
  _prevState: SaveStandaloneWebsiteWizardState,
  formData: FormData,
): Promise<SaveStandaloneWebsiteWizardState> {
  const user = await requireUser();
  const wizardRaw = formData.get("wizard_state")?.toString() ?? "";
  const logoEntry = formData.get("logo");
  const logoFile =
    logoEntry instanceof File && logoEntry.size > 0 ? logoEntry : null;

  const state = parseWizardState(wizardRaw);
  if (!state) {
    return { error: "Wizard-Daten konnten nicht gelesen werden." };
  }

  const validationError = validateStandaloneWebsiteWizardStep("summary", state);
  if (validationError) {
    return { error: validationError };
  }

  if (!state.customer_id || !UUID_PATTERN.test(state.customer_id)) {
    return { error: "Bitte wählen Sie einen gültigen Kunden." };
  }

  const customer = await getCustomerById(state.customer_id, user.id);
  if (!customer) {
    return { error: "Der ausgewählte Kunde wurde nicht gefunden." };
  }

  try {
    const agent = await getOrCreateWebsiteWizardAgent(user.id);

    let logoPath = state.logo_storage_path.trim() || null;

    const createInput = buildCreateWebsiteBriefInputFromStandaloneWizard(state, {
      user_id: user.id,
      agent_id: agent.id,
      logo_storage_path: logoPath,
      status: "ready",
    });

    const created = await createWebsiteBrief(createInput);
    const briefId = created.id;

    if (logoFile && !logoPath) {
      const upload = await uploadWebsiteBriefLogo(user.id, briefId, logoFile);
      if ("error" in upload) {
        return { error: upload.error };
      }
      logoPath = upload.path;

      await updateWebsiteBrief(briefId, user.id, {
        customer_id: createInput.customer_id,
        project_id: createInput.project_id,
        business_name: createInput.business_name,
        industry: createInput.industry,
        location: createInput.location,
        website_goal: createInput.website_goal,
        target_audience: createInput.target_audience,
        services: createInput.services,
        unique_selling_points: createInput.unique_selling_points,
        preferred_style: createInput.preferred_style,
        primary_color: createInput.primary_color,
        secondary_color: createInput.secondary_color,
        required_pages: createInput.required_pages,
        required_features: createInput.required_features,
        reference_websites: createInput.reference_websites,
        additional_notes: createInput.additional_notes,
        contact_phone: createInput.contact_phone,
        contact_email: createInput.contact_email,
        contact_address: createInput.contact_address,
        social_media: createInput.social_media,
        logo_storage_path: logoPath,
        status: createInput.status,
      });
    }

    revalidatePath("/website-wizard");
    revalidatePath("/agents");
    revalidatePath(`/agents/${agent.id}`);
    revalidatePath(`/website-briefs/${briefId}`);

    return {
      success: true,
      briefId,
      agentId: agent.id,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Website Brief konnte nicht gespeichert werden.";
    return { error: message };
  }
}
