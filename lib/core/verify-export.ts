import { execSync } from "node:child_process";

import {
  createTempExportDirectory,
  extractZipArchiveToDirectory,
  removeTempExportDirectory,
} from "@/lib/core/export-zip-extract";
import {
  verifyExportAssetCopying,
  verifyExportPreviewCompatibility,
  verifyExportProjectStructure,
  verifyExportRouting,
  verifySourceCustomerAssetsOnDisk,
  type ExportVerificationCheck,
} from "@/lib/core/export-verify-suites";
import { compileAndGenerateWebsite } from "@/lib/core/pipeline";
import {
  compileSmashburgerSampleProject,
  createSmashburgerCompilerInput,
} from "@/lib/core/samples";
import { stableSerializeNormalizedFiles } from "@/lib/project-export/checksum";
import { buildExportableWebsiteProject } from "@/lib/project-export/export-package";
import { verifyDeterministicExport } from "@/lib/project-export/verify";
import { generateSmashburgerZipExportSample } from "@/lib/project-export/zip-export.verify";
import { generateNextJsProject } from "@/lib/project-generator/generator";
import { stableSerializeGeneratedProjectTreeJson } from "@/lib/project-generator/serializer";

export type ExportVerificationReport = {
  passed: boolean;
  exportFileCount: number;
  zipFileCount: number;
  zipArchiveBytes: number;
  previewBuildPassed: boolean | null;
  checks: ExportVerificationCheck[];
};

function flattenZipChecks(
  checks: { name: string; passed: boolean; detail: string }[],
): ExportVerificationCheck[] {
  return checks.map((check) => ({
    suite: "zip-export",
    name: check.name,
    passed: check.passed,
    detail: check.detail,
  }));
}

function flattenExportChecks(
  checks: { name: string; passed: boolean; detail: string }[],
): ExportVerificationCheck[] {
  return checks.map((check) => ({
    suite: "export-package",
    name: check.name,
    passed: check.passed,
    detail: check.detail,
  }));
}

function verifyDeterministicWebsiteGeneration(): ExportVerificationCheck[] {
  const input = createSmashburgerCompilerInput();
  const first = compileAndGenerateWebsite(input, "1970-01-01T00:00:00.000Z");
  const second = compileAndGenerateWebsite(input, "1970-01-01T00:00:00.000Z");
  const exportFirst = buildExportableWebsiteProject(first.generated);
  const exportSecond = buildExportableWebsiteProject(second.generated);

  const treeMatch =
    stableSerializeGeneratedProjectTreeJson(first.generated) ===
    stableSerializeGeneratedProjectTreeJson(second.generated);
  const exportMatch =
    stableSerializeNormalizedFiles(exportFirst.files) ===
    stableSerializeNormalizedFiles(exportSecond.files);

  return [
    {
      suite: "deterministic-generation",
      name: "Pipeline produces identical virtual Next.js tree",
      passed: treeMatch,
      detail: `${first.generated.files.length} files`,
    },
    {
      suite: "deterministic-generation",
      name: "Pipeline produces identical export package",
      passed: exportMatch && exportFirst.checksum === exportSecond.checksum,
      detail: exportFirst.checksum,
    },
  ];
}

export async function runExportVerification(options?: {
  skipPreviewBuild?: boolean;
}): Promise<ExportVerificationReport> {
  const checks: ExportVerificationCheck[] = [];

  checks.push(...verifySourceCustomerAssetsOnDisk());
  checks.push(...verifyDeterministicWebsiteGeneration());

  const { project } = compileSmashburgerSampleProject();
  const deterministicExport = verifyDeterministicExport({ project });
  checks.push(...flattenExportChecks(deterministicExport.checks));

  const generatedAt = "1970-01-01T00:00:00.000Z";
  const { generated } = generateNextJsProject({ project, generatedAt });
  const exportPackage = buildExportableWebsiteProject(generated);

  checks.push(...verifyExportRouting(exportPackage));
  checks.push(...verifyExportProjectStructure(exportPackage));
  checks.push(...verifyExportAssetCopying(exportPackage));
  checks.push(...verifyExportPreviewCompatibility(exportPackage));

  const { zipExport, zipVerification, exportPackage: zipSamplePackage } =
    await generateSmashburgerZipExportSample();
  checks.push(...flattenZipChecks(zipVerification.checks));
  checks.push({
    suite: "zip-export",
    name: "ZIP created and verified by export engine",
    passed: zipExport.verified && zipVerification.passed,
    detail: `${zipExport.metadata.fileCount} files, ${zipExport.metadata.archiveSize} bytes`,
  });

  let previewBuildPassed: boolean | null = options?.skipPreviewBuild ? null : true;
  if (!options?.skipPreviewBuild) {
    const tempDirectory = createTempExportDirectory();
    try {
      await extractZipArchiveToDirectory(zipExport.archive, tempDirectory);
      execSync("npm install --no-audit --no-fund", {
        cwd: tempDirectory,
        stdio: "pipe",
        env: { ...process.env, CI: "true" },
      });
      execSync("npm run build", {
        cwd: tempDirectory,
        stdio: "pipe",
        env: { ...process.env, CI: "true" },
      });
      checks.push({
        suite: "export-preview",
        name: "Extracted ZIP installs and builds (preview-ready)",
        passed: true,
        detail: "npm install && npm run build succeeded in temp extract",
      });
    } catch (error) {
      previewBuildPassed = false;
      const message = error instanceof Error ? error.message : "Export build failed";
      const stderr =
        error && typeof error === "object" && "stderr" in error
          ? String((error as { stderr?: Buffer }).stderr ?? "")
          : "";
      checks.push({
        suite: "export-preview",
        name: "Extracted ZIP installs and builds (preview-ready)",
        passed: false,
        detail: `${message} ${stderr}`.trim().slice(0, 800),
      });
    } finally {
      removeTempExportDirectory(tempDirectory);
    }
  }

  return {
    passed: checks.every((check) => check.passed),
    exportFileCount: exportPackage.files.length,
    zipFileCount: zipSamplePackage.files.length,
    zipArchiveBytes: zipExport.metadata.archiveSize,
    previewBuildPassed,
    checks,
  };
}
