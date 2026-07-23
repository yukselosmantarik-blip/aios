import type { AIProviderName } from "@/lib/ai/types";
import type {
  StructuredOutputRequest,
  StructuredOutputResult,
} from "@/lib/ai/types";

export interface AIProvider {
  readonly name: AIProviderName;
  readonly supportedModels: readonly string[];
  isConfigured(): boolean;
  generateStructuredOutput(
    request: StructuredOutputRequest,
  ): Promise<StructuredOutputResult>;
}

const registry = new Map<AIProviderName, AIProvider>();

export function registerAIProvider(provider: AIProvider): void {
  registry.set(provider.name, provider);
}

export function getRegisteredAIProvider(name: AIProviderName): AIProvider {
  const provider = registry.get(name);

  if (!provider) {
    throw new Error(`AI provider "${name}" is not registered.`);
  }

  return provider;
}

export function listRegisteredAIProviders(): readonly AIProvider[] {
  return Array.from(registry.values());
}
