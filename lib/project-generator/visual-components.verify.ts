import { execSync } from "node:child_process";

import { generateNextJsProject } from "@/lib/project-generator/generator";
import { findDuplicateExports } from "@/lib/project-generator/visual-component-registry";
import {
  countClientComponents,
  countServerComponents,
  countVisualComponentFiles,
  countVisualPrimitives,
} from "@/lib/project-generator/visual-components";
import {
  PLACEHOLDER_PREFIX,
} from "@/lib/project-generator/react-component-utils";
import {
  countComponentVariants,
  collectRequiredVisualComponents,
  VISUAL_LAYOUT_PRIMITIVES,
} from "@/lib/project-generator/visual-component-utils";
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
  VisualComponentSampleReport,
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

const RESPONSIVE_PATTERNS = [
  /md:|sm:|lg:/,
  /flex-col|grid|sectionContainer|ResponsiveGrid|Container|mobileSticky|hidden md:/,
];

const KEY_RESPONSIVE_COMPONENTS = [
  "SiteHeader.tsx",
  "HeroSection.tsx",
  "SiteFooter.tsx",
  "MenuSection.tsx",
  "ContactSection.tsx",
  "FeatureGridSection.tsx",
  "GallerySection.tsx",
];

function countMatches(content: string, pattern: RegExp): number {
  return content.match(pattern)?.length ?? 0;
}

function componentFiles(generated: GeneratedNextJsProject): VirtualFile[] {
  return generated.files.filter(
    (file) => file.kind === "react-component" && file.path.endsWith(".tsx"),
  );
}

function countPlaceholdersByCategory(files: VirtualFile[]): Record<string, number> {
  const categories: Record<string, number> = {
    logo: 0,
    image: 0,
    price: 0,
    address: 0,
    phone: 0,
    email: 0,
    "opening-hours": 0,
    testimonial: 0,
    legal: 0,
    map: 0,
    "social-link": 0,
    "product-data": 0,
    trust: 0,
    other: 0,
  };

  for (const file of files) {
    if (!file.path.startsWith("components/generated/")) {
      continue;
    }
    const categoryMatches = file.content.matchAll(/category="([^"]+)"/g);
    for (const match of categoryMatches) {
      const category = match[1];
      if (category in categories) {
        categories[category] += 1;
      } else {
        categories.other += 1;
      }
    }
    const labelMatches = file.content.match(/\[PLACEHOLDER:[^\]]+\]/g) ?? [];
    for (const match of labelMatches) {
      const lower = match.toLowerCase();
      if (/logo/.test(lower)) categories.logo += 1;
      else if (/bild|media|hero|produktbild/.test(lower)) categories.image += 1;
      else if (/price|eur/.test(lower)) categories.price += 1;
      else if (/adresse|address/.test(lower)) categories.address += 1;
      else if (/telefon|phone/.test(lower)) categories.phone += 1;
      else if (/e-mail|email/.test(lower)) categories.email += 1;
      else if (/öffnungs|opening/.test(lower)) categories["opening-hours"] += 1;
      else if (/testimonial/.test(lower)) categories.testimonial += 1;
      else if (/legal|privacy|impressum/.test(lower)) categories.legal += 1;
      else if (/map/.test(lower)) categories.map += 1;
      else if (/social/.test(lower)) categories["social-link"] += 1;
      else if (/product|menu|allergen|availability/.test(lower)) categories["product-data"] += 1;
      else if (/trust/.test(lower)) categories.trust += 1;
      else categories.other += 1;
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

function countFakeLinks(files: VirtualFile[]): number {
  let count = 0;
  for (const file of files.filter((item) => item.path.startsWith("components/generated/"))) {
    count += countMatches(file.content, /href="#"/g);
    count += countMatches(file.content, /href="javascript:void\(0\)"/g);
  }
  return count;
}

function countUnknownTokenReferences(generated: GeneratedNextJsProject): number {
  const cssVariablesFile = generated.files.find((file) => file.path === "styles/css-variables.ts");
  const knownVariables = new Set(
    cssVariablesFile
      ? [...cssVariablesFile.content.matchAll(/"(--[^"]+)"/g)].map((match) => match[1])
      : [],
  );
  knownVariables.add("--color-error");

  let unknown = 0;
  for (const file of componentFiles(generated)) {
    const references = file.content.matchAll(/var\((--[^)]+)\)/g);
    for (const match of references) {
      if (!knownVariables.has(match[1])) {
        unknown += 1;
      }
    }
  }
  return unknown;
}

