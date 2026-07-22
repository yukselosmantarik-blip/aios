"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { updateProjectAction } from "@/app/actions/projects";
import {
  PROJECT_PRIORITIES,
  PROJECT_STATUSES,
  type CustomerOption,
  type ProjectWithCustomer,
} from "@/lib/projects.types";

const statusLabels: Record<(typeof PROJECT_STATUSES)[number], string> = {
  planned: "Geplant",
  active: "Aktiv",
  paused: "Pausiert",
  completed: "Abgeschlossen",
};

const priorityLabels: Record<(typeof PROJECT_PRIORITIES)[number], string> = {
  low: "Niedrig",
  medium: "Mittel",
  high: "Hoch",
};

const fieldClassName =
  "w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

const labelClassName = "mb-1.5 block text-sm font-medium text-zinc-300";

type ProjectFormValues = {
  name: string;
  customer_id: string;
  description: string;
  status: ProjectWithCustomer["status"];
  priority: ProjectWithCustomer["priority"];
  start_date: string;
  end_date: string;
};

type EditProjectDialogProps = {
  project: ProjectWithCustomer | null;
  customers: CustomerOption[];
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
};

type EditProjectFormProps = {
  project: ProjectWithCustomer;
  customers: CustomerOption[];
  onClose: () => void;
  onSuccess: (message: string) => void;
};

function toFormValues(project: ProjectWithCustomer): ProjectFormValues {
  return {
    name: project.name,
    customer_id: project.customer_id,
    description: project.description ?? "",
    status: project.status,
    priority: project.priority,
    start_date: project.start_date ?? "",
    end_date: project.end_date ?? "",
  };
}

function EditProjectForm({
  project,
  customers,
  onClose,
  onSuccess,
}: EditProjectFormProps) {
  const [error, setError] = useState<string | undefined>();
  const [values, setValues] = useState(() => toFormValues(project));
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

  function updateField<K extends keyof ProjectFormValues>(
    field: K,
    value: ProjectFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData();
    formData.set("id", project.id);
    formData.set("name", values.name);
    formData.set("customer_id", values.customer_id);
    formData.set("description", values.description);
    formData.set("status", values.status);
    formData.set("priority", values.priority);
    formData.set("start_date", values.start_date);
    formData.set("end_date", values.end_date);

    startTransition(async () => {
      const result = await updateProjectAction({}, formData);

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
            Projekt bearbeiten
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Aktualisiere die Daten für {project.name}.
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
              <label htmlFor="edit_name" className={labelClassName}>
                Projektname *
              </label>
              <input
                id="edit_name"
                name="name"
                type="text"
                required
                value={values.name}
                onChange={(event) => updateField("name", event.target.value)}
                className={fieldClassName}
              />
            </div>

            <div>
              <label htmlFor="edit_customer_id" className={labelClassName}>
                Kunde *
              </label>
              <select
                id="edit_customer_id"
                name="customer_id"
                required
                value={values.customer_id}
                onChange={(event) =>
                  updateField("customer_id", event.target.value)
                }
                className={fieldClassName}
              >
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.company_name}
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
                    updateField(
                      "status",
                      event.target.value as ProjectWithCustomer["status"],
                    )
                  }
                  className={fieldClassName}
                >
                  {PROJECT_STATUSES.map((status) => (
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
                    updateField(
                      "priority",
                      event.target.value as ProjectWithCustomer["priority"],
                    )
                  }
                  className={fieldClassName}
                >
                  {PROJECT_PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {priorityLabels[priority]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="edit_start_date" className={labelClassName}>
                  Startdatum
                </label>
                <input
                  id="edit_start_date"
                  name="start_date"
                  type="date"
                  value={values.start_date}
                  onChange={(event) =>
                    updateField("start_date", event.target.value)
                  }
                  className={fieldClassName}
                />
              </div>
              <div>
                <label htmlFor="edit_end_date" className={labelClassName}>
                  Enddatum
                </label>
                <input
                  id="edit_end_date"
                  name="end_date"
                  type="date"
                  value={values.end_date}
                  onChange={(event) =>
                    updateField("end_date", event.target.value)
                  }
                  className={fieldClassName}
                />
              </div>
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

export default function EditProjectDialog({
  project,
  customers,
  open,
  onClose,
  onSuccess,
}: EditProjectDialogProps) {
  if (!open || !project) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <EditProjectForm
        key={`${project.id}-${project.updated_at}`}
        project={project}
        customers={customers}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </div>
  );
}
