"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
} from "react";
import { createCustomerAction } from "@/app/actions/customers";
import {
  CUSTOMER_SOURCE_OPTIONS,
  CUSTOMER_STATUSES,
} from "@/lib/customers.types";

const statusLabels: Record<(typeof CUSTOMER_STATUSES)[number], string> = {
  lead: "Lead",
  contacted: "Kontaktiert",
  meeting: "Meeting",
  proposal: "Angebot",
  customer: "Kunde",
  inactive: "Inaktiv",
};

const fieldClassName =
  "w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

const labelClassName = "mb-1.5 block text-sm font-medium text-zinc-300";

export default function CreateCustomerDialog() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const titleId = useId();

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
      const result = await createCustomerAction({}, formData);

      if (result.error) {
        setError(result.error);
        return;
      }

      setError(undefined);
      setOpen(false);
      formRef.current?.reset();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        + Neuer Kunde
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
              <h2
                id={titleId}
                className="text-lg font-semibold text-zinc-50"
              >
                Neuer Kunde
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                Lege einen neuen CRM-Eintrag an.
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
                  <label htmlFor="company_name" className={labelClassName}>
                    Unternehmen *
                  </label>
                  <input
                    id="company_name"
                    name="company_name"
                    type="text"
                    required
                    className={fieldClassName}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="contact_first_name"
                      className={labelClassName}
                    >
                      Vorname *
                    </label>
                    <input
                      id="contact_first_name"
                      name="contact_first_name"
                      type="text"
                      required
                      className={fieldClassName}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact_last_name"
                      className={labelClassName}
                    >
                      Nachname *
                    </label>
                    <input
                      id="contact_last_name"
                      name="contact_last_name"
                      type="text"
                      required
                      className={fieldClassName}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className={labelClassName}>
                    E-Mail *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className={fieldClassName}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="phone" className={labelClassName}>
                      Telefon
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      className={fieldClassName}
                    />
                  </div>
                  <div>
                    <label htmlFor="website" className={labelClassName}>
                      Website
                    </label>
                    <input
                      id="website"
                      name="website"
                      type="url"
                      placeholder="https://"
                      className={fieldClassName}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="industry" className={labelClassName}>
                      Branche
                    </label>
                    <input
                      id="industry"
                      name="industry"
                      type="text"
                      className={fieldClassName}
                    />
                  </div>
                  <div>
                    <label htmlFor="source" className={labelClassName}>
                      Quelle
                    </label>
                    <select
                      id="source"
                      name="source"
                      defaultValue=""
                      className={fieldClassName}
                    >
                      <option value="">Keine Angabe</option>
                      {CUSTOMER_SOURCE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="status" className={labelClassName}>
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    defaultValue="lead"
                    className={fieldClassName}
                  >
                    {CUSTOMER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </select>
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
                  {isPending ? "Wird gespeichert…" : "Kunde anlegen"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
