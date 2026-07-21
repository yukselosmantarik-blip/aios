import { createClient } from "@/lib/supabase/server";

export type Project = {
  id: string;
  name: string;
  status: string;
  type: string;
  created_at?: string;
};

export async function getProjects(): Promise<Project[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function createProject(
  project: Pick<Project, "name" | "status" | "type">,
): Promise<Project> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .insert(project)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteProject(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}
