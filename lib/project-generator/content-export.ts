import type {
  CompiledPage,
  CompiledSection,
  CompiledWebsiteProject,
  ContentBlock,
} from "@/lib/website-compiler/types";
import type { PageSectionConfig } from "@/lib/project-generator/react-utils";
import {
  buildPageSectionConfig,
  shouldIncludeSectionInPage,
} from "@/lib/project-generator/react-utils";

export type ExportedMenuItem = {
  id: string;
  name: string;
  category: string;
  description: string;
};

export type ExportedFaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type ExportedSectionContent = {
  contentBody: string;
  contentLines: string[];
  trustBadges: string[];
  menuItems: ExportedMenuItem[];
  faqItems: ExportedFaqItem[];
};

const PLACEHOLDER_TOKEN = /\[PLACEHOLDER(?::[^\]]+)?\]/gi;

export function sanitizeCompiledText(value: string | null | undefined): string {
  if (!value) {
    return "";
  }
  return value
    .replace(PLACEHOLDER_TOKEN, "")
    .replace(/\s+/g, " ")
    .trim();
}

function lookupContentBlocks(
  project: CompiledWebsiteProject,
  blockIds: string[],
): ContentBlock[] {
  const byId = new Map(project.contentBlocks.map((block) => [block.id, block]));
  return blockIds.map((id) => byId.get(id)).filter((block): block is ContentBlock => Boolean(block));
}

