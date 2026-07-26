import { BUILTIN_INDUSTRY_DEFINITIONS } from "@/lib/core/registries/industry-definitions";
import type {
  IndustryId,
  IndustryRegistration,
  IndustryRegistrySnapshot,
} from "@/lib/core/registries/types";
import type { WebsiteBrief } from "@/lib/website-briefs.types";
import { detectBusinessProfile } from "@/lib/website-compiler/normalize";

const industries = new Map<IndustryId, IndustryRegistration>();
let bootstrapped = false;

function compareIndustryId(left: IndustryId, right: IndustryId): number {
  return left.localeCompare(right);
}

export function ensureIndustryRegistryBootstrapped(): void {
  if (bootstrapped) {
    return;
  }

  for (const definition of BUILTIN_INDUSTRY_DEFINITIONS) {
    registerIndustry(definition, { skipBootstrap: true });
  }

  bootstrapped = true;
}

export function registerIndustry(
  registration: IndustryRegistration,
  options?: { skipBootstrap?: boolean },
): void {
  if (!options?.skipBootstrap) {
    ensureIndustryRegistryBootstrapped();
  }

  if (industries.has(registration.id)) {
    throw new Error(`Industry already registered: ${registration.id}`);
  }

  industries.set(registration.id, {
    ...registration,
    defaultSitemap: [...registration.defaultSitemap],
  });
}

export function getIndustryRegistration(id: IndustryId): IndustryRegistration | undefined {
  ensureIndustryRegistryBootstrapped();
  return industries.get(id);
}

export function listIndustryRegistrations(): IndustryRegistration[] {
  ensureIndustryRegistryBootstrapped();
  return [...industries.values()].sort((left, right) =>
    compareIndustryId(left.id, right.id),
  );
}

export function getIndustryRegistrySnapshot(): IndustryRegistrySnapshot {
  const list = listIndustryRegistrations();
  return {
    industries: list,
    count: list.length,
  };
}

export function isIndustryRegistered(id: IndustryId): boolean {
  ensureIndustryRegistryBootstrapped();
  return industries.has(id);
}

/** Resolve industry id from a brief using the same rules as the compiler. */
export function resolveIndustryIdFromBrief(brief: WebsiteBrief): IndustryId {
  ensureIndustryRegistryBootstrapped();
  return detectBusinessProfile(brief.industry, brief.business_name);
}

export function resolveIndustryRegistrationFromBrief(
  brief: WebsiteBrief,
): IndustryRegistration {
  const id = resolveIndustryIdFromBrief(brief);
  const registration = getIndustryRegistration(id);
  if (!registration) {
    throw new Error(`Industry registration missing for resolved id: ${id}`);
  }
  return registration;
}

/** @internal Test-only reset; not for production use. */
export function resetIndustryRegistryForTests(): void {
  industries.clear();
  bootstrapped = false;
}
