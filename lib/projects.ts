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

type ProjectRow = Project & {
  customers: { company_name: string } | null;
};

function mapProjectRow(row: ProjectRow): ProjectWithCustomer {
  const { customers, ...project } = row;

  return {
    ...project,
    customer_company_name: customers?.company_name ?? "—",
  };
}

export async function getProjects(): Promise<ProjectWithCustomer[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .select(
      `
      *,
      customers!projects_customer_id_fkey (
        company_name
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as ProjectRow[]).map(mapProjectRow);
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
