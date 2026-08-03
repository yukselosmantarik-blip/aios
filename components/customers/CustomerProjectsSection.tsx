"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import CreateProjectDialog from "@/components/projects/CreateProjectDialog";
import DeleteProjectDialog from "@/components/projects/DeleteProjectDialog";
import EditProjectDialog from "@/components/projects/EditProjectDialog";
import ProjectPriorityBadge from "@/components/projects/ProjectPriorityBadge";
import ProjectStatusBadge from "@/components/projects/ProjectStatusBadge";
import type { CustomerOption, ProjectWithCustomer } from "@/lib/projects.types";

type CustomerProjectsSectionProps = {
  customerId: string;
  customerCompanyName: string;
  projects: ProjectWithCustomer[];
  customerOptions: CustomerOption[];
};

function formatUpdatedAt(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

export default function CustomerProjectsSection({
  customerId,
  customerCompanyName,
  projects,
  customerOptions,
}: CustomerProjectsSectionProps) {
  const router = useRouter();
  const [editingProject, setEditingProject] =
    useState<ProjectWithCustomer | null>(null);
  const [deletingProject, setDeletingProject] =
    useState<ProjectWithCustomer | null>(null);
  const [removedIds, setRemovedIds] = useState<string[]>([]);

  const visibleProjects = useMemo(
    () => projects.filter((project) => !removedIds.includes(project.id)),
    [projects, removedIds],
  );

  return (
    <section className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-50">Projekte</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Projekte, die diesem Kunden zugeordnet sind.
          </p>
        </div>
        <CreateProjectDialog
          customers={customerOptions.filter(
            (option) => option.id === customerId,
          )}
          defaultCustomerId={customerId}
          triggerLabel="Projekt anlegen"
        />
      </div>

      {visibleProjects.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-500">
          Noch keine Projekte für {customerCompanyName}.
        </p>
      ) : (
        <>
          <div className="mt-6 hidden overflow-x-auto md:block">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-2 py-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Projekt
                  </th>
                  <th className="px-2 py-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Status
                  </th>
                  <th className="px-2 py-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Priorität
                  </th>
                  <th className="px-2 py-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Aktualisiert
                  </th>
                  <th className="px-2 py-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="border-b border-zinc-800/80 last:border-b-0"
                  >
                    <td className="px-2 py-3 text-sm font-medium text-zinc-50">
                      {project.name}
                    </td>
                    <td className="px-2 py-3">
                      <ProjectStatusBadge status={project.status} />
                    </td>
                    <td className="px-2 py-3">
                      <ProjectPriorityBadge priority={project.priority} />
                    </td>
                    <td className="px-2 py-3 text-sm text-zinc-400 tabular-nums">
                      {formatUpdatedAt(project.updated_at)}
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingProject(project)}
                          className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800"
                        >
                          Bearbeiten
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingProject(project)}
                          className="rounded-md border border-red-900/40 px-3 py-1.5 text-sm text-red-400 hover:bg-red-950/20"
                        >
                          Löschen
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="mt-6 space-y-3 md:hidden">
            {visibleProjects.map((project) => (
              <li
                key={project.id}
                className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-4"
              >
                <p className="font-medium text-zinc-50">{project.name}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <ProjectStatusBadge status={project.status} />
                  <ProjectPriorityBadge priority={project.priority} />
                </div>
                <p className="mt-2 text-xs text-zinc-500 tabular-nums">
                  Aktualisiert: {formatUpdatedAt(project.updated_at)}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingProject(project)}
                    className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300"
                  >
                    Bearbeiten
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingProject(project)}
                    className="rounded-md border border-red-900/40 px-3 py-1.5 text-sm text-red-400"
                  >
                    Löschen
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <EditProjectDialog
        project={editingProject}
        customers={customerOptions}
        open={editingProject !== null}
        onClose={() => setEditingProject(null)}
        onSuccess={() => {
          setEditingProject(null);
          router.refresh();
        }}
      />

      <DeleteProjectDialog
        project={deletingProject}
        open={deletingProject !== null}
        onClose={() => setDeletingProject(null)}
        onSuccess={(message, projectId) => {
          setDeletingProject(null);
          setRemovedIds((current) =>
            current.includes(projectId) ? current : [...current, projectId],
          );
          router.refresh();
        }}
      />
    </section>
  );
}
