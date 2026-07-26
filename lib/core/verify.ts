import { verifyIndustryRegistry } from "@/lib/core/registries/verify";
import { verifySectionRegistry } from "@/lib/core/registries/section-verify";
import { verifyThemeRegistry } from "@/lib/core/registries/theme-verify";
import { stableSerializeGeneratedProjectTreeJson } from "@/lib/project-generator/serializer";
import { generateSmashburgerZipExportSample } from "@/lib/project-export/zip-export.verify";
import { compileSmashburgerSampleProject } from "@/lib/website-compiler/verify";
import { compileAndGenerateWebsite } from "@/lib/core/pipeline";
import { createSmashburgerCompilerInput } from "@/lib/core/samples";

export type CoreEngineSmokeReport = {
  compileRouteCount: number;
  generatedFileCount: number;
  zipVerificationPassed: boolean;
  pipelineDeterministic: boolean;
  industryRegistryPassed: boolean;
  sectionRegistryPassed: boolean;
  themeRegistryPassed: boolean;
};

/**
 * Lightweight smoke checks for the core facade (no behavior change to legacy paths).
 */
export async function runCoreEngineSmokeChecks(): Promise<CoreEngineSmokeReport> {
  const input = createSmashburgerCompilerInput();
  const first = compileAndGenerateWebsite(input, "1970-01-01T00:00:00.000Z");
  const second = compileAndGenerateWebsite(input, "1970-01-01T00:00:00.000Z");
  const { zipVerification } = await generateSmashburgerZipExportSample();
  const { project } = compileSmashburgerSampleProject();

  return {
    compileRouteCount: project.routes.length,
    generatedFileCount: first.generated.files.length,
    zipVerificationPassed: zipVerification.passed,
    pipelineDeterministic:
      stableSerializeGeneratedProjectTreeJson(first.generated) ===
      stableSerializeGeneratedProjectTreeJson(second.generated),
    industryRegistryPassed: verifyIndustryRegistry().passed,
    sectionRegistryPassed: verifySectionRegistry().passed,
    themeRegistryPassed: verifyThemeRegistry().passed,
  };
}
