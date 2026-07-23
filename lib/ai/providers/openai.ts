import OpenAI, {
  APIConnectionTimeoutError,
  APIError,
  APIUserAbortError,
} from "openai";
import type { AIProvider } from "@/lib/ai/provider";
import {
  AIProviderError,
  DEFAULT_STRUCTURED_OUTPUT_TIMEOUT_MS,
  type StructuredOutputRequest,
  type StructuredOutputResult,
  type StructuredOutputUsage,
} from "@/lib/ai/types";

export const OPENAI_API_KEY_ENV = "OPENAI_API_KEY";

export const OPENAI_SUPPORTED_MODELS = ["gpt-4o", "gpt-4o-mini"] as const;

export type OpenAISupportedModel = (typeof OPENAI_SUPPORTED_MODELS)[number];

function isSupportedModel(model: string): model is OpenAISupportedModel {
  return OPENAI_SUPPORTED_MODELS.includes(model as OpenAISupportedModel);
}

function readApiKey(): string | null {
  const apiKey = process.env[OPENAI_API_KEY_ENV]?.trim();
  return apiKey || null;
}

function validateRequest(request: StructuredOutputRequest): void {
  if (!request.model.trim()) {
    throw new AIProviderError({
      code: "unsupported_provider",
      message: "OpenAI model is required.",
    });
  }

  if (!isSupportedModel(request.model.trim())) {
    throw new AIProviderError({
      code: "unsupported_provider",
      message: `OpenAI model "${request.model}" is not supported.`,
    });
  }

  if (!request.systemPrompt.trim()) {
    throw new AIProviderError({
      code: "invalid_response",
      message: "System prompt is required.",
    });
  }

  if (!request.userPrompt.trim()) {
    throw new AIProviderError({
      code: "invalid_response",
      message: "User prompt is required.",
    });
  }

  if (
    !request.jsonSchema ||
    typeof request.jsonSchema !== "object" ||
    Array.isArray(request.jsonSchema)
  ) {
    throw new AIProviderError({
      code: "invalid_response",
      message: "JSON schema must be an object.",
    });
  }
}

function mapOpenAIError(error: unknown): AIProviderError {
  if (error instanceof AIProviderError) {
    return error;
  }

  if (
    error instanceof APIUserAbortError ||
    (error instanceof Error && error.name === "AbortError")
  ) {
    return new AIProviderError({
      code: "timeout",
      message: "OpenAI request timed out.",
      cause: error,
    });
  }

  if (error instanceof APIConnectionTimeoutError) {
    return new AIProviderError({
      code: "timeout",
      message: "OpenAI request timed out.",
      cause: error,
    });
  }

  if (error instanceof APIError) {
    if (error.status === 401) {
      return new AIProviderError({
        code: "missing_api_key",
        message: "OpenAI API key is invalid or missing.",
        cause: error,
      });
    }

    if (error.status === 429) {
      return new AIProviderError({
        code: "provider_rate_limited",
        message: "OpenAI rate limit reached.",
        cause: error,
      });
    }

    if (error.status && error.status >= 500) {
      return new AIProviderError({
        code: "provider_unavailable",
        message: "OpenAI service is temporarily unavailable.",
        cause: error,
      });
    }

    return new AIProviderError({
      code: "provider_unavailable",
      message: "OpenAI request failed.",
      cause: error,
    });
  }

  return new AIProviderError({
    code: "provider_unavailable",
    message: "OpenAI request failed.",
    cause: error,
  });
}

function parseStructuredOutputContent(content: string): unknown {
  try {
    return JSON.parse(content);
  } catch (error) {
    throw new AIProviderError({
      code: "invalid_response",
      message: "OpenAI returned invalid JSON.",
      cause: error,
    });
  }
}

async function invokeStructuredOutputRequest(
  request: StructuredOutputRequest,
  apiKey: string,
  signal: AbortSignal,
): Promise<{ data: unknown; usage: StructuredOutputUsage }> {
  const client = new OpenAI({
    apiKey,
    timeout: request.timeoutMs ?? DEFAULT_STRUCTURED_OUTPUT_TIMEOUT_MS,
  });

  try {
    const response = await client.chat.completions.create(
      {
        model: request.model.trim(),
        messages: [
          { role: "system", content: request.systemPrompt },
          { role: "user", content: request.userPrompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: request.schemaName ?? "structured_output",
            strict: true,
            schema: request.jsonSchema,
          },
        },
      },
      { signal },
    );

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new AIProviderError({
        code: "invalid_response",
        message: "OpenAI returned an empty response.",
      });
    }

    return {
      data: parseStructuredOutputContent(content),
      usage: {
        inputTokens: response.usage?.prompt_tokens ?? null,
        outputTokens: response.usage?.completion_tokens ?? null,
      },
    };
  } catch (error) {
    throw mapOpenAIError(error);
  }
}

export class OpenAIProvider implements AIProvider {
  readonly name = "openai" as const;
  readonly supportedModels = OPENAI_SUPPORTED_MODELS;

  isConfigured(): boolean {
    return readApiKey() !== null;
  }

  async generateStructuredOutput(
    request: StructuredOutputRequest,
  ): Promise<StructuredOutputResult> {
    validateRequest(request);

    const apiKey = readApiKey();

    if (!apiKey) {
      throw new AIProviderError({
        code: "missing_api_key",
        message: "OpenAI API key is not configured.",
      });
    }

    const model = request.model.trim();
    const timeoutMs = request.timeoutMs ?? DEFAULT_STRUCTURED_OUTPUT_TIMEOUT_MS;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await invokeStructuredOutputRequest(
        request,
        apiKey,
        controller.signal,
      );

      return {
        provider: this.name,
        model,
        data: response.data,
        usage: response.usage,
      };
    } catch (error) {
      throw mapOpenAIError(error);
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

export const openAIProvider = new OpenAIProvider();
