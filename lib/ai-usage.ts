import { createClient } from "@/lib/supabase/server";
import type {
  AIUsageErrorCode,
  AIUsageLog,
  CreateAIUsageLogInput,
} from "@/lib/ai-usage.types";
import {
  AI_ENHANCEMENT_RATE_LIMIT_PER_HOUR,
} from "@/lib/ai-usage.types";

export type {
  AIUsageErrorCode,
  AIUsageLog,
  AIUsageLogStatus,
  CreateAIUsageLogInput,
} from "@/lib/ai-usage.types";

export {
  AI_ENHANCEMENT_RATE_LIMIT_PER_HOUR,
  AI_USAGE_LOG_STATUSES,
  AI_V1_MODEL,
  AI_V1_PROVIDER,
} from "@/lib/ai-usage.types";

const ONE_HOUR_MS = 60 * 60 * 1000;

function oneHourAgoIso(): string {
  return new Date(Date.now() - ONE_HOUR_MS).toISOString();
}

export async function countAIEnhancementRequestsInLastHour(
  userId: string,
): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("ai_usage_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", oneHourAgoIso());

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

export async function isAIEnhancementRateLimited(
  userId: string,
): Promise<boolean> {
  const requestCount = await countAIEnhancementRequestsInLastHour(userId);
  return requestCount >= AI_ENHANCEMENT_RATE_LIMIT_PER_HOUR;
}

export async function createAIUsageLog(
  input: CreateAIUsageLogInput,
): Promise<AIUsageLog> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ai_usage_logs")
    .insert({
      user_id: input.user_id,
      agent_id: input.agent_id,
      brief_id: input.brief_id,
      provider: input.provider,
      model: input.model,
      status: input.status,
      input_tokens: input.input_tokens ?? null,
      output_tokens: input.output_tokens ?? null,
      estimated_cost: input.estimated_cost ?? null,
      error_code: input.error_code ?? null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as AIUsageLog;
}

export function getGermanAIEnhancementErrorMessage(
  errorCode: AIUsageErrorCode,
): string {
  switch (errorCode) {
    case "missing_api_key":
      return "KI-Dienst ist nicht konfiguriert.";
    case "timeout":
      return "Die KI-Anfrage hat zu lange gedauert. Das bestehende Blueprint bleibt erhalten.";
    case "rate_limited":
      return "Zu viele KI-Anfragen. Bitte später erneut versuchen.";
    case "provider_rate_limited":
      return "Anbieter-Limit erreicht. Bitte später erneut versuchen.";
    case "invalid_response":
      return "KI-Antwort ungültig. Das bestehende Blueprint bleibt erhalten.";
    case "provider_unavailable":
      return "KI-Dienst vorübergehend nicht verfügbar.";
    case "no_blueprint":
      return "Erstelle zuerst ein deterministisches Blueprint.";
    case "unsupported_provider":
      return "KI-Verbesserung ist für diesen Agenten noch nicht verfügbar.";
    case "agent_not_active":
      return "Der Agent muss aktiv sein, um KI-Verbesserungen zu nutzen.";
    case "save_failed":
      return "Blueprint konnte nicht gespeichert werden.";
    case "input_too_large":
      return "Die Eingabedaten sind zu groß für eine KI-Verbesserung.";
    default:
      return "Blueprint konnte nicht mit KI verbessert werden.";
  }
}
