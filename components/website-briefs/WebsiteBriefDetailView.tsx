import Link from "next/link";
import type { Customer } from "@/lib/customers.types";
import type { WebsiteBrief } from "@/lib/website-briefs.types";
import { WEBSITE_BRIEF_STATUS_OPTIONS } from "@/lib/website-briefs.types";

const statusLabels = Object.fromEntries(
  WEBSITE_BRIEF_STATUS_OPTIONS.map((option) => [option.value, option.label]),
) as Record<WebsiteBrief["status"], string>;

function ReadOnlyField({
  label,
  value,
  className,
}: {
  label: string;
  value: string | null | undefined;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </dt>
      <dd className="mt-1 whitespace-pre-wrap text-sm text-zinc-200">
        {value?.trim() ? value : "—"}
      </dd>
    </div>
  );
}

type WebsiteBriefDetailViewProps = {
  brief: WebsiteBrief;
  customer: Customer | null;
  logoSignedUrl: string | null;
};

export default function WebsiteBriefDetailView({
  brief,
  customer,
  logoSignedUrl,
}: WebsiteBriefDetailViewProps) {
  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/website-wizard"
            className="text-sm font-medium text-blue-400 hover:text-blue-300"
          >
            ← Zurück zum Website Wizard
          </Link>
          <h1 className="mt-3 text-2xl font-semibold text-zinc-50">
            {brief.business_name}
          </h1>
          <p className="mt-1 text-sm text-zinc-400">Website Brief</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/agents/${brief.agent_id}/wizard`}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800"
          >
            Brief bearbeiten
          </Link>
          <Link
            href={`/agents/${brief.agent_id}`}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Zum Agenten
          </Link>
        </div>
      </div>

      <div className="mb-4">
        <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-300">
          {statusLabels[brief.status]}
        </span>
      </div>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-lg font-semibold text-zinc-50">Kunde & Unternehmen</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <ReadOnlyField
            label="Kunde"
            value={
              customer
                ? customer.company_name
                : brief.customer_id
                  ? "Kunde nicht geladen"
                  : null
            }
          />
          <ReadOnlyField label="Unternehmensname" value={brief.business_name} />
          <ReadOnlyField label="Branche" value={brief.industry} />
          <ReadOnlyField label="Standort / Adresse" value={brief.location} />
        </dl>
      </section>

      <section className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-lg font-semibold text-zinc-50">Ziele & Zielgruppe</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <ReadOnlyField
            label="Website-Ziel"
            value={brief.website_goal}
            className="sm:col-span-2"
          />
          <ReadOnlyField
            label="Zielgruppe"
            value={brief.target_audience}
            className="sm:col-span-2"
          />
          <ReadOnlyField label="Leistungen / Produkte" value={brief.services} />
          <ReadOnlyField label="USP" value={brief.unique_selling_points} />
        </dl>
      </section>

      <section className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-lg font-semibold text-zinc-50">Inhalte & Kontakt</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <ReadOnlyField label="Telefon" value={brief.contact_phone} />
          <ReadOnlyField label="E-Mail" value={brief.contact_email} />
          <ReadOnlyField
            label="Adresse"
            value={brief.contact_address}
            className="sm:col-span-2"
          />
          <ReadOnlyField
            label="Social Media"
            value={brief.social_media}
            className="sm:col-span-2"
          />
          <ReadOnlyField
            label="Zusätzliche Notizen"
            value={brief.additional_notes}
            className="sm:col-span-2"
          />
        </dl>
      </section>

      <section className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-lg font-semibold text-zinc-50">Design</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <ReadOnlyField label="Stil" value={brief.preferred_style} />
          <ReadOnlyField label="Primärfarbe" value={brief.primary_color} />
          <ReadOnlyField label="Sekundärfarbe" value={brief.secondary_color} />
          <ReadOnlyField
            label="Referenz-Websites"
            value={brief.reference_websites}
            className="sm:col-span-2"
          />
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Logo
            </dt>
            <dd className="mt-2">
              {logoSignedUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoSignedUrl}
                  alt={`Logo ${brief.business_name}`}
                  className="max-h-24 rounded border border-zinc-800 bg-zinc-950"
                />
              ) : brief.logo_storage_path ? (
                <p className="text-sm text-zinc-400">
                  Logo gespeichert ({brief.logo_storage_path}), Vorschau nicht
                  verfügbar.
                </p>
              ) : (
                <p className="text-sm text-zinc-500">Kein Logo hochgeladen.</p>
              )}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-lg font-semibold text-zinc-50">Seiten & Funktionen</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <ReadOnlyField
            label="Gewünschte Seiten"
            value={brief.required_pages}
            className="sm:col-span-2"
          />
          <ReadOnlyField
            label="Gewünschte Funktionen"
            value={brief.required_features}
            className="sm:col-span-2"
          />
        </dl>
      </section>
    </>
  );
}
