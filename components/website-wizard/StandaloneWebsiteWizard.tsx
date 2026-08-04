"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useId,
  useMemo,
  useState,
  useTransition,
  type ChangeEvent,
} from "react";
import { saveStandaloneWebsiteWizardAction } from "@/app/actions/website-wizard";
import CreateCustomerDialog from "@/components/customers/CreateCustomerDialog";
import { WIZARD_INDUSTRY_OPTIONS } from "@/lib/website-brief-wizard/industry-options";
import { WEBSITE_BRIEF_STYLE_PRESETS } from "@/lib/website-brief-wizard/style-presets";
import { uploadWebsiteBriefLogoFromBrowser } from "@/lib/website-brief-logo-client";
import { buildCreateWebsiteBriefInputFromStandaloneWizard } from "@/lib/website-wizard/build-brief-input";
import {
  STANDALONE_WEBSITE_WIZARD_STEPS,
  WIZARD_FEATURE_OPTIONS,
  WIZARD_PAGE_OPTIONS,
} from "@/lib/website-wizard/steps";
import {
  EMPTY_STANDALONE_WIZARD_STATE,
  type StandaloneWebsiteWizardState,
} from "@/lib/website-wizard/types";
import { validateStandaloneWebsiteWizardStep } from "@/lib/website-wizard/validate-step";
import { normalizeStandaloneWebsiteWizardState } from "@/lib/website-wizard/normalize-state";

const fieldClassName =
  "w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

const labelClassName = "mb-1.5 block text-sm font-medium text-zinc-300";

const PAGE_LABELS: Record<(typeof WIZARD_PAGE_OPTIONS)[number], string> = {
  Home: "Startseite",
  About: "Über uns",
  Services: "Leistungen",
  Gallery: "Galerie",
  Testimonials: "Referenzen",
  FAQ: "FAQ",
  Contact: "Kontakt",
  "Legal pages": "Impressum & Datenschutz",
};

const FEATURE_LABELS: Record<(typeof WIZARD_FEATURE_OPTIONS)[number], string> =
  {
    "Contact form": "Kontaktformular",
    "WhatsApp button": "WhatsApp-Button",
    "Appointment request": "Terminanfrage",
    Map: "Karte",
    "Social links": "Social-Media-Links",
    "Image gallery": "Bildergalerie",
  };

export type WebsiteWizardCustomerOption = {
  id: string;
  company_name: string;
  industry: string | null;
  phone: string | null;
  email: string | null;
};

type StandaloneWebsiteWizardProps = {
  agentId: string;
  userId: string;
  customers: WebsiteWizardCustomerOption[];
};

