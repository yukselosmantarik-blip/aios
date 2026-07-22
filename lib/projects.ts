import { createClient } from "@/lib/supabase/server";
import type {
  CreateProjectInput,
  Project,
  ProjectWithCustomer,
  UpdateProjectInput,
} from "@/lib/projects.types";

export type {
  CreateProjectInput,
  CustomerOption,
  Project,
  ProjectPriority,
  ProjectStatus,
  ProjectWithCustomer,
  UpdateProjectInput,
} from "@/lib/projects.types";

export {
  PROJECT_PRIORITIES,
  PROJECT_STATUSES,
} from "@/lib/projects.types";

export async function getProjects(): Promise<ProjectWithCustomer[]> {
  const supabase = await createClient();

  const { data: projects, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  if (!projects?.length) {
    return [];
  }

  const customerIds = [
    ...new Set(projects.map((project) => project.customer_id)),
  ];

  const { data: customers, error: customersError } = await supabase
    .from("customers")
    .select("id, company_name")
    .in("id", customerIds);

  if (customersError) {
    throw new Error(customersError.message);
  }

  const customerNames = new Map(
    (customers ?? []).map((customer) => [customer.id, customer.company_name]),
  );

  return projects.map((project) => ({
    ...(project as Project),
    customer_company_name: customerNames.get(project.customer_id) ?? "—",
  }));
}

export async function createProject(
  input: CreateProjectInput,
): Promise<Project> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .insert(input)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Project;
}

export async function updateProject(
  id: string,
  ownerId: string,
  input: UpdateProjectInput,
): Promise<Project> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .update(input)
    .eq("id", id)
    .eq("owner_id", ownerId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Project;
}

export async function getProjectById(
  id: string,
  ownerId: string,
): Promise<Project | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as Project | null) ?? null;
}

export async function deleteProject(
  id: string,
  ownerId: string,
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id)
    .eq("owner_id", ownerId);

  if (error) {
    throw new Error(error.message);
  }
}
