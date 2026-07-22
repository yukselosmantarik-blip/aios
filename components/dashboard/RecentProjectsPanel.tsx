import Link from "next/link";
import ProjectPriorityBadge from "@/components/projects/ProjectPriorityBadge";
import ProjectStatusBadge from "@/components/projects/ProjectStatusBadge";
import type { ProjectWithCustomer } from "@/lib/projects.types";

type RecentProjectsPanelProps = {
  projects: ProjectWithCustomer[];
};

function formatCreatedAt(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

export default function RecentProjectsPanel({
  projects,
}: RecentProjectsPanelProps) {
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-50">
            Neueste Projekte
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Die zuletzt erstellten Projekte.
          </p>
        </div>
        <Link
          href="/projects"
          className="shrink-0 text-sm font-medium text-blue-400 transition-colors hover:text-blue-300"
        >
          Alle anzeigen
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-zinc-800 px-4 py-8 text-center text-sm text-zinc-500">
          Noch keine Projekte vorhanden.
        </p>
      ) : (
        <ul className="mt-5 divide-y divide-zinc-800">
          {projects.map((project) => (
            <li
              key={project.id}
              className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-50">
                  {project.name}
                </p>
                <p className="mt-0.5 truncate text-sm text-zinc-400">
                  {project.customer_company_name}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <ProjectStatusBadge status={project.status} />
                <ProjectPriorityBadge priority={project.priority} />
                <span className="text-xs tabular-nums text-zinc-500">
                  {formatCreatedAt(project.created_at)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
