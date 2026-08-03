"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useMemo,
  useState,
  useTransition,
  type ChangeEvent,
} from "react";
import { saveWebsiteBriefWizardAction } from "@/app/actions/website-brief-wizard";
import type { WebsiteBrief } from "@/lib/website-briefs.types";
import { websiteBriefToWizardState } from "@/lib/website-brief-wizard/brief-to-wizard-state";
import { buildCreateWebsiteBriefInputFromWizard } from "@/lib/website-brief-wizard/build-website-brief-input";
import { WIZARD_INDUSTRY_OPTIONS } from "@/lib/website-brief-wizard/industry-options";
import { WEBSITE_BRIEF_STYLE_PRESETS } from "@/lib/website-brief-wizard/style-presets";
import { WEBSITE_BRIEF_WIZARD_STEPS } from "@/lib/website-brief-wizard/steps";
import {
  EMPTY_WIZARD_STATE,
  type WebsiteBriefWizardState,
  type WebsiteBriefWizardStepId,
} from "@/lib/website-brief-wizard/types";
import { validateWebsiteBriefWizardStep } from "@/lib/website-brief-wizard/validate-step";

const fieldClassName =
  "w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

const labelClassName = "mb-1.5 block text-sm font-medium text-zinc-300";

type WebsiteBriefWizardProps = {
  agentId: string;
  agentName: string;
  brief?: WebsiteBrief | null;
};

