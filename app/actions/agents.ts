"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  AGENT_PROVIDERS,
  AGENT_STATUSES,
  createAgent,
  deleteAgent,
  getAgent,
  setAgentStatus,
  updateAgent,
  type AgentProvider,
  type AgentStatus,
} from "@/lib/agents";
import type { UpdateAgentInput } from "@/lib/agents.types";
import { createClient } from "@/lib/supabase/server";

export type CreateAgentState = {
  error?: string;
  success?: boolean;
};

export type UpdateAgentState = {
  error?: string;
  success?: boolean;
  message?: string;
};

export type DeleteAgentState = {
  error?: string;
  success?: boolean;
  message?: string;
};

export type AgentStatusState = {
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

function isAgentProvider(value: string): value is AgentProvider {
  return AGENT_PROVIDERS.includes(value as AgentProvider);
}

function isAgentStatus(value: string): value is AgentStatus {
  return AGENT_STATUSES.includes(value as AgentStatus);
}

function isValidUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

function parseAgentFields(formData: FormData):
  | { ok: true; data: UpdateAgentInput }
  | { ok: false; error: string } {
  const name = formData.get("name")?.toString().trim() ?? "";
  const model = formData.get("model")?.toString().trim() ?? "";
  const providerValue =
    formData.get("provider")?.toString().trim() || "openai";
  const statusValue = formData.get("status")?.toString().trim() || "draft";

  if (!name) {
    return { ok: false, error: "Agentenname ist erforderlich." };
  }

  if (!model) {
    return { ok: false, error: "Modell ist erforderlich." };
  }

  if (!isAgentProvider(providerValue)) {
    return { ok: false, error: "Ungültiger Anbieter." };
  }

  if (!isAgentStatus(statusValue)) {
    return { ok: false, error: "Ungültiger Status." };
  }

  return {
    ok: true,
    data: {
      name,
      description: optionalText(formData.get("description")),
      provider: providerValue,
      model,
      system_prompt: optionalText(formData.get("system_prompt")),
      status: statusValue,
    },
  };
}

export async function createAgentAction(
  _prevState: CreateAgentState,
  formData: FormData,
): Promise<CreateAgentState> {
  const user = await requireUser();
  const parsed = parseAgentFields(formData);

  if (!parsed.ok) {
    return { error: parsed.error };
  }

  try {
    await createAgent({
      ...parsed.data,
      user_id: user.id,
    });

    revalidatePath("/agents");
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Agent konnte nicht erstellt werden.";
    return { error: message };
  }
}

export async function updateAgentAction(
  _prevState: UpdateAgentState,
  formData: FormData,
): Promise<UpdateAgentState> {
  const user = await requireUser();
  const id = formData.get("id")?.toString().trim() ?? "";

  if (!id || !isValidUuid(id)) {
    return { error: "Ungültiger Agent." };
  }

  const parsed = parseAgentFields(formData);

  if (!parsed.ok) {
    return { error: parsed.error };
  }

  try {
    await updateAgent(id, user.id, parsed.data);
    revalidatePath("/agents");
    return {
      success: true,
      message: "Agent wurde erfolgreich aktualisiert.",
    };
  } catch {
    return {
      error:
        "Der Agent konnte nicht gespeichert werden. Bitte versuche es erneut.",
    };
  }
}

export async function deleteAgentAction(
  id: string,
): Promise<DeleteAgentState> {
  const user = await requireUser();
  const trimmedId = id.trim();

  if (!trimmedId || !isValidUuid(trimmedId)) {
    return { error: "Ungültiger Agent." };
  }

  try {
    const agent = await getAgent(trimmedId);

    if (!agent || agent.user_id !== user.id) {
      return { error: "Agent wurde nicht gefunden." };
    }

    await deleteAgent(trimmedId, user.id);
    revalidatePath("/agents");

    return {
      success: true,
      message: "Agent wurde erfolgreich gelöscht.",
    };
  } catch {
    return {
      error:
        "Der Agent konnte nicht gelöscht werden. Bitte versuche es erneut.",
    };
  }
}

export async function activateAgentAction(
  id: string,
): Promise<AgentStatusState> {
  const user = await requireUser();
  const trimmedId = id.trim();

  if (!trimmedId || !isValidUuid(trimmedId)) {
    return { error: "Ungültiger Agent." };
  }

  try {
    const agent = await getAgent(trimmedId);

    if (!agent || agent.user_id !== user.id) {
      return { error: "Agent wurde nicht gefunden." };
    }

    if (agent.status === "active") {
      return { error: "Der Agent ist bereits aktiv." };
    }

    if (agent.status !== "draft" && agent.status !== "inactive") {
      return { error: "Ungültiger Status." };
    }

    await setAgentStatus(trimmedId, user.id, "active");
    revalidatePath("/agents");

    return {
      success: true,
      message: "Agent wurde erfolgreich aktiviert.",
    };
  } catch {
    return {
      error:
        "Der Agent konnte nicht aktiviert werden. Bitte versuche es erneut.",
    };
  }
}

export async function deactivateAgentAction(
  id: string,
): Promise<AgentStatusState> {
  const user = await requireUser();
  const trimmedId = id.trim();

  if (!trimmedId || !isValidUuid(trimmedId)) {
    return { error: "Ungültiger Agent." };
  }

  try {
    const agent = await getAgent(trimmedId);

    if (!agent || agent.user_id !== user.id) {
      return { error: "Agent wurde nicht gefunden." };
    }

    if (agent.status !== "active") {
      return { error: "Nur aktive Agenten können deaktiviert werden." };
    }

    await setAgentStatus(trimmedId, user.id, "inactive");
    revalidatePath("/agents");

    return {
      success: true,
      message: "Agent wurde erfolgreich deaktiviert.",
    };
  } catch {
    return {
      error:
        "Der Agent konnte nicht deaktiviert werden. Bitte versuche es erneut.",
    };
  }
}
