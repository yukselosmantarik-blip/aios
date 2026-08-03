"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  createCustomerNoteAction,
  updateCustomerAction,
} from "@/app/actions/customers";
import CustomerStatusBadge from "@/components/customers/CustomerStatusBadge";
import DeleteCustomerDialog from "@/components/customers/DeleteCustomerDialog";
import { CUSTOMER_NOTES_MIGRATION_FILE } from "@/lib/customer-notes.constants";
import {
  CUSTOMER_SOURCE_OPTIONS,
  CUSTOMER_STATUS_OPTIONS,
  type Customer,
  type CustomerNote,
} from "@/lib/customers.types";
import {
  formatCustomerContactName,
  formatCustomerSource,
  formatCustomerWebsiteHref,
  formatPhoneTelHref,
} from "@/lib/customers-display";

const fieldClassName =
  "w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

const labelClassName = "mb-1.5 block text-sm font-medium text-zinc-300";

type CustomerDetailPageContentProps = {
  customer: Customer;
  notes: CustomerNote[];
  notesAvailable: boolean;
  ownerLabel: string;
};

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default function CustomerDetailPageContent({
  customer,
  notes,
  notesAvailable,
  ownerLabel,
}: CustomerDetailPageContentProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(customer);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [noteBody, setNoteBody] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [isSaving, startSaveTransition] = useTransition();
  const [isNotePending, startNoteTransition] = useTransition();

  const websiteHref = useMemo(
    () => formatCustomerWebsiteHref(customer.website),
    [customer.website],
  );
  const telHref = useMemo(() => formatPhoneTelHref(customer.phone), [customer.phone]);

  function resetDraft() {
    setDraft(customer);
    setIsEditing(false);
  }

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("id", customer.id);

    startSaveTransition(async () => {
      const result = await updateCustomerAction({}, formData);
      if (result.error) {
        setFeedback({ type: "error", message: result.error });
        return;
      }
      setFeedback({
        type: "success",
        message: result.message ?? "Änderungen gespeichert.",
      });
      setIsEditing(false);
      router.refresh();
    });
  }

  function handleAddNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData();
    formData.set("customer_id", customer.id);
    formData.set("body", noteBody);

    startNoteTransition(async () => {
      const result = await createCustomerNoteAction({}, formData);
      if (result.error) {
        setFeedback({ type: "error", message: result.error });
        return;
      }
      setNoteBody("");
      setFeedback({ type: "success", message: "Notiz hinzugefügt." });
      router.refresh();
    });
  }

  return (
    <>
      {feedback ? (
        <p
          role={feedback.type === "error" ? "alert" : "status"}
          className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
            feedback.type === "error"
              ? "border-red-900/50 bg-red-950/20 text-red-400"
              : "border-green-900/50 bg-green-950/20 text-green-400"
          }`}
        >
          {feedback.message}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-zinc-50">
                {customer.company_name}
              </h1>
              <p className="mt-1 text-sm text-zinc-400">
                {formatCustomerContactName(customer)}
              </p>
            </div>
            <CustomerStatusBadge status={customer.status} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {telHref ? (
              <a
                href={telHref}
                className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
              >
                Anrufen
              </a>
            ) : null}
            {customer.email ? (
              <a
                href={`mailto:${customer.email}`}
                className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
              >
                E-Mail senden
              </a>
            ) : null}
            {websiteHref ? (
              <a
                href={websiteHref}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
              >
                Website öffnen
              </a>
            ) : null}
          </div>

          {!isEditing ? (
            <>
              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-zinc-500">Branche</dt>
                  <dd className="mt-1 text-sm text-zinc-200">
                    {customer.industry ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-zinc-500">Quelle</dt>
                  <dd className="mt-1 text-sm text-zinc-200">
                    {formatCustomerSource(customer.source)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-zinc-500">E-Mail</dt>
                  <dd className="mt-1 text-sm text-zinc-200">
                    {customer.email ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-zinc-500">Telefon</dt>
                  <dd className="mt-1 text-sm text-zinc-200">
                    {customer.phone ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-zinc-500">Website</dt>
                  <dd className="mt-1 text-sm text-zinc-200">
                    {customer.website ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-zinc-500">Erstellt</dt>
                  <dd className="mt-1 text-sm text-zinc-200 tabular-nums">
                    {formatDateTime(customer.created_at)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-zinc-500">Aktualisiert</dt>
                  <dd className="mt-1 text-sm text-zinc-200 tabular-nums">
                    {formatDateTime(customer.updated_at)}
                  </dd>
                </div>
              </dl>

              <div className="mt-6 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDraft(customer);
                    setIsEditing(true);
                  }}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Bearbeiten
                </button>
                <button
                  type="button"
                  onClick={() => setShowDelete(true)}
                  className="rounded-lg border border-red-900/40 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-950/20"
                >
                  Kunde löschen
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleSave} className="mt-6 space-y-4">
              <div>
                <label htmlFor="company_name" className={labelClassName}>
                  Unternehmen *
                </label>
                <input
                  id="company_name"
                  name="company_name"
                  defaultValue={draft.company_name}
                  required
                  className={fieldClassName}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact_first_name" className={labelClassName}>
                    Vorname
                  </label>
                  <input
                    id="contact_first_name"
                    name="contact_first_name"
                    defaultValue={draft.contact_first_name ?? ""}
                    className={fieldClassName}
                  />
                </div>
                <div>
                  <label htmlFor="contact_last_name" className={labelClassName}>
                    Nachname
                  </label>
                  <input
                    id="contact_last_name"
                    name="contact_last_name"
                    defaultValue={draft.contact_last_name ?? ""}
                    className={fieldClassName}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="email" className={labelClassName}>
                    E-Mail
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={draft.email ?? ""}
                    className={fieldClassName}
                  />
                </div>
                <div>
                  <label htmlFor="phone" className={labelClassName}>
                    Telefon
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    defaultValue={draft.phone ?? ""}
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
                    defaultValue={draft.industry ?? ""}
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
                    defaultValue={draft.source ?? ""}
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
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="website" className={labelClassName}>
                    Website
                  </label>
                  <input
                    id="website"
                    name="website"
                    defaultValue={draft.website ?? ""}
                    className={fieldClassName}
                  />
                </div>
                <div>
                  <label htmlFor="status" className={labelClassName}>
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    defaultValue={draft.status}
                    className={fieldClassName}
                  >
                    {CUSTOMER_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSaving ? "Speichern…" : "Speichern"}
                </button>
                <button
                  type="button"
                  onClick={resetDraft}
                  disabled={isSaving}
                  className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          )}
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-lg font-semibold text-zinc-50">Notizen</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Zeitgestempelte Aktivitäten zu diesem Kunden.
          </p>

          {!notesAvailable ? (
            <p
              role="status"
              className="mt-4 rounded-lg border border-amber-900/50 bg-amber-950/20 px-4 py-3 text-sm text-amber-200"
            >
              Notizen sind in Supabase noch nicht verfügbar. Führe die Migration{" "}
              <code className="text-amber-100">{CUSTOMER_NOTES_MIGRATION_FILE}</code>{" "}
              im SQL Editor aus (danach ggf. kurz warten, bis der Schema-Cache
              aktualisiert ist).
            </p>
          ) : (
            <>
          <form onSubmit={handleAddNote} className="mt-4 space-y-3">
            <label htmlFor="note_body" className={labelClassName}>
              Neue Notiz
            </label>
            <textarea
              id="note_body"
              name="body"
              rows={3}
              value={noteBody}
              onChange={(event) => setNoteBody(event.target.value)}
              className={fieldClassName}
              placeholder="Gespräch, nächste Schritte, offene Fragen …"
            />
            <button
              type="submit"
              disabled={isNotePending || !noteBody.trim()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isNotePending ? "Wird gespeichert…" : "Notiz hinzufügen"}
            </button>
          </form>

          {notes.length === 0 ? (
            <p className="mt-6 text-sm text-zinc-500">Noch keine Notizen.</p>
          ) : (
            <ul className="mt-6 space-y-4">
              {notes.map((note) => (
                <li
                  key={note.id}
                  className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4"
                >
                  <p className="whitespace-pre-wrap text-sm text-zinc-200">
                    {note.body}
                  </p>
                  <p className="mt-2 text-xs text-zinc-500">
                    {formatDateTime(note.created_at)} · {ownerLabel}
                  </p>
                </li>
              ))}
            </ul>
          )}
            </>
          )}
        </section>
      </div>

      <DeleteCustomerDialog
        customer={customer}
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onSuccess={() => {
          router.push("/customers");
          router.refresh();
        }}
      />
    </>
  );
}
