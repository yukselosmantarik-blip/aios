"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import DeleteProjectDialog from "@/components/projects/DeleteProjectDialog";
import EditProjectDialog from "@/components/projects/EditProjectDialog";
import ProjectPriorityBadge from "@/components/projects/ProjectPriorityBadge";
import ProjectStatusBadge from "@/components/projects/ProjectStatusBadge";
import type { CustomerOption, ProjectWithCustomer } from "@/lib/projects.types";

type ProjectsTableProps = {
  projects: ProjectWithCustomer[];
  customers: CustomerOption[];
  onProjectDeleted?: () => void;
};

function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatCreatedAt(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

export default function ProjectsTable({
  projects,
  customers,
  onProjectDeleted,
}: ProjectsTableProps) {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState<string | undefined>();
  const [editingProject, setEditingProject] = useState<ProjectWithCustomer | null>(
    null,
  );
  const [deletingProject, setDeletingProject] =
    useState<ProjectWithCustomer | null>(null);
  const [removedIds, setRemovedIds] = useState<string[]>([]);

  const visibleProjects = useMemo(
    () => projects.filter((project) => !removedIds.includes(project.id)),
    [projects, removedIds],
  );

  function handleEdit(project: ProjectWithCustomer) {
    setSuccessMessage(undefined);
    setEditingProject(project);
  }

  function handleCloseEdit() {
    setEditingProject(null);
  }

  function handleDelete(project: ProjectWithCustomer) {
    setSuccessMessage(undefined);
    setDeletingProject(project);
  }

  function handleCloseDelete() {
    setDeletingProject(null);
  }

  function handleMutationSuccess(message: string) {
    setSuccessMessage(message);
    setEditingProject(null);
    router.refresh();
  }

  function handleDeleteSuccess(message: string, projectId: string) {
    setSuccessMessage(message);
    setDeletingProject(null);
    setRemovedIds((current) =>
      current.includes(projectId) ? current : [...current, projectId],
    );
    onProjectDeleted?.();
    router.refresh();
  }

  return (
    <>
      {successMessage ? (
        <p
          role="status"
          className="mb-4 rounded-lg border border-green-900/50 bg-green-950/20 px-4 py-3 text-sm text-green-400"
        >
          {successMessage}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] border-collapse text-left">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900">
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Projekt
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Kunde
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Status
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Priorität
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Start
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Ende
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Erstellt
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleProjects.map((project) => (
                <tr
                  key={project.id}
                  className="border-b border-zinc-800/80 transition-colors last:border-b-0 hover:bg-zinc-800/50"
                >
                  <td className="px-4 py-3 text-sm font-medium text-zinc-50">
                    {project.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-300">
                    {project.customer_company_name}
                  </td>
                  <td className="px-4 py-3">
                    <ProjectStatusBadge status={project.status} />
                  </td>
                  <td className="px-4 py-3">
                    <ProjectPriorityBadge priority={project.priority} />
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-400 tabular-nums">
                    {formatDate(project.start_date)}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-400 tabular-nums">
                    {formatDate(project.end_date)}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-500 tabular-nums">
                    {formatCreatedAt(project.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(project)}
                        className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-100"
                      >
                        Bearbeiten
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(project)}
                        className="rounded-md border border-red-900/40 px-3 py-1.5 text-sm font-medium text-red-400 transition-colors hover:border-red-900/60 hover:bg-red-950/20"
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
      </div>

      <EditProjectDialog
        project={editingProject}
        customers={customers}
        open={editingProject !== null}
        onClose={handleCloseEdit}
        onSuccess={handleMutationSuccess}
      />

      <DeleteProjectDialog
        project={deletingProject}
        open={deletingProject !== null}
        onClose={handleCloseDelete}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
}
