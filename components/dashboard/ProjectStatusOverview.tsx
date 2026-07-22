import type { ProjectStatusCounts } from "@/lib/dashboard";
import {
  PROJECT_STATUSES,
  type ProjectStatus,
} from "@/lib/projects.types";

const statusLabels: Record<ProjectStatus, string> = {
  planned: "Geplant",
  active: "Aktiv",
  paused: "Pausiert",
  completed: "Abgeschlossen",
};

const statusBarColors: Record<ProjectStatus, string> = {
  planned: "bg-zinc-500",
  active: "bg-blue-500",
  paused: "bg-amber-500",
  completed: "bg-green-500",
};

type ProjectStatusOverviewProps = {
  counts: ProjectStatusCounts;
};

export default function ProjectStatusOverview({
  counts,
}: ProjectStatusOverviewProps) {
  const total = PROJECT_STATUSES.reduce(
    (sum, status) => sum + counts[status],
    0,
  );
  const maxCount = Math.max(...PROJECT_STATUSES.map((status) => counts[status]), 1);

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-50">
          Projektstatus-Übersicht
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Verteilung deiner Projekte nach Status.
        </p>
      </div>

      {total === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-zinc-800 px-4 py-8 text-center text-sm text-zinc-500">
          Noch keine Projekte für eine Statusübersicht vorhanden.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {PROJECT_STATUSES.map((status) => {
            const count = counts[status];
            const width = `${Math.max((count / maxCount) * 100, count > 0 ? 8 : 0)}%`;

            return (
              <div
                key={status}
                className="rounded-lg border border-zinc-800 bg-zinc-950 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-zinc-300">
                    {statusLabels[status]}
                  </p>
                  <p className="text-2xl font-semibold tabular-nums text-zinc-50">
                    {count}
                  </p>
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className={`h-full rounded-full transition-all ${statusBarColors[status]}`}
                    style={{ width }}
                  />
                </div>
                <p className="mt-2 text-xs text-zinc-500">
                  {total > 0
                    ? `${Math.round((count / total) * 100)}% aller Projekte`
                    : "0% aller Projekte"}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
