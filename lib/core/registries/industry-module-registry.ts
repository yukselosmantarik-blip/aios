import type {
  IndustryCompileAttachments,
  IndustryModuleRegistration,
  IndustryModuleRegistrySnapshot,
} from "@/lib/core/registries/industry-module-types";
import type { IndustryId } from "@/lib/core/registries/types";
import type { WebsiteCompilerInput } from "@/lib/website-compiler/types";

const modules = new Map<IndustryId, IndustryModuleRegistration>();
let bootstrapped = false;

export function ensureIndustryModuleRegistryBootstrapped(): void {
  if (bootstrapped) {
    return;
  }
  bootstrapped = true;
}

export function registerIndustryModule(
  registration: IndustryModuleRegistration,
  options?: { allowReplace?: boolean },
): void {
  ensureIndustryModuleRegistryBootstrapped();

  if (modules.has(registration.id) && !options?.allowReplace) {
    throw new Error(`Industry module already registered: ${registration.id}`);
  }

  modules.set(registration.id, registration);
}

export function getIndustryModule(id: IndustryId): IndustryModuleRegistration | undefined {
  ensureIndustryModuleRegistryBootstrapped();
  return modules.get(id);
}

export function listIndustryModules(): IndustryModuleRegistration[] {
  ensureIndustryModuleRegistryBootstrapped();
  return [...modules.values()].sort((left, right) => left.id.localeCompare(right.id));
}

export function getIndustryModuleRegistrySnapshot(): IndustryModuleRegistrySnapshot {
  const list = listIndustryModules();
  return { modules: list, count: list.length };
}

export function isIndustryModuleRegistered(id: IndustryId): boolean {
  ensureIndustryModuleRegistryBootstrapped();
  return modules.has(id);
}

/**
 * Resolve compile attachments for the brief's industry via registered modules.
 */
export function resolveIndustryCompileAttachments(
  input: WebsiteCompilerInput,
  industryId: IndustryId,
): IndustryCompileAttachments {
  const industryModule = getIndustryModule(industryId);
  if (!industryModule?.compile.resolveCompileAttachments) {
    return {};
  }
  return industryModule.compile.resolveCompileAttachments(input) ?? {};
}

/** @internal Test-only reset. */
export function resetIndustryModuleRegistryForTests(): void {
  modules.clear();
  bootstrapped = false;
}
