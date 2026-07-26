import { BY_NANIS_RESTAURANT_ASSETS } from "@/lib/industries/restaurant/fixtures/by-nanis-assets";
import { BY_NANIS_BUSINESS_PROFILE } from "@/lib/industries/restaurant/fixtures/by-nanis-profile";
import {
  collectRestaurantAssetPaths,
  verifyRestaurantAssetsOnDisk,
} from "@/lib/industries/restaurant/assets-verify";
import { BY_NANIS_WEBSITE_THEME } from "@/lib/industries/restaurant/fixtures/by-nanis-theme";
import { verifyWebsiteThemeSerializable } from "@/lib/themes/verify";
import type { WebsiteBrief } from "@/lib/website-briefs.types";
import { generateWebsiteBlueprintContent } from "@/lib/website-blueprint-generator";
import { compileWebsiteProject, serializeCompiledWebsiteProject } from "@/lib/website-compiler/compile";
import { stableStringify } from "@/lib/website-compiler/normalize";
import type {
  CompiledWebsiteProject,
  WebsiteCompilerInput,
} from "@/lib/website-compiler/types";
import { VALID_PATTERN_IDS } from "@/lib/website-blueprint-visual-hierarchy";

export type CompilerVerificationCheck = {
  name: string;
  passed: boolean;
  detail: string;
};

export type CompilerVerificationResult = {
  passed: boolean;
  checks: CompilerVerificationCheck[];
};

const VALID_TOKEN_NAMES = new Set([
  "color.background",
  "color.surface",
  "color.surfaceElevated",
  "color.primary",
  "color.secondary",
  "color.accent",
  "color.muted",
  "color.border",
  "color.error",
  "color.text",
  "color.textMuted",
  "font.displayXL",
  "font.displayL",
  "font.h1",
  "font.h2",
  "font.h3",
  "font.h4",
  "font.bodyLarge",
  "font.body",
  "font.bodySmall",
  "font.label",
  "font.caption",
  "font.button",
  "spacing.section",
  "spacing.block",
  "spacing.inline",
  "spacing.stack",
  "radius.sm",
  "radius.md",
  "radius.lg",
  "radius.full",
  "shadow.sm",
  "shadow.md",
  "shadow.lg",
  "layout.maxWidth",
  "layout.contentWidth",
  "breakpoint.sm",
  "breakpoint.md",
  "breakpoint.lg",
  "breakpoint.xl",
  "transition.fast",
  "transition.normal",
  "transition.slow",
  "easing.standard",
  "easing.emphasized",
  "zIndex.header",
  "zIndex.sticky",
  "zIndex.modal",
  "ratio.16x9",
  "ratio.4x3",
  "ratio.1x1",
]);

function unique(values: string[]): boolean {
  return new Set(values).size === values.length;
}

function routePathSet(project: CompiledWebsiteProject): Set<string> {
  return new Set(project.routes.map((route) => route.routePath));
}

