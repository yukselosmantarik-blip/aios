"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { updateCustomerAction } from "@/app/actions/customers";
import {
  CUSTOMER_SOURCE_OPTIONS,
  CUSTOMER_STATUSES,
  type Customer,
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

type CustomerFormValues = {
  company_name: string;
  contact_first_name: string;
  contact_last_name: string;
  email: string;
  website: string;
  industry: string;
  phone: string;
  source: string;
  status: Customer["status"];
};

type EditCustomerDialogProps = {
  customer: Customer | null;
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
};

type EditCustomerFormProps = {
  customer: Customer;
  onClose: () => void;
  onSuccess: (message: string) => void;
};

function toFormValues(customer: Customer): CustomerFormValues {
  return {
    company_name: customer.company_name,
    contact_first_name: customer.contact_first_name,
    contact_last_name: customer.contact_last_name,
    email: customer.email,
    website: customer.website ?? "",
    industry: customer.industry ?? "",
    phone: customer.phone ?? "",
    source: customer.source ?? "",
    status: customer.status,
  };
}

function EditCustomerForm({
  customer,
  onClose,
  onSuccess,
}: EditCustomerFormProps) {
  const [error, setError] = useState<string | undefined>();
  const [values, setValues] = useState(() => toFormValues(customer));
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

  function updateField<K extends keyof CustomerFormValues>(
    field: K,
    value: CustomerFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData();
    formData.set("id", customer.id);
    formData.set("company_name", values.company_name);
    formData.set("contact_first_name", values.contact_first_name);
    formData.set("contact_last_name", values.contact_last_name);
    formData.set("email", values.email);
    formData.set("website", values.website);
    formData.set("industry", values.industry);
    formData.set("phone", values.phone);
    formData.set("source", values.source);
    formData.set("status", values.status);

    startTransition(async () => {
      const result = await updateCustomerAction({}, formData);

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
            Kunde bearbeiten
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Aktualisiere die Daten für {customer.company_name}.
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
              <label htmlFor="edit_company_name" className={labelClassName}>
                Unternehmen *
              </label>
              <input
                id="edit_company_name"
                name="company_name"
                type="text"
                required
                value={values.company_name}
                onChange={(event) =>
                  updateField("company_name", event.target.value)
                }
                className={fieldClassName}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="edit_contact_first_name"
                  className={labelClassName}
                >
                  Vorname *
                </label>
                <input
                  id="edit_contact_first_name"
                  name="contact_first_name"
                  type="text"
                  required
                  value={values.contact_first_name}
                  onChange={(event) =>
                    updateField("contact_first_name", event.target.value)
                  }
                  className={fieldClassName}
                />
              </div>
              <div>
                <label
                  htmlFor="edit_contact_last_name"
                  className={labelClassName}
                >
                  Nachname *
                </label>
                <input
                  id="edit_contact_last_name"
                  name="contact_last_name"
                  type="text"
                  required
                  value={values.contact_last_name}
                  onChange={(event) =>
                    updateField("contact_last_name", event.target.value)
                  }
                  className={fieldClassName}
                />
              </div>
            </div>

            <div>
              <label htmlFor="edit_email" className={labelClassName}>
                E-Mail *
              </label>
              <input
                id="edit_email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={values.email}
                onChange={(event) => updateField("email", event.target.value)}
                className={fieldClassName}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="edit_phone" className={labelClassName}>
                  Telefon
                </label>
                <input
                  id="edit_phone"
                  name="phone"
                  type="tel"
                  value={values.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  className={fieldClassName}
                />
              </div>
              <div>
                <label htmlFor="edit_website" className={labelClassName}>
                  Website
                </label>
                <input
                  id="edit_website"
                  name="website"
                  type="url"
                  placeholder="https://"
                  value={values.website}
                  onChange={(event) =>
                    updateField("website", event.target.value)
                  }
                  className={fieldClassName}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="edit_industry" className={labelClassName}>
                  Branche
                </label>
                <input
                  id="edit_industry"
                  name="industry"
                  type="text"
                  value={values.industry}
                  onChange={(event) =>
                    updateField("industry", event.target.value)
                  }
                  className={fieldClassName}
                />
              </div>
              <div>
                <label htmlFor="edit_source" className={labelClassName}>
                  Quelle
                </label>
                <select
                  id="edit_source"
                  name="source"
                  value={values.source}
                  onChange={(event) =>
                    updateField("source", event.target.value)
                  }
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
              <label htmlFor="edit_status" className={labelClassName}>
                Status
              </label>
              <select
                id="edit_status"
                name="status"
                value={values.status}
                onChange={(event) =>
                  updateField("status", event.target.value as Customer["status"])
                }
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

export default function EditCustomerDialog({
  customer,
  open,
  onClose,
  onSuccess,
}: EditCustomerDialogProps) {
  if (!open || !customer) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <EditCustomerForm
        key={`${customer.id}-${customer.updated_at}`}
        customer={customer}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </div>
  );
}
