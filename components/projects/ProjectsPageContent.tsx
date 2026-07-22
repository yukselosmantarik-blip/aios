"use client";

import { useState } from "react";
import CreateProjectDialog from "@/components/projects/CreateProjectDialog";
import ProjectsEmptyState from "@/components/projects/ProjectsEmptyState";
import ProjectsTable from "@/components/projects/ProjectsTable";
import LogoutButton from "@/components/LogoutButton";
import type { CustomerOption, ProjectWithCustomer } from "@/lib/projects.types";

type ProjectsPageContentProps = {
  projects: ProjectWithCustomer[];
  customers: CustomerOption[];
};

export default function ProjectsPageContent({
  projects,
  customers,
}: ProjectsPageContentProps) {
  const [projectCount, setProjectCount] = useState(projects.length);

  return (
    <>
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
            Projekte
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Verwalte Kundenprojekte mit Status, Priorität und Zeitraum.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          <CreateProjectDialog customers={customers} />
          <span className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm tabular-nums text-zinc-400">
            {projectCount} {projectCount === 1 ? "Eintrag" : "Einträge"}
          </span>
          <div className="[&_button]:text-zinc-400 [&_button]:hover:text-zinc-200">
            <LogoutButton />
          </div>
        </div>
      </header>

      {projects.length === 0 ? (
        <ProjectsEmptyState hasCustomers={customers.length > 0} />
      ) : (
        <ProjectsTable
          projects={projects}
          customers={customers}
          onProjectDeleted={() =>
            setProjectCount((count) => Math.max(0, count - 1))
          }
        />
      )}
    </>
  );
}
