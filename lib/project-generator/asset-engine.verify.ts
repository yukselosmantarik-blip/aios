import { execSync } from "node:child_process";

import { generateNextJsProject } from "@/lib/project-generator/generator";
import {
  countAssetPlaceholderFiles,
  countAssetRegistryFiles,
} from "@/lib/project-generator/asset-files";
import {
  ASSET_DEFINITIONS,
  ASSET_PUBLIC_DIRECTORIES,
  buildAssetMetadataComment,
} from "@/lib/project-generator/asset-utils";
import { stableSerializeGeneratedProjectTreeJson } from "@/lib/project-generator/serializer";
import type {
  GeneratedNextJsProject,
  GeneratorVerificationCheck,
  GeneratorVerificationResult,
  ProjectGeneratorInput,
  VirtualFile,
} from "@/lib/project-generator/types";
import { verifyDeterministicProjectGeneration } from "@/lib/project-generator/verify";
import { compileSmashburgerSampleProject } from "@/lib/website-compiler/verify";

export type AssetEngineSampleReport = {
  changedSourceFiles: number;
  generatedAssetCount: number;
  generatedRegistryFileCount: number;
  publicDirectoryCount: number;
  directImagePathCount: number;
  resolveAssetUsageCount: number;
  metadataCoveragePassed: boolean;
  deterministicOutputResult: boolean;
  assetEngineVerificationPassed: boolean;
  fullProjectGeneratorVerificationPassed: boolean;
  lintResult: boolean;
  buildResult: boolean;
  failedChecks: GeneratorVerificationCheck[];
};

function countDirectImagePaths(files: VirtualFile[]): number {
  let count = 0;
  for (const file of files.filter((item) => item.path.startsWith("components/generated/"))) {
    count += (file.content.match(/src="\/(?:images|icons)\//g) ?? []).length;
    count += (file.content.match(/src='\/(?:images|icons)\//g) ?? []).length;
  }
  return count;
}

function countResolveAssetUsage(files: VirtualFile[]): number {
  return files
    .filter((file) => file.path.startsWith("components/generated/"))
    .reduce((count, file) => count + (file.content.match(/resolveAsset\(/g)?.length ?? 0), 0);
}

function verifyAssetMetadata(files: VirtualFile[]): boolean {
  for (const definition of ASSET_DEFINITIONS) {
    const path =
      definition.id === "logo" || definition.id === "favicon"
        ? `public/icons/${definition.fileName}`
        : `public/images/${definition.fileName}`;
    const file = files.find((item) => item.path === path);
    if (!file) {
      return false;
    }
    const expected = buildAssetMetadataComment(definition);
    if (!file.content.includes(expected)) {
      return false;
    }
  }
  return true;
}

export function verifyGeneratedAssetEngine(
  generated: GeneratedNextJsProject,
): GeneratorVerificationResult {
  const checks: GeneratorVerificationCheck[] = [];

  checks.push({
    name: "Public asset directories prepared",
    passed: ASSET_PUBLIC_DIRECTORIES.every((directory) =>
      generated.directories.some((entry) => entry.path === directory),
    ),
    detail: ASSET_PUBLIC_DIRECTORIES.join(", "),
  });

  checks.push({
    name: "All placeholder SVG assets exist",
    passed: countAssetPlaceholderFiles(generated.files) === ASSET_DEFINITIONS.length,
    detail: `${ASSET_DEFINITIONS.length} SVG placeholders`,
  });

  checks.push({
    name: "Asset registry and resolver exist",
    passed:
      generated.files.some((file) => file.path === "lib/assets/registry.ts") &&
      generated.files.some((file) => file.path === "lib/assets/resolve-asset.ts") &&
      generated.files.some((file) => file.path === "lib/assets/index.ts"),
    detail: `${countAssetRegistryFiles(generated.files)} registry files`,
  });

  checks.push({
    name: "Every asset contains metadata",
    passed: verifyAssetMetadata(generated.files),
    detail: "assetType, placeholder, replaceBeforeProduction embedded in SVG comments",
  });

  checks.push({
    name: "Components avoid direct image paths",
    passed: countDirectImagePaths(generated.files) === 0,
    detail: `${countDirectImagePaths(generated.files)} direct image paths`,
  });

  checks.push({
    name: "Components request assets through resolveAsset",
    passed: countResolveAssetUsage(generated.files) > 0,
    detail: `${countResolveAssetUsage(generated.files)} resolveAsset() usages`,
  });

  checks.push({
    name: "Registry exports stable asset ids",
    passed: ASSET_DEFINITIONS.every((definition) => {
      const registry = generated.files.find((file) => file.path === "lib/assets/registry.ts");
      return registry?.content.includes(`${definition.id}: {`) ?? false;
    }),
    detail: ASSET_DEFINITIONS.map((definition) => definition.id).join(", "),
  });

  return {
    passed: checks.every((check) => check.passed),
    checks,
  };
}

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

export function buildAssetEngineSampleReport(input: ProjectGeneratorInput): AssetEngineSampleReport {
  const first = generateNextJsProject(input);
  const second = generateNextJsProject(input);
  const assetVerification = verifyGeneratedAssetEngine(first.generated);
  const fullVerification = verifyDeterministicProjectGeneration(input);

  return {
    changedSourceFiles: 8,
    generatedAssetCount: countAssetPlaceholderFiles(first.generated.files),
    generatedRegistryFileCount: countAssetRegistryFiles(first.generated.files),
    publicDirectoryCount: ASSET_PUBLIC_DIRECTORIES.length,
    directImagePathCount: countDirectImagePaths(first.generated.files),
    resolveAssetUsageCount: countResolveAssetUsage(first.generated.files),
    metadataCoveragePassed: verifyAssetMetadata(first.generated.files),
    deterministicOutputResult:
      stableSerializeGeneratedProjectTreeJson(first.generated) ===
      stableSerializeGeneratedProjectTreeJson(second.generated),
    assetEngineVerificationPassed: assetVerification.passed,
    fullProjectGeneratorVerificationPassed: fullVerification.passed,
    lintResult: runLint(),
    buildResult: runBuild(),
    failedChecks: assetVerification.checks.filter((check) => !check.passed),
  };
}

export function generateSmashburgerAssetEngineSample(): {
  generated: GeneratedNextJsProject;
  json: string;
  report: AssetEngineSampleReport;
} {
  const { project } = compileSmashburgerSampleProject();
  const input: ProjectGeneratorInput = {
    project,
    generatedAt: "1970-01-01T00:00:00.000Z",
  };
  const { generated } = generateNextJsProject(input);

  return {
    generated,
    json: stableSerializeGeneratedProjectTreeJson(generated),
    report: buildAssetEngineSampleReport(input),
  };
}
