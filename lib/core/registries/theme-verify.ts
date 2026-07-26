import { createSmashburgerCompilerInput } from "@/lib/website-compiler/verify";
import { detectStyleTier } from "@/lib/website-compiler/normalize";
import {
  getThemeRegistrySnapshot,
  suggestThemePresetsForBrief,
} from "@/lib/core/registries/theme-registry";

export type ThemeRegistryVerificationCheck = {
  name: string;
  passed: boolean;
  detail: string;
};

export type ThemeRegistryVerificationResult = {
  passed: boolean;
  checks: ThemeRegistryVerificationCheck[];
};

const EXPECTED_THEME_IDS = [
  "premium",
  "luxury",
  "modern",
  "minimal",
  "corporate",
  "dark",
  "light",
  "creative",
] as const;

export function verifyThemeRegistry(): ThemeRegistryVerificationResult {
  const checks: ThemeRegistryVerificationCheck[] = [];
  const snapshot = getThemeRegistrySnapshot();

  checks.push({
    name: "Built-in theme presets registered",
    passed: snapshot.count === EXPECTED_THEME_IDS.length,
    detail: `count=${snapshot.count}`,
  });

  checks.push({
    name: "Expected theme ids present",
    passed: EXPECTED_THEME_IDS.every((id) => snapshot.themes.some((entry) => entry.id === id)),
    detail: snapshot.themes.map((entry) => entry.id).join(", "),
  });

  checks.push({
    name: "Registrations expose styling capabilities only",
    passed: snapshot.themes.every(
      (entry) =>
        entry.capabilities &&
        typeof entry.capabilities.colorMode === "string" &&
        typeof entry.capabilities.layoutDensity === "string" &&
        !("industryId" in entry) &&
        !("sectionIds" in entry),
    ),
    detail: "no industry/section fields on theme registrations",
  });

  const smashburgerBrief = createSmashburgerCompilerInput().brief;
  const tier = detectStyleTier(
    smashburgerBrief.preferred_style,
    smashburgerBrief.additional_notes,
    smashburgerBrief.reference_websites,
  );
  const suggestions = suggestThemePresetsForBrief(smashburgerBrief);

  checks.push({
    name: "Smashburger brief style tier matches premium heuristic",
    passed: tier === "premium",
    detail: `tier=${tier}`,
  });

  checks.push({
    name: "Theme suggestions for Smashburger include premium preset",
    passed: suggestions.some((entry) => entry.id === "premium"),
    detail: suggestions.map((entry) => entry.id).join(", ") || "none",
  });

  return {
    passed: checks.every((check) => check.passed),
    checks,
  };
}
