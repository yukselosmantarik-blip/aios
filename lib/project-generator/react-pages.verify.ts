import { generateNextJsProject } from "@/lib/project-generator/generator";
import { countErrorFiles, countLoadingFiles } from "@/lib/project-generator/react-route-files";
import {
  countPageConfigFiles,
  countPlaceholderComponents,
  countReactPages,
  countTsxFiles,
} from "@/lib/project-generator/react-pages";
import { stableSerializeGeneratedProjectTreeJson } from "@/lib/project-generator/serializer";
import { routePathToPageFilePath } from "@/lib/project-generator/tree";
import type {
  GeneratedNextJsProject,
  GeneratorVerificationCheck,
  GeneratorVerificationResult,
  ProjectGeneratorInput,
  ReactPageSampleReport,
  VirtualFile,
} from "@/lib/project-generator/types";
import { verifyGeneratedNextJsProject } from "@/lib/project-generator/verify";
import { compileSmashburgerSampleProject } from "@/lib/website-compiler/verify";

const IMPORT_PATTERN = /from ['"](@\/[^'"]+|\.[^'"]+)['"]/g;

function unique(values: string[]): boolean {
  return new Set(values).size === values.length;
}

function fileExists(files: VirtualFile[], importPath: string): boolean {
  if (importPath.startsWith("@/")) {
    const relative = importPath.slice(2);
    const candidates = [
      relative,
      `${relative}.ts`,
      `${relative}.tsx`,
      `${relative}/index.ts`,
      `${relative}/index.tsx`,
    ];
    return candidates.some((candidate) => files.some((file) => file.path === candidate));
  }

  return true;
}

export function extractImports(content: string): string[] {
  const imports: string[] = [];
  let match: RegExpExecArray | null = IMPORT_PATTERN.exec(content);
  while (match) {
    imports.push(match[1]);
    match = IMPORT_PATTERN.exec(content);
  }
  IMPORT_PATTERN.lastIndex = 0;
  return imports.sort();
}

export function findUnresolvedImports(files: VirtualFile[]): string[] {
  const unresolved: string[] = [];
  const tsxFiles = files.filter((file) => file.path.endsWith(".tsx") || file.path.endsWith(".ts"));

  for (const file of tsxFiles) {
    if (file.path.startsWith("components/") && file.path.endsWith(".descriptor.ts")) {
      continue;
    }

    for (const importPath of extractImports(file.content)) {
      if (importPath.startsWith("@/") && !fileExists(files, importPath)) {
        unresolved.push(`${file.path} -> ${importPath}`);
      }
    }
  }

  return unresolved.sort();
}

export function findDeadInternalLinks(
  generated: GeneratedNextJsProject,
  projectRoutes: string[],
): string[] {
  const knownRoutes = new Set(projectRoutes);
  const deadLinks: string[] = [];
  const hrefPattern = /href=["']([^"']+)["']/g;

  for (const file of generated.files) {
    if (!file.path.endsWith(".tsx")) {
      continue;
    }

    let match: RegExpExecArray | null = hrefPattern.exec(file.content);
    while (match) {
      const href = match[1];
      if (!href.startsWith("/") || href.startsWith("//")) {
        match = hrefPattern.exec(file.content);
        continue;
      }
      const pathOnly = href.split("#")[0] || "/";
      const hash = href.includes("#") ? href.slice(href.indexOf("#")) : "";
      const pathKnown = knownRoutes.has(pathOnly);
      const homeAnchorKnown =
        pathOnly === "/" && (hash === "#home" || hash === "#menu" || hash === "#contact");
      if (!pathKnown && !homeAnchorKnown) {
        deadLinks.push(`${file.path}: ${href}`);
      }
      match = hrefPattern.exec(file.content);
    }
    hrefPattern.lastIndex = 0;
  }

  return deadLinks.sort();
}

export function countMainLandmarks(content: string): number {
  return (content.match(/<main[\s>]/g) ?? []).length;
}

export function verifyGeneratedReactPages(
  generated: GeneratedNextJsProject,
): GeneratorVerificationResult {
  const checks: GeneratorVerificationCheck[] = [];
  const routePaths = generated.routes.map((route) => route.routePath);

  checks.push({
    name: "All compiled routes have generated page files",
    passed: generated.routes.every((route) =>
      generated.files.some((file) => file.path === route.pageFilePath),
    ),
    detail: generated.routes.map((route) => route.pageFilePath).join(", "),
  });

  checks.push({
    name: "Homepage maps to app/page.tsx",
    passed: generated.files.some(
      (file) => file.path === "app/page.tsx" && file.kind === "react-page",
    ),
    detail: "Expected generated React homepage",
  });

  checks.push({
    name: "Non-home routes map correctly",
    passed: generated.routes
      .filter((route) => route.routePath !== "/")
      .every((route) => {
        const expected = routePathToPageFilePath(route.routePath);
        return generated.files.some((file) => file.path === expected && file.kind === "react-page");
      }),
    detail: routePaths.filter((path) => path !== "/").join(", "),
  });

  checks.push({
    name: "All legal routes have generated page files",
    passed: generated.routes
      .filter((route) => route.pageRole === "legal")
      .every((route) =>
        generated.files.some(
          (file) => file.path === route.pageFilePath && file.kind === "react-page",
        ),
      ),
    detail:
      generated.routes
        .filter((route) => route.pageRole === "legal")
        .map((route) => route.routePath)
        .join(", ") || "none",
  });

  const unresolvedImports = findUnresolvedImports(generated.files);
  checks.push({
    name: "All generated imports resolve within virtual tree",
    passed: unresolvedImports.length === 0,
    detail:
      unresolvedImports.length === 0
        ? "All @/ imports resolved"
        : unresolvedImports.slice(0, 5).join("; "),
  });

  const deadLinks = findDeadInternalLinks(generated, routePaths);
  checks.push({
    name: "All internal links resolve",
    passed: deadLinks.length === 0,
    detail: deadLinks.length === 0 ? "No dead internal links" : deadLinks.join("; "),
  });

  checks.push({
    name: "All generated files have unique paths",
    passed: unique(generated.files.map((file) => file.path)),
    detail: `${generated.files.length} files`,
  });

  const pageIds = generated.files
    .filter((file) => file.kind === "react-page")
    .map((file) => file.metadata.pageId)
    .filter(Boolean) as string[];
  checks.push({
    name: "All page IDs are stable",
    passed: unique(pageIds) && pageIds.every((id) => id.startsWith("page:")),
    detail: pageIds.join(", "),
  });

  const reactPages = generated.files.filter((file) => file.kind === "react-page");
  const sectionIdPattern = /id=\{[^}]+\}|id="[^"]+"/g;
  checks.push({
    name: "All section IDs are unique per page",
    passed: reactPages.every((file) => {
      const ids = file.content.match(sectionIdPattern) ?? [];
      return unique(ids);
    }),
    detail: `${reactPages.length} react pages checked`,
  });

  checks.push({
    name: "Exactly one main landmark per page",
    passed:
      generated.files.some((file) => file.path === "app/layout.tsx" && countMainLandmarks(file.content) === 1) &&
      reactPages.every((file) => countMainLandmarks(file.content) === 0),
    detail: "Main landmark only in root layout",
  });

  checks.push({
    name: "No unsupported raw HTML injection",
    passed: !generated.files.some((file) => /dangerouslySetInnerHTML/.test(file.content)),
    detail: "dangerouslySetInnerHTML must not be used",
  });

  checks.push({
    name: "No any types in generated React files",
    passed: !generated.files.some(
      (file) =>
        (file.kind === "react-page" ||
          file.kind === "react-layout" ||
          file.kind === "react-route" ||
          file.kind === "react-component-placeholder") &&
        /\bany\b/.test(file.content),
    ),
    detail: "Generated TSX must avoid any",
  });

  checks.push({
    name: "No unresolved component imports",
    passed: unresolvedImports.filter((entry) => entry.includes("components/")).length === 0,
    detail: "Component imports resolve to generated placeholders",
  });

  checks.push({
    name: "Generated root App Router files exist",
    passed: ["app/layout.tsx", "app/loading.tsx", "app/error.tsx", "app/not-found.tsx"].every(
      (path) => generated.files.some((file) => file.path === path),
    ),
    detail: "layout, loading, error, not-found",
  });

  checks.push({
    name: "Generated error boundary is client component",
    passed: generated.files.some(
      (file) => file.path === "app/error.tsx" && file.content.includes("'use client'"),
    ),
    detail: "app/error.tsx must include use client",
  });

  return {
    passed: checks.every((check) => check.passed),
    checks,
  };
}

