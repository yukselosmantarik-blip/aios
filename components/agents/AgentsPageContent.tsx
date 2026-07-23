"use client";

import { useState } from "react";
import AgentsEmptyState from "@/components/agents/AgentsEmptyState";
import AgentsGrid from "@/components/agents/AgentsGrid";
import CreateAgentDialog from "@/components/agents/CreateAgentDialog";
import LogoutButton from "@/components/LogoutButton";
import type { Agent } from "@/lib/agents.types";

type AgentsPageContentProps = {
  agents: Agent[];
};

export default function AgentsPageContent({ agents }: AgentsPageContentProps) {
  const [successMessage, setSuccessMessage] = useState<string | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  function handleCreateSuccess() {
    setErrorMessage(undefined);
    setSuccessMessage("Agent wurde erfolgreich erstellt.");
  }

  function handleMutationSuccess(message: string) {
    setErrorMessage(undefined);
    setSuccessMessage(message || undefined);
  }

  function handleMutationError(message: string) {
    setSuccessMessage(undefined);
    setErrorMessage(message || undefined);
  }

  return (
    <>
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
            AI Agents
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Verwalte deine KI-Agenten mit Anbieter, Modell und System-Prompt.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          <CreateAgentDialog onSuccess={handleCreateSuccess} />
          <span className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm tabular-nums text-zinc-400">
            {agents.length} {agents.length === 1 ? "Eintrag" : "Einträge"}
          </span>
          <div className="[&_button]:text-zinc-400 [&_button]:hover:text-zinc-200">
            <LogoutButton />
          </div>
        </div>
      </header>

      {successMessage ? (
        <p
          role="status"
          className="mb-4 rounded-lg border border-green-900/50 bg-green-950/20 px-4 py-3 text-sm text-green-400"
        >
          {successMessage}
        </p>
      ) : null}

      {errorMessage ? (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-400"
        >
          {errorMessage}
        </p>
      ) : null}

      {agents.length === 0 ? (
        <AgentsEmptyState />
      ) : (
        <AgentsGrid
          agents={agents}
          onSuccess={handleMutationSuccess}
          onError={handleMutationError}
        />
      )}
    </>
  );
}
