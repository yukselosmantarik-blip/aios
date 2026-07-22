"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getProjectById } from "@/lib/projects";
import {
  createTask,
  deleteTask,
  getTask,
  TASK_PRIORITIES,
  TASK_STATUSES,
  updateTask,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/tasks";
import type { UpdateTaskInput } from "@/lib/tasks.types";
import { createClient } from "@/lib/supabase/server";

export type CreateTaskState = {
  error?: string;
  success?: boolean;
};

export type UpdateTaskState = {
  error?: string;
  success?: boolean;
  message?: string;
};

export type DeleteTaskState = {
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

function isTaskStatus(value: string): value is TaskStatus {
  return TASK_STATUSES.includes(value as TaskStatus);
}

function isTaskPriority(value: string): value is TaskPriority {
  return TASK_PRIORITIES.includes(value as TaskPriority);
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

function resolveCompletedAt(status: TaskStatus): string | null {
  return status === "done" ? new Date().toISOString() : null;
}

async function parseTaskFields(
  formData: FormData,
  userId: string,
): Promise<
  | { ok: true; data: UpdateTaskInput }
  | { ok: false; error: string }
> {
  const title = formData.get("title")?.toString().trim() ?? "";
  const projectId = formData.get("project_id")?.toString().trim() ?? "";
  const statusValue = formData.get("status")?.toString().trim() || "todo";
  const priorityValue =
    formData.get("priority")?.toString().trim() || "medium";

  if (!title) {
    return { ok: false, error: "Aufgabentitel ist erforderlich." };
  }

  if (!projectId || !isValidUuid(projectId)) {
    return { ok: false, error: "Bitte wähle ein gültiges Projekt." };
  }

  if (!isTaskStatus(statusValue)) {
    return { ok: false, error: "Ungültiger Status." };
  }

  if (!isTaskPriority(priorityValue)) {
    return { ok: false, error: "Ungültige Priorität." };
  }

  const dueDate = parseOptionalDate(formData.get("due_date"));
  if (!dueDate.ok) {
    return { ok: false, error: dueDate.error };
  }

  const project = await getProjectById(projectId, userId);

  if (!project) {
    return { ok: false, error: "Das ausgewählte Projekt wurde nicht gefunden." };
  }

  return {
    ok: true,
    data: {
      project_id: projectId,
      title,
      description: optionalText(formData.get("description")),
      status: statusValue,
      priority: priorityValue,
      due_date: dueDate.value,
      completed_at: resolveCompletedAt(statusValue),
    },
  };
}

export async function createTaskAction(
  _prevState: CreateTaskState,
  formData: FormData,
): Promise<CreateTaskState> {
  const user = await requireUser();
  const parsed = await parseTaskFields(formData, user.id);

  if (!parsed.ok) {
    return { error: parsed.error };
  }

  try {
    await createTask({
      ...parsed.data,
      user_id: user.id,
    });

    revalidatePath("/tasks");
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Aufgabe konnte nicht erstellt werden.";
    return { error: message };
  }
}

export async function updateTaskAction(
  _prevState: UpdateTaskState,
  formData: FormData,
): Promise<UpdateTaskState> {
  const user = await requireUser();
  const id = formData.get("id")?.toString().trim() ?? "";

  if (!id || !isValidUuid(id)) {
    return { error: "Ungültige Aufgabe." };
  }

  const parsed = await parseTaskFields(formData, user.id);

  if (!parsed.ok) {
    return { error: parsed.error };
  }

  try {
    await updateTask(id, user.id, parsed.data);
    revalidatePath("/tasks");
    return {
      success: true,
      message: "Aufgabe wurde erfolgreich aktualisiert.",
    };
  } catch {
    return {
      error:
        "Die Aufgabe konnte nicht gespeichert werden. Bitte versuche es erneut.",
    };
  }
}

export async function deleteTaskAction(
  id: string,
): Promise<DeleteTaskState> {
  const user = await requireUser();
  const trimmedId = id.trim();

  if (!trimmedId || !isValidUuid(trimmedId)) {
    return { error: "Ungültige Aufgabe." };
  }

  try {
    const task = await getTask(trimmedId);

    if (!task || task.user_id !== user.id) {
      return { error: "Aufgabe wurde nicht gefunden." };
    }

    await deleteTask(trimmedId, user.id);
    revalidatePath("/tasks");

    return {
      success: true,
      message: "Aufgabe wurde erfolgreich gelöscht.",
    };
  } catch {
    return {
      error:
        "Die Aufgabe konnte nicht gelöscht werden. Bitte versuche es erneut.",
    };
  }
}
