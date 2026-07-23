import { createClient } from "@/lib/supabase/server";
import type {
  Agent,
  AgentStatus,
  CreateAgentInput,
  UpdateAgentInput,
} from "@/lib/agents.types";

export type {
  Agent,
  AgentProvider,
  AgentStatus,
  CreateAgentInput,
  UpdateAgentInput,
} from "@/lib/agents.types";

export {
  AGENT_PROVIDERS,
  AGENT_PROVIDER_OPTIONS,
  AGENT_STATUSES,
  AGENT_STATUS_OPTIONS,
} from "@/lib/agents.types";

export async function getAgents(): Promise<Agent[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Agent[];
}

export async function createAgent(input: CreateAgentInput): Promise<Agent> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("agents")
    .insert(input)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Agent;
}

export async function updateAgent(
  id: string,
  userId: string,
  input: UpdateAgentInput,
): Promise<Agent> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("agents")
    .update(input)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Agent;
}

export async function getAgent(id: string): Promise<Agent | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as Agent | null) ?? null;
}

export async function deleteAgent(id: string, userId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("agents")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function setAgentStatus(
  id: string,
  userId: string,
  status: AgentStatus,
): Promise<Agent> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("agents")
    .update({ status })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Agent;
}
