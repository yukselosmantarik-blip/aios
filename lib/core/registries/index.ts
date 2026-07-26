export type {
  IndustryId,
  IndustryRegistration,
  IndustryRegistrySnapshot,
} from "@/lib/core/registries/types";

export {
  ensureIndustryRegistryBootstrapped,
  registerIndustry,
  getIndustryRegistration,
  listIndustryRegistrations,
  getIndustryRegistrySnapshot,
  isIndustryRegistered,
  resolveIndustryIdFromBrief,
  resolveIndustryRegistrationFromBrief,
  resetIndustryRegistryForTests,
} from "@/lib/core/registries/industry-registry";

export { BUILTIN_INDUSTRY_DEFINITIONS } from "@/lib/core/registries/industry-definitions";

export {
  verifyIndustryRegistry,
  type IndustryRegistryVerificationCheck,
  type IndustryRegistryVerificationResult,
} from "@/lib/core/registries/verify";

export type {
  SectionId,
  SectionCategory,
  SectionKind,
  SectionRegistration,
  SectionRegistrySnapshot,
  SectionComponentBinding,
} from "@/lib/core/registries/section-types";

export {
  ensureSectionRegistryBootstrapped,
  registerSection,
  getSectionRegistration,
  listSectionRegistrations,
  listSectionRegistrationsByCategory,
  listSectionRegistrationsByKind,
  getSectionRegistrySnapshot,
  isSectionRegistered,
  resetSectionRegistryForTests,
} from "@/lib/core/registries/section-registry";

export { BUILTIN_SECTION_DEFINITIONS } from "@/lib/core/registries/section-definitions";

export {
  verifySectionRegistry,
  type SectionRegistryVerificationCheck,
  type SectionRegistryVerificationResult,
} from "@/lib/core/registries/section-verify";

export type {
  ThemePresetId,
  ThemeStyleTier,
  ThemeColorMode,
  ThemeMotionLevel,
  ThemeLayoutDensity,
  ThemeCapabilities,
  ThemeRegistration,
  ThemeRegistrySnapshot,
} from "@/lib/core/registries/theme-types";

export {
  ensureThemeRegistryBootstrapped,
  registerTheme,
  getThemeRegistration,
  listThemeRegistrations,
  listThemeRegistrationsByLegacyStyleTier,
  getThemeRegistrySnapshot,
  isThemeRegistered,
  suggestThemePresetsForBrief,
  resetThemeRegistryForTests,
} from "@/lib/core/registries/theme-registry";

export { BUILTIN_THEME_DEFINITIONS } from "@/lib/core/registries/theme-definitions";

export {
  verifyThemeRegistry,
  type ThemeRegistryVerificationCheck,
  type ThemeRegistryVerificationResult,
} from "@/lib/core/registries/theme-verify";