export default function StandaloneWebsiteWizard({
  agentId,
  userId,
  customers: initialCustomers,
}: StandaloneWebsiteWizardProps) {
  const router = useRouter();
  const formId = useId();
  const [customers, setCustomers] = useState(initialCustomers);
  const [stepIndex, setStepIndex] = useState(0);
  const [state, setState] = useState<StandaloneWebsiteWizardState>(() =>
    normalizeStandaloneWebsiteWizardState({
      ...EMPTY_STANDALONE_WIZARD_STATE,
      logo_draft_id: crypto.randomUUID(),
    }),
  );
  const form = useMemo(
    () => normalizeStandaloneWebsiteWizardState(state),
    [state],
  );
  const [stepError, setStepError] = useState<string | undefined>();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [logoUploadError, setLogoUploadError] = useState<string | undefined>();
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [saveError, setSaveError] = useState<string | undefined>();
  const [savedBriefId, setSavedBriefId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const currentStep = STANDALONE_WEBSITE_WIZARD_STEPS[stepIndex];
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === STANDALONE_WEBSITE_WIZARD_STEPS.length - 1;
  const isSuccess = savedBriefId !== null;

  const previewBrief = useMemo(
    () =>
      buildCreateWebsiteBriefInputFromStandaloneWizard(form, {
        user_id: userId,
        agent_id: agentId,
        logo_storage_path: form.logo_storage_path || null,
        status: "ready",
      }),
    [agentId, form, userId],
  );

  const updateField = useCallback(
    <K extends keyof StandaloneWebsiteWizardState>(
      field: K,
      value: StandaloneWebsiteWizardState[K],
    ) => {
      setState((current) =>
        normalizeStandaloneWebsiteWizardState({ ...current, [field]: value }),
      );
    },
    [],
  );

  function applyCustomer(customerId: string) {
    const customer = customers.find((entry) => entry.id === customerId);
    setState((current) =>
      normalizeStandaloneWebsiteWizardState({
        ...current,
        customer_id: customerId,
        business_name: customer?.company_name ?? current.business_name,
        industry: customer?.industry ?? "",
        contact_phone: customer?.phone ?? current.contact_phone,
        contact_email: customer?.email ?? current.contact_email,
      }),
    );
  }

  function toggleListValue(list: string[], value: string): string[] {
    return list.includes(value)
      ? list.filter((item) => item !== value)
      : [...list, value];
  }

  async function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setLogoFile(file);
    setLogoUploadError(undefined);

    if (logoPreviewUrl) {
      URL.revokeObjectURL(logoPreviewUrl);
    }
    setLogoPreviewUrl(file ? URL.createObjectURL(file) : null);

    if (!file) {
      updateField("logo_storage_path", "");
      return;
    }

    setIsUploadingLogo(true);
    const result = await uploadWebsiteBriefLogoFromBrowser(
      userId,
      form.logo_draft_id,
      file,
    );
    setIsUploadingLogo(false);

    if ("error" in result) {
      setLogoUploadError(result.error);
      updateField("logo_storage_path", "");
      return;
    }

    updateField("logo_storage_path", result.path);
  }

  function goNext() {
    const error = validateStandaloneWebsiteWizardStep(currentStep.id, form);
    if (error) {
      setStepError(error);
      return;
    }
    setStepError(undefined);
    setStepIndex((index) =>
      Math.min(index + 1, STANDALONE_WEBSITE_WIZARD_STEPS.length - 1),
    );
  }

  function goBack() {
    setStepError(undefined);
    setStepIndex((index) => Math.max(index - 1, 0));
  }

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSuccess || isPending) {
      return;
    }

    const error = validateStandaloneWebsiteWizardStep("summary", form);
    if (error) {
      setSaveError(error);
      return;
    }

    const formData = new FormData();
    formData.set("wizard_state", JSON.stringify(form));
    if (logoFile && !state.logo_storage_path) {
      formData.set("logo", logoFile);
    }

    startTransition(async () => {
      const result = await saveStandaloneWebsiteWizardAction({}, formData);
      if (result.error) {
        setSaveError(result.error);
        return;
      }
      setSaveError(undefined);
      if (result.briefId) {
        setSavedBriefId(result.briefId);
      }
      router.refresh();
    });
  }

  const continueDisabled =
    isPending ||
    isUploadingLogo ||
    Boolean(validateStandaloneWebsiteWizardStep(currentStep.id, form));

  if (isSuccess) {
    return (
      <div className="rounded-xl border border-green-900/40 bg-green-950/20 p-8 text-center">
        <h2 className="text-2xl font-semibold text-green-300">
          Website Brief gespeichert
        </h2>
        <p className="mt-2 text-sm text-zinc-300">
          Alle Angaben wurden als Website Brief hinterlegt. Sie können den Brief
          im Agenten öffnen und die Website generieren.
        </p>
        <Link
          href={`/website-briefs/${savedBriefId}`}
          className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Brief öffnen
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold text-zinc-50">Website Wizard</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Geführte Erfassung aller Informationen für eine professionelle
          Business-Website.
        </p>
      </header>

      <nav aria-label="Wizard-Fortschritt">
        <ol className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
          {STANDALONE_WEBSITE_WIZARD_STEPS.map((step, index) => {
            const active = index === stepIndex;
            const done = index < stepIndex;
            return (
              <li
                key={step.id}
                className={`rounded-lg border px-3 py-2 text-xs sm:text-sm ${
                  active
                    ? "border-blue-500/50 bg-blue-950/30 text-blue-200"
                    : done
                      ? "border-zinc-700 bg-zinc-900 text-zinc-300"
                      : "border-zinc-800 bg-zinc-950 text-zinc-500"
                }`}
              >
                <span className="font-medium">{index + 1}. {step.title}</span>
              </li>
            );
          })}
        </ol>
      </nav>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-lg font-semibold text-zinc-50">
          {currentStep.title}
        </h2>
        <p className="mt-1 text-sm text-zinc-400">{currentStep.description}</p>

        {stepError ? (
          <p role="alert" className="mt-4 text-sm text-red-400">
            {stepError}
          </p>
        ) : null}

        <div className="mt-6 space-y-4">
          {currentStep.id === "customer" ? (
            <>
              <div className="flex flex-wrap items-end gap-3">
                <div className="min-w-[200px] flex-1">
                  <label htmlFor="customer_id" className={labelClassName}>
                    Kunde *
                  </label>
                  <select
                    id="customer_id"
                    value={form.customer_id}
                    onChange={(event) => applyCustomer(event.target.value)}
                    className={fieldClassName}
                  >
                    <option value="">Bitte wählen …</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.company_name}
                      </option>
                    ))}
                  </select>
                </div>
                <CreateCustomerDialog
                  suppressRedirect
                  triggerLabel="Kunde anlegen"
                  onCustomerCreated={(created) => {
                    setCustomers((current) => {
                      if (current.some((c) => c.id === created.id)) {
                        return current;
                      }
                      return [
                        {
                          id: created.id,
                          company_name: created.company_name,
                          industry: created.industry,
                          phone: created.phone,
                          email: created.email,
                        },
                        ...current,
                      ];
                    });
                    applyCustomer(created.id);
                    router.refresh();
                  }}
                />
              </div>
              <div>
                <label htmlFor="business_name" className={labelClassName}>
                  Unternehmensname *
                </label>
                <input
                  id="business_name"
                  value={form.business_name}
                  onChange={(event) =>
                    updateField("business_name", event.target.value)
                  }
                  className={fieldClassName}
                />
              </div>
              <div>
                <label htmlFor="industry" className={labelClassName}>
                  Branche *
                </label>
                <input
                  id="industry"
                  list="wizard-industries"
                  value={form.industry}
                  onChange={(event) =>
                    updateField("industry", event.target.value)
                  }
                  className={fieldClassName}
                />
                <datalist id="wizard-industries">
                  {WIZARD_INDUSTRY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value} />
                  ))}
                </datalist>
              </div>
              <div>
                <label htmlFor="business_description" className={labelClassName}>
                  Kurzbeschreibung *
                </label>
                <textarea
                  id="business_description"
                  rows={3}
                  value={form.business_description}
                  onChange={(event) =>
                    updateField("business_description", event.target.value)
                  }
                  className={fieldClassName}
                />
              </div>
            </>
          ) : null}

          {currentStep.id === "goals" ? (
            <>
              <div>
                <label htmlFor="website_goal" className={labelClassName}>
                  Hauptziel der Website *
                </label>
                <textarea
                  id="website_goal"
                  rows={2}
                  value={form.website_goal}
                  onChange={(event) =>
                    updateField("website_goal", event.target.value)
                  }
                  className={fieldClassName}
                />
              </div>
              <div>
                <label htmlFor="target_audience" className={labelClassName}>
                  Zielgruppe *
                </label>
                <textarea
                  id="target_audience"
                  rows={2}
                  value={form.target_audience}
                  onChange={(event) =>
                    updateField("target_audience", event.target.value)
                  }
                  className={fieldClassName}
                />
              </div>
              <div>
                <label htmlFor="services" className={labelClassName}>
                  Hauptleistungen / Produkte *
                </label>
                <textarea
                  id="services"
                  rows={3}
                  value={form.services}
                  onChange={(event) =>
                    updateField("services", event.target.value)
                  }
                  className={fieldClassName}
                />
              </div>
              <div>
                <label htmlFor="unique_selling_points" className={labelClassName}>
                  Alleinstellungsmerkmal (USP)
                </label>
                <textarea
                  id="unique_selling_points"
                  rows={2}
                  value={form.unique_selling_points}
                  onChange={(event) =>
                    updateField("unique_selling_points", event.target.value)
                  }
                  className={fieldClassName}
                />
              </div>
              <div>
                <label htmlFor="call_to_action" className={labelClassName}>
                  Gewünschte Handlungsaufforderung (CTA) *
                </label>
                <input
                  id="call_to_action"
                  value={form.call_to_action}
                  onChange={(event) =>
                    updateField("call_to_action", event.target.value)
                  }
                  placeholder="z. B. Termin vereinbaren, Angebot anfordern"
                  className={fieldClassName}
                />
              </div>
            </>
          ) : null}

          {currentStep.id === "content" ? (
            <>
              <div>
                <label htmlFor="about_content" className={labelClassName}>
                  Über uns *
                </label>
                <textarea
                  id="about_content"
                  rows={4}
                  value={form.about_content}
                  onChange={(event) =>
                    updateField("about_content", event.target.value)
                  }
                  className={fieldClassName}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact_phone" className={labelClassName}>
                    Telefon
                  </label>
                  <input
                    id="contact_phone"
                    value={form.contact_phone}
                    onChange={(event) =>
                      updateField("contact_phone", event.target.value)
                    }
                    className={fieldClassName}
                  />
                </div>
                <div>
                  <label htmlFor="contact_email" className={labelClassName}>
                    E-Mail
                  </label>
                  <input
                    id="contact_email"
                    type="email"
                    value={form.contact_email}
                    onChange={(event) =>
                      updateField("contact_email", event.target.value)
                    }
                    className={fieldClassName}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="contact_address" className={labelClassName}>
                  Adresse
                </label>
                <textarea
                  id="contact_address"
                  rows={2}
                  value={form.contact_address}
                  onChange={(event) =>
                    updateField("contact_address", event.target.value)
                  }
                  className={fieldClassName}
                />
              </div>
              <div>
                <label htmlFor="social_media" className={labelClassName}>
                  Social-Media-Links
                </label>
                <textarea
                  id="social_media"
                  rows={2}
                  value={form.social_media}
                  onChange={(event) =>
                    updateField("social_media", event.target.value)
                  }
                  placeholder="Instagram, LinkedIn, …"
                  className={fieldClassName}
                />
              </div>
              <div>
                <label htmlFor="opening_hours" className={labelClassName}>
                  Öffnungszeiten
                </label>
                <textarea
                  id="opening_hours"
                  rows={2}
                  value={form.opening_hours}
                  onChange={(event) =>
                    updateField("opening_hours", event.target.value)
                  }
                  className={fieldClassName}
                />
              </div>
              <div>
                <label htmlFor="content_notes" className={labelClassName}>
                  Zusätzliche Notizen
                </label>
                <textarea
                  id="content_notes"
                  rows={2}
                  value={form.content_notes}
                  onChange={(event) =>
                    updateField("content_notes", event.target.value)
                  }
                  className={fieldClassName}
                />
              </div>
            </>
          ) : null}

          {currentStep.id === "design" ? (
            <>
              <div>
                <label htmlFor="preferred_style" className={labelClassName}>
                  Visueller Stil *
                </label>
                <input
                  id="preferred_style"
                  list="wizard-styles"
                  value={form.preferred_style}
                  onChange={(event) =>
                    updateField("preferred_style", event.target.value)
                  }
                  className={fieldClassName}
                />
                <datalist id="wizard-styles">
                  {WEBSITE_BRIEF_STYLE_PRESETS.map((preset) => (
                    <option key={preset} value={preset} />
                  ))}
                </datalist>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="primary_color" className={labelClassName}>
                    Primärfarbe
                  </label>
                  <input
                    id="primary_color"
                    type="color"
                    value={form.primary_color}
                    onChange={(event) =>
                      updateField("primary_color", event.target.value)
                    }
                    className="h-10 w-full cursor-pointer rounded-lg border border-zinc-700 bg-zinc-950"
                  />
                </div>
                <div>
                  <label htmlFor="secondary_color" className={labelClassName}>
                    Sekundärfarbe
                  </label>
                  <input
                    id="secondary_color"
                    type="color"
                    value={form.secondary_color}
                    onChange={(event) =>
                      updateField("secondary_color", event.target.value)
                    }
                    className="h-10 w-full cursor-pointer rounded-lg border border-zinc-700 bg-zinc-950"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="theme_preference" className={labelClassName}>
                  Hell / Dunkel
                </label>
                <select
                  id="theme_preference"
                  value={form.theme_preference}
                  onChange={(event) =>
                    updateField(
                      "theme_preference",
                      event.target.value as StandaloneWebsiteWizardState["theme_preference"],
                    )
                  }
                  className={fieldClassName}
                >
                  <option value="light">Hell</option>
                  <option value="dark">Dunkel</option>
                  <option value="auto">Automatisch</option>
                </select>
              </div>
              <div>
                <label htmlFor="reference_websites" className={labelClassName}>
                  Referenz-Websites
                </label>
                <textarea
                  id="reference_websites"
                  rows={2}
                  value={form.reference_websites}
                  onChange={(event) =>
                    updateField("reference_websites", event.target.value)
                  }
                  className={fieldClassName}
                />
              </div>
              <div>
                <label htmlFor="logo" className={labelClassName}>
                  Firmenlogo (optional)
                </label>
                <input
                  id="logo"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleLogoChange}
                  className="text-sm text-zinc-300"
                />
                {isUploadingLogo ? (
                  <p className="mt-2 text-sm text-zinc-400">Logo wird hochgeladen …</p>
                ) : null}
                {logoUploadError ? (
                  <p role="alert" className="mt-2 text-sm text-red-400">
                    {logoUploadError}
                  </p>
                ) : null}
                {logoPreviewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoPreviewUrl}
                    alt="Logo-Vorschau"
                    className="mt-3 max-h-24 rounded border border-zinc-800"
                  />
                ) : null}
              </div>
            </>
          ) : null}

          {currentStep.id === "pages" ? (
            <>
              <fieldset>
                <legend className={labelClassName}>Seiten *</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {WIZARD_PAGE_OPTIONS.map((page) => (
                    <label
                      key={page}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-200"
                    >
                      <input
                        type="checkbox"
                        checked={form.selected_pages.includes(page)}
                        onChange={() =>
                          updateField(
                            "selected_pages",
                            toggleListValue(form.selected_pages, page),
                          )
                        }
                      />
                      {PAGE_LABELS[page]}
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset className="mt-4">
                <legend className={labelClassName}>Funktionen *</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {WIZARD_FEATURE_OPTIONS.map((feature) => (
                    <label
                      key={feature}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-200"
                    >
                      <input
                        type="checkbox"
                        checked={form.selected_features.includes(feature)}
                        onChange={() =>
                          updateField(
                            "selected_features",
                            toggleListValue(form.selected_features, feature),
                          )
                        }
                      />
                      {FEATURE_LABELS[feature]}
                    </label>
                  ))}
                </div>
              </fieldset>
            </>
          ) : null}

          {currentStep.id === "summary" ? (
            <form id={formId} onSubmit={handleSave} className="space-y-4">
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-zinc-500">Unternehmen</dt>
                  <dd className="text-zinc-100">{previewBrief.business_name}</dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Branche</dt>
                  <dd className="text-zinc-100">{previewBrief.industry}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-zinc-500">Website-Ziel</dt>
                  <dd className="whitespace-pre-wrap text-zinc-100">
                    {previewBrief.website_goal}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-zinc-500">Seiten</dt>
                  <dd className="whitespace-pre-wrap text-zinc-100">
                    {previewBrief.required_pages}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-zinc-500">Funktionen</dt>
                  <dd className="whitespace-pre-wrap text-zinc-100">
                    {previewBrief.required_features}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-zinc-500">Logo</dt>
                  <dd className="text-zinc-100">
                    {previewBrief.logo_storage_path ?? "Kein Logo"}
                  </dd>
                </div>
              </dl>
              {saveError ? (
                <p role="alert" className="text-sm text-red-400">
                  {saveError}
                </p>
              ) : null}
            </form>
          ) : null}
        </div>

        <div className="mt-8 flex flex-wrap justify-between gap-3 border-t border-zinc-800 pt-6">
          <button
            type="button"
            onClick={goBack}
            disabled={isFirstStep || isPending}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
          >
            Zurück
          </button>
          {isLastStep ? (
            <button
              type="submit"
              form={formId}
              disabled={isPending || isUploadingLogo}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? "Wird gespeichert…" : "Website Brief speichern"}
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              disabled={continueDisabled}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Weiter
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
