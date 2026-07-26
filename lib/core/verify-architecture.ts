import { ensureWebsiteEngineBootstrapped, resetWebsiteEngineBootstrapForTests } from "@/lib/core/bootstrap";
import {
  getIndustryModuleRegistrySnapshot,
  resetIndustryModuleRegistryForTests,
} from "@/lib/core/registries/industry-module-registry";
import {
  getIndustryRegistrySnapshot,
  resolveIndustryIdFromBrief,
  resetIndustryRegistryForTests,
} from "@/lib/core/registries/industry-registry";
import {
  getSectionRegistrySnapshot,
  resetSectionRegistryForTests,
} from "@/lib/core/registries/section-registry";
import {
  getThemeRegistrySnapshot,
  resetThemeRegistryForTests,
} from "@/lib/core/registries/theme-registry";
import { compileAndGenerateWebsite } from "@/lib/core/pipeline";
import { compileSmashburgerSampleProject, createSmashburgerCompilerInput } from "@/lib/core/samples";
import { stableSerializeGeneratedProjectTreeJson } from "@/lib/project-generator/serializer";
import { generateWebsiteBlueprintContent } from "@/lib/website-blueprint-generator";
import { detectBusinessProfile } from "@/lib/website-compiler/normalize";
import { resetIndustryModulesBootstrapForTests } from "@/lib/industries/bootstrap";
import { resetRestaurantIndustryModuleRegistrationForTests } from "@/lib/industries/restaurant/register";

export type ArchitectureVerificationCheck = {
  name: string;
  passed: boolean;
  detail: string;
};

export type ArchitectureVerificationResult = {
  passed: boolean;
  checks: ArchitectureVerificationCheck[];
};

function resetWebsiteEngineForVerify(): void {
  resetWebsiteEngineBootstrapForTests();
  resetIndustryRegistryForTests();
  resetSectionRegistryForTests();
  resetThemeRegistryForTests();
  resetIndustryModuleRegistryForTests();
  resetIndustryModulesBootstrapForTests();
  resetRestaurantIndustryModuleRegistrationForTests();
}

export function verifyWebsiteEngineArchitecture(): ArchitectureVerificationResult {
  resetWebsiteEngineForVerify();
  const checks: ArchitectureVerificationCheck[] = [];

  ensureWebsiteEngineBootstrapped();

  checks.push({
    name: "Industry registry bootstrapped",
    passed: getIndustryRegistrySnapshot().count === 4,
    detail: `industries=${getIndustryRegistrySnapshot().count}`,
  });

  checks.push({
    name: "Section registry bootstrapped",
    passed: getSectionRegistrySnapshot().count === 11,
    detail: `sections=${getSectionRegistrySnapshot().count}`,
  });

  checks.push({
    name: "Theme registry bootstrapped",
    passed: getThemeRegistrySnapshot().count === 8,
    detail: `themes=${getThemeRegistrySnapshot().count}`,
  });

  checks.push({
    name: "Industry module registry includes restaurant",
    passed: getIndustryModuleRegistrySnapshot().count >= 1,
    detail: `modules=${getIndustryModuleRegistrySnapshot().count}`,
  });

  const brief = createSmashburgerCompilerInput().brief;
  const resolvedIndustry = resolveIndustryIdFromBrief(brief);
  const legacyProfile = detectBusinessProfile(brief.industry, brief.business_name);
  checks.push({
    name: "Brief industry resolution uses shared detectBusinessProfile rules",
    passed: resolvedIndustry === legacyProfile && resolvedIndustry === "restaurant",
    detail: resolvedIndustry,
  });

  const blueprint = generateWebsiteBlueprintContent(brief);
  checks.push({
    name: "Blueprint generation runs with engine registries active",
    passed: blueprint.recommendedSitemap.length >= 5,
    detail: blueprint.recommendedSitemap.join(" → "),
  });

  const input = createSmashburgerCompilerInput();
  const first = compileAndGenerateWebsite(input, "1970-01-01T00:00:00.000Z");
  const second = compileAndGenerateWebsite(input, "1970-01-01T00:00:00.000Z");
  checks.push({
    name: "Core pipeline output remains deterministic after bootstrap consolidation",
    passed:
      stableSerializeGeneratedProjectTreeJson(first.generated) ===
      stableSerializeGeneratedProjectTreeJson(second.generated),
    detail: `${first.generated.files.length} files`,
  });

  const { project } = compileSmashburgerSampleProject();
  checks.push({
    name: "Compiled sample attaches restaurant industry data",
    passed: Boolean(project.restaurantAssets && project.restaurantBusinessProfile),
    detail: project.routes.map((route) => route.routePath).join(", "),
  });

  return {
    passed: checks.every((check) => check.passed),
    checks,
  };
}