function splitContentLines(body: string): string[] {
  const sanitized = sanitizeCompiledText(body);
  if (!sanitized) {
    return [];
  }

  return sanitized
    .split(/\||\n|•|;/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function splitUspStatements(usp: string | null): string[] {
  if (!usp) {
    return [];
  }

  return usp
    .split(/[,;]|(?:\s+und\s+)/i)
    .map((part) => sanitizeCompiledText(part))
    .filter((part) => part.length > 0);
}

export function buildMenuItemsFromProject(
  project: CompiledWebsiteProject,
  limit = 8,
): ExportedMenuItem[] {
  const description =
    sanitizeCompiledText(project.business.usp) ||
    sanitizeCompiledText(project.business.websiteGoal);

  return project.business.services.slice(0, limit).map((name, index) => ({
    id: `menu-item-${index + 1}`,
    name: sanitizeCompiledText(name),
    category: index < 3 ? "Highlights" : "Klassiker",
    description,
  }));
}

export function parseFaqItems(body: string, sectionId: string): ExportedFaqItem[] {
  const segments = body.split("|").map((segment) => segment.trim());
  const items: ExportedFaqItem[] = [];

  for (const [index, segment] of segments.entries()) {
    const match = segment.match(/FAQ:\s*(.+?)\?\s*→\s*(.+)$/i);
    if (!match) {
      continue;
    }

    const answer = sanitizeCompiledText(match[2]);
    if (!answer) {
      continue;
    }

    items.push({
      id: `${sectionId}-faq-${index + 1}`,
      question: `${sanitizeCompiledText(match[1])}?`,
      answer,
    });
  }

  return items;
}

function sectionDisplayTitle(
  section: CompiledSection,
  page: CompiledPage,
  project: CompiledWebsiteProject,
): string {
  const titles: Record<string, string> = {
    TrustBar: sanitizeCompiledText(project.business.usp) || "Unser Versprechen",
    FeaturedItems: "Beliebte Speisen",
    USPGrid: "Was uns auszeichnet",
    TestimonialSection: "Stimmen unserer Gäste",
    GalleryTeaser: "Einblicke",
    LocationContactTeaser: "Besuchen Sie uns",
    FAQSection: "Häufige Fragen",
    FinalCTA: project.business.businessName,
    MenuIntro: "Speisekarte",
    MenuCategoryNav: "Kategorien",
    MenuOrderCTA: project.business.businessName,
    BrandStory: "Unsere Geschichte",
    MissionValues: "Mission & Werte",
    GalleryGrid: "Galerie",
    ContactHero: "Kontakt",
    ContactDetails: "Kontakt",
    ContactFormBlock: "Nachricht senden",
    MapBlock: "Standort",
  };

  return titles[section.name] ?? page.seo.title.split("|")[0]?.trim() ?? section.name;
}

function sectionDisplayDescription(
  section: CompiledSection,
  body: string,
  project: CompiledWebsiteProject,
): string {
  const sanitizedBody = sanitizeCompiledText(body);
  if (sanitizedBody.length > 0) {
    return sanitizedBody.slice(0, 240);
  }

  if (section.name === "FinalCTA") {
    return sanitizeCompiledText(project.business.websiteGoal);
  }

  return sanitizeCompiledText(section.purpose);
}

export function resolveSectionContent(
  project: CompiledWebsiteProject,
  section: CompiledSection,
): ExportedSectionContent {
  const blocks = lookupContentBlocks(project, section.contentBlocks);
  const contentBody = blocks.map((block) => String(block.content.body ?? "")).join(" | ");
  const contentLines = splitContentLines(contentBody);
  const uspLines = splitUspStatements(project.business.usp);

  let trustBadges = uspLines;
  if (section.name === "TrustBar" && contentLines.length > 0) {
    trustBadges = contentLines.flatMap((line) => splitUspStatements(line));
  }
  if (trustBadges.length === 0) {
    trustBadges = uspLines;
  }

  let menuItems: ExportedMenuItem[] = [];
  if (
    section.type === "menu-grid" ||
    section.type === "pricing" ||
    /featured|menu|product/i.test(section.name)
  ) {
    menuItems = buildMenuItemsFromProject(project);
  }

  const faqItems = section.name === "FAQSection" ? parseFaqItems(contentBody, section.id) : [];

  const resolvedLines =
    section.name === "USPGrid" || section.type === "feature-grid" || section.type === "usp-block"
      ? uspLines.length > 0
        ? uspLines
        : contentLines
      : contentLines;

  return {
    contentBody: sanitizeCompiledText(contentBody),
    contentLines: resolvedLines,
    trustBadges,
    menuItems,
    faqItems,
  };
}

export function enrichPageSectionConfig(
  section: CompiledSection,
  page: CompiledPage,
  project: CompiledWebsiteProject,
  isFirstVisibleSection: boolean,
): PageSectionConfig {
  const base = buildPageSectionConfig(section, page.pageRole, isFirstVisibleSection);
  const resolved = resolveSectionContent(project, section);

  return {
    ...base,
    title: sectionDisplayTitle(section, page, project),
    description: sectionDisplayDescription(section, resolved.contentBody, project),
    isPlaceholder: base.isPlaceholder,
    contentBody: resolved.contentBody,
    contentLines: resolved.contentLines,
    trustBadges: resolved.trustBadges,
    menuItems: resolved.menuItems,
    faqItems: resolved.faqItems,
  };
}

function routePathForPageRole(
  project: CompiledWebsiteProject,
  role: string,
): string | undefined {
  return project.routes.find((route) => route.pageRole === role)?.routePath;
}

export function resolveHeroCtaHref(
  project: CompiledWebsiteProject,
  label: string | null,
  intent: "primary" | "secondary",
): string {
  if (!label) {
    return "/";
  }

  const lower = label.toLowerCase();
  const menuPath =
    routePathForPageRole(project, "menu") ??
    project.routes.find((route) => /speise|menu/i.test(route.pageName))?.routePath;
  const contactPath =
    routePathForPageRole(project, "contact") ??
    project.routes.find((route) => /kontakt|contact/i.test(route.pageName))?.routePath;

  if (intent === "primary") {
    if (/speise|menu|bestell|order/i.test(lower)) {
      return menuPath ?? contactPath ?? "/";
    }
    if (/kontakt|contact|anfrage/i.test(lower)) {
      return contactPath ?? "/";
    }
    return menuPath ?? contactPath ?? "/";
  }

  if (/standort|öffnung|location|kontakt|contact/i.test(lower)) {
    return contactPath ?? "/";
  }

  return contactPath ?? menuPath ?? "/";
}

function extractPhoneFromProject(): string | null {
  return null;
}

function extractAddressFromProject(project: CompiledWebsiteProject): string | null {
  const location = sanitizeCompiledText(project.business.location);
  return location || null;
}

export function buildHeroSectionForPage(
  page: CompiledPage,
  project: CompiledWebsiteProject,
): PageSectionConfig {
  const uspLines = splitUspStatements(project.business.usp);
  const tagline = sanitizeCompiledText(uspLines[0] ?? project.business.usp?.split(",")[0] ?? "");
  const title = sanitizeCompiledText(project.business.businessName);
  const description = sanitizeCompiledText(project.business.websiteGoal);
  const premiumHome =
    page.pageRole === "home" && Boolean(project.websiteTheme && project.restaurantAssets);

  return {
    id: `section:${page.id.replace(/^page:/, "")}-hero`,
    title,
    name: "HeroSection",
    eyebrow: tagline || null,
    description,
    type: "hero",
    order: 0,
    priority: 100,
    hierarchyLevel: "dominant",
    visualWeight: "very-high",
    purpose: page.pageObjective,
    componentName: "HeroSection",
    isPlaceholder: false,
    missingData: [],
    contentBlocks: [],
    primaryCTA: page.primaryCta,
    secondaryCTA: page.secondaryCta,
    media: [],
    ctaReferences: [
      resolveHeroCtaHref(project, page.primaryCta, "primary"),
      resolveHeroCtaHref(project, page.secondaryCta, "secondary"),
    ],
    mediaReferences: [],
    headingLevel: 1,
    sourcePatternIds: ["hero"],
    contentBody: description,
    contentLines: uspLines,
    trustBadges: uspLines,
    menuItems: [],
    faqItems: [],
    heroLayout: premiumHome ? "premium-restaurant" : "legacy",
    tagline: tagline || null,
    primaryCtaHref: resolveHeroCtaHref(project, page.primaryCta, "primary"),
    secondaryCtaHref: resolveHeroCtaHref(project, page.secondaryCta, "secondary"),
    phone: extractPhoneFromProject(),
    address: extractAddressFromProject(project),
    className: premiumHome ? "hero-premium" : undefined,
  };
}

export function buildEnrichedPageSections(
  page: CompiledPage,
  project: CompiledWebsiteProject,
): PageSectionConfig[] {
  const visibleSections = page.orderedSections.filter(shouldIncludeSectionInPage);
  const hero = buildHeroSectionForPage(page, project);
  let firstVisible = true;

  const bodySections = visibleSections.map((section) => {
    const config = enrichPageSectionConfig(section, page, project, firstVisible);
    firstVisible = false;
    return config;
  });

  return [hero, ...bodySections].map((section, index) => ({
    ...section,
    order: index + 1,
  }));
}
