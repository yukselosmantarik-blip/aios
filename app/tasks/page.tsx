import Sidebar from "@/components/Sidebar";
import TasksPageContent from "@/components/tasks/TasksPageContent";
import type { TaskWithProjectName } from "@/components/tasks/TaskList";
import { getProjects } from "@/lib/projects";
import { getTasks, getTasksByProject } from "@/lib/tasks";

export const dynamic = "force-dynamic";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type TasksPageProps = {
  searchParams: Promise<{ project?: string }>;
};

function resolveActiveProjectId(
  rawProjectId: string | undefined,
  projectIds: Set<string>,
): string | null {
  const trimmed = rawProjectId?.trim();

  if (!trimmed || !UUID_PATTERN.test(trimmed) || !projectIds.has(trimmed)) {
    return null;
  }

  return trimmed;
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const { project: rawProjectId } = await searchParams;
  const projects = await getProjects();
  const projectIds = new Set(projects.map((project) => project.id));
  const activeProjectId = resolveActiveProjectId(rawProjectId, projectIds);

  const tasks = activeProjectId
    ? await getTasksByProject(activeProjectId)
    : await getTasks();

  const projectNames = new Map(
    projects.map((project) => [project.id, project.name]),
  );

  const tasksWithProjectName: TaskWithProjectName[] = tasks.map((task) => ({
    ...task,
    project_name: projectNames.get(task.project_id) ?? "—",
  }));

  const projectOptions = projects.map((project) => ({
    id: project.id,
    name: project.name,
  }));

  return (
    <main className="min-h-screen flex bg-[#09090B]">
      <Sidebar />

      <section className="flex-1 overflow-auto">
        <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-6 lg:px-12 lg:py-10">
          <TasksPageContent
            tasks={tasksWithProjectName}
            projects={projectOptions}
            activeProjectId={activeProjectId}
          />
        </div>
      </section>
    </main>
  );
}
