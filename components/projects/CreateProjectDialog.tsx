"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { createProjectAction } from "@/app/actions/projects";
import {
  PROJECT_PRIORITIES,
  PROJECT_STATUSES,
  type CustomerOption,
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

type CreateProjectDialogProps = {
  customers: CustomerOption[];
};

export default function CreateProjectDialog({
  customers,
}: CreateProjectDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const titleId = useId();
  const canCreate = customers.length > 0;

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  function handleOpen() {
    setError(undefined);
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await createProjectAction({}, formData);

      if (result.error) {
        setError(result.error);
        return;
      }

      setError(undefined);
      setOpen(false);
      formRef.current?.reset();
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        disabled={!canCreate}
        title={
          canCreate
            ? undefined
            : "Lege zuerst einen Kunden an, bevor du ein Projekt erstellst."
        }
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        + Neues Projekt
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Dialog schließen"
            className="absolute inset-0 bg-black/70"
            onClick={handleClose}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-900 shadow-md"
          >
            <div className="border-b border-zinc-800 px-6 py-4">
              <h2 id={titleId} className="text-lg font-semibold text-zinc-50">
                Neues Projekt
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                Lege ein neues Kundenprojekt an.
              </p>
            </div>

            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="px-6 py-5"
            >
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
                  <label htmlFor="name" className={labelClassName}>
                    Projektname *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className={fieldClassName}
                  />
                </div>

                <div>
                  <label htmlFor="customer_id" className={labelClassName}>
                    Kunde *
                  </label>
                  <select
                    id="customer_id"
                    name="customer_id"
                    required
                    defaultValue={customers[0]?.id ?? ""}
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
                  <label htmlFor="description" className={labelClassName}>
                    Beschreibung
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    className={fieldClassName}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="status" className={labelClassName}>
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      defaultValue="planned"
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
                    <label htmlFor="priority" className={labelClassName}>
                      Priorität
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      defaultValue="medium"
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
                    <label htmlFor="start_date" className={labelClassName}>
                      Startdatum
                    </label>
                    <input
                      id="start_date"
                      name="start_date"
                      type="date"
                      className={fieldClassName}
                    />
                  </div>
                  <div>
                    <label htmlFor="end_date" className={labelClassName}>
                      Enddatum
                    </label>
                    <input
                      id="end_date"
                      name="end_date"
                      type="date"
                      className={fieldClassName}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-zinc-800 pt-5">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending ? "Wird gespeichert…" : "Projekt anlegen"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