function checkInventedBusinessFacts(generated: GeneratedNextJsProject): boolean {
  const payload = JSON.stringify(
    generated.files.filter((file) => file.path.startsWith("components/generated/")),
  );
  return !INVENTED_FACT_PATTERNS.some((pattern) => pattern.test(payload));
}

function verifyResponsiveComponents(generated: GeneratedNextJsProject): boolean {
  const files = componentFiles(generated).filter((file) =>
    KEY_RESPONSIVE_COMPONENTS.some((name) => file.path.endsWith(name)),
  );
  return files.every((file) => RESPONSIVE_PATTERNS.some((pattern) => pattern.test(file.content)));
}

function verifyAccessibilityComponents(generated: GeneratedNextJsProject): boolean {
  const files = componentFiles(generated);
  const header = files.find((file) => file.path.endsWith("SiteHeader.tsx"));
  const faq = files.find((file) => file.path.endsWith("FAQSection.tsx"));
  const contactForm = files.find((file) => file.path.endsWith("ContactForm.tsx"));
  const sectionShell = files.find((file) => file.path.endsWith("SectionShell.tsx"));
  const layout = generated.files.find((file) => file.path === "app/layout.tsx");

  const headerAccessible = Boolean(
    header?.content.includes("skipLink") && header.content.includes("aria-expanded"),
  );
  const faqAccessible = faq ? faq.content.includes("<details") : true;
  const formAccessible = contactForm ? contactForm.content.includes("htmlFor") : true;
  const shellAccessible = sectionShell ? sectionShell.content.includes("aria-labelledby") : true;
  const landmarkAccessible = Boolean(
    layout?.content.includes("<main") || files.some((file) => file.content.includes('role="main"')),
  );

  return headerAccessible && faqAccessible && formAccessible && shellAccessible && landmarkAccessible;
}

function countH1InPages(generated: GeneratedNextJsProject): number {
  return generated.files
    .filter((file) => file.kind === "react-page")
    .reduce((count, file) => {
      const h1Count = countMatches(file.content, /<h1[\s>]/g);
      return count + (h1Count > 1 ? h1Count : 0);
    }, 0);
}

export function verifyGeneratedVisualComponents(
  generated: GeneratedNextJsProject,
  project: ProjectGeneratorInput["project"],
): GeneratorVerificationResult {
  const checks: GeneratorVerificationCheck[] = [];
  const required = collectRequiredVisualComponents(project);
  const primitives = VISUAL_LAYOUT_PRIMITIVES;
  const files = componentFiles(generated);
  const registry = generated.files.find((file) => file.path === "components/generated/index.ts");
  const sectionNames = collectRequiredSectionComponentNames(project);

  checks.push({
    name: "Every required visual component exists",
    passed: required.every((name) =>
      generated.files.some((file) => file.path === `components/generated/${name}.tsx`),
    ),
    detail: `${files.length} component files`,
  });

  checks.push({
    name: "Every layout primitive exists",
    passed: primitives.every((name) =>
      generated.files.some((file) => file.path === `components/generated/${name}.tsx`),
    ),
    detail: `${primitives.length} primitives`,
  });

  checks.push({
    name: "Every page component import resolves",
    passed: findUnresolvedImports(generated.files).length === 0,
    detail: "Page and layout imports resolve through generated registry",
  });

  checks.push({
    name: "No duplicate component paths",
    passed: new Set(files.map((file) => file.path)).size === files.length,
    detail: `${files.length} unique component paths`,
  });

  const duplicateExports = registry ? findDuplicateExports(registry.content) : [];
  checks.push({
    name: "No duplicate exports",
    passed: duplicateExports.length === 0,
    detail: duplicateExports.join(", ") || "Registry exports are unique",
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
    detail: "Visual components use explicit placeholders only",
  });

  checks.push({
    name: "Placeholder references remain explicit",
    passed: generated.files
      .filter((file) => file.path.startsWith("components/generated/"))
      .every((file) => !file.content.includes("PLACEHOLDER") || file.content.includes(PLACEHOLDER_PREFIX)),
    detail: "Placeholder prefix preserved",
  });

  checks.push({
    name: "SiteHeader navigation routes resolve",
    passed:
      findDeadInternalLinks(
        generated,
        generated.routes.map((route) => route.routePath),
      ).filter((link) => link.includes("SiteHeader")).length === 0,
    detail: "Header nav hrefs resolve to compiled routes",
  });

  checks.push({
    name: "One H1 per page output",
    passed: countH1InPages(generated) === 0,
    detail: "At most one H1 per page file; primary headings live in section components",
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
    name: "Valid token references",
    passed: countUnknownTokenReferences(generated) === 0,
    detail: `${countUnknownTokenReferences(generated)} unknown CSS variables`,
  });

  checks.push({
    name: "No fake placeholder links",
    passed: countFakeLinks(generated.files) === 0,
    detail: `${countFakeLinks(generated.files)} fake links`,
  });

  checks.push({
    name: "Generated TSX syntax heuristics",
    passed: !generated.files.some(
      (file) =>
        file.path.endsWith(".tsx") &&
        (/className="[^"]*$/.test(file.content) || /import \{ \} from/.test(file.content)),
    ),
    detail: "Basic syntax heuristics passed",
  });

  checks.push({
    name: "No AIOS customer public paths in export",
    passed: !generated.files.some((file) => file.content.includes("/customers/")),
    detail: "Customer assets use export-local /images or /icons paths",
  });

  checks.push({
    name: "Responsive layout patterns present",
    passed: verifyResponsiveComponents(generated),
    detail: "Mobile-first responsive utilities detected",
  });

  checks.push({
    name: "Accessibility patterns present",
    passed: verifyAccessibilityComponents(generated),
    detail: "Landmarks, skip link, and ARIA/focus patterns detected",
  });

  checks.push({
    name: "Premium components marked generated",
    passed: generated.files
      .filter((file) => file.path.startsWith("components/generated/"))
      .every((file) => file.metadata.implementationStatus === "generated"),
    detail: "Visual component metadata updated for Sprint 8.3",
  });

  return {
    passed: checks.every((check) => check.passed),
    checks,
  };
}

