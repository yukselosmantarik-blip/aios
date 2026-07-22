import { getCustomers } from "@/lib/customers";
import type { Customer } from "@/lib/customers.types";
import { getProjects } from "@/lib/projects";
import {
  PROJECT_STATUSES,
  type ProjectStatus,
  type ProjectWithCustomer,
} from "@/lib/projects.types";

export type DashboardStats = {
  customers: number;
  projects: number;
  aiAgents: number;
  tasks: number;
};

export type ProjectStatusCounts = Record<ProjectStatus, number>;

export type DashboardData = {
  stats: DashboardStats;
  recentCustomers: Customer[];
  recentProjects: ProjectWithCustomer[];
  projectStatusCounts: ProjectStatusCounts;
};

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

export async function getDashboardData(): Promise<DashboardData> {
  const [customers, projects] = await Promise.all([
    getCustomers(),
    getProjects(),
  ]);

  return {
    stats: {
      customers: customers.length,
      projects: projects.length,
      aiAgents: 0,
      tasks: 0,
    },
    recentCustomers: customers.slice(0, 5),
    recentProjects: projects.slice(0, 5),
    projectStatusCounts: countProjectStatuses(projects),
  };
}