export function verifyDeterministicReactPageGeneration(
  input: ProjectGeneratorInput,
): GeneratorVerificationResult {
  const first = generateNextJsProject({ ...input, generatedAt: "1970-01-01T00:00:00.000Z" }).generated;
  const second = generateNextJsProject({ ...input, generatedAt: "1970-01-01T00:00:00.000Z" }).generated;

  const checks: GeneratorVerificationCheck[] = [
    {
      name: "Identical input creates identical output",
      passed:
        stableSerializeGeneratedProjectTreeJson(first) ===
        stableSerializeGeneratedProjectTreeJson(second),
      detail: "Normalized virtual tree comparison",
    },
    ...verifyGeneratedNextJsProject(first).checks,
    ...verifyGeneratedReactPages(first).checks,
  ];

  return {
    passed: checks.every((check) => check.passed),
    checks,
  };
}

export function buildReactPageSampleReport(input: ProjectGeneratorInput): ReactPageSampleReport {
  const first = generateNextJsProject(input);
  const second = generateNextJsProject(input);
  const verification = verifyDeterministicReactPageGeneration(input);
  const unresolvedImports = findUnresolvedImports(first.generated.files);
  const deadLinks = findDeadInternalLinks(
    first.generated,
    first.generated.routes.map((route) => route.routePath),
  );

  return {
    changedFiles: 9,
    generatedTsxFileCount: countTsxFiles(first.generated.files),
    generatedPageCount: countReactPages(first.generated.files),
    generatedRouteCount: first.generated.routes.length,
    generatedPageConfigCount: countPageConfigFiles(first.generated.files),
    generatedLoadingFileCount: countLoadingFiles(first.generated.files),
    generatedErrorFileCount: countErrorFiles(first.generated.files),
    generatedPlaceholderComponentCount: countPlaceholderComponents(first.generated.files),
    unresolvedImportCount: unresolvedImports.length,
    deadInternalLinkCount: deadLinks.length,
    determinismResult:
      stableSerializeGeneratedProjectTreeJson(first.generated) ===
      stableSerializeGeneratedProjectTreeJson(second.generated),
    verificationPassed: verification.passed,
    failedChecks: verification.checks.filter((check) => !check.passed),
  };
}

export function generateSmashburgerReactPagesSample(): {
  generated: GeneratedNextJsProject;
  json: string;
  report: ReactPageSampleReport;
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
    report: buildReactPageSampleReport(input),
  };
}
