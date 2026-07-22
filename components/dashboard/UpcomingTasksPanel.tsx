import Link from "next/link";
import TaskPriorityBadge from "@/components/tasks/TaskPriorityBadge";
import TaskStatusBadge from "@/components/tasks/TaskStatusBadge";
import type { UpcomingTask } from "@/lib/dashboard";

type UpcomingTasksPanelProps = {
  tasks: UpcomingTask[];
};

function formatDueDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export default function UpcomingTasksPanel({ tasks }: UpcomingTasksPanelProps) {
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-50">
            Nächste Aufgaben
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Die nächsten offenen Aufgaben nach Fälligkeit.
          </p>
        </div>
        <Link
          href="/tasks"
          className="shrink-0 text-sm font-medium text-blue-400 transition-colors hover:text-blue-300"
        >
          Alle Aufgaben anzeigen
        </Link>
      </div>

      {tasks.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-zinc-800 px-4 py-8 text-center text-sm text-zinc-500">
          Keine offenen Aufgaben vorhanden.
        </p>
      ) : (
        <ul className="mt-5 divide-y divide-zinc-800">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-50">
                  {task.title}
                </p>
                <p className="mt-0.5 truncate text-sm text-zinc-400">
                  {task.project_name}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <TaskStatusBadge status={task.status} />
                <TaskPriorityBadge priority={task.priority} />
                <span className="text-xs tabular-nums text-zinc-500">
                  {formatDueDate(task.due_date)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
