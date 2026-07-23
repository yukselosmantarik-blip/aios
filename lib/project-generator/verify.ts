import { generateNextJsProject } from "@/lib/project-generator/generator";
import { stableSerializeGeneratedProjectTreeJson } from "@/lib/project-generator/serializer";
import {
  fileNameFromPath,
  groupFilesByDirectory,
  REQUIRED_ROOT_DIRECTORIES,
  routePathToPageFilePath,
} from "@/lib/project-generator/tree";
import type {
  GeneratedNextJsProject,
  GeneratorSampleReport,
  GeneratorVerificationCheck,
  GeneratorVerificationResult,
  ProjectGeneratorInput,
} from "@/lib/project-generator/types";
import { compileSmashburgerSampleProject } from "@/lib/website-compiler/verify";

function unique(values: string[]): boolean {
  return new Set(values).size === values.length;
}

export function verifyGeneratedNextJsProject(
  generated: GeneratedNextJsProject,
): GeneratorVerificationResult {
  const checks: GeneratorVerificationCheck[] = [];
  const filePaths = generated.files.map((file) => file.path);
  const routePaths = generated.routes.map((route) => route.routePath);
  const pageFilePaths = generated.routes.map((route) => route.pageFilePath);

  checks.push({
    name: "Unique virtual file paths",
    passed: unique(filePaths),
    detail: `${filePaths.length} files`,
  });

  const duplicateNamesByDirectory = [...groupFilesByDirectory(generated.files).entries()].filter(
    ([, files]) => {
      const names = files.map((file) => fileNameFromPath(file.path));
      return !unique(names);
    },
  );
  checks.push({
    name: "No duplicate filenames within directories",
    passed: duplicateNamesByDirectory.length === 0,
    detail:
      duplicateNamesByDirectory.length === 0
        ? "All directory filenames are unique"
        : duplicateNamesByDirectory.map(([directory]) => directory).join(", "),
  });

  checks.push({
    name: "Valid App Router structure",
    passed:
      generated.files.some((file) => file.path === "app/layout.tsx") &&
      generated.files.some((file) => file.path === "app/page.tsx") &&
      generated.files.some((file) => file.path === "app/loading.tsx") &&
      generated.files.some((file) => file.path === "app/error.tsx") &&
      generated.files.some((file) => file.path === "app/not-found.tsx"),
    detail: "Root app shell files must exist",
  });

  checks.push({
    name: "Every compiled page has a route file",
    passed: generated.routes.every((route) =>
      generated.files.some((file) => file.path === route.pageFilePath),
    ),
    detail: pageFilePaths.join(", "),
  });

  checks.push({
    name: "Every route has a matching page record",
    passed: generated.routes.every((route) => Boolean(route.pageName && route.pageRole)),
    detail: `${generated.routes.length} routes`,
  });

  checks.push({
    name: "No missing required folders",
    passed: REQUIRED_ROOT_DIRECTORIES.every((folder) =>
      generated.directories.some((directory) => directory.path === folder),
    ),
    detail: REQUIRED_ROOT_DIRECTORIES.join(", "),
  });

  checks.push({
    name: "Homepage route exists",
    passed: generated.routes.some((route) => route.routePath === "/"),
    detail: routePaths.join(", "),
  });

  checks.push({
    name: "Unique route paths",
    passed: unique(routePaths),
    detail: routePaths.join(", "),
  });

  checks.push({
    name: "Component descriptors have registry entries",
    passed:
      generated.files.some((file) => file.path === "components/registry.ts") &&
      generated.componentDescriptors.every((descriptor) =>
        generated.files.some((file) => file.path === descriptor.filePath),
      ),
    detail: `${generated.componentDescriptors.length} descriptors`,
  });

  checks.push({
    name: "No JSX component implementations generated",
    passed: !generated.files.some(
      (file) =>
        file.kind === "component-descriptor" &&
        /return\s*\(|<[A-Z][A-Za-z0-9]*/.test(file.content),
    ),
    detail: "Descriptor sprint must remain JSX-free",
  });

  checks.push({
    name: "No filesystem writes encoded in output",
    passed: !JSON.stringify(generated).includes("writeFileSync") &&
      !JSON.stringify(generated).includes("fs.writeFile"),
    detail: "Virtual tree only",
  });

  checks.push({
    name: "Public asset placeholders prepared",
    passed: ["public/logo.svg", "public/favicon.ico", "public/og-image.jpg", "public/images/.gitkeep"].every(
      (path) => generated.files.some((file) => file.path === path),
    ),
    detail: "Logo, favicon, OG image, images directory",
  });

  return {
    passed: checks.every((check) => check.passed),
    checks,
  };
}

export function verifyDeterministicProjectGeneration(
  input: ProjectGeneratorInput,
): GeneratorVerificationResult {
  const first = generateNextJsProject({ ...input, generatedAt: "1970-01-01T00:00:00.000Z" }).generated;
  const second = generateNextJsProject({ ...input, generatedAt: "1970-01-01T00:00:00.000Z" }).generated;

  const checks: GeneratorVerificationCheck[] = [
    {
      name: "Stable output across identical runs",
      passed:
        stableSerializeGeneratedProjectTreeJson(first) ===
        stableSerializeGeneratedProjectTreeJson(second),
      detail: "Normalized tree JSON comparison",
    },
    ...verifyGeneratedNextJsProject(first).checks,
  ];

  return {
    passed: checks.every((check) => check.passed),
    checks,
  };
}

export function buildGeneratorSampleReport(input: ProjectGeneratorInput): GeneratorSampleReport {
  const first = generateNextJsProject(input);
  const second = generateNextJsProject(input);
  const verification = verifyDeterministicProjectGeneration(input);

  return {
    filesPrepared: first.generated.files.length,
    foldersPrepared: first.generated.directories.length,
    routesPrepared: first.generated.routes.map((route) => route.routePath),
    componentDescriptors: first.generated.componentDescriptors.map((descriptor) => descriptor.name),
    verificationPassed: verification.passed,
    failedChecks: verification.checks.filter((check) => !check.passed),
    identicalRuns:
      stableSerializeGeneratedProjectTreeJson(first.generated) ===
      stableSerializeGeneratedProjectTreeJson(second.generated),
  };
}

export function generateSmashburgerSampleProject(): {
  generated: GeneratedNextJsProject;
  json: string;
  report: GeneratorSampleReport;
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
    report: buildGeneratorSampleReport(input),
  };
}

export function summarizeGeneratedRoutes(generated: GeneratedNextJsProject): string[] {
  return generated.routes.map((route) => `${route.routePath} -> ${route.pageFilePath}`);
}

export function assertRoutePageFilesExist(generated: GeneratedNextJsProject): boolean {
  return generated.routes.every((route) =>
    generated.files.some((file) => file.path === routePathToPageFilePath(route.routePath)),
  );
}
