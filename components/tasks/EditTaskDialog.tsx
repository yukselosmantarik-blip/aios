"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { updateTaskAction } from "@/app/actions/tasks";
import type { TaskWithProjectName } from "@/components/tasks/TaskList";
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/tasks.types";

const statusLabels: Record<(typeof TASK_STATUSES)[number], string> = {
  todo: "Offen",
  in_progress: "In Bearbeitung",
  done: "Erledigt",
};

const priorityLabels: Record<(typeof TASK_PRIORITIES)[number], string> = {
  low: "Niedrig",
  medium: "Mittel",
  high: "Hoch",
};

const fieldClassName =
  "w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

const labelClassName = "mb-1.5 block text-sm font-medium text-zinc-300";

type ProjectOption = {
  id: string;
  name: string;
};

type TaskFormValues = {
  title: string;
  project_id: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string;
};

type EditTaskDialogProps = {
  task: TaskWithProjectName | null;
  projects: ProjectOption[];
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
};

type EditTaskFormProps = {
  task: TaskWithProjectName;
  projects: ProjectOption[];
  onClose: () => void;
  onSuccess: (message: string) => void;
};

function toFormValues(task: TaskWithProjectName): TaskFormValues {
  return {
    title: task.title,
    project_id: task.project_id,
    description: task.description ?? "",
    status: task.status,
    priority: task.priority,
    due_date: task.due_date ?? "",
  };
}

function EditTaskForm({
  task,
  projects,
  onClose,
  onSuccess,
}: EditTaskFormProps) {
  const [error, setError] = useState<string | undefined>();
  const [values, setValues] = useState(() => toFormValues(task));
  const [isPending, startTransition] = useTransition();
  const titleId = useId();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function updateField<K extends keyof TaskFormValues>(
    field: K,
    value: TaskFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData();
    formData.set("id", task.id);
    formData.set("title", values.title);
    formData.set("project_id", values.project_id);
    formData.set("description", values.description);
    formData.set("status", values.status);
    formData.set("priority", values.priority);
    formData.set("due_date", values.due_date);

    startTransition(async () => {
      const result = await updateTaskAction({}, formData);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.success && result.message) {
        onSuccess(result.message);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        aria-label="Dialog schließen"
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-900 shadow-md"
      >
        <div className="border-b border-zinc-800 px-6 py-4">
          <h2 id={titleId} className="text-lg font-semibold text-zinc-50">
            Aufgabe bearbeiten
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Aktualisiere die Daten für {task.title}.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5">
          {error ? (
            <p
              role="alert"
              className="mb-4 rounded-lg border border-red-900/50 bg-red-950/20 px-3 py-2 text-sm text-red-400"
            >
              {error}
            </p>
          ) : null}

          <div className="space-y-4">
            <div>
              <label htmlFor="edit_title" className={labelClassName}>
                Titel *
              </label>
              <input
                id="edit_title"
                name="title"
                type="text"
                required
                value={values.title}
                onChange={(event) => updateField("title", event.target.value)}
                className={fieldClassName}
              />
            </div>

            <div>
              <label htmlFor="edit_project_id" className={labelClassName}>
                Projekt *
              </label>
              <select
                id="edit_project_id"
                name="project_id"
                required
                value={values.project_id}
                onChange={(event) =>
                  updateField("project_id", event.target.value)
                }
                className={fieldClassName}
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="edit_description" className={labelClassName}>
                Beschreibung
              </label>
              <textarea
                id="edit_description"
                name="description"
                rows={3}
                value={values.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                className={fieldClassName}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="edit_status" className={labelClassName}>
                  Status
                </label>
                <select
                  id="edit_status"
                  name="status"
                  value={values.status}
                  onChange={(event) =>
                    updateField("status", event.target.value as TaskStatus)
                  }
                  className={fieldClassName}
                >
                  {TASK_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {statusLabels[status]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="edit_priority" className={labelClassName}>
                  Priorität
                </label>
                <select
                  id="edit_priority"
                  name="priority"
                  value={values.priority}
                  onChange={(event) =>
                    updateField("priority", event.target.value as TaskPriority)
                  }
                  className={fieldClassName}
                >
                  {TASK_PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {priorityLabels[priority]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="edit_due_date" className={labelClassName}>
                Fällig am
              </label>
              <input
                id="edit_due_date"
                name="due_date"
                type="date"
                value={values.due_date}
                onChange={(event) =>
                  updateField("due_date", event.target.value)
                }
                className={fieldClassName}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-zinc-800 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "Wird gespeichert…" : "Änderungen speichern"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default function EditTaskDialog({
  task,
  projects,
  open,
  onClose,
  onSuccess,
}: EditTaskDialogProps) {
  if (!open || !task) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <EditTaskForm
        key={`${task.id}-${task.updated_at}`}
        task={task}
        projects={projects}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </div>
  );
}
