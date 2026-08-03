import { getAgents } from "@/lib/agents";
import { getCustomers } from "@/lib/customers";
import type { Customer, CustomerCrmStats } from "@/lib/customers.types";
import { computeCustomerCrmStats } from "@/lib/customers-display";
import { getProjects } from "@/lib/projects";
import {
  PROJECT_STATUSES,
  type ProjectStatus,
  type ProjectWithCustomer,
} from "@/lib/projects.types";
import { getTasks } from "@/lib/tasks";
import type { Task } from "@/lib/tasks.types";

export type DashboardStats = {
  customers: number;
  projects: number;
  aiAgents: number;
  tasks: number;
  crm: CustomerCrmStats;
};

export type TaskInsights = {
  overdue: number;
  dueToday: number;
};

export type UpcomingTask = {
  id: string;
  title: string;
  project_name: string;
  status: Task["status"];
  priority: Task["priority"];
  due_date: string | null;
};

export type ProjectStatusCounts = Record<ProjectStatus, number>;

export type DashboardData = {
  stats: DashboardStats;
  taskInsights: TaskInsights;
  upcomingTasks: UpcomingTask[];
  recentCustomers: Customer[];
  recentProjects: ProjectWithCustomer[];
  projectStatusCounts: ProjectStatusCounts;
};

function getTodayDateKey(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function countTaskInsights(tasks: Task[]): TaskInsights {
  const todayKey = getTodayDateKey();
  let overdue = 0;
  let dueToday = 0;

  for (const task of tasks) {
    if (!task.due_date || task.status === "done") {
      continue;
    }

    if (task.due_date < todayKey) {
      overdue += 1;
    } else if (task.due_date === todayKey) {
      dueToday += 1;
    }
  }

  return { overdue, dueToday };
}

function countProjectStatuses(
  projects: ProjectWithCustomer[],
): ProjectStatusCounts {
  const counts = Object.fromEntries(
    PROJECT_STATUSES.map((status) => [status, 0]),
  ) as ProjectStatusCounts;

  for (const project of projects) {
    counts[project.status] += 1;
  }

  return counts;
}

function compareUpcomingTasks(a: Task, b: Task): number {
  if (a.due_date && b.due_date) {
    const byDueDate = a.due_date.localeCompare(b.due_date);
    if (byDueDate !== 0) {
      return byDueDate;
    }
  } else if (a.due_date && !b.due_date) {
    return -1;
  } else if (!a.due_date && b.due_date) {
    return 1;
  }

  return a.created_at.localeCompare(b.created_at);
}

function getUpcomingTasks(
  tasks: Task[],
  projectNames: Map<string, string>,
): UpcomingTask[] {
  return tasks
    .filter((task) => task.status !== "done")
    .sort(compareUpcomingTasks)
    .slice(0, 5)
    .map((task) => ({
      id: task.id,
      title: task.title,
      project_name: projectNames.get(task.project_id) ?? "—",
      status: task.status,
      priority: task.priority,
      due_date: task.due_date,
    }));
}

export async function getDashboardData(): Promise<DashboardData> {
  const [customers, projects, tasks, agents] = await Promise.all([
    getCustomers(),
    getProjects(),
    getTasks(),
    getAgents(),
  ]);

  return {
    stats: {
      customers: customers.length,
      projects: projects.length,
      aiAgents: agents.length,
      tasks: tasks.length,
      crm: computeCustomerCrmStats(customers),
    },
    taskInsights: countTaskInsights(tasks),
    upcomingTasks: getUpcomingTasks(
      tasks,
      new Map(projects.map((project) => [project.id, project.name])),
    ),
    recentCustomers: customers.slice(0, 5),
    recentProjects: projects.slice(0, 5),
    projectStatusCounts: countProjectStatuses(projects),
  };
}
