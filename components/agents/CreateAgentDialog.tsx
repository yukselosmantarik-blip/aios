"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { createAgentAction } from "@/app/actions/agents";
import {
  AGENT_PROVIDER_OPTIONS,
  AGENT_STATUS_OPTIONS,
} from "@/lib/agents.types";

const fieldClassName =
  "w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

const labelClassName = "mb-1.5 block text-sm font-medium text-zinc-300";

type CreateAgentDialogProps = {
  onSuccess?: () => void;
};

export default function CreateAgentDialog({ onSuccess }: CreateAgentDialogProps) {
  const router = useRouter();
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
      const result = await createAgentAction({}, formData);

      if (result.error) {
        setError(result.error);
        return;
      }

      setError(undefined);
      setOpen(false);
      formRef.current?.reset();
      router.refresh();
      onSuccess?.();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        + Neuer Agent
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
            className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl border border-zinc-800 bg-zinc-900 shadow-md"
          >
            <div className="shrink-0 border-b border-zinc-800 px-6 py-4">
              <h2 id={titleId} className="text-lg font-semibold text-zinc-50">
                Neuer Agent
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                Lege einen neuen KI-Agenten mit Anbieter und Modell an.
              </p>
            </div>

            <form
              ref={formRef}
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
                  <div>
                    <label htmlFor="name" className={labelClassName}>
                      Name *
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
                      <label htmlFor="provider" className={labelClassName}>
                        Anbieter
                      </label>
                      <select
                        id="provider"
                        name="provider"
                        defaultValue="openai"
                        className={fieldClassName}
                      >
                        {AGENT_PROVIDER_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="status" className={labelClassName}>
                        Status
                      </label>
                      <select
                        id="status"
                        name="status"
                        defaultValue="draft"
                        className={fieldClassName}
                      >
                        {AGENT_STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="model" className={labelClassName}>
                      Modell *
                    </label>
                    <input
                      id="model"
                      name="model"
                      type="text"
                      required
                      placeholder="z. B. gpt-4o"
                      className={fieldClassName}
                    />
                  </div>

                  <div>
                    <label htmlFor="system_prompt" className={labelClassName}>
                      System Prompt
                    </label>
                    <textarea
                      id="system_prompt"
                      name="system_prompt"
                      rows={8}
                      placeholder="Optionale Anweisungen für den Agenten…"
                      className={fieldClassName}
                    />
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
                  {isPending ? "Wird gespeichert…" : "Agent anlegen"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
