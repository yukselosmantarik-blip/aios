"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { generateWebsiteBlueprintAction } from "@/app/actions/website-blueprints";
import AgentStatusBadge from "@/components/agents/AgentStatusBadge";
import CreateWebsiteBriefDialog from "@/components/website-briefs/CreateWebsiteBriefDialog";
import ImproveWebsiteBlueprintDialog from "@/components/website-blueprints/ImproveWebsiteBlueprintDialog";
import LogoutButton from "@/components/LogoutButton";
import type { Agent, AgentProvider } from "@/lib/agents.types";
import { AGENT_PROVIDER_OPTIONS } from "@/lib/agents.types";
import type { WebsiteBrief } from "@/lib/website-briefs.types";
import { WEBSITE_BRIEF_STATUS_OPTIONS } from "@/lib/website-briefs.types";
import type {
  WebsiteBlueprint,
  WebsiteBlueprintContent,
} from "@/lib/website-blueprints.types";

type AgentDetailPageContentProps = {
  agent: Agent;
  brief: WebsiteBrief | null;
  blueprint: WebsiteBlueprint | null;
};

const providerLabels = Object.fromEntries(
  AGENT_PROVIDER_OPTIONS.map((option) => [option.value, option.label]),
) as Record<AgentProvider, string>;

const briefStatusLabels = Object.fromEntries(
  WEBSITE_BRIEF_STATUS_OPTIONS.map((option) => [option.value, option.label]),
);

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function ReadOnlyField({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div>
      <dt className="text-sm text-zinc-500">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap text-sm text-zinc-200">
        {value?.trim() ? value : "—"}
      </dd>
    </div>
  );
}

function BlueprintSectionBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
      <h3 className="text-sm font-semibold text-zinc-50">{title}</h3>
      <div className="mt-3 text-sm text-zinc-300">{children}</div>
    </section>
  );
}

function BlueprintList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <p>—</p>;
  }

  return (
    <ul className="list-disc space-y-1 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function BlueprintPageStructure({
  sections,
}: {
  sections: Record<string, string[]>;
}) {
  const entries = Object.entries(sections);

  if (entries.length === 0) {
    return <p>—</p>;
  }

  return (
    <div className="space-y-4">
      {entries.map(([page, items]) => (
        <div key={page}>
          <h4 className="font-medium text-zinc-200">{page}</h4>
          <div className="mt-2">
            <BlueprintList items={items} />
          </div>
        </div>
      ))}
    </div>
  );
}

function BlueprintView({ content }: { content: WebsiteBlueprintContent }) {
  return (
    <div className="space-y-4">
      <BlueprintSectionBlock title="Projektübersicht">
        <p>{content.projectSummary}</p>
      </BlueprintSectionBlock>

      <BlueprintSectionBlock title="Zielgruppe">
        <p>{content.targetAudienceSummary}</p>
      </BlueprintSectionBlock>

      <BlueprintSectionBlock title="Markenrichtung">
        <p className="whitespace-pre-wrap">{content.brandDirection}</p>
      </BlueprintSectionBlock>

      <BlueprintSectionBlock title="Sitemap">
        <BlueprintList items={content.recommendedSitemap} />
      </BlueprintSectionBlock>

      <BlueprintSectionBlock title="Seitenstruktur">
        <BlueprintPageStructure sections={content.recommendedPageSections} />
      </BlueprintSectionBlock>

      <BlueprintSectionBlock title="Features">
        <BlueprintList items={content.features} />
      </BlueprintSectionBlock>

      <BlueprintSectionBlock title="SEO">
        <BlueprintList items={content.seoBasics} />
      </BlueprintSectionBlock>

      <BlueprintSectionBlock title="Technische Empfehlung">
        <p className="whitespace-pre-wrap">{content.technicalRecommendation}</p>
      </BlueprintSectionBlock>

      <BlueprintSectionBlock title="Checkliste">
        <BlueprintList items={content.implementationChecklist} />
      </BlueprintSectionBlock>

      <BlueprintSectionBlock title="Master Prompt">
        <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-xs leading-relaxed text-zinc-300">
          {content.masterPrompt}
        </pre>
      </BlueprintSectionBlock>
    </div>
  );
}

