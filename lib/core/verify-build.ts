import { verifyIndustryModuleRegistry } from "@/lib/core/registries/industry-module-verify";
import { verifyBlueprintIndustrySitemapIntegration } from "@/lib/core/registries/blueprint-industry-verify";
import { verifyIndustryRegistry } from "@/lib/core/registries/verify";
import { verifySectionRegistry } from "@/lib/core/registries/section-verify";
import { verifyThemeRegistry } from "@/lib/core/registries/theme-verify";
import { compileSmashburgerSampleProject, createSmashburgerCompilerInput } from "@/lib/core/samples";
import { verifyDeterministicVisualComponentGeneration } from "@/lib/project-generator/visual-components.verify";
import { verifyDeterministicReactPageGeneration } from "@/lib/project-generator/react-pages.verify";
import { verifyDeterministicReactComponentGeneration } from "@/lib/project-generator/react-components.verify";
import { generateNextJsProject } from "@/lib/project-generator/generator";
import { verifyDeterministicProjectGeneration } from "@/lib/project-generator/verify";
import { verifyDeterministicCompilation } from "@/lib/website-compiler/verify";
import type { ProjectGeneratorInput } from "@/lib/project-generator/types";

export type BuildVerificationCheck = {
  suite: string;
  name: string;
  passed: boolean;
  detail: string;
};

export type BuildVerificationReport = {
  passed: boolean;
  compileRouteCount: number;
  generatedFileCount: number;
  checks: BuildVerificationCheck[];
};

function flattenSuite(
  suite: string,
  result: { passed: boolean; checks: { name: string; passed: boolean; detail: string }[] },
): BuildVerificationCheck[] {
  return result.checks.map((check) => ({
    suite,
    name: check.name,
    passed: check.passed,
    detail: check.detail,
  }));
}

/**
 * In-memory engine verification for Milestone 6 (build gate).
 * Does not run ZIP/export checks (Milestone 7) or Next.js app build.
 */
export function runBuildVerification(): BuildVerificationReport {
  const checks: BuildVerificationCheck[] = [];

  checks.push(
    ...flattenSuite("industry-registry", verifyIndustryRegistry()),
    ...flattenSuite("section-registry", verifySectionRegistry()),
    ...flattenSuite("theme-registry", verifyThemeRegistry()),
    ...flattenSuite("industry-module-registry", verifyIndustryModuleRegistry()),
    ...flattenSuite("blueprint-industry-sitemap", verifyBlueprintIndustrySitemapIntegration()),
  );

  const compilerInput = createSmashburgerCompilerInput();
  checks.push(
    ...flattenSuite(
      "website-compiler",
      verifyDeterministicCompilation(compilerInput),
    ),
  );

  const { project: compiledProject } = compileSmashburgerSampleProject();
  const generatorInput: ProjectGeneratorInput = {
    project: compiledProject,
    generatedAt: "1970-01-01T00:00:00.000Z",
  };

  checks.push(
    ...flattenSuite(
      "project-generator",
      verifyDeterministicProjectGeneration(generatorInput),
    ),
    ...flattenSuite(
      "react-pages",
      verifyDeterministicReactPageGeneration(generatorInput),
    ),
    ...flattenSuite(
      "react-components",
      verifyDeterministicReactComponentGeneration(generatorInput),
    ),
    ...flattenSuite(
      "visual-components",
      verifyDeterministicVisualComponentGeneration(generatorInput),
    ),
  );

  const { generated } = generateNextJsProject(generatorInput);

  return {
    passed: checks.every((check) => check.passed),
    compileRouteCount: compiledProject.routes.length,
    generatedFileCount: generated.files.length,
    checks,
  };
}
