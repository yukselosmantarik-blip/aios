import type {
  CompiledPage,
  CompiledSection,
  CompiledWebsiteProject,
  FeatureFlag,
  PageSeoModel,
} from "@/lib/website-compiler/types";
import { joinProjectPath, routePathToAppSegment } from "@/lib/project-generator/tree";

export const SECTION_COMPONENT_NAMES = [
  "HeroSection",
  "TrustSection",
  "FeatureGridSection",
  "MenuSection",
  "ProductGridSection",
  "GallerySection",
  "TestimonialSection",
  "FAQSection",
  "ContactSection",
  "LocationSection",
  "CTASection",
  "ContentSection",
  "GenericSection",
] as const;

export type SectionComponentName = (typeof SECTION_COMPONENT_NAMES)[number];

export type PageSectionConfig = {
  id: string;
  title: string;
  name: string;
  eyebrow: string | null;
  description: string;
  type: string;
  order: number;
  priority: number;
  hierarchyLevel: string;
  visualWeight: string;
  purpose: string;
  componentName: SectionComponentName;
  isPlaceholder: boolean;
  missingData: string[];
  contentBlocks: string[];
  primaryCTA: string | null;
  secondaryCTA: string | null;
  media: string[];
  ctaReferences: string[];
  mediaReferences: string[];
  headingLevel: 1 | 2 | 3;
  sourcePatternIds: string[];
  className?: string;
};

export type GeneratedPageConfig = {
  pageId: string;
  pageName: string;
  pageRole: string;
  title: string;
  description: string;
  route: string;
  h1Direction: string;
  primaryCta: string;
  secondaryCta: string;
  selectedPatternIds: string[];
  sections: PageSectionConfig[];
  ctas: {
    primary: string;
    secondary: string;
  };
  mediaPlaceholders: string[];
  seo: PageSeoModel;
  missingDataReferences: string[];
  internalLinks: string[];
  implementationWarnings: string[];
};

const SKIP_PAGE_SECTION_TYPES = new Set(["navbar", "footer"]);

export function pageConfigFilePath(pageId: string): string {
  const normalized = pageId.replace(/^page:/, "page-").replace(/:/g, "-");
  return joinProjectPath("content", "pages", `${normalized}.ts`);
}

export function pageConfigExportName(pageId: string): string {
  const normalized = pageId.replace(/^page:/, "page_").replace(/[^a-zA-Z0-9_]/g, "_");
  return `${normalized}Config`;
}

export function escapeTsString(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "");
}

export function escapeJsonString(value: string): string {
  return JSON.stringify(value);
}

export function mapSectionTypeToComponent(
  sectionType: string,
  sectionName: string,
): SectionComponentName {
  const normalizedName = sectionName.toLowerCase();

  if (sectionType === "hero" || /hero/i.test(sectionName)) {
    return "HeroSection";
  }
  if (sectionType === "feature-grid") {
    return "FeatureGridSection";
  }
  if (sectionType === "usp-block" || sectionType === "statistics") {
    return "TrustSection";
  }
  if (sectionType === "menu-grid" || sectionType === "pricing" || /menu|speise/i.test(normalizedName)) {
    return sectionType === "pricing" ? "ProductGridSection" : "MenuSection";
  }
  if (sectionType === "gallery" || /gallery|galerie/i.test(normalizedName)) {
    return "GallerySection";
  }
  if (sectionType === "testimonials" || /testimonial|review/i.test(normalizedName)) {
    return "TestimonialSection";
  }
  if (sectionType === "faq" || /faq/i.test(normalizedName)) {
    return "FAQSection";
  }
  if (
    sectionType === "location" ||
    /map|location|standort|kontakt/i.test(normalizedName) ||
    /ContactForm|MapBlock/i.test(sectionName)
  ) {
    return /contact|form|kontakt/i.test(normalizedName) ? "ContactSection" : "LocationSection";
  }
  if (
    sectionType === "cta-banner" ||
    sectionType === "reservation-block" ||
    /cta|order|bestell/i.test(normalizedName)
  ) {
    return "CTASection";
  }
  if (/rich-text|content|story|intro|about|über/i.test(normalizedName)) {
    return "ContentSection";
  }

  return "GenericSection";
}

