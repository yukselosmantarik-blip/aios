export type AgentProvider = "openai" | "anthropic" | "google" | "custom";

export type AgentStatus = "draft" | "active" | "inactive";

export const AGENT_PROVIDERS: AgentProvider[] = [
  "openai",
  "anthropic",
  "google",
  "custom",
];

export const AGENT_STATUSES: AgentStatus[] = ["draft", "active", "inactive"];

export const AGENT_PROVIDER_OPTIONS = [
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "google", label: "Google" },
  { value: "custom", label: "Custom" },
] as const;

export const AGENT_STATUS_OPTIONS = [
  { value: "draft", label: "Entwurf" },
  { value: "active", label: "Aktiv" },
  { value: "inactive", label: "Inaktiv" },
] as const;

export type Agent = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  provider: AgentProvider;
  model: string;
  system_prompt: string | null;
  status: AgentStatus;
  created_at: string;
  updated_at: string;
};

export type CreateAgentInput = {
  user_id: string;
  name: string;
  description: string | null;
  provider: AgentProvider;
  model: string;
  system_prompt: string | null;
  status: AgentStatus;
};

export type UpdateAgentInput = {
  name: string;
  description: string | null;
  provider: AgentProvider;
  model: string;
  system_prompt: string | null;
  status: AgentStatus;
};