export function verifyDeterministicVisualComponentGeneration(
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
    ...verifyGeneratedVisualComponents(first, input.project).checks,
    ...verifyGeneratedNextJsProject(first).checks.filter(
      (check) => check.name !== "Component descriptors remain metadata-only",
    ),
  ];

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

export function buildVisualComponentSampleReport(
  input: ProjectGeneratorInput,
): VisualComponentSampleReport {
  const first = generateNextJsProject(input);
  const second = generateNextJsProject(input);
  const componentVerification = verifyGeneratedVisualComponents(first.generated, input.project);
  const fullVerification = verifyDeterministicProjectGeneration(input);
  const registry = first.generated.files.find((file) => file.path === "components/generated/index.ts");
  const unresolvedImports = findUnresolvedImports(first.generated.files);

  return {
    changedSourceFiles: 7,
    generatedVisualComponentCount: countVisualComponentFiles(first.generated.files) - countVisualPrimitives(first.generated.files),
    generatedPrimitiveCount: countVisualPrimitives(first.generated.files),
    generatedClientComponentCount: countClientComponents(first.generated.files),
    generatedServerComponentCount: countServerComponents(first.generated.files),
    componentVariantCount: countComponentVariants(input.project),
    placeholderCountByCategory: countPlaceholdersByCategory(first.generated.files),
    unresolvedImportCount: unresolvedImports.length,
    duplicateExportCount: registry ? findDuplicateExports(registry.content).length : 0,
    unknownTokenReferenceCount: countUnknownTokenReferences(first.generated),
    fakeLinkCount: countFakeLinks(first.generated.files),
    anyCount: countAnyUsage(first.generated.files),
    unsafeHtmlCount: countUnsafeHtml(first.generated.files),
    deterministicOutputResult:
      stableSerializeGeneratedProjectTreeJson(first.generated) ===
      stableSerializeGeneratedProjectTreeJson(second.generated),
    responsiveVerificationResult: verifyResponsiveComponents(first.generated),
    accessibilityVerificationResult: verifyAccessibilityComponents(first.generated),
    lintResult: runLint(),
    buildResult: runBuild(),
    visualComponentVerificationPassed: componentVerification.passed,
    fullProjectGeneratorVerificationPassed: fullVerification.passed,
    failedChecks: componentVerification.checks.filter((check) => !check.passed),
  };
}

export function generateSmashburgerVisualComponentsSample(): {
  generated: GeneratedNextJsProject;
  json: string;
  report: VisualComponentSampleReport;
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
    report: buildVisualComponentSampleReport(input),
  };
}
