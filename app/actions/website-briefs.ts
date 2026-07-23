"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAgent } from "@/lib/agents";
import { getCustomerById } from "@/lib/customers";
import { getProjectById } from "@/lib/projects";
import {
  createWebsiteBrief,
  getWebsiteBrief,
  updateWebsiteBrief,
  WEBSITE_BRIEF_STATUSES,
  type WebsiteBriefStatus,
} from "@/lib/website-briefs";
import type { UpdateWebsiteBriefInput } from "@/lib/website-briefs.types";
import { createClient } from "@/lib/supabase/server";

export type CreateWebsiteBriefState = {
  error?: string;
  success?: boolean;
  message?: string;
};

export type UpdateWebsiteBriefState = {
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

function optionalText(value: FormDataEntryValue | null): string | null {
  const trimmed = value?.toString().trim();
  return trimmed ? trimmed : null;
}

function isValidUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

function isWebsiteBriefStatus(value: string): value is WebsiteBriefStatus {
  return WEBSITE_BRIEF_STATUSES.includes(value as WebsiteBriefStatus);
}

function parseWebsiteBriefFields(formData: FormData):
  | { ok: true; data: UpdateWebsiteBriefInput }
  | { ok: false; error: string } {
  const business_name = formData.get("business_name")?.toString().trim() ?? "";
  const industry = formData.get("industry")?.toString().trim() ?? "";
  const website_goal = formData.get("website_goal")?.toString().trim() ?? "";
  const target_audience =
    formData.get("target_audience")?.toString().trim() ?? "";
  const statusValue = formData.get("status")?.toString().trim() || "draft";

  if (!business_name) {
    return { ok: false, error: "Unternehmensname ist erforderlich." };
  }

  if (!industry) {
    return { ok: false, error: "Branche ist erforderlich." };
  }

  if (!website_goal) {
    return { ok: false, error: "Website-Ziel ist erforderlich." };
  }

  if (!target_audience) {
    return { ok: false, error: "Zielgruppe ist erforderlich." };
  }

  if (!isWebsiteBriefStatus(statusValue)) {
    return { ok: false, error: "Ungültiger Status." };
  }

  const customerIdRaw = formData.get("customer_id")?.toString().trim() ?? "";
  const projectIdRaw = formData.get("project_id")?.toString().trim() ?? "";

  if (customerIdRaw && !isValidUuid(customerIdRaw)) {
    return { ok: false, error: "Ungültiger Kunde." };
  }

  if (projectIdRaw && !isValidUuid(projectIdRaw)) {
    return { ok: false, error: "Ungültiges Projekt." };
  }

  return {
    ok: true,
    data: {
      customer_id: customerIdRaw || null,
      project_id: projectIdRaw || null,
      business_name,
      industry,
      location: optionalText(formData.get("location")),
      website_goal,
      target_audience,
      services: optionalText(formData.get("services")),
      unique_selling_points: optionalText(formData.get("unique_selling_points")),
      preferred_style: optionalText(formData.get("preferred_style")),
      primary_color: optionalText(formData.get("primary_color")),
      secondary_color: optionalText(formData.get("secondary_color")),
      required_pages: optionalText(formData.get("required_pages")),
      required_features: optionalText(formData.get("required_features")),
      reference_websites: optionalText(formData.get("reference_websites")),
      additional_notes: optionalText(formData.get("additional_notes")),
      status: statusValue,
    },
  };
}

async function validateBriefReferences(
  userId: string,
  agentId: string,
  customerId: string | null,
  projectId: string | null,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isValidUuid(agentId)) {
    return { ok: false, error: "Ungültiger Agent." };
  }

  const agent = await getAgent(agentId);

  if (!agent || agent.user_id !== userId) {
    return { ok: false, error: "Agent wurde nicht gefunden." };
  }

  if (customerId) {
    const customer = await getCustomerById(customerId, userId);

    if (!customer) {
      return { ok: false, error: "Der ausgewählte Kunde wurde nicht gefunden." };
    }
  }

  if (projectId) {
    const project = await getProjectById(projectId, userId);

    if (!project) {
      return {
        ok: false,
        error: "Das ausgewählte Projekt wurde nicht gefunden.",
      };
    }
  }

  return { ok: true };
}

function revalidateAgentPaths(agentId: string) {
  revalidatePath("/agents");
  revalidatePath(`/agents/${agentId}`);
}

export async function createWebsiteBriefAction(
  _prevState: CreateWebsiteBriefState,
  formData: FormData,
): Promise<CreateWebsiteBriefState> {
  const user = await requireUser();
  const agentId = formData.get("agent_id")?.toString().trim() ?? "";
  const parsed = parseWebsiteBriefFields(formData);

  if (!parsed.ok) {
    return { error: parsed.error };
  }

  const references = await validateBriefReferences(
    user.id,
    agentId,
    parsed.data.customer_id,
    parsed.data.project_id,
  );

  if (!references.ok) {
    return { error: references.error };
  }

  try {
    await createWebsiteBrief({
      ...parsed.data,
      user_id: user.id,
      agent_id: agentId,
    });

    revalidateAgentPaths(agentId);

    return {
      success: true,
      message: "Website Brief wurde erfolgreich erstellt.",
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Website Brief konnte nicht erstellt werden.";
    return { error: message };
  }
}

export async function updateWebsiteBriefAction(
  _prevState: UpdateWebsiteBriefState,
  formData: FormData,
): Promise<UpdateWebsiteBriefState> {
  const user = await requireUser();
  const id = formData.get("id")?.toString().trim() ?? "";

  if (!id || !isValidUuid(id)) {
    return { error: "Ungültiger Website Brief." };
  }

  const parsed = parseWebsiteBriefFields(formData);

  if (!parsed.ok) {
    return { error: parsed.error };
  }

  const existingBrief = await getWebsiteBrief(id, user.id);

  if (!existingBrief) {
    return { error: "Website Brief wurde nicht gefunden." };
  }

  const references = await validateBriefReferences(
    user.id,
    existingBrief.agent_id,
    parsed.data.customer_id,
    parsed.data.project_id,
  );

  if (!references.ok) {
    return { error: references.error };
  }

  try {
    const updated = await updateWebsiteBrief(id, user.id, parsed.data);

    revalidateAgentPaths(updated.agent_id);

    return {
      success: true,
      message: "Website Brief wurde erfolgreich aktualisiert.",
    };
  } catch {
    return {
      error:
        "Der Website Brief konnte nicht gespeichert werden. Bitte versuche es erneut.",
    };
  }
}
