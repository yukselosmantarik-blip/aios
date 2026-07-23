import {
  AI_ENHANCEMENT_INPUT_MAX_BYTES,
  buildWebsiteBlueprintEnhancementPrompts,
  buildWebsiteBlueprintJsonSchema,
  estimateEnhancementPromptBytes,
  WEBSITE_BLUEPRINT_ENHANCEMENT_SCHEMA_NAME,
} from "@/lib/ai/blueprint-prompt";
import { getRegisteredAIProvider, registerAIProvider } from "@/lib/ai/provider";
import { openAIProvider } from "@/lib/ai/providers/openai";
import { AIProviderError, type StructuredOutputUsage } from "@/lib/ai/types";
import { AI_V1_PROVIDER, type AIProviderName } from "@/lib/ai-usage.types";
import type { Agent } from "@/lib/agents.types";
import type { WebsiteBrief } from "@/lib/website-briefs.types";
import { validateWebsiteBlueprintContent } from "@/lib/website-blueprint-validator";
import type { WebsiteBlueprintContent } from "@/lib/website-blueprints.types";

export type EnhanceWebsiteBlueprintInput = {
  brief: WebsiteBrief;
  agent: Agent;
  blueprint: WebsiteBlueprintContent;
};

export type EnhanceWebsiteBlueprintResult = {
  content: WebsiteBlueprintContent;
  provider: AIProviderName;
  model: string;
  usage: StructuredOutputUsage;
};

let providersInitialized = false;

function ensureProvidersRegistered(): void {
  if (providersInitialized) {
    return;
  }

  registerAIProvider(openAIProvider);
  providersInitialized = true;
}

function resolveModelForAgent(model: string): string | null {
  const trimmedModel = model.trim();

  if (!trimmedModel) {
    return null;
  }

  ensureProvidersRegistered();
  const provider = getRegisteredAIProvider(AI_V1_PROVIDER);

  if (!provider.supportedModels.includes(trimmedModel)) {
    return null;
  }

  return trimmedModel;
}

export async function enhanceWebsiteBlueprint(
  input: EnhanceWebsiteBlueprintInput,
): Promise<EnhanceWebsiteBlueprintResult> {
  if (input.agent.provider !== AI_V1_PROVIDER) {
    throw new AIProviderError({
      code: "unsupported_provider",
      message: "AI enhancement is only available for OpenAI agents.",
    });
  }

  if (input.agent.status !== "active") {
    throw new AIProviderError({
      code: "agent_not_active",
      message: "Agent must be active before AI enhancement can run.",
    });
  }

  if (!input.blueprint) {
    throw new AIProviderError({
      code: "no_blueprint",
      message: "A deterministic blueprint is required before AI enhancement.",
    });
  }

  const model = resolveModelForAgent(input.agent.model);

  if (!model) {
    throw new AIProviderError({
      code: "unsupported_provider",
      message: `Agent model "${input.agent.model}" is not supported.`,
    });
  }

  ensureProvidersRegistered();
  const provider = getRegisteredAIProvider(AI_V1_PROVIDER);

  if (!provider.isConfigured()) {
    throw new AIProviderError({
      code: "missing_api_key",
      message: "OpenAI API key is not configured.",
    });
  }

  const prompts = buildWebsiteBlueprintEnhancementPrompts({
    brief: input.brief,
    blueprint: input.blueprint,
    agentSystemPrompt: input.agent.system_prompt,
  });

  if (estimateEnhancementPromptBytes(prompts) > AI_ENHANCEMENT_INPUT_MAX_BYTES) {
    throw new AIProviderError({
      code: "input_too_large",
      message: "Combined prompt input exceeds the allowed size limit.",
    });
  }

  const result = await provider.generateStructuredOutput({
    model,
    systemPrompt: prompts.systemPrompt,
    userPrompt: prompts.userPrompt,
    jsonSchema: buildWebsiteBlueprintJsonSchema(input.blueprint),
    schemaName: WEBSITE_BLUEPRINT_ENHANCEMENT_SCHEMA_NAME,
  });

  const validated = validateWebsiteBlueprintContent(result.data);

  if (!validated.ok) {
    throw new AIProviderError({
      code: "invalid_response",
      message: validated.error,
    });
  }

  return {
    content: validated.data,
    provider: result.provider,
    model: result.model,
    usage: result.usage,
  };
}