export default function WebsiteBriefWizard({
  agentId,
  agentName,
  brief,
}: WebsiteBriefWizardProps) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [state, setState] = useState<WebsiteBriefWizardState>(() =>
    brief ? websiteBriefToWizardState(brief) : EMPTY_WIZARD_STATE,
  );
  const [stepError, setStepError] = useState<string | undefined>();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const currentStep = WEBSITE_BRIEF_WIZARD_STEPS[stepIndex];
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === WEBSITE_BRIEF_WIZARD_STEPS.length - 1;

  const previewInput = useMemo(
    () =>
      buildCreateWebsiteBriefInputFromWizard(state, {
        user_id: "preview",
        agent_id: agentId,
        logo_storage_path: brief?.logo_storage_path ?? null,
        status: "ready",
      }),
    [agentId, brief?.logo_storage_path, state],
  );

  const updateField = useCallback(
    <K extends keyof WebsiteBriefWizardState>(
      field: K,
      value: WebsiteBriefWizardState[K],
    ) => {
      setState((current) => ({ ...current, [field]: value }));
    },
    [],
  );

  function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setLogoFile(file);
    if (logoPreviewUrl) {
      URL.revokeObjectURL(logoPreviewUrl);
    }
    setLogoPreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  function goNext() {
    const error = validateWebsiteBriefWizardStep(currentStep.id, state);
    if (error) {
      setStepError(error);
      return;
    }
    setStepError(undefined);
    setStepIndex((index) => Math.min(index + 1, WEBSITE_BRIEF_WIZARD_STEPS.length - 1));
  }

  function goBack() {
    setStepError(undefined);
    setStepIndex((index) => Math.max(index - 1, 0));
  }

  function handleSubmit() {
    const error = validateWebsiteBriefWizardStep("review", state);
    if (error) {
      setStepError(error);
      return;
    }

    const formData = new FormData();
    formData.set("agent_id", agentId);
    if (brief?.id) {
      formData.set("brief_id", brief.id);
    }
    formData.set("wizard_state", JSON.stringify(state));
    if (logoFile) {
      formData.set("logo", logoFile);
    }

    startTransition(async () => {
      const result = await saveWebsiteBriefWizardAction({}, formData);
      if (result.error) {
        setStepError(result.error);
        return;
      }
      router.push(`/agents/${agentId}`);
      router.refresh();
    });
  }

  function renderStepContent(stepId: WebsiteBriefWizardStepId) {
    switch (stepId) {
      case "business":
        return (
          <div>
            <label htmlFor="business_name" className={labelClassName}>
              Unternehmensname *
            </label>
            <input
              id="business_name"
              type="text"
              autoFocus
              value={state.business_name}
              onChange={(event) =>
                updateField("business_name", event.target.value)
              }
              className={fieldClassName}
              placeholder="z. B. Müller Gebäudeservice"
            />
          </div>
        );
      case "industry":
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="industry" className={labelClassName}>
                Branche *
              </label>
              <input
                id="industry"
                list="wizard-industry-options"
                value={state.industry}
                onChange={(event) => updateField("industry", event.target.value)}
                className={fieldClassName}
                placeholder="Branche wählen oder eingeben"
              />
              <datalist id="wizard-industry-options">
                {WIZARD_INDUSTRY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value} />
                ))}
              </datalist>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {WIZARD_INDUSTRY_OPTIONS.map((option) => (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick={() => updateField("industry", option.value)}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                      state.industry === option.value
                        ? "border-blue-500 bg-blue-950/30 text-zinc-50"
                        : "border-zinc-800 bg-zinc-950/50 text-zinc-300 hover:border-zinc-600"
                    }`}
                  >
                    <span className="font-medium">{option.label}</span>
                    {option.description ? (
                      <span className="mt-0.5 block text-xs text-zinc-500">
                        {option.description}
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        );
      case "brand":
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="primary_color" className={labelClassName}>
                Primärfarbe
              </label>
              <div className="flex gap-2">
                <input
                  id="primary_color_picker"
                  type="color"
                  value={state.primary_color}
                  onChange={(event) =>
                    updateField("primary_color", event.target.value)
                  }
                  className="h-10 w-12 cursor-pointer rounded border border-zinc-700 bg-zinc-950"
                  aria-label="Primärfarbe wählen"
                />
                <input
                  id="primary_color"
                  type="text"
                  value={state.primary_color}
                  onChange={(event) =>
                    updateField("primary_color", event.target.value)
                  }
                  className={fieldClassName}
                />
              </div>
            </div>
            <div>
              <label htmlFor="secondary_color" className={labelClassName}>
                Sekundärfarbe
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={state.secondary_color}
                  onChange={(event) =>
                    updateField("secondary_color", event.target.value)
                  }
                  className="h-10 w-12 cursor-pointer rounded border border-zinc-700 bg-zinc-950"
                  aria-label="Sekundärfarbe wählen"
                />
                <input
                  id="secondary_color"
                  type="text"
                  value={state.secondary_color}
                  onChange={(event) =>
                    updateField("secondary_color", event.target.value)
                  }
                  className={fieldClassName}
                />
              </div>
            </div>
          </div>
        );
      case "audience":
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="target_audience" className={labelClassName}>
                Zielgruppe *
              </label>
              <textarea
                id="target_audience"
                rows={4}
                value={state.target_audience}
                onChange={(event) =>
                  updateField("target_audience", event.target.value)
                }
                className={fieldClassName}
                placeholder="Wer soll die Website nutzen? (z. B. Hausverwaltungen, Privatkunden …)"
              />
            </div>
            <div>
              <label htmlFor="website_goal" className={labelClassName}>
                Website-Ziel (optional)
              </label>
              <textarea
                id="website_goal"
                rows={2}
                value={state.website_goal}
                onChange={(event) =>
                  updateField("website_goal", event.target.value)
                }
                className={fieldClassName}
                placeholder="Wird automatisch formuliert, wenn leer."
              />
            </div>
          </div>
        );
      case "services":
        return (
          <div>
            <label htmlFor="services" className={labelClassName}>
              Leistungen
            </label>
            <textarea
              id="services"
              rows={6}
              value={state.services}
              onChange={(event) => updateField("services", event.target.value)}
              className={fieldClassName}
              placeholder="Eine Leistung pro Zeile"
            />
          </div>
        );
      case "contact":
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="contact_address" className={labelClassName}>
                Adresse
              </label>
              <input
                id="contact_address"
                type="text"
                value={state.contact_address}
                onChange={(event) =>
                  updateField("contact_address", event.target.value)
                }
                className={fieldClassName}
              />
            </div>
            <div>
              <label htmlFor="location" className={labelClassName}>
                Ort / Region
              </label>
              <input
                id="location"
                type="text"
                value={state.location}
                onChange={(event) => updateField("location", event.target.value)}
                className={fieldClassName}
              />
            </div>
            <div>
              <label htmlFor="contact_phone" className={labelClassName}>
                Telefon
              </label>
              <input
                id="contact_phone"
                type="tel"
                value={state.contact_phone}
                onChange={(event) =>
                  updateField("contact_phone", event.target.value)
                }
                className={fieldClassName}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="contact_email" className={labelClassName}>
                E-Mail
              </label>
              <input
                id="contact_email"
                type="email"
                value={state.contact_email}
                onChange={(event) =>
                  updateField("contact_email", event.target.value)
                }
                className={fieldClassName}
              />
            </div>
          </div>
        );
      case "social":
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="social_instagram" className={labelClassName}>
                Instagram
              </label>
              <input
                id="social_instagram"
                type="url"
                value={state.social_instagram}
                onChange={(event) =>
                  updateField("social_instagram", event.target.value)
                }
                className={fieldClassName}
                placeholder="https://instagram.com/…"
              />
            </div>
            <div>
              <label htmlFor="social_facebook" className={labelClassName}>
                Facebook
              </label>
              <input
                id="social_facebook"
                type="url"
                value={state.social_facebook}
                onChange={(event) =>
                  updateField("social_facebook", event.target.value)
                }
                className={fieldClassName}
              />
            </div>
            <div>
              <label htmlFor="social_linkedin" className={labelClassName}>
                LinkedIn
              </label>
              <input
                id="social_linkedin"
                type="url"
                value={state.social_linkedin}
                onChange={(event) =>
                  updateField("social_linkedin", event.target.value)
                }
                className={fieldClassName}
              />
            </div>
            <div>
              <label htmlFor="social_other" className={labelClassName}>
                Weitere Profile
              </label>
              <input
                id="social_other"
                type="text"
                value={state.social_other}
                onChange={(event) =>
                  updateField("social_other", event.target.value)
                }
                className={fieldClassName}
              />
            </div>
          </div>
        );
      case "logo":
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="logo_upload" className={labelClassName}>
                Logo hochladen (optional)
              </label>
              <input
                id="logo_upload"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleLogoChange}
                className="block w-full text-sm text-zinc-400 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-800 file:px-3 file:py-2 file:text-sm file:text-zinc-200"
              />
              <p className="mt-2 text-xs text-zinc-500">
                PNG, JPEG, WebP oder SVG, max. 2 MB.
              </p>
            </div>
            {logoPreviewUrl ? (
              <img
                src={logoPreviewUrl}
                alt="Logo-Vorschau"
                className="max-h-24 w-auto rounded border border-zinc-800 bg-zinc-950 p-2"
              />
            ) : brief?.logo_storage_path ? (
              <p className="text-sm text-zinc-400">
                Aktuelles Logo: {brief.logo_storage_path}
              </p>
            ) : null}
          </div>
        );
      case "style":
        return (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {WEBSITE_BRIEF_STYLE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => updateField("preferred_style", preset)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    state.preferred_style === preset
                      ? "border-blue-500 bg-blue-950/40 text-zinc-50"
                      : "border-zinc-700 text-zinc-300 hover:border-zinc-500"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
            <div>
              <label htmlFor="preferred_style" className={labelClassName}>
                Design-Stil *
              </label>
              <input
                id="preferred_style"
                type="text"
                value={state.preferred_style}
                onChange={(event) =>
                  updateField("preferred_style", event.target.value)
                }
                className={fieldClassName}
              />
            </div>
          </div>
        );
      case "review":
        return (
          <div className="space-y-4 text-sm">
            <p className="text-zinc-400">
              Der Brief wird mit Status <strong className="text-zinc-200">Bereit</strong>{" "}
              gespeichert und kann direkt für Blueprint und Website-Generator
              verwendet werden.
            </p>
            <dl className="grid gap-3 rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 sm:grid-cols-2">
              <div>
                <dt className="text-zinc-500">Unternehmen</dt>
                <dd className="text-zinc-100">{previewInput.business_name}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Branche</dt>
                <dd className="text-zinc-100">{previewInput.industry}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Zielgruppe</dt>
                <dd className="text-zinc-100">{previewInput.target_audience}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Stil</dt>
                <dd className="text-zinc-100">{previewInput.preferred_style}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Farben</dt>
                <dd className="text-zinc-100">
                  {previewInput.primary_color} / {previewInput.secondary_color}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">Kontakt</dt>
                <dd className="text-zinc-100">
                  {[previewInput.contact_phone, previewInput.contact_email]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </dd>
              </div>
            </dl>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-8">
        <Link
          href={`/agents/${agentId}`}
          className="mb-3 inline-block text-sm font-medium text-blue-400 transition-colors hover:text-blue-300"
        >
          ← Zurück zu {agentName}
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
          AI Website Wizard
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Schritt {stepIndex + 1} von {WEBSITE_BRIEF_WIZARD_STEPS.length}:{" "}
          {currentStep.title}
        </p>
      </header>

      <ol className="mb-8 flex flex-wrap gap-2" aria-label="Fortschritt">
        {WEBSITE_BRIEF_WIZARD_STEPS.map((step, index) => (
          <li key={step.id}>
            <span
              className={`inline-block rounded-md px-2 py-1 text-xs font-medium ${
                index === stepIndex
                  ? "bg-blue-600 text-white"
                  : index < stepIndex
                    ? "bg-zinc-700 text-zinc-200"
                    : "bg-zinc-900 text-zinc-500"
              }`}
            >
              {step.title}
            </span>
          </li>
        ))}
      </ol>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-lg font-semibold text-zinc-50">{currentStep.title}</h2>
        <p className="mt-1 text-sm text-zinc-400">{currentStep.description}</p>

        {stepError ? (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-red-900/50 bg-red-950/20 px-3 py-2 text-sm text-red-400"
          >
            {stepError}
          </p>
        ) : null}

        <div className="mt-6">{renderStepContent(currentStep.id)}</div>

        <div className="mt-8 flex flex-wrap justify-between gap-3 border-t border-zinc-800 pt-6">
          <button
            type="button"
            onClick={goBack}
            disabled={isFirstStep || isPending}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Zurück
          </button>
          {isLastStep ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "Wird gespeichert…" : "Website Brief speichern"}
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              disabled={isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Weiter
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
