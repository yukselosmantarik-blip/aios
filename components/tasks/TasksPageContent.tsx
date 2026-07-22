"use client";

import { useState } from "react";
import CreateTaskDialog from "@/components/tasks/CreateTaskDialog";
import TaskList from "@/components/tasks/TaskList";
import TasksEmptyState from "@/components/tasks/TasksEmptyState";
import LogoutButton from "@/components/LogoutButton";
import type { TaskWithProjectName } from "@/components/tasks/TaskList";

const fieldClassName =
  "rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

type ProjectOption = {
  id: string;
  name: string;
};

type TasksPageContentProps = {
  tasks: TaskWithProjectName[];
  projects: ProjectOption[];
  activeProjectId: string | null;
};

export default function TasksPageContent({
  tasks,
  projects,
  activeProjectId,
}: TasksPageContentProps) {
  const [successMessage, setSuccessMessage] = useState<string | undefined>();
  const isFiltered = activeProjectId !== null;

  function handleCreateSuccess() {
    setSuccessMessage("Aufgabe wurde erfolgreich erstellt.");
  }

  return (
    <>
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
            Aufgaben
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Übersicht aller Aufgaben mit Status, Priorität und Fälligkeit.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          <CreateTaskDialog
            projects={projects}
            defaultProjectId={activeProjectId}
            onSuccess={handleCreateSuccess}
          />
          <span className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm tabular-nums text-zinc-400">
            {tasks.length} {tasks.length === 1 ? "Eintrag" : "Einträge"}
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

      <form method="get" className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="w-full sm:max-w-xs">
          <label
            htmlFor="project"
            className="mb-1.5 block text-sm font-medium text-zinc-300"
          >
            Projekt filtern
          </label>
          <select
            id="project"
            name="project"
            defaultValue={activeProjectId ?? ""}
            className={`${fieldClassName} w-full`}
          >
            <option value="">Alle Projekte</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
        >
          Anwenden
        </button>
      </form>

      {tasks.length === 0 ? (
        <TasksEmptyState
          filtered={isFiltered}
          hasProjects={projects.length > 0}
        />
      ) : (
        <TaskList tasks={tasks} projects={projects} />
      )}
    </>
  );
}
