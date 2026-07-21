"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createProject, deleteProject } from "@/lib/projects";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function createProjectAction(formData: FormData) {
  await requireUser();

  const name = formData.get("name")?.toString().trim();
  const type = formData.get("type")?.toString().trim() || "Website";
  const status = formData.get("status")?.toString().trim() || "In Arbeit";

  if (!name) {
    throw new Error("Projektname ist erforderlich");
  }

  await createProject({ name, type, status });
  revalidatePath("/");
}

export async function deleteProjectAction(id: string) {
  await requireUser();

  await deleteProject(id);
  revalidatePath("/");
}
