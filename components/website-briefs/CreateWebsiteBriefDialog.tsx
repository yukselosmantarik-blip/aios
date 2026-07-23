"use client";

import {
  useEffect,
  useId,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { createWebsiteBriefAction } from "@/app/actions/website-briefs";

const fieldClassName =
  "w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

const labelClassName = "mb-1.5 block text-sm font-medium text-zinc-300";

type WebsiteBriefFormValues = {
  business_name: string;
  industry: string;
  website_goal: string;
  target_audience: string;
  services: string;
  unique_selling_points: string;
  preferred_style: string;
  primary_color: string;
  secondary_color: string;
  required_pages: string;
  required_features: string;
  reference_websites: string;
  additional_notes: string;
};

const initialFormValues: WebsiteBriefFormValues = {
  business_name: "",
  industry: "",
  website_goal: "",
  target_audience: "",
  services: "",
  unique_selling_points: "",
  preferred_style: "",
  primary_color: "",
  secondary_color: "",
  required_pages: "",
  required_features: "",
  reference_websites: "",
  additional_notes: "",
};

type CreateWebsiteBriefDialogProps = {
  agentId: string;
  onSuccess?: () => void;
};

function validateClient(values: WebsiteBriefFormValues): string | undefined {
  if (!values.business_name.trim()) {
    return "Unternehmensname ist erforderlich.";
  }

  if (!values.industry.trim()) {
    return "Branche ist erforderlich.";
  }

  if (!values.website_goal.trim()) {
    return "Website-Ziel ist erforderlich.";
  }

  if (!values.target_audience.trim()) {
    return "Zielgruppe ist erforderlich.";
  }

  return undefined;
}

export default function CreateWebsiteBriefDialog({
  agentId,
  onSuccess,
}: CreateWebsiteBriefDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [values, setValues] = useState(initialFormValues);
  const [isPending, startTransition] = useTransition();
  const titleId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isPending) {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isPending, open]);

  function handleOpen() {
    setError(undefined);
    setValues(initialFormValues);
    setOpen(true);
  }

  function handleClose() {
    if (!isPending) {
      setOpen(false);
    }
  }

  function updateField<K extends keyof WebsiteBriefFormValues>(
    field: K,
    value: WebsiteBriefFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const clientError = validateClient(values);

    if (clientError) {
      setError(clientError);
      return;
    }

    const formData = new FormData();
    formData.set("agent_id", agentId);
    formData.set("status", "draft");
    formData.set("business_name", values.business_name);
    formData.set("industry", values.industry);
    formData.set("website_goal", values.website_goal);
    formData.set("target_audience", values.target_audience);
    formData.set("services", values.services);
    formData.set("unique_selling_points", values.unique_selling_points);
    formData.set("preferred_style", values.preferred_style);
    formData.set("primary_color", values.primary_color);
    formData.set("secondary_color", values.secondary_color);
    formData.set("required_pages", values.required_pages);
    formData.set("required_features", values.required_features);
    formData.set("reference_websites", values.reference_websites);
    formData.set("additional_notes", values.additional_notes);

    startTransition(async () => {
      const result = await createWebsiteBriefAction({}, formData);

      if (result.error) {
        setError(result.error);
        return;
      }

      setError(undefined);
      setOpen(false);
      setValues(initialFormValues);
      router.refresh();
      onSuccess?.();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 self-start"
      >
        Website Brief erstellen
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
            className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl border border-zinc-800 bg-zinc-900 shadow-md"
          >
            <div className="shrink-0 border-b border-zinc-800 px-6 py-4">
              <h2 id={titleId} className="text-lg font-semibold text-zinc-50">
                Website Brief erstellen
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                Erfasse die Anforderungen für die Website-Planung.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex min-h-0 flex-1 flex-col overflow-hidden"
            >
              <div className="overflow-y-auto px-6 py-5">
                {error ? (
                  <p
                    role="alert"
                    className="mb-4 rounded-lg border border-red-900/50 bg-red-950/20 px-3 py-2 text-sm text-red-400"
                  >
                    {error}
                  </p>
                ) : null}

                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="business_name" className={labelClassName}>
                        Unternehmensname *
                      </label>
                      <input
                        id="business_name"
                        name="business_name"
                        type="text"
                        required
                        value={values.business_name}
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
                        name="industry"
                        type="text"
                        required
                        value={values.industry}
                        onChange={(event) =>
                          updateField("industry", event.target.value)
                        }
                        className={fieldClassName}
                      />
                    </div>

                    <div>
                      <label htmlFor="website_goal" className={labelClassName}>
                        Website-Ziel *
                      </label>
                      <input
                        id="website_goal"
                        name="website_goal"
                        type="text"
                        required
                        value={values.website_goal}
                        onChange={(event) =>
                          updateField("website_goal", event.target.value)
                        }
                        className={fieldClassName}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="target_audience" className={labelClassName}>
                        Zielgruppe *
                      </label>
                      <textarea
                        id="target_audience"
                        name="target_audience"
                        rows={2}
                        required
                        value={values.target_audience}
                        onChange={(event) =>
                          updateField("target_audience", event.target.value)
                        }
                        className={fieldClassName}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="services" className={labelClassName}>
                        Leistungen
                      </label>
                      <textarea
                        id="services"
                        name="services"
                        rows={3}
                        value={values.services}
                        onChange={(event) =>
                          updateField("services", event.target.value)
                        }
                        className={fieldClassName}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="unique_selling_points"
                        className={labelClassName}
                      >
                        USP
                      </label>
                      <textarea
                        id="unique_selling_points"
                        name="unique_selling_points"
                        rows={2}
                        value={values.unique_selling_points}
                        onChange={(event) =>
                          updateField("unique_selling_points", event.target.value)
                        }
                        className={fieldClassName}
                      />
                    </div>

                    <div>
                      <label htmlFor="preferred_style" className={labelClassName}>
                        Bevorzugter Stil
                      </label>
                      <input
                        id="preferred_style"
                        name="preferred_style"
                        type="text"
                        value={values.preferred_style}
                        onChange={(event) =>
                          updateField("preferred_style", event.target.value)
                        }
                        className={fieldClassName}
                      />
                    </div>

                    <div>
                      <label htmlFor="primary_color" className={labelClassName}>
                        Primärfarbe
                      </label>
                      <input
                        id="primary_color"
                        name="primary_color"
                        type="text"
                        placeholder="z. B. #1E3A5F"
                        value={values.primary_color}
                        onChange={(event) =>
                          updateField("primary_color", event.target.value)
                        }
                        className={fieldClassName}
                      />
                    </div>

                    <div>
                      <label htmlFor="secondary_color" className={labelClassName}>
                        Sekundärfarbe
                      </label>
                      <input
                        id="secondary_color"
                        name="secondary_color"
                        type="text"
                        placeholder="z. B. #F59E0B"
                        value={values.secondary_color}
                        onChange={(event) =>
                          updateField("secondary_color", event.target.value)
                        }
                        className={fieldClassName}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="required_pages" className={labelClassName}>
                        Erforderliche Seiten
                      </label>
                      <textarea
                        id="required_pages"
                        name="required_pages"
                        rows={2}
                        placeholder="Eine Seite pro Zeile oder kommagetrennt"
                        value={values.required_pages}
                        onChange={(event) =>
                          updateField("required_pages", event.target.value)
                        }
                        className={fieldClassName}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="required_features"
                        className={labelClassName}
                      >
                        Erforderliche Features
                      </label>
                      <textarea
                        id="required_features"
                        name="required_features"
                        rows={2}
                        value={values.required_features}
                        onChange={(event) =>
                          updateField("required_features", event.target.value)
                        }
                        className={fieldClassName}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="reference_websites"
                        className={labelClassName}
                      >
                        Referenz-Websites
                      </label>
                      <textarea
                        id="reference_websites"
                        name="reference_websites"
                        rows={2}
                        value={values.reference_websites}
                        onChange={(event) =>
                          updateField("reference_websites", event.target.value)
                        }
                        className={fieldClassName}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="additional_notes" className={labelClassName}>
                        Zusätzliche Notizen
                      </label>
                      <textarea
                        id="additional_notes"
                        name="additional_notes"
                        rows={3}
                        value={values.additional_notes}
                        onChange={(event) =>
                          updateField("additional_notes", event.target.value)
                        }
                        className={fieldClassName}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 justify-end gap-3 border-t border-zinc-800 px-6 py-5">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isPending}
                  className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending ? "Wird gespeichert…" : "Brief anlegen"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
