export type ProjectStatus = "planned" | "active" | "paused" | "completed";

export type ProjectPriority = "low" | "medium" | "high";

export const PROJECT_STATUSES: ProjectStatus[] = [
  "planned",
  "active",
  "paused",
  "completed",
];

export const PROJECT_PRIORITIES: ProjectPriority[] = [
  "low",
  "medium",
  "high",
];

export type Project = {
  id: string;
  name: string;
  customer_id: string;
  description: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  start_date: string | null;
  end_date: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
};

export type ProjectWithCustomer = Project & {
  customer_company_name: string;
};

export type CreateProjectInput = {
  name: string;
  customer_id: string;
  description: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  start_date: string | null;
  end_date: string | null;
  owner_id: string;
};

export type UpdateProjectInput = {
  name: string;
  customer_id: string;
  description: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  start_date: string | null;
  end_date: string | null;
};

export type CustomerOption = {
  id: string;
  company_name: string;
};
