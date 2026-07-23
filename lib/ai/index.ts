import {
  getRegisteredAIProvider,
  listRegisteredAIProviders,
  registerAIProvider,
} from "@/lib/ai/provider";
import { openAIProvider } from "@/lib/ai/providers/openai";
import type { AIProviderName } from "@/lib/ai/types";

let providersInitialized = false;

function ensureProvidersRegistered(): void {
  if (providersInitialized) {
    return;
  }

  registerAIProvider(openAIProvider);
  providersInitialized = true;
}

export function getAIProvider(name: AIProviderName) {
  ensureProvidersRegistered();
  return getRegisteredAIProvider(name);
}

export function listAIProviders() {
  ensureProvidersRegistered();
  return listRegisteredAIProviders();
}

export function resolveModelForAgent(
  providerName: AIProviderName,
  model: string,
): string | null {
  const trimmedModel = model.trim();

  if (!trimmedModel) {
    return null;
  }

  const provider = getAIProvider(providerName);

  if (!provider.supportedModels.includes(trimmedModel)) {
    return null;
  }

  return trimmedModel;
}

export type { AIProvider } from "@/lib/ai/provider";
export {
  getRegisteredAIProvider,
  listRegisteredAIProviders,
  registerAIProvider,
} from "@/lib/ai/provider";
export { OpenAIProvider, openAIProvider, OPENAI_SUPPORTED_MODELS } from "@/lib/ai/providers/openai";
export {
  AIProviderError,
  DEFAULT_STRUCTURED_OUTPUT_TIMEOUT_MS,
} from "@/lib/ai/types";
export type {
  AIProviderErrorOptions,
  StructuredOutputRequest,
  StructuredOutputResult,
  StructuredOutputUsage,
} from "@/lib/ai/types";
export {
  AI_ENHANCEMENT_INPUT_MAX_BYTES,
  buildWebsiteBlueprintEnhancementPrompts,
  buildWebsiteBlueprintJsonSchema,
  estimateEnhancementPromptBytes,
  serializeBlueprintForPrompt,
  serializeBriefForPrompt,
  WEBSITE_BLUEPRINT_ENHANCEMENT_SCHEMA_NAME,
} from "@/lib/ai/blueprint-prompt";
export type {
  WebsiteBlueprintEnhancementPromptInput,
  WebsiteBlueprintEnhancementPrompts,
} from "@/lib/ai/blueprint-prompt";
export {
  enhanceWebsiteBlueprint,
} from "@/lib/ai/enhance-blueprint";
export type {
  EnhanceWebsiteBlueprintInput,
  EnhanceWebsiteBlueprintResult,
} from "@/lib/ai/enhance-blueprint";
