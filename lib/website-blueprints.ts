import { getWebsiteBrief } from "@/lib/website-briefs";
import {
  isWebsiteBlueprintContent,
  validateWebsiteBlueprintContent,
} from "@/lib/website-blueprint-validator";
import { createClient } from "@/lib/supabase/server";
import type {
  UpsertWebsiteBlueprintInput,
  WebsiteBlueprint,
} from "@/lib/website-blueprints.types";

export type {
  UpsertWebsiteBlueprintInput,
  WebsiteBlueprint,
  WebsiteBlueprintContent,
} from "@/lib/website-blueprints.types";

export {
  isWebsiteBlueprintContent,
  validateWebsiteBlueprintContent,
  WEBSITE_BLUEPRINT_LIMITS,
} from "@/lib/website-blueprint-validator";

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
  const validated = validateWebsiteBlueprintContent(input.content);

  if (!validated.ok) {
    throw new Error(validated.error);
  }

  const brief = await getWebsiteBrief(input.brief_id, input.user_id);

  if (!brief) {
    throw new Error("Website Brief wurde nicht gefunden.");
  }

  const supabase = await createClient();
  const generatedAt = new Date().toISOString();

  const payload = {
    content: validated.data,
    generated_at: generatedAt,
    generation_source: input.generation_source ?? "deterministic",
    generation_provider: input.generation_provider ?? null,
    generation_model: input.generation_model ?? null,
  };

  const { data: existing, error: existingError } = await supabase
    .from("website_blueprints")
    .select("id")
    .eq("brief_id", input.brief_id)
    .eq("user_id", input.user_id)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  const { data, error } = existing
    ? await supabase
        .from("website_blueprints")
        .update(payload)
        .eq("brief_id", input.brief_id)
        .eq("user_id", input.user_id)
        .select()
        .single()
    : await supabase
        .from("website_blueprints")
        .insert({
          user_id: input.user_id,
          brief_id: input.brief_id,
          ...payload,
        })
        .select()
        .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Blueprint konnte nicht gespeichert werden.");
  }

  return data as WebsiteBlueprint;
}
