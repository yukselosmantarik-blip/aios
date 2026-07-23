import type { AIProviderName, AIUsageErrorCode } from "@/lib/ai-usage.types";

export type { AIProviderName } from "@/lib/ai-usage.types";

export const DEFAULT_STRUCTURED_OUTPUT_TIMEOUT_MS = 45_000;

export type StructuredOutputRequest = {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  jsonSchema: Record<string, unknown>;
  schemaName?: string;
  timeoutMs?: number;
};

export type StructuredOutputUsage = {
  inputTokens: number | null;
  outputTokens: number | null;
};

export type StructuredOutputResult = {
  provider: AIProviderName;
  model: string;
  data: unknown;
  usage: StructuredOutputUsage;
};

export type AIProviderErrorOptions = {
  code: AIUsageErrorCode;
  message: string;
  cause?: unknown;
};

export class AIProviderError extends Error {
  readonly code: AIUsageErrorCode;
  readonly cause?: unknown;

  constructor(options: AIProviderErrorOptions) {
    super(options.message);
    this.name = "AIProviderError";
    this.code = options.code;
    this.cause = options.cause;
  }
}
