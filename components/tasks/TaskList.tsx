"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import DeleteTaskDialog from "@/components/tasks/DeleteTaskDialog";
import EditTaskDialog from "@/components/tasks/EditTaskDialog";
import TaskPriorityBadge from "@/components/tasks/TaskPriorityBadge";
import TaskStatusBadge from "@/components/tasks/TaskStatusBadge";
import type { Task } from "@/lib/tasks.types";

export type TaskWithProjectName = Task & {
  project_name: string;
};

type ProjectOption = {
  id: string;
  name: string;
};

type TaskListProps = {
  tasks: TaskWithProjectName[];
  projects: ProjectOption[];
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

export default function TaskList({ tasks, projects }: TaskListProps) {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState<string | undefined>();
  const [editingTask, setEditingTask] = useState<TaskWithProjectName | null>(
    null,
  );
  const [deletingTask, setDeletingTask] = useState<TaskWithProjectName | null>(
    null,
  );
  const [removedIds, setRemovedIds] = useState<string[]>([]);

  const visibleTasks = useMemo(
    () => tasks.filter((task) => !removedIds.includes(task.id)),
    [tasks, removedIds],
  );

  const actionsDisabled = deletingTask !== null;

  function handleEdit(task: TaskWithProjectName) {
    setSuccessMessage(undefined);
    setEditingTask(task);
  }

  function handleCloseEdit() {
    setEditingTask(null);
  }

  function handleDelete(task: TaskWithProjectName) {
    setSuccessMessage(undefined);
    setDeletingTask(task);
  }

  function handleCloseDelete() {
    setDeletingTask(null);
  }

  function handleMutationSuccess(message: string) {
    setSuccessMessage(message);
    setEditingTask(null);
    router.refresh();
  }

  function handleDeleteSuccess(message: string, taskId: string) {
    setSuccessMessage(message);
    setDeletingTask(null);
    setRemovedIds((current) =>
      current.includes(taskId) ? current : [...current, taskId],
    );
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
                  Aufgabe
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Projekt
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Status
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Priorität
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Fällig am
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleTasks.map((task) => (
                <tr
                  key={task.id}
                  className="border-b border-zinc-800/80 transition-colors last:border-b-0 hover:bg-zinc-800/50"
                >
                  <td className="px-4 py-3 text-sm font-medium text-zinc-50">
                    {task.title}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-300">
                    {task.project_name}
                  </td>
                  <td className="px-4 py-3">
                    <TaskStatusBadge status={task.status} />
                  </td>
                  <td className="px-4 py-3">
                    <TaskPriorityBadge priority={task.priority} />
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-400 tabular-nums">
                    {formatDate(task.due_date)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(task)}
                        disabled={actionsDisabled}
                        className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Bearbeiten
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(task)}
                        disabled={actionsDisabled}
                        className="rounded-md border border-red-900/40 px-3 py-1.5 text-sm font-medium text-red-400 transition-colors hover:border-red-900/60 hover:bg-red-950/20 disabled:cursor-not-allowed disabled:opacity-50"
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

      <EditTaskDialog
        task={editingTask}
        projects={projects}
        open={editingTask !== null}
        onClose={handleCloseEdit}
        onSuccess={handleMutationSuccess}
      />

      <DeleteTaskDialog
        task={deletingTask}
        open={deletingTask !== null}
        onClose={handleCloseDelete}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
}