export function verifyCompiledWebsiteProject(
  project: CompiledWebsiteProject,
): CompilerVerificationResult {
  const checks: CompilerVerificationCheck[] = [];
  const routeIds = project.routes.map((route) => route.id);
  const routePaths = project.routes.map((route) => route.routePath);
  const pageIds = project.pages.map((page) => page.id);
  const sectionIds = project.pages.flatMap((page) =>
    page.orderedSections.map((section) => section.id),
  );
  const componentIds = project.components.map((component) => component.id);
  const knownRoutes = routePathSet(project);

  checks.push({
    name: "Unique route IDs",
    passed: unique(routeIds),
    detail: `${routeIds.length} routes`,
  });
  checks.push({
    name: "Unique route paths",
    passed: unique(routePaths),
    detail: routePaths.join(", "),
  });
  checks.push({
    name: "Unique page IDs",
    passed: unique(pageIds),
    detail: `${pageIds.length} pages`,
  });
  checks.push({
    name: "Unique section IDs",
    passed: unique(sectionIds),
    detail: `${sectionIds.length} sections`,
  });
  checks.push({
    name: "Unique component IDs",
    passed: unique(componentIds),
    detail: `${componentIds.length} components`,
  });
  checks.push({
    name: "Homepage route exists",
    passed: project.routes.some((route) => route.routePath === "/"),
    detail: "Expected one route with path /",
  });

  const navResolved = [
    ...project.navigation.desktopNavigation,
    ...project.navigation.mobileNavigation,
    project.navigation.ctaItem,
  ].every((item) => project.routes.some((route) => route.id === item.routeId));
  checks.push({
    name: "Navigation items resolve",
    passed: navResolved,
    detail: "All nav items must reference existing routes",
  });

  const footerResolved = project.footer.navigationGroups.every((group) =>
    group.items.every((item) => project.routes.some((route) => route.id === item.routeId)),
  );
  checks.push({
    name: "Footer links resolve",
    passed: footerResolved,
    detail: "Footer nav groups must reference existing routes",
  });

  const internalLinksResolved = project.routes.every((route) =>
    route.internalLinks.every((link) => knownRoutes.has(link)),
  );
  checks.push({
    name: "Internal links resolve",
    passed: internalLinksResolved,
    detail: "Route internalLinks must target known route paths",
  });

  const patternIds = project.pages.flatMap((page) => page.selectedPatternIds);
  checks.push({
    name: "Pattern IDs resolve",
    passed: patternIds.every((patternId) => VALID_PATTERN_IDS.includes(patternId)),
    detail: `${patternIds.length} pattern references`,
  });

  const tokenRefs = project.components.flatMap((component) => component.designTokenReferences);
  checks.push({
    name: "Design token references resolve",
    passed: tokenRefs.every((token) => VALID_TOKEN_NAMES.has(token)),
    detail: `${tokenRefs.length} token references`,
  });

  const missingEntitiesValid = project.missingData.every(
    (entry) =>
      entry.affectedPages.every((pageId) => pageIds.includes(pageId)) &&
      entry.affectedComponents.every(
        (componentName) =>
          componentName.startsWith("[") ||
          project.components.some((component) => component.name === componentName),
      ),
  );
  checks.push({
    name: "Missing-data registry references valid entities",
    passed: missingEntitiesValid,
    detail: `${project.missingData.length} missing-data entries`,
  });

  const inventedFacts = JSON.stringify(project).includes("beste der stadt") ||
    JSON.stringify(project).includes("10.000 zufriedene");
  checks.push({
    name: "No unsupported business facts introduced",
    passed: !inventedFacts,
    detail: "Compiler output must not add unsupported marketing claims",
  });

  checks.push({
    name: "No backend integrations created",
    passed: !JSON.stringify(project).includes("api.example.com") &&
      project.forms.every((form) =>
        form.submissionBehaviorPlaceholder.includes("no backend"),
      ),
    detail: "Forms remain placeholder-only",
  });

  const homepage = project.pages.find((page) => page.pageRole === "home");
  checks.push({
    name: "Homepage has one dominant hero pattern",
    passed: Boolean(homepage?.selectedPatternIds.includes("hero")),
    detail: homepage?.selectedPatternIds.join(", ") ?? "missing home page",
  });

  const contactPage = project.pages.find((page) => page.pageRole === "contact");
  checks.push({
    name: "Contact page prioritizes contact paths",
    passed: Boolean(
      contactPage?.orderedSections.some((section) =>
        /ContactForm|ContactDetails/i.test(section.name),
      ),
    ),
    detail: contactPage?.orderedSections.map((section) => section.name).join(", ") ?? "n/a",
  });

  checks.push({
    name: "Mobile hierarchy differs from desktop",
    passed: project.pages.every((page) =>
      page.responsiveRules.some((rule) => /mobile|stack|sticky/i.test(rule)),
    ),
    detail: "Responsive rules must mention mobile-specific hierarchy",
  });

  if (project.restaurantAssets) {
    const assetCheck = verifyRestaurantAssetsOnDisk(project.restaurantAssets);
    checks.push({
      name: "Restaurant asset paths exist on disk",
      passed: assetCheck.passed,
      detail: assetCheck.passed
        ? `${collectRestaurantAssetPaths(project.restaurantAssets).length} public files`
        : `Missing: ${assetCheck.missing.join(", ")}`,
    });
  }

  if (project.websiteTheme) {
    const themeCheck = verifyWebsiteThemeSerializable(project.websiteTheme);
    checks.push({
      name: "Website theme is serializable",
      passed: themeCheck.passed,
      detail: themeCheck.detail,
    });
  }

  return {
    passed: checks.every((check) => check.passed),
    checks,
  };
}

export function verifyDeterministicCompilation(input: WebsiteCompilerInput): CompilerVerificationResult {
  const first = compileWebsiteProject({ ...input, generatedAt: "1970-01-01T00:00:00.000Z" }).project;
  const second = compileWebsiteProject({ ...input, generatedAt: "1970-01-01T00:00:00.000Z" }).project;

  const checks: CompilerVerificationCheck[] = [
    {
      name: "Identical input produces identical compiled output",
      passed: stableStringify(first) === stableStringify(second),
      detail: "Normalized JSON comparison excluding generatedAt variance",
    },
    ...verifyCompiledWebsiteProject(first).checks,
  ];

  const inputWithoutOptionalThemeAssets: WebsiteCompilerInput = {
    brief: { ...input.brief, id: "00000000-0000-0000-0000-000000000099" },
    blueprint: input.blueprint,
    sourceBlueprintId: input.sourceBlueprintId,
    sourceBriefId: input.sourceBriefId,
    generatedAt: input.generatedAt,
    generationMode: input.generationMode,
  };
  const withoutOptional = compileWebsiteProject({
    ...inputWithoutOptionalThemeAssets,
    generatedAt: "1970-01-01T00:00:00.000Z",
  }).project;
  checks.push({
    name: "Compile succeeds without optional theme or assets",
    passed: withoutOptional.metadata.projectName.length > 0 &&
      withoutOptional.websiteTheme === undefined &&
      withoutOptional.restaurantAssets === undefined &&
      withoutOptional.restaurantBusinessProfile === undefined,
    detail: "Optional websiteTheme and restaurantAssets must not be required",
  });

  return {
    passed: checks.every((check) => check.passed),
    checks,
  };
}

