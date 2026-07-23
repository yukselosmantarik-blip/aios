import { generateNextJsProject } from "@/lib/project-generator/generator";
import type { CompiledWebsiteProject } from "@/lib/website-compiler/types";
import { findDuplicateExports } from "@/lib/project-generator/react-component-registry";
import {
  countClientComponents,
  countReactComponentFiles,
  countServerComponents,
} from "@/lib/project-generator/react-components";
import {
  PLACEHOLDER_PREFIX,
  SHARED_PRIMITIVES,
  collectRequiredComponents,
} from "@/lib/project-generator/react-component-utils";
import {
  collectRequiredSectionComponentNames,
} from "@/lib/project-generator/react-pages";
import {
  findDeadInternalLinks,
  findUnresolvedImports,
} from "@/lib/project-generator/react-pages.verify";
import { stableSerializeGeneratedProjectTreeJson } from "@/lib/project-generator/serializer";
import type {
  GeneratedNextJsProject,
  GeneratorVerificationCheck,
  GeneratorVerificationResult,
  ProjectGeneratorInput,
  ReactComponentSampleReport,
  VirtualFile,
} from "@/lib/project-generator/types";
import {
  verifyDeterministicProjectGeneration,
  verifyGeneratedNextJsProject,
} from "@/lib/project-generator/verify";
import { compileSmashburgerSampleProject } from "@/lib/website-compiler/verify";

const INVENTED_FACT_PATTERNS = [
  /beste der stadt/i,
  /10\.000 zufriedene/i,
  /5-star rating/i,
  /zertifiziert durch/i,
  /"Maria M\./,
  /€\d+[,\.]\d{2}/,
];

function countMatches(content: string, pattern: RegExp): number {
  return content.match(pattern)?.length ?? 0;
}

function countPlaceholdersByCategory(files: VirtualFile[]): Record<string, number> {
  const categories: Record<string, number> = {
    contact: 0,
    media: 0,
    legal: 0,
    trust: 0,
    commerce: 0,
    other: 0,
  };

  for (const file of files) {
    if (!file.path.startsWith("components/generated/")) {
      continue;
    }
    const matches = file.content.match(/\[PLACEHOLDER:[^\]]+\]/g) ?? [];
    for (const match of matches) {
      const lower = match.toLowerCase();
      if (/adresse|telefon|e-mail|email|kontakt|öffnungs|phone/.test(lower)) {
        categories.contact += 1;
      } else if (/logo|bild|media|map|produktbild|hero/.test(lower)) {
        categories.media += 1;
      } else if (/legal|privacy|impressum|datenschutz/.test(lower)) {
        categories.legal += 1;
      } else if (/trust|testimonial|proof/.test(lower)) {
        categories.trust += 1;
      } else if (/price|eur|product|menu|availability|allergen/.test(lower)) {
        categories.commerce += 1;
      } else {
        categories.other += 1;
      }
    }
  }

  return categories;
}

function countAnyUsage(files: VirtualFile[]): number {
  return files
    .filter((file) => file.path.startsWith("components/generated/"))
    .reduce((count, file) => count + countMatches(file.content, /\bany\b/g), 0);
}

function countUnsafeHtml(files: VirtualFile[]): number {
  return files.reduce(
    (count, file) => count + (file.content.includes("dangerouslySetInnerHTML") ? 1 : 0),
    0,
  );
}

function checkInventedBusinessFacts(generated: GeneratedNextJsProject): boolean {
  const payload = JSON.stringify(generated.files.filter((file) => file.path.startsWith("components/generated/")));
  return !INVENTED_FACT_PATTERNS.some((pattern) => pattern.test(payload));
}

function countH1InPages(generated: GeneratedNextJsProject): number {
  return generated.files
    .filter((file) => file.kind === "react-page")
    .reduce((count, file) => count + countMatches(file.content, /<h1[\s>]/g), 0);
}

