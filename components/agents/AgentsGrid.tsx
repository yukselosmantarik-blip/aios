"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  activateAgentAction,
  deactivateAgentAction,
} from "@/app/actions/agents";
import DeleteAgentDialog from "@/components/agents/DeleteAgentDialog";
import AgentStatusBadge from "@/components/agents/AgentStatusBadge";
import EditAgentDialog from "@/components/agents/EditAgentDialog";
import type { Agent, AgentProvider } from "@/lib/agents.types";
import { AGENT_PROVIDER_OPTIONS } from "@/lib/agents.types";

type AgentsGridProps = {
  agents: Agent[];
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
};

type PendingAction =
  | { id: string; type: "activate" | "deactivate" }
  | null;

const providerLabels = Object.fromEntries(
  AGENT_PROVIDER_OPTIONS.map((option) => [option.value, option.label]),
) as Record<AgentProvider, string>;

const actionButtonClassName =
  "rounded-md border border-zinc-700 px-3 py-1.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-50";

function truncateDescription(text: string | null, maxLength = 120): string {
  if (!text) {
    return "—";
  }

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trimEnd()}…`;
}

function formatCreatedAt(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

export default function AgentsGrid({
  agents,
  onSuccess,
  onError,
}: AgentsGridProps) {
  const router = useRouter();
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [deletingAgent, setDeletingAgent] = useState<Agent | null>(null);
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [, startStatusTransition] = useTransition();

  const visibleAgents = useMemo(
    () => agents.filter((agent) => !removedIds.includes(agent.id)),
    [agents, removedIds],
  );

  const actionsDisabled =
    editingAgent !== null || deletingAgent !== null || pendingAction !== null;

  function clearBanner() {
    onSuccess("");
    onError("");
  }

  function handleEdit(agent: Agent) {
    clearBanner();
    setEditingAgent(agent);
  }

  function handleCloseEdit() {
    setEditingAgent(null);
  }

  function handleEditSuccess(message: string) {
    setEditingAgent(null);
    onError("");
    onSuccess(message);
  }

  function handleDelete(agent: Agent) {
    clearBanner();
    setDeletingAgent(agent);
  }

  function handleCloseDelete() {
    setDeletingAgent(null);
  }

  function handleDeleteSuccess(message: string, agentId: string) {
    setDeletingAgent(null);
    setRemovedIds((current) => [...current, agentId]);
    onError("");
    onSuccess(message);
    router.refresh();
  }

  function handleActivate(agent: Agent) {
    clearBanner();
    setPendingAction({ id: agent.id, type: "activate" });

    startStatusTransition(async () => {
      const result = await activateAgentAction(agent.id);
      setPendingAction(null);

      if (result.error) {
        onSuccess("");
        onError(result.error);
        return;
      }

      if (result.success && result.message) {
        onError("");
        onSuccess(result.message);
        router.refresh();
      }
    });
  }

  function handleDeactivate(agent: Agent) {
    clearBanner();
    setPendingAction({ id: agent.id, type: "deactivate" });

    startStatusTransition(async () => {
      const result = await deactivateAgentAction(agent.id);
      setPendingAction(null);

      if (result.error) {
        onSuccess("");
        onError(result.error);
        return;
      }

      if (result.success && result.message) {
        onError("");
        onSuccess(result.message);
        router.refresh();
      }
    });
  }

  function isStatusPending(agentId: string, type: "activate" | "deactivate") {
    return (
      pendingAction?.id === agentId && pendingAction.type === type
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {visibleAgents.map((agent) => {
          const showActivate =
            agent.status === "draft" || agent.status === "inactive";
          const showDeactivate = agent.status === "active";
          const activatePending = isStatusPending(agent.id, "activate");
          const deactivatePending = isStatusPending(agent.id, "deactivate");

          return (
            <article
              key={agent.id}
              className="flex flex-col rounded-xl border border-zinc-800 bg-zinc-900 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="min-w-0 text-base font-semibold text-zinc-50">
                  {agent.name}
                </h2>
                <AgentStatusBadge status={agent.status} />
              </div>

              <p className="mt-2 line-clamp-3 text-sm text-zinc-400">
                {truncateDescription(agent.description)}
              </p>

              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-zinc-500">Anbieter</dt>
                  <dd className="font-medium text-zinc-200">
                    {providerLabels[agent.provider]}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-zinc-500">Modell</dt>
                  <dd className="truncate font-medium text-zinc-200">
                    {agent.model}
                  </dd>
                </div>
              </dl>

              <footer className="mt-4 border-t border-zinc-800 pt-4">
                <span className="text-xs tabular-nums text-zinc-500">
                  Erstellt am {formatCreatedAt(agent.created_at)}
                </span>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(agent)}
                    disabled={actionsDisabled}
                    className={actionButtonClassName}
                  >
                    Bearbeiten
                  </button>
                  {showActivate ? (
                    <button
                      type="button"
                      onClick={() => handleActivate(agent)}
                      disabled={actionsDisabled}
                      className={actionButtonClassName}
                    >
                      {activatePending ? "Wird aktiviert…" : "Aktivieren"}
                    </button>
                  ) : null}
                  {showDeactivate ? (
                    <button
                      type="button"
                      onClick={() => handleDeactivate(agent)}
                      disabled={actionsDisabled}
                      className={actionButtonClassName}
                    >
                      {deactivatePending ? "Wird deaktiviert…" : "Deaktivieren"}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => handleDelete(agent)}
                    disabled={actionsDisabled}
                    className="rounded-md border border-red-900/40 px-3 py-1.5 text-sm font-medium text-red-400 transition-colors hover:border-red-900/60 hover:bg-red-950/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Löschen
                  </button>
                </div>
              </footer>
            </article>
          );
        })}
      </div>

      <EditAgentDialog
        agent={editingAgent}
        open={editingAgent !== null}
        onClose={handleCloseEdit}
        onSuccess={handleEditSuccess}
      />

      <DeleteAgentDialog
        agent={deletingAgent}
        open={deletingAgent !== null}
        onClose={handleCloseDelete}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
}
