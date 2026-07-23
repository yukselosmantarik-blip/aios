"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateWebsiteBlueprintContent } from "@/lib/website-blueprint-generator";
import {
  getWebsiteBrief,
  updateWebsiteBrief,
} from "@/lib/website-briefs";
import type { WebsiteBrief } from "@/lib/website-briefs.types";
import type { UpdateWebsiteBriefInput } from "@/lib/website-briefs.types";
import { upsertWebsiteBlueprint } from "@/lib/website-blueprints";
import { createClient } from "@/lib/supabase/server";

export type GenerateWebsiteBlueprintState = {
  error?: string;
  success?: boolean;
  message?: string;
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

function isValidUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

function toUpdateInput(brief: WebsiteBrief): UpdateWebsiteBriefInput {
  return {
    customer_id: brief.customer_id,
    project_id: brief.project_id,
    business_name: brief.business_name,
    industry: brief.industry,
    location: brief.location,
    website_goal: brief.website_goal,
    target_audience: brief.target_audience,
    services: brief.services,
    unique_selling_points: brief.unique_selling_points,
    preferred_style: brief.preferred_style,
    primary_color: brief.primary_color,
    secondary_color: brief.secondary_color,
    required_pages: brief.required_pages,
    required_features: brief.required_features,
    reference_websites: brief.reference_websites,
    additional_notes: brief.additional_notes,
    status: brief.status,
  };
}

function validateBriefForGeneration(
  brief: WebsiteBrief,
): { ok: true } | { ok: false; error: string } {
  if (!brief.business_name.trim()) {
    return { ok: false, error: "Unternehmensname ist erforderlich." };
  }

  if (!brief.industry.trim()) {
    return { ok: false, error: "Branche ist erforderlich." };
  }

  if (!brief.website_goal.trim()) {
    return { ok: false, error: "Website-Ziel ist erforderlich." };
  }

  if (!brief.target_audience.trim()) {
    return { ok: false, error: "Zielgruppe ist erforderlich." };
  }

  return { ok: true };
}

function revalidateAgentPaths(agentId: string) {
  revalidatePath("/agents");
  revalidatePath(`/agents/${agentId}`);
}

export async function generateWebsiteBlueprintAction(
  briefId: string,
): Promise<GenerateWebsiteBlueprintState> {
  const user = await requireUser();
  const trimmedId = briefId.trim();

  if (!trimmedId || !isValidUuid(trimmedId)) {
    return { error: "Ungültiger Website Brief." };
  }

  try {
    const brief = await getWebsiteBrief(trimmedId, user.id);

    if (!brief) {
      return { error: "Website Brief wurde nicht gefunden." };
    }

    const validation = validateBriefForGeneration(brief);

    if (!validation.ok) {
      return { error: validation.error };
    }

    const content = generateWebsiteBlueprintContent(brief);

    await upsertWebsiteBlueprint({
      user_id: user.id,
      brief_id: brief.id,
      content,
    });

    if (brief.status === "draft") {
      await updateWebsiteBrief(brief.id, user.id, {
        ...toUpdateInput(brief),
        status: "ready",
      });
    }

    revalidateAgentPaths(brief.agent_id);

    return {
      success: true,
      message: "Website Blueprint wurde erfolgreich generiert.",
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Website Blueprint konnte nicht generiert werden.";
    return { error: message };
  }
}
