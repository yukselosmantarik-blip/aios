export type AIUsageLogStatus = "success" | "failed";

export const AI_USAGE_LOG_STATUSES: AIUsageLogStatus[] = ["success", "failed"];

export type AIUsageErrorCode =
  | "missing_api_key"
  | "timeout"
  | "rate_limited"
  | "provider_rate_limited"
  | "invalid_response"
  | "provider_unavailable"
  | "no_blueprint"
  | "unsupported_provider"
  | "agent_not_active"
  | "save_failed"
  | "input_too_large";

export type AIProviderName = "openai";

export const AI_V1_PROVIDER: AIProviderName = "openai";

export const AI_V1_MODEL = "gpt-4o-mini";

export const AI_ENHANCEMENT_RATE_LIMIT_PER_HOUR = 5;

export type AIUsageLog = {
  id: string;
  user_id: string;
  agent_id: string;
  brief_id: string;
  provider: string;
  model: string;
  status: AIUsageLogStatus;
  input_tokens: number | null;
  output_tokens: number | null;
  estimated_cost: number | null;
  error_code: string | null;
  created_at: string;
};

export type CreateAIUsageLogInput = {
  user_id: string;
  agent_id: string;
  brief_id: string;
  provider: string;
  model: string;
  status: AIUsageLogStatus;
  input_tokens?: number | null;
  output_tokens?: number | null;
  estimated_cost?: number | null;
  error_code?: AIUsageErrorCode | null;
};