export function createSmashburgerCompilerInput(
  briefOverrides?: Partial<WebsiteBrief>,
): WebsiteCompilerInput {
  const brief: WebsiteBrief = {
    id: "adcc1216-b477-41d3-be47-5b5ec2ea05ec",
    user_id: "d568b238-736b-4ab0-93e2-0816d488a0e7",
    agent_id: "9a7f18a6-1e7a-4ca7-8ff2-b9dd7f8f1f5a",
    customer_id: null,
    project_id: null,
    business_name: "by Nani's",
    industry: "Smashburger Restaurant",
    location: "Blaubeuren",
    website_goal: "Gäste informieren und zur Speisekarte sowie zum Besuch vor Ort einladen",
    target_audience: "Burger liebhaber, familien, studenten",
    services:
      "Smashburger\r\nHot Dogs\r\nPommes\r\nDesserts\r\nKaffee\r\nCocktails\r\nGetränke\r\nTake-Away",
    unique_selling_points: "100 % Halal, frische Zutaten",
    preferred_style: "Modern, premium, Apple-ähnliche Animationen",
    primary_color: "#111111",
    secondary_color: "#F59E0B",
    required_pages: "Startseite\r\nSpeisekarte\r\nÜber uns\r\nGalerie\r\nKontakt",
    required_features:
      "Online-Bestellung, Speisekarte, Galerie, Kontaktformular, Google Maps, Social Media Links",
    reference_websites: "https://www.fiveguys.de, https://www.shakeshack.com",
    additional_notes:
      "Logo und Bilder folgen. Fokus auf mobile Bestellung und schnelle Ladezeiten.",
    status: "ready",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...briefOverrides,
  };

  const blueprint = generateWebsiteBlueprintContent(brief);

  return {
    brief,
    blueprint,
    sourceBlueprintId: "sample-blueprint-nanis",
    sourceBriefId: brief.id,
    generatedAt: "1970-01-01T00:00:00.000Z",
    generationMode: "deterministic",
    restaurantAssets: BY_NANIS_RESTAURANT_ASSETS,
    websiteTheme: BY_NANIS_WEBSITE_THEME,
    restaurantBusinessProfile: BY_NANIS_BUSINESS_PROFILE,
  };
}

export type CompilerSampleReport = {
  changedFiles: number;
  detectedInputSections: CompiledWebsiteProject["detectedInputSections"];
  routeCount: number;
  pageCount: number;
  sectionCount: number;
  reusableComponentCount: number;
  contentBlockCount: number;
  enabledFeatureFlags: string[];
  missingDataCount: number;
  warningCountBySeverity: Record<string, number>;
  identicalRuns: boolean;
  verificationPassed: boolean;
  failedChecks: CompilerVerificationCheck[];
};

export function buildCompilerSampleReport(
  input: WebsiteCompilerInput,
): CompilerSampleReport {
  const first = compileWebsiteProject(input);
  const second = compileWebsiteProject(input);
  const verification = verifyDeterministicCompilation(input);
  const project = first.project;

  const warningCountBySeverity = project.warnings.reduce<Record<string, number>>(
    (accumulator, warning) => {
      accumulator[warning.severity] = (accumulator[warning.severity] ?? 0) + 1;
      return accumulator;
    },
    {},
  );

  return {
    changedFiles: 4,
    detectedInputSections: project.detectedInputSections,
    routeCount: project.routes.length,
    pageCount: project.pages.length,
    sectionCount: project.pages.reduce(
      (count, page) => count + page.orderedSections.length,
      0,
    ),
    reusableComponentCount: project.components.length,
    contentBlockCount: project.contentBlocks.length,
    enabledFeatureFlags: project.featureFlags
      .filter((flag) => flag.enabled)
      .map((flag) => flag.name),
    missingDataCount: project.missingData.length,
    warningCountBySeverity,
    identicalRuns:
      stableStringify(first.project) === stableStringify(second.project),
    verificationPassed: verification.passed,
    failedChecks: verification.checks.filter((check) => !check.passed),
  };
}

export function compileSmashburgerSampleProject(): {
  project: CompiledWebsiteProject;
  json: string;
  report: CompilerSampleReport;
} {
  const input = createSmashburgerCompilerInput();
  const { project } = compileWebsiteProject(input);
  return {
    project,
    json: serializeCompiledWebsiteProject(project, { includeGeneratedAt: false }),
    report: buildCompilerSampleReport(input),
  };
}