export function shouldIncludeSectionInPage(section: CompiledSection): boolean {
  return !SKIP_PAGE_SECTION_TYPES.has(section.type);
}

export function buildPageSectionConfig(
  section: CompiledSection,
  pageRole: string,
  isFirstVisibleSection: boolean,
): PageSectionConfig {
  const isPlaceholder =
    section.missingData.length > 0 ||
    section.mediaReferences.some((reference) => reference.includes("[PLACEHOLDER"));

  let headingLevel: 1 | 2 | 3 = 2;
  if (pageRole === "home" && isFirstVisibleSection && section.type === "hero") {
    headingLevel = 1;
  } else if (section.hierarchyLevel === "supporting" || section.hierarchyLevel === "utility") {
    headingLevel = 3;
  }

  return {
    id: section.id,
    title: section.name,
    name: section.name,
    eyebrow: section.hierarchyLevel === "primary" ? section.type : null,
    description: section.purpose,
    type: section.type,
    order: section.order,
    priority: section.priority,
    hierarchyLevel: section.hierarchyLevel,
    visualWeight: section.visualWeight,
    purpose: section.purpose,
    componentName: mapSectionTypeToComponent(section.type, section.name),
    isPlaceholder,
    missingData: section.missingData,
    contentBlocks: section.contentBlocks,
    primaryCTA: section.ctaReferences[0] ?? null,
    secondaryCTA: section.ctaReferences[1] ?? null,
    media: section.mediaReferences,
    ctaReferences: section.ctaReferences,
    mediaReferences: section.mediaReferences,
    headingLevel,
    sourcePatternIds: section.sourcePatternIds,
  };
}

export function buildPageConfig(page: CompiledPage, project: CompiledWebsiteProject): GeneratedPageConfig {
  const route = project.routes.find((entry) => entry.id === page.routeId);
  const visibleSections = page.orderedSections.filter(shouldIncludeSectionInPage);
  let firstVisible = true;

  const sections = visibleSections.map((section) => {
    const config = buildPageSectionConfig(section, page.pageRole, firstVisible);
    firstVisible = false;
    return config;
  });

  const missingDataReferences = project.missingData
    .filter((entry) => entry.affectedPages.includes(page.id))
    .map((entry) => entry.field);

  return {
    pageId: page.id,
    pageName: page.pageName,
    pageRole: page.pageRole,
    title: page.seo.title,
    description: page.seo.metaDescription,
    route: route?.routePath ?? "/",
    h1Direction: page.seo.h1Direction,
    primaryCta: page.primaryCta,
    secondaryCta: page.secondaryCta,
    selectedPatternIds: page.selectedPatternIds,
    sections,
    ctas: {
      primary: page.primaryCta,
      secondary: page.secondaryCta,
    },
    mediaPlaceholders: page.mediaRequirements,
    seo: page.seo,
    missingDataReferences,
    internalLinks: page.seo.internalLinks.filter((link) =>
      project.routes.some((entry) => entry.routePath === link),
    ),
    implementationWarnings: page.implementationWarnings,
  };
}

export function buildMetadataObjectLiteral(seo: PageSeoModel, routePath: string): string {
  const lines = [
    "export const metadata: Metadata = {",
    `  title: ${escapeJsonString(seo.title)},`,
    `  description: ${escapeJsonString(seo.metaDescription)},`,
    `  robots: ${escapeJsonString(seo.robots)},`,
    "  openGraph: {",
    `    title: ${escapeJsonString(seo.openGraph.title)},`,
    `    description: ${escapeJsonString(seo.openGraph.description)},`,
    `    type: ${escapeJsonString(seo.openGraph.type)},`,
    "  },",
    "  twitter: {",
    `    card: ${escapeJsonString(seo.twitter.card)},`,
    `    title: ${escapeJsonString(seo.twitter.title)},`,
    `    description: ${escapeJsonString(seo.twitter.description)},`,
    "  },",
    "  alternates: {",
    `    canonical: ${escapeJsonString(routePath === "/" ? "/" : routePath)},`,
    "  },",
    "};",
  ];

  if (seo.missingSeoInputs.length > 0) {
    lines.splice(1, 0, `  // missing SEO inputs: ${seo.missingSeoInputs.join(", ")}`);
  }

  return lines.join("\n");
}

