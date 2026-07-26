import { BUILTIN_THEME_DEFINITIONS } from "@/lib/core/registries/theme-definitions";
import type {
  ThemePresetId,
  ThemeRegistration,
  ThemeRegistrySnapshot,
  ThemeStyleTier,
} from "@/lib/core/registries/theme-types";
import type { WebsiteBrief } from "@/lib/website-briefs.types";
import { detectStyleTier } from "@/lib/website-compiler/normalize";

const themes = new Map<ThemePresetId, ThemeRegistration>();
let bootstrapped = false;

function compareThemeId(left: ThemePresetId, right: ThemePresetId): number {
  return left.localeCompare(right);
}

export function ensureThemeRegistryBootstrapped(): void {
  if (bootstrapped) {
    return;
  }

  for (const definition of BUILTIN_THEME_DEFINITIONS) {
    registerTheme(definition, { skipBootstrap: true });
  }

  bootstrapped = true;
}

export function registerTheme(
  registration: ThemeRegistration,
  options?: { skipBootstrap?: boolean },
): void {
  if (!options?.skipBootstrap) {
    ensureThemeRegistryBootstrapped();
  }

  if (themes.has(registration.id)) {
    throw new Error(`Theme already registered: ${registration.id}`);
  }

  themes.set(registration.id, {
    ...registration,
    capabilities: { ...registration.capabilities },
  });
}

export function getThemeRegistration(id: ThemePresetId): ThemeRegistration | undefined {
  ensureThemeRegistryBootstrapped();
  return themes.get(id);
}

export function listThemeRegistrations(): ThemeRegistration[] {
  ensureThemeRegistryBootstrapped();
  return [...themes.values()].sort((left, right) => compareThemeId(left.id, right.id));
}

export function listThemeRegistrationsByLegacyStyleTier(
  tier: ThemeStyleTier,
): ThemeRegistration[] {
  return listThemeRegistrations().filter((entry) => entry.legacyStyleTier === tier);
}

export function getThemeRegistrySnapshot(): ThemeRegistrySnapshot {
  const list = listThemeRegistrations();
  return {
    themes: list,
    count: list.length,
  };
}

export function isThemeRegistered(id: ThemePresetId): boolean {
  ensureThemeRegistryBootstrapped();
  return themes.has(id);
}

/**
 * Suggest preset themes compatible with the brief's current style tier heuristic.
 * Does not change compile/generator behavior.
 */
export function suggestThemePresetsForBrief(brief: WebsiteBrief): ThemeRegistration[] {
  ensureThemeRegistryBootstrapped();
  const tier = detectStyleTier(
    brief.preferred_style,
    brief.additional_notes,
    brief.reference_websites,
  );
  return listThemeRegistrationsByLegacyStyleTier(tier);
}

/** @internal Test-only reset; not for production use. */
export function resetThemeRegistryForTests(): void {
  themes.clear();
  bootstrapped = false;
}
