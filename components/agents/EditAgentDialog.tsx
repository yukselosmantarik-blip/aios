"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateAgentAction } from "@/app/actions/agents";
import type { Agent, AgentProvider, AgentStatus } from "@/lib/agents.types";
import {
  AGENT_PROVIDER_OPTIONS,
  AGENT_STATUS_OPTIONS,
} from "@/lib/agents.types";

const fieldClassName =
  "w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

const labelClassName = "mb-1.5 block text-sm font-medium text-zinc-300";

type AgentFormValues = {
  name: string;
  description: string;
  provider: AgentProvider;
  model: string;
  system_prompt: string;
  status: AgentStatus;
};

type EditAgentDialogProps = {
  agent: Agent | null;
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
};

type EditAgentFormProps = {
  agent: Agent;
  onClose: () => void;
  onSuccess: (message: string) => void;
};

function toFormValues(agent: Agent): AgentFormValues {
  return {
    name: agent.name,
    description: agent.description ?? "",
    provider: agent.provider,
    model: agent.model,
    system_prompt: agent.system_prompt ?? "",
    status: agent.status,
  };
}

function EditAgentForm({ agent, onClose, onSuccess }: EditAgentFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>();
  const [values, setValues] = useState(() => toFormValues(agent));
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

  function updateField<K extends keyof AgentFormValues>(
    field: K,
    value: AgentFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData();
    formData.set("id", agent.id);
    formData.set("name", values.name);
    formData.set("description", values.description);
    formData.set("provider", values.provider);
    formData.set("model", values.model);
    formData.set("system_prompt", values.system_prompt);
    formData.set("status", values.status);

    startTransition(async () => {
      const result = await updateAgentAction({}, formData);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.success && result.message) {
        onClose();
        router.refresh();
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
        className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl border border-zinc-800 bg-zinc-900 shadow-md"
      >
        <div className="shrink-0 border-b border-zinc-800 px-6 py-4">
          <h2 id={titleId} className="text-lg font-semibold text-zinc-50">
            Agent bearbeiten
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Aktualisiere die Daten für {agent.name}.
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
              <div>
                <label htmlFor="edit_name" className={labelClassName}>
                  Name *
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
                  <label htmlFor="edit_provider" className={labelClassName}>
                    Anbieter
                  </label>
                  <select
                    id="edit_provider"
                    name="provider"
                    value={values.provider}
                    onChange={(event) =>
                      updateField(
                        "provider",
                        event.target.value as AgentProvider,
                      )
                    }
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
                  <label htmlFor="edit_status" className={labelClassName}>
                    Status
                  </label>
                  <select
                    id="edit_status"
                    name="status"
                    value={values.status}
                    onChange={(event) =>
                      updateField("status", event.target.value as AgentStatus)
                    }
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
                <label htmlFor="edit_model" className={labelClassName}>
                  Modell *
                </label>
                <input
                  id="edit_model"
                  name="model"
                  type="text"
                  required
                  value={values.model}
                  onChange={(event) => updateField("model", event.target.value)}
                  className={fieldClassName}
                />
              </div>

              <div>
                <label htmlFor="edit_system_prompt" className={labelClassName}>
                  System Prompt
                </label>
                <textarea
                  id="edit_system_prompt"
                  name="system_prompt"
                  rows={8}
                  value={values.system_prompt}
                  onChange={(event) =>
                    updateField("system_prompt", event.target.value)
                  }
                  className={fieldClassName}
                />
              </div>
            </div>
          </div>

          <div className="flex shrink-0 justify-end gap-3 border-t border-zinc-800 px-6 py-5">
            <button
              type="button"
              onClick={onClose}
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
              {isPending ? "Wird gespeichert…" : "Änderungen speichern"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default function EditAgentDialog({
  agent,
  open,
  onClose,
  onSuccess,
}: EditAgentDialogProps) {
  if (!open || !agent) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <EditAgentForm
        key={`${agent.id}-${agent.updated_at}`}
        agent={agent}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </div>
  );
}
