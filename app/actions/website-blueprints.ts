"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { enhanceWebsiteBlueprint } from "@/lib/ai/enhance-blueprint";
import { AIProviderError } from "@/lib/ai/types";
import {
  AI_V1_PROVIDER,
  createAIUsageLog,
  getGermanAIEnhancementErrorMessage,
  isAIEnhancementRateLimited,
} from "@/lib/ai-usage";
import type { AIUsageErrorCode } from "@/lib/ai-usage.types";
import { getAgent } from "@/lib/agents";
import { generateWebsiteBlueprintContent } from "@/lib/website-blueprint-generator";
import {
  getWebsiteBrief,
  updateWebsiteBrief,
} from "@/lib/website-briefs";
import type { WebsiteBrief } from "@/lib/website-briefs.types";
import type { UpdateWebsiteBriefInput } from "@/lib/website-briefs.types";
import {
  getWebsiteBlueprintByBrief,
  upsertWebsiteBlueprint,
} from "@/lib/website-blueprints";
import { createClient } from "@/lib/supabase/server";

export type GenerateWebsiteBlueprintState = {
  error?: string;
  success?: boolean;
  message?: string;
};

export type ImproveWebsiteBlueprintState = {
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
      try {
        await updateWebsiteBrief(brief.id, user.id, {
          ...toUpdateInput(brief),
          status: "ready",
        });
      } catch {
        // Blueprint was saved; brief status update must not block success.
      }
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

type AIUsageLogContext = {
  userId: string;
  agentId: string;
  briefId: string;
  provider: string;
  model: string;
};

async function logAIUsageFailure(
  context: AIUsageLogContext,
  errorCode: AIUsageErrorCode,
): Promise<void> {
  try {
    await createAIUsageLog({
      user_id: context.userId,
      agent_id: context.agentId,
      brief_id: context.briefId,
      provider: context.provider,
      model: context.model,
      status: "failed",
      error_code: errorCode,
    });
  } catch {
    // Usage logging must not block the user-facing error response.
  }
}

export async function improveWebsiteBlueprintAction(
  briefId: string,
): Promise<ImproveWebsiteBlueprintState> {
  const user = await requireUser();
  const trimmedId = briefId.trim();

  if (!trimmedId || !isValidUuid(trimmedId)) {
    return { error: "Ungültiger Website Brief." };
  }

  let usageContext: AIUsageLogContext | null = null;

  try {
    const brief = await getWebsiteBrief(trimmedId, user.id);

    if (!brief) {
      return { error: "Website Brief wurde nicht gefunden." };
    }

    const agent = await getAgent(brief.agent_id);

    if (!agent || agent.user_id !== user.id) {
      return { error: "Agent wurde nicht gefunden." };
    }

    usageContext = {
      userId: user.id,
      agentId: agent.id,
      briefId: brief.id,
      provider: agent.provider,
      model: agent.model,
    };

    if (agent.status !== "active") {
      await logAIUsageFailure(usageContext, "agent_not_active");
      return {
        error: getGermanAIEnhancementErrorMessage("agent_not_active"),
      };
    }

    if (agent.provider !== AI_V1_PROVIDER) {
      await logAIUsageFailure(usageContext, "unsupported_provider");
      return {
        error: getGermanAIEnhancementErrorMessage("unsupported_provider"),
      };
    }

    const existingBlueprint = await getWebsiteBlueprintByBrief(
      brief.id,
      user.id,
    );

    if (!existingBlueprint) {
      await logAIUsageFailure(usageContext, "no_blueprint");
      return {
        error: getGermanAIEnhancementErrorMessage("no_blueprint"),
      };
    }

    if (await isAIEnhancementRateLimited(user.id)) {
      await logAIUsageFailure(usageContext, "rate_limited");
      return {
        error: getGermanAIEnhancementErrorMessage("rate_limited"),
      };
    }

    const enhancement = await enhanceWebsiteBlueprint({
      brief,
      agent,
      blueprint: existingBlueprint.content,
    });

    try {
      await upsertWebsiteBlueprint({
        user_id: user.id,
        brief_id: brief.id,
        content: enhancement.content,
        generation_source: "ai",
        generation_provider: enhancement.provider,
        generation_model: enhancement.model,
      });
    } catch {
      await logAIUsageFailure(usageContext, "save_failed");
      return {
        error: getGermanAIEnhancementErrorMessage("save_failed"),
      };
    }

    try {
      await createAIUsageLog({
        user_id: user.id,
        agent_id: agent.id,
        brief_id: brief.id,
        provider: enhancement.provider,
        model: enhancement.model,
        status: "success",
        input_tokens: enhancement.usage.inputTokens,
        output_tokens: enhancement.usage.outputTokens,
      });
    } catch {
      // Blueprint was saved; logging failure must not undo user success.
    }

    revalidateAgentPaths(brief.agent_id);

    return {
      success: true,
      message: "Blueprint wurde mit KI verbessert.",
    };
  } catch (error) {
    if (error instanceof AIProviderError) {
      if (usageContext) {
        await logAIUsageFailure(usageContext, error.code);
      }

      return {
        error: getGermanAIEnhancementErrorMessage(error.code),
      };
    }

    const message =
      error instanceof Error
        ? error.message
        : "Blueprint konnte nicht mit KI verbessert werden.";

    return { error: message };
  }
}
