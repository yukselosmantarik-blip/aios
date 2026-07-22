"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCustomerById } from "@/lib/customers";
import {
  createProject,
  deleteProject,
  getProjectById,
  PROJECT_PRIORITIES,
  PROJECT_STATUSES,
  updateProject,
  type ProjectPriority,
  type ProjectStatus,
} from "@/lib/projects";
import type { UpdateProjectInput } from "@/lib/projects.types";
import { createClient } from "@/lib/supabase/server";

export type CreateProjectState = {
  error?: string;
  success?: boolean;
};

export type UpdateProjectState = {
  error?: string;
  success?: boolean;
  message?: string;
};

export type DeleteProjectState = {
  error?: string;
  success?: boolean;
  message?: string;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

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

function isProjectStatus(value: string): value is ProjectStatus {
  return PROJECT_STATUSES.includes(value as ProjectStatus);
}

function isProjectPriority(value: string): value is ProjectPriority {
  return PROJECT_PRIORITIES.includes(value as ProjectPriority);
}

function parseOptionalDate(
  value: FormDataEntryValue | null,
): { ok: true; value: string | null } | { ok: false; error: string } {
  const trimmed = value?.toString().trim();

  if (!trimmed) {
    return { ok: true, value: null };
  }

  if (!DATE_PATTERN.test(trimmed)) {
    return { ok: false, error: "Ungültiges Datumsformat." };
  }

  const parsed = new Date(`${trimmed}T00:00:00.000Z`);

  if (Number.isNaN(parsed.getTime())) {
    return { ok: false, error: "Ungültiges Datum." };
  }

  return { ok: true, value: trimmed };
}

async function parseProjectFields(
  formData: FormData,
  userId: string,
): Promise<
  | { ok: true; data: UpdateProjectInput }
  | { ok: false; error: string }
> {
  const name = formData.get("name")?.toString().trim() ?? "";
  const customerId = formData.get("customer_id")?.toString().trim() ?? "";
  const statusValue = formData.get("status")?.toString().trim() || "planned";
  const priorityValue =
    formData.get("priority")?.toString().trim() || "medium";

  if (!name) {
    return { ok: false, error: "Projektname ist erforderlich." };
  }

  if (!customerId || !isValidUuid(customerId)) {
    return { ok: false, error: "Bitte wähle einen gültigen Kunden." };
  }

  if (!isProjectStatus(statusValue)) {
    return { ok: false, error: "Ungültiger Status." };
  }

  if (!isProjectPriority(priorityValue)) {
    return { ok: false, error: "Ungültige Priorität." };
  }

  const startDate = parseOptionalDate(formData.get("start_date"));
  if (!startDate.ok) {
    return { ok: false, error: startDate.error };
  }

  const endDate = parseOptionalDate(formData.get("end_date"));
  if (!endDate.ok) {
    return { ok: false, error: endDate.error };
  }

  if (
    startDate.value &&
    endDate.value &&
    endDate.value < startDate.value
  ) {
    return {
      ok: false,
      error: "Das Enddatum darf nicht vor dem Startdatum liegen.",
    };
  }

  const customer = await getCustomerById(customerId, userId);

  if (!customer) {
    return { ok: false, error: "Der ausgewählte Kunde wurde nicht gefunden." };
  }

  return {
    ok: true,
    data: {
      name,
      customer_id: customerId,
      description: optionalText(formData.get("description")),
      status: statusValue,
      priority: priorityValue,
      start_date: startDate.value,
      end_date: endDate.value,
    },
  };
}

export async function createProjectAction(
  _prevState: CreateProjectState,
  formData: FormData,
): Promise<CreateProjectState> {
  const user = await requireUser();
  const parsed = await parseProjectFields(formData, user.id);

  if (!parsed.ok) {
    return { error: parsed.error };
  }

  try {
    await createProject({
      ...parsed.data,
      owner_id: user.id,
    });

    revalidatePath("/projects");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Projekt konnte nicht erstellt werden.";
    return { error: message };
  }
}

export async function updateProjectAction(
  _prevState: UpdateProjectState,
  formData: FormData,
): Promise<UpdateProjectState> {
  const user = await requireUser();
  const id = formData.get("id")?.toString().trim() ?? "";

  if (!id || !isValidUuid(id)) {
    return { error: "Ungültiges Projekt." };
  }

  const parsed = await parseProjectFields(formData, user.id);

  if (!parsed.ok) {
    return { error: parsed.error };
  }

  try {
    await updateProject(id, user.id, parsed.data);
    revalidatePath("/projects");
    revalidatePath("/");
    return {
      success: true,
      message: "Projekt wurde erfolgreich aktualisiert.",
    };
  } catch {
    return {
      error:
        "Das Projekt konnte nicht gespeichert werden. Bitte versuche es erneut.",
    };
  }
}

export async function deleteProjectAction(
  id: string,
): Promise<DeleteProjectState> {
  const user = await requireUser();
  const trimmedId = id.trim();

  if (!trimmedId || !isValidUuid(trimmedId)) {
    return { error: "Ungültiges Projekt." };
  }

  try {
    const project = await getProjectById(trimmedId, user.id);

    if (!project) {
      return { error: "Projekt wurde nicht gefunden." };
    }

    await deleteProject(trimmedId, user.id);
    revalidatePath("/projects");
    revalidatePath("/");

    return {
      success: true,
      message: "Projekt wurde erfolgreich gelöscht.",
    };
  } catch {
    return {
      error:
        "Das Projekt konnte nicht gelöscht werden. Bitte versuche es erneut.",
    };
  }
}
