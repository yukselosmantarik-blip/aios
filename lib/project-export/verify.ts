import { execSync } from "node:child_process";

import { generateNextJsProject } from "@/lib/project-generator/generator";
import { stableSerializeNormalizedFiles } from "@/lib/project-export/checksum";
import {
  buildExportableWebsiteProject,
  countPlaceholdersByCategory,
} from "@/lib/project-export/export-package";
import { REQUIRED_ROOT_FILES } from "@/lib/project-export/normalize";
import type { ExportableWebsiteProject, ExportSampleReport } from "@/lib/project-export/types";
import { verifyDeterministicProjectGeneration } from "@/lib/project-generator/verify";
import { compileSmashburgerSampleProject } from "@/lib/website-compiler/verify";

function runLint(): boolean {
  try {
    execSync("npm run lint", { cwd: process.cwd(), stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

function runBuild(): boolean {
  try {
    execSync("npm run build", { cwd: process.cwd(), stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

export function verifyExportableWebsiteProject(
  exportPackage: ExportableWebsiteProject,
): { passed: boolean; checks: ExportSampleReport["failedChecks"] } {
  const checks: ExportSampleReport["failedChecks"] = [];

  checks.push({
    name: "Unique file paths",
    passed: exportPackage.validationSummary.uniqueFilePaths,
    detail: `${exportPackage.files.length} files`,
  });

  checks.push({
    name: "Unique directory paths",
    passed: exportPackage.validationSummary.uniqueDirectoryPaths,
    detail: `${exportPackage.directories.length} directories`,
  });

  checks.push({
    name: "Required root files exist",
    passed: REQUIRED_ROOT_FILES.every((path) =>
      exportPackage.files.some((file) => file.path === path),
    ),
    detail: REQUIRED_ROOT_FILES.join(", "),
  });

  checks.push({
    name: "No empty required files",
    passed: exportPackage.files.every((file) => !file.required || file.byteLength > 0),
    detail: "Required export files contain content",
  });

  checks.push({
    name: "All imports resolve",
    passed: exportPackage.validationSummary.unresolvedImportCount === 0,
    detail: `${exportPackage.validationSummary.unresolvedImportCount} unresolved imports`,
  });

  checks.push({
    name: "All routes resolve",
    passed: exportPackage.validationSummary.routesValid,
    detail: `${exportPackage.routeSummary.length} routes`,
  });

  checks.push({
    name: "All assets resolve",
    passed: exportPackage.validationSummary.assetsValid,
    detail: `${exportPackage.validationSummary.unresolvedAssetCount} unresolved assets`,
  });

  checks.push({
    name: "Token references resolve",
    passed: exportPackage.validationSummary.unknownTokenCount === 0,
    detail: `${exportPackage.validationSummary.unknownTokenCount} unknown tokens`,
  });

  checks.push({
    name: "No secrets detected",
    passed: exportPackage.validationSummary.securityValid,
    detail: `${exportPackage.validationSummary.detectedSecretCount} secrets`,
  });

  checks.push({
    name: "No absolute local paths",
    passed: exportPackage.validationSummary.absoluteLocalPathCount === 0,
    detail: `${exportPackage.validationSummary.absoluteLocalPathCount} absolute paths`,
  });

  checks.push({
    name: "No .env.local in export",
    passed: !exportPackage.virtualFiles.some((file) => file.path === ".env.local"),
    detail: "Secret env files excluded",
  });

  checks.push({
    name: "Unsupported dependencies absent",
    passed: exportPackage.validationSummary.dependenciesValid,
    detail: exportPackage.dependencySummary.issues.join("; ") || "Dependencies valid",
  });

  checks.push({
    name: "Placeholder report complete",
    passed: exportPackage.placeholderReport.length > 0,
    detail: `${exportPackage.placeholderReport.length} placeholders tracked`,
  });

  checks.push({
    name: "Export manifest checksum matches tree",
    passed: exportPackage.manifest.checksum === exportPackage.checksum,
    detail: exportPackage.checksum,
  });

  checks.push({
    name: "ZIP-ready entries prepared",
    passed:
      exportPackage.zipReadyEntries.length === exportPackage.files.length &&
      exportPackage.zipReadyEntries.every((entry) => entry.relativePath.length > 0),
    detail: `${exportPackage.zipReadyEntries.length} entries`,
  });

  return {
    passed: checks.every((check) => check.passed),
    checks,
  };
}

export function verifyDeterministicExport(input: {
  project: ReturnType<typeof compileSmashburgerSampleProject>["project"];
  generatedAt?: string;
}): { passed: boolean; checks: ExportSampleReport["failedChecks"] } {
  const generatedAt = input.generatedAt ?? "1970-01-01T00:00:00.000Z";
  const first = buildExportableWebsiteProject(
    generateNextJsProject({ project: input.project, generatedAt }).generated,
  );
  const second = buildExportableWebsiteProject(
    generateNextJsProject({ project: input.project, generatedAt }).generated,
  );

  const checks: ExportSampleReport["failedChecks"] = [
    {
      name: "Identical input produces identical export package",
      passed:
        stableSerializeNormalizedFiles(first.files) === stableSerializeNormalizedFiles(second.files),
      detail: "Stable normalized file comparison",
    },
    {
      name: "Identical input produces identical project checksum",
      passed: first.checksum === second.checksum,
      detail: first.checksum,
    },
    ...verifyExportableWebsiteProject(first).checks,
    ...verifyDeterministicProjectGeneration({ project: input.project, generatedAt }).checks.map(
      (check) => ({
        name: check.name,
        passed: check.passed,
        detail: check.detail,
      }),
    ),
  ];

  return {
    passed: checks.every((check) => check.passed),
    checks,
  };
}

export function buildExportSampleReport(input: {
  project: ReturnType<typeof compileSmashburgerSampleProject>["project"];
  generatedAt?: string;
}): ExportSampleReport {
  const generatedAt = input.generatedAt ?? "1970-01-01T00:00:00.000Z";
  const first = buildExportableWebsiteProject(
    generateNextJsProject({ project: input.project, generatedAt }).generated,
  );
  const second = buildExportableWebsiteProject(
    generateNextJsProject({ project: input.project, generatedAt }).generated,
  );
  const exportVerification = verifyExportableWebsiteProject(first);
  const deterministicVerification = verifyDeterministicExport({ project: input.project, generatedAt });

  const warningCountBySeverity = {
    info: first.warnings.filter((warning) => warning.severity === "info").length,
    warning: first.warnings.filter((warning) => warning.severity === "warning").length,
    error: first.warnings.filter((warning) => warning.severity === "error").length,
  };

  return {
    changedSourceFiles: 6,
    exportFileCount: first.files.length,
    exportDirectoryCount: first.directories.length,
    routeCount: first.routeSummary.length,
    componentCount: first.componentSummary.exportCount,
    assetCount: first.assetSummary.assetCount,
    placeholderCountByCategory: countPlaceholdersByCategory(first.placeholderReport),
    launchBlockingPlaceholderCount: first.placeholderReport.filter((entry) => entry.blocksLaunch)
      .length,
    warningCountBySeverity,
    totalTextBytes: first.files.reduce((sum, file) => sum + file.byteLength, 0),
    duplicatePathCount: first.validationSummary.duplicatePathCount,
    unresolvedImportCount: first.validationSummary.unresolvedImportCount,
    unresolvedAssetCount: first.validationSummary.unresolvedAssetCount,
    unknownTokenCount: first.validationSummary.unknownTokenCount,
    detectedSecretCount: first.validationSummary.detectedSecretCount,
    absoluteLocalPathCount: first.validationSummary.absoluteLocalPathCount,
    deterministicOutputResult:
      stableSerializeNormalizedFiles(first.files) === stableSerializeNormalizedFiles(second.files),
    checksumStabilityResult: first.checksum === second.checksum,
    lintResult: runLint(),
    buildResult: runBuild(),
    exportVerificationResult: exportVerification.passed,
    fullProjectGeneratorVerificationResult: deterministicVerification.passed,
    failedChecks: exportVerification.checks.filter((check) => !check.passed),
  };
}

export function generateSmashburgerExportSample(): {
  exportPackage: ExportableWebsiteProject;
  report: ExportSampleReport;
} {
  const { project } = compileSmashburgerSampleProject();
  const generatedAt = "1970-01-01T00:00:00.000Z";
  const { generated } = generateNextJsProject({ project, generatedAt });
  const exportPackage = buildExportableWebsiteProject(generated);

  return {
    exportPackage,
    report: buildExportSampleReport({ project, generatedAt }),
  };
}