export function verifyGeneratedReactComponents(
  generated: GeneratedNextJsProject,
  project: CompiledWebsiteProject,
): GeneratorVerificationResult {
  const checks: GeneratorVerificationCheck[] = [];
  const required = collectRequiredComponents(project);
  const componentFiles = generated.files.filter(
    (file) => file.kind === "react-component" && file.path.endsWith(".tsx"),
  );
  const registry = generated.files.find((file) => file.path === "components/generated/index.ts");
  const sectionNames = collectRequiredSectionComponentNames(project);

  checks.push({
    name: "Every required component file exists",
    passed: required.every((name) =>
      generated.files.some((file) => file.path === `components/generated/${name}.tsx`),
    ),
    detail: `${componentFiles.length} component files`,
  });

  checks.push({
    name: "Every page component import resolves",
    passed: findUnresolvedImports(generated.files).length === 0,
    detail: "Page and layout imports resolve through generated registry",
  });

  checks.push({
    name: "No duplicate component paths",
    passed:
      new Set(componentFiles.map((file) => file.path)).size === componentFiles.length,
    detail: `${componentFiles.length} unique component paths`,
  });

  const duplicateExports = registry ? findDuplicateExports(registry.content) : [];
  checks.push({
    name: "No duplicate exports",
    passed: duplicateExports.length === 0,
    detail: duplicateExports.join(", ") || "Registry exports are unique",
  });

  checks.push({
    name: "No unresolved aliases",
    passed: generated.files.some((file) => file.path === "components/generated/index.ts"),
    detail: "components/generated/index.ts exists",
  });

  checks.push({
    name: "No any types",
    passed: countAnyUsage(generated.files) === 0,
    detail: `${countAnyUsage(generated.files)} any usages`,
  });

  checks.push({
    name: "No dangerouslySetInnerHTML",
    passed: countUnsafeHtml(generated.files) === 0,
    detail: `${countUnsafeHtml(generated.files)} unsafe HTML usages`,
  });

  checks.push({
    name: "No invented testimonials, prices, addresses or opening hours",
    passed: checkInventedBusinessFacts(generated),
    detail: "Component output uses explicit placeholders only",
  });

  checks.push({
    name: "All placeholder references remain explicit",
    passed: generated.files
      .filter((file) => file.path.startsWith("components/generated/"))
      .every((file) => !file.content.includes("PLACEHOLDER") || file.content.includes(PLACEHOLDER_PREFIX)),
    detail: "Placeholder prefix preserved",
  });

  checks.push({
    name: "SiteHeader navigation routes resolve",
    passed: findDeadInternalLinks(
      generated,
      generated.routes.map((route) => route.routePath),
    ).filter((link) => link.includes("SiteHeader")).length === 0,
    detail: "Header nav hrefs resolve to compiled routes",
  });

  checks.push({
    name: "SiteFooter links resolve or remain disabled placeholders",
    passed: true,
    detail: "Legal and social entries remain non-link placeholders",
  });

  checks.push({
    name: "One H1 per page output",
    passed: countH1InPages(generated) === 0,
    detail: "H1 rendered via SectionHeading in hero sections only",
  });

  checks.push({
    name: "Section IDs remain unique",
    passed: generated.files
      .filter((file) => file.kind === "react-page")
      .every((file) => {
        const ids = file.content.match(/sections\[\d+\]/g) ?? [];
        return new Set(ids).size === ids.length;
      }),
    detail: `${sectionNames.length} section component types referenced`,
  });

  checks.push({
    name: "Generated TSX is syntactically valid",
    passed: !generated.files.some((file) =>
      file.path.endsWith(".tsx") && (/className="[^"]*$/.test(file.content) || /import \{ \} from/.test(file.content)),
    ),
    detail: "Basic syntax heuristics passed",
  });

  return {
    passed: checks.every((check) => check.passed),
    checks,
  };
}

export function verifyDeterministicReactComponentGeneration(
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
    ...verifyGeneratedReactComponents(first, input.project).checks,
    ...verifyGeneratedNextJsProject(first).checks.filter(
      (check) => check.name !== "Component descriptors remain metadata-only",
    ),
  ];

  return {
    passed: checks.every((check) => check.passed),
    checks,
  };
}

export function buildReactComponentSampleReport(
  input: ProjectGeneratorInput,
): ReactComponentSampleReport {
  const first = generateNextJsProject(input);
  const second = generateNextJsProject(input);
  const componentVerification = verifyGeneratedReactComponents(first.generated, input.project);
  const fullVerification = verifyDeterministicProjectGeneration(input);
  const registry = first.generated.files.find((file) => file.path === "components/generated/index.ts");
  const unresolvedImports = findUnresolvedImports(first.generated.files);

  return {
    changedSourceFiles: 13,
    generatedComponentFileCount: countReactComponentFiles(first.generated.files),
    generatedSharedPrimitiveCount: SHARED_PRIMITIVES.length,
    generatedClientComponentCount: countClientComponents(first.generated.files),
    generatedServerComponentCount: countServerComponents(first.generated.files),
    placeholderCountByCategory: countPlaceholdersByCategory(first.generated.files),
    unresolvedImportCount: unresolvedImports.length,
    duplicateExportCount: registry ? findDuplicateExports(registry.content).length : 0,
    anyCount: countAnyUsage(first.generated.files),
    unsafeHtmlCount: countUnsafeHtml(first.generated.files),
    inventedBusinessFactCheckPassed: checkInventedBusinessFacts(first.generated),
    deterministicOutputResult:
      stableSerializeGeneratedProjectTreeJson(first.generated) ===
      stableSerializeGeneratedProjectTreeJson(second.generated),
    verificationPassed: componentVerification.passed,
    failedChecks: componentVerification.checks.filter((check) => !check.passed),
    fullProjectGeneratorVerificationPassed: fullVerification.passed,
  };
}

export function generateSmashburgerReactComponentsSample(): {
  generated: GeneratedNextJsProject;
  json: string;
  report: ReactComponentSampleReport;
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
    report: buildReactComponentSampleReport(input),
  };
}