export function isFeatureEnabled(
  featureFlags: FeatureFlag[],
  name: FeatureFlag["name"],
): boolean {
  return featureFlags.some((flag) => flag.name === name && flag.enabled);
}

export function shouldGenerateRouteLoading(page: CompiledPage, project: CompiledWebsiteProject): boolean {
  if (page.pageRole === "menu" && isFeatureEnabled(project.featureFlags, "onlineOrdering")) {
    return true;
  }
  if (page.pageRole === "contact" && isFeatureEnabled(project.featureFlags, "contactForm")) {
    return true;
  }
  if (page.pageRole === "gallery" && isFeatureEnabled(project.featureFlags, "gallery")) {
    return true;
  }
  return page.orderedSections.length >= 8;
}

export function shouldGenerateRouteError(page: CompiledPage, project: CompiledWebsiteProject): boolean {
  if (page.pageRole === "contact" && isFeatureEnabled(project.featureFlags, "contactForm")) {
    return true;
  }
  if (page.pageRole === "menu" && isFeatureEnabled(project.featureFlags, "onlineOrdering")) {
    return true;
  }
  return false;
}

export function routeSegmentDirectory(routePath: string): string {
  const segment = routePathToAppSegment(routePath);
  return segment ? joinProjectPath("app", segment) : "app";
}

export function pageComponentName(pageRole: string, pageName: string): string {
  if (pageRole === "home") {
    return "HomePage";
  }

  const normalized = pageName
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");

  return `${normalized || "Page"}Page`;
}

export function collectSectionComponents(config: GeneratedPageConfig): SectionComponentName[] {
  const names = new Set<SectionComponentName>();
  for (const section of config.sections) {
    names.add(section.componentName);
  }
  return [...names].sort();
}

export function primaryLanguageCopy(project: CompiledWebsiteProject): {
  skipLink: string;
  loading: string;
  errorTitle: string;
  errorMessage: string;
  errorRetry: string;
  notFoundTitle: string;
  notFoundMessage: string;
  notFoundHome: string;
} {
  const language = project.metadata.language.toLowerCase();
  if (language.startsWith("de")) {
    return {
      skipLink: "Zum Inhalt springen",
      loading: "Seite wird geladen",
      errorTitle: "Etwas ist schiefgelaufen",
      errorMessage: "Die Seite konnte nicht geladen werden. Bitte versuchen Sie es erneut.",
      errorRetry: "Erneut versuchen",
      notFoundTitle: "Seite nicht gefunden",
      notFoundMessage: "Die angeforderte Seite existiert nicht oder wurde verschoben.",
      notFoundHome: "Zur Startseite",
    };
  }

  return {
    skipLink: "Skip to content",
    loading: "Loading page",
    errorTitle: "Something went wrong",
    errorMessage: "This page could not be loaded. Please try again.",
    errorRetry: "Try again",
    notFoundTitle: "Page not found",
    notFoundMessage: "The requested page does not exist or has moved.",
    notFoundHome: "Back to homepage",
  };
}

export function serializePageConfigModule(config: GeneratedPageConfig): string {
  const exportName = pageConfigExportName(config.pageId);
  const payload = JSON.stringify(config, null, 2);

  return [
    "/**",
    " * GENERATED PAGE CONFIG — Sprint 8.2B",
    ` * Page: ${config.pageName}`,
    " */",
    "",
    `export const ${exportName} = ${payload} as const;`,
    "",
    `export type ${exportName.replace(/Config$/, "ConfigType")} = typeof ${exportName};`,
    "",
  ].join("\n");
}
