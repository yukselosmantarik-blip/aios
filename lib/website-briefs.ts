import { createClient } from "@/lib/supabase/server";
import type {
  CreateWebsiteBriefInput,
  UpdateWebsiteBriefInput,
  WebsiteBrief,
} from "@/lib/website-briefs.types";

export type {
  CreateWebsiteBriefInput,
  UpdateWebsiteBriefInput,
  WebsiteBrief,
  WebsiteBriefStatus,
} from "@/lib/website-briefs.types";

export {
  WEBSITE_BRIEF_STATUSES,
  WEBSITE_BRIEF_STATUS_OPTIONS,
} from "@/lib/website-briefs.types";

export async function listWebsiteBriefsByAgent(
  agentId: string,
): Promise<WebsiteBrief[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("website_briefs")
    .select("*")
    .eq("agent_id", agentId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as WebsiteBrief[];
}

export async function getWebsiteBrief(
  id: string,
  userId: string,
): Promise<WebsiteBrief | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("website_briefs")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as WebsiteBrief | null) ?? null;
}

export async function createWebsiteBrief(
  input: CreateWebsiteBriefInput,
): Promise<WebsiteBrief> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("website_briefs")
    .insert(input)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as WebsiteBrief;
}

export async function updateWebsiteBrief(
  id: string,
  userId: string,
  input: UpdateWebsiteBriefInput,
): Promise<WebsiteBrief> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("website_briefs")
    .update(input)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as WebsiteBrief;
}