function formatGenerationMetadata(blueprint: WebsiteBlueprint): string {
  if (blueprint.generation_source === "ai") {
    const providerLabel =
      blueprint.generation_provider &&
      providerLabels[blueprint.generation_provider as AgentProvider]
        ? providerLabels[blueprint.generation_provider as AgentProvider]
        : blueprint.generation_provider ?? "—";
    const model = blueprint.generation_model ?? "—";

    return `Quelle: KI (${providerLabel} · ${model})`;
  }

  return "Quelle: Deterministisch";
}

export default function AgentDetailPageContent({
  agent,
  brief,
  blueprint,
}: AgentDetailPageContentProps) {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState<string | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [improveDialogOpen, setImproveDialogOpen] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isGenerating, startGenerateTransition] = useTransition();

  const canImproveWithAi =
    agent.status === "active" &&
    brief !== null &&
    blueprint !== null &&
    blueprint.generation_source === "deterministic";

  const isBlueprintBusy = isGenerating || isEnhancing;

  function handleCreateBriefSuccess() {
    setErrorMessage(undefined);
    setSuccessMessage("Website Brief wurde erfolgreich erstellt.");
  }

  function handleEditBriefSuccess() {
    setErrorMessage(undefined);
    setSuccessMessage("Website Brief wurde erfolgreich aktualisiert.");
  }

  function handleGenerateBlueprint() {
    if (!brief) {
      return;
    }

    setSuccessMessage(undefined);
    setErrorMessage(undefined);

    startGenerateTransition(async () => {
      const result = await generateWebsiteBlueprintAction(brief.id);

      if (result.error) {
        setErrorMessage(result.error);
        return;
      }

      if (result.success && result.message) {
        setSuccessMessage(result.message);
        router.refresh();
      }
    });
  }

  function handleImproveSuccess(message: string) {
    setImproveDialogOpen(false);
    setErrorMessage(undefined);
    setSuccessMessage(message);
    router.refresh();
  }

  function handleOpenImproveDialog() {
    if (!brief || !canImproveWithAi) {
      return;
    }

    setSuccessMessage(undefined);
    setErrorMessage(undefined);
    setImproveDialogOpen(true);
  }

  return (
    <>
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/agents"
            className="mb-3 inline-block text-sm font-medium text-blue-400 transition-colors hover:text-blue-300"
          >
            ← Zurück zu KI-Agenten
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
            {agent.name}
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Website Agent — Brief und Blueprint verwalten.
          </p>
        </div>

        <div className="self-start sm:self-auto">
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

      <div className="space-y-6">
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-lg font-semibold text-zinc-50">Übersicht</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Agent-Konfiguration und System Prompt.
          </p>

          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-zinc-500">Status</dt>
              <dd className="mt-1">
                <AgentStatusBadge status={agent.status} />
              </dd>
            </div>
            <div>
              <dt className="text-sm text-zinc-500">Anbieter</dt>
              <dd className="mt-1 text-sm text-zinc-200">
                {providerLabels[agent.provider]}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-zinc-500">Modell</dt>
              <dd className="mt-1 text-sm text-zinc-200">{agent.model}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm text-zinc-500">Beschreibung</dt>
              <dd className="mt-1 text-sm text-zinc-200">
                {agent.description?.trim() ? agent.description : "—"}
              </dd>
            </div>
          </dl>

          <div className="mt-6 border-t border-zinc-800 pt-6">
            <h3 className="text-sm font-semibold text-zinc-50">System Prompt</h3>
            <p className="mt-3 whitespace-pre-wrap rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 text-sm text-zinc-300">
              {agent.system_prompt?.trim()
                ? agent.system_prompt
                : "Kein System Prompt hinterlegt."}
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-50">
                Website Brief
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                Strukturierte Anforderungen für die Website.
              </p>
            </div>
            {!brief ? (
              <CreateWebsiteBriefDialog
                agentId={agent.id}
                onSuccess={handleCreateBriefSuccess}
              />
            ) : (
              <CreateWebsiteBriefDialog
                agentId={agent.id}
                brief={brief}
                onSuccess={handleEditBriefSuccess}
              />
            )}
          </div>

          {brief ? (
            <div className="mt-6 rounded-lg border border-zinc-800 bg-zinc-950/50 p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-zinc-50">
                  {brief.business_name}
                </h3>
                <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-300">
                  {briefStatusLabels[brief.status]}
                </span>
              </div>

              <dl className="grid gap-4 sm:grid-cols-2">
                <ReadOnlyField label="Branche" value={brief.industry} />
                <ReadOnlyField label="Standort" value={brief.location} />
                <ReadOnlyField label="Website-Ziel" value={brief.website_goal} />
                <ReadOnlyField
                  label="Zielgruppe"
                  value={brief.target_audience}
                />
                <ReadOnlyField label="Leistungen" value={brief.services} />
                <ReadOnlyField label="USP" value={brief.unique_selling_points} />
                <ReadOnlyField
                  label="Bevorzugter Stil"
                  value={brief.preferred_style}
                />
                <ReadOnlyField
                  label="Primärfarbe"
                  value={brief.primary_color}
                />
                <ReadOnlyField
                  label="Sekundärfarbe"
                  value={brief.secondary_color}
                />
                <ReadOnlyField
                  label="Erforderliche Seiten"
                  value={brief.required_pages}
                />
                <ReadOnlyField
                  label="Erforderliche Features"
                  value={brief.required_features}
                />
                <ReadOnlyField
                  label="Referenz-Websites"
                  value={brief.reference_websites}
                />
                <ReadOnlyField
                  label="Zusätzliche Notizen"
                  value={brief.additional_notes}
                />
              </dl>
            </div>
          ) : (
            <div className="mt-6 flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 px-6 py-12 text-center">
              <h3 className="text-base font-semibold text-zinc-50">
                Noch kein Website Brief vorhanden
              </h3>
              <p className="mt-2 max-w-md text-sm text-zinc-400">
                Lege einen Website Brief an, um Anforderungen zu erfassen und
                ein Blueprint zu generieren.
              </p>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-50">Blueprint</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Deterministisches Website-Projekt-Blueprint.
              </p>
            </div>
            {brief ? (
              <div className="flex flex-wrap gap-2 self-start">
                <button
                  type="button"
                  onClick={handleGenerateBlueprint}
                  disabled={isBlueprintBusy}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isGenerating
                    ? "Blueprint wird erstellt..."
                    : "Blueprint generieren"}
                </button>
                {canImproveWithAi ? (
                  <button
                    type="button"
                    onClick={handleOpenImproveDialog}
                    disabled={isBlueprintBusy}
                    className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isEnhancing
                      ? "KI verbessert Blueprint..."
                      : "Mit KI verbessern"}
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>

          {blueprint ? (
            <div className="mt-6">
              <div className="mb-4 space-y-1">
                <p className="text-xs tabular-nums text-zinc-500">
                  Generiert am {formatDateTime(blueprint.generated_at)}
                </p>
                <p className="text-xs text-zinc-500">
                  {formatGenerationMetadata(blueprint)}
                </p>
              </div>
              <BlueprintView content={blueprint.content} />
            </div>
          ) : (
            <div className="mt-6 flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 px-6 py-12 text-center">
              <p className="text-sm text-zinc-400">
                Erstelle zuerst einen Blueprint.
              </p>
            </div>
          )}
        </section>
      </div>

      {brief ? (
        <ImproveWebsiteBlueprintDialog
          briefId={brief.id}
          open={improveDialogOpen}
          onClose={() => {
            if (!isEnhancing) {
              setImproveDialogOpen(false);
            }
          }}
          onSuccess={handleImproveSuccess}
          onPendingChange={setIsEnhancing}
        />
      ) : null}
    </>
  );
}
