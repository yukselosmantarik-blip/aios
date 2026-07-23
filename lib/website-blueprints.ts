import { getWebsiteBrief } from "@/lib/website-briefs";
import { createClient } from "@/lib/supabase/server";
import type {
  UpsertWebsiteBlueprintInput,
  WebsiteBlueprint,
  WebsiteBlueprintContent,
} from "@/lib/website-blueprints.types";

export type {
  UpsertWebsiteBlueprintInput,
  WebsiteBlueprint,
  WebsiteBlueprintContent,
} from "@/lib/website-blueprints.types";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isPageSectionsRecord(
  value: unknown,
): value is Record<string, string[]> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every((sections) => isStringArray(sections));
}

export function isWebsiteBlueprintContent(
  value: unknown,
): value is WebsiteBlueprintContent {
  if (!value || typeof value !== "object") {
    return false;
  }

  const content = value as WebsiteBlueprintContent;

  return (
    isNonEmptyString(content.projectSummary) &&
    isNonEmptyString(content.targetAudienceSummary) &&
    isNonEmptyString(content.brandDirection) &&
    isStringArray(content.recommendedSitemap) &&
    isPageSectionsRecord(content.recommendedPageSections) &&
    isStringArray(content.features) &&
    isStringArray(content.contentRequirements) &&
    isStringArray(content.seoBasics) &&
    isNonEmptyString(content.technicalRecommendation) &&
    isStringArray(content.implementationChecklist) &&
    isNonEmptyString(content.masterPrompt)
  );
}

export async function getWebsiteBlueprintByBrief(
  briefId: string,
  userId: string,
): Promise<WebsiteBlueprint | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("website_blueprints")
    .select("*")
    .eq("brief_id", briefId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const blueprint = data as WebsiteBlueprint;

  if (!isWebsiteBlueprintContent(blueprint.content)) {
    throw new Error("Gespeichertes Blueprint hat ein ungültiges Format.");
  }

  return blueprint;
}

export async function upsertWebsiteBlueprint(
  input: UpsertWebsiteBlueprintInput,
): Promise<WebsiteBlueprint> {
  if (!isWebsiteBlueprintContent(input.content)) {
    throw new Error("Blueprint-Inhalt ist ungültig.");
  }

  const brief = await getWebsiteBrief(input.brief_id, input.user_id);

  if (!brief) {
    throw new Error("Website Brief wurde nicht gefunden.");
  }

  const supabase = await createClient();
  const generatedAt = new Date().toISOString();

  const { data, error } = await supabase
    .from("website_blueprints")
    .upsert(
      {
        user_id: input.user_id,
        brief_id: input.brief_id,
        content: input.content,
        generated_at: generatedAt,
      },
      { onConflict: "brief_id" },
    )
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as WebsiteBlueprint;
}
