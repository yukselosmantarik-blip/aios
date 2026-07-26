import { BUILTIN_SECTION_DEFINITIONS } from "@/lib/core/registries/section-definitions";
import type {
  SectionCategory,
  SectionId,
  SectionKind,
  SectionRegistration,
  SectionRegistrySnapshot,
} from "@/lib/core/registries/section-types";

const sections = new Map<SectionId, SectionRegistration>();
let bootstrapped = false;

function compareSectionId(left: SectionId, right: SectionId): number {
  return left.localeCompare(right);
}

export function ensureSectionRegistryBootstrapped(): void {
  if (bootstrapped) {
    return;
  }

  for (const definition of BUILTIN_SECTION_DEFINITIONS) {
    registerSection(definition, { skipBootstrap: true });
  }

  bootstrapped = true;
}

export function registerSection(
  registration: SectionRegistration,
  options?: { skipBootstrap?: boolean },
): void {
  if (!options?.skipBootstrap) {
    ensureSectionRegistryBootstrapped();
  }

  if (sections.has(registration.id)) {
    throw new Error(`Section already registered: ${registration.id}`);
  }

  sections.set(registration.id, {
    ...registration,
    patternIds: [...registration.patternIds],
    componentBinding: registration.componentBinding
      ? {
          primary: registration.componentBinding.primary,
          alternates: registration.componentBinding.alternates
            ? [...registration.componentBinding.alternates]
            : undefined,
        }
      : undefined,
  });
}

export function getSectionRegistration(id: SectionId): SectionRegistration | undefined {
  ensureSectionRegistryBootstrapped();
  return sections.get(id);
}

export function listSectionRegistrations(): SectionRegistration[] {
  ensureSectionRegistryBootstrapped();
  return [...sections.values()].sort((left, right) => compareSectionId(left.id, right.id));
}

export function listSectionRegistrationsByCategory(
  category: SectionCategory,
): SectionRegistration[] {
  return listSectionRegistrations().filter((entry) => entry.category === category);
}

export function listSectionRegistrationsByKind(kind: SectionKind): SectionRegistration[] {
  return listSectionRegistrations().filter((entry) => entry.kind === kind);
}

export function getSectionRegistrySnapshot(): SectionRegistrySnapshot {
  const list = listSectionRegistrations();
  return {
    sections: list,
    count: list.length,
  };
}

export function isSectionRegistered(id: SectionId): boolean {
  ensureSectionRegistryBootstrapped();
  return sections.has(id);
}

/** @internal Test-only reset; not for production use. */
export function resetSectionRegistryForTests(): void {
  sections.clear();
  bootstrapped = false;
}
