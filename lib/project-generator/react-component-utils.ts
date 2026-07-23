import type { CompiledWebsiteProject } from "@/lib/website-compiler/types";
import {
  buildPageConfig,
  collectSectionComponents,
  isFeatureEnabled,
  type SectionComponentName,
} from "@/lib/project-generator/react-utils";

export const ALL_GENERATED_COMPONENTS = [
  "SiteHeader",
  "SiteFooter",
  "HeroSection",
  "TrustSection",
  "FeatureGridSection",
  "MenuSection",
  "ProductGridSection",
  "GallerySection",
  "TestimonialSection",
  "FAQSection",
  "ContactSection",
  "ContactForm",
  "LocationSection",
  "MapSection",
  "OpeningHours",
  "CTASection",
  "ContentSection",
  "GenericSection",
  "MobileStickyCTA",
  "SectionHeading",
  "ButtonLink",
  "MediaPlaceholder",
] as const;

export type GeneratedComponentName = (typeof ALL_GENERATED_COMPONENTS)[number];

export const SHARED_PRIMITIVES = ["ButtonLink", "SectionHeading", "MediaPlaceholder"] as const;

export const PLACEHOLDER_PREFIX = "[PLACEHOLDER:";

export function placeholderLabel(label: string): string {
  return `${PLACEHOLDER_PREFIX} ${label}]`;
}

export function componentFilePath(name: GeneratedComponentName): string {
  return `components/generated/${name}.tsx`;
}

export function collectRequiredComponents(project: CompiledWebsiteProject): GeneratedComponentName[] {
  const required = new Set<GeneratedComponentName>([
    "SiteHeader",
    "SiteFooter",
    "ButtonLink",
    "SectionHeading",
    "MediaPlaceholder",
    "GenericSection",
  ]);

  for (const page of project.pages) {
    const config = buildPageConfig(page, project);
    for (const name of collectSectionComponents(config)) {
      required.add(name);
    }
  }

  if (
    isFeatureEnabled(project.featureFlags, "onlineOrdering") ||
    isFeatureEnabled(project.featureFlags, "contactForm")
  ) {
    required.add("MobileStickyCTA");
  }

  if (required.has("ContactSection") || project.forms.length > 0) {
    required.add("ContactForm");
  }

  if (
    required.has("LocationSection") ||
    isFeatureEnabled(project.featureFlags, "maps") ||
    isFeatureEnabled(project.featureFlags, "openingHours")
  ) {
    required.add("MapSection");
    required.add("OpeningHours");
  }

  return ALL_GENERATED_COMPONENTS.filter((name) => required.has(name));
}

export function heroVariantForPage(pageRole: string, styleTier: string): string {
  if (pageRole === "home" && styleTier === "premium") {
    return "split";
  }
  if (pageRole === "home") {
    return "centered";
  }
  if (pageRole === "menu") {
    return "product-focused";
  }
  if (pageRole === "contact" || pageRole === "location") {
    return "local-business";
  }
  return "minimal-editorial";
}

export function buildSharedTypesFile(): string {
  return [
    "/**",
    " * GENERATED SHARED TYPES — Sprint 8.2C",
    " */",
    "",
    "export type CTA = {",
    "  label: string;",
    "  href: string;",
    "  variant?: 'primary' | 'secondary';",
    "};",
    "",
    "export type MediaPlaceholderModel = {",
    "  id: string;",
    "  label: string;",
    "  aspectRatio?: string;",
    "  altText?: string;",
    "};",
    "",
    "export type NavigationItemModel = {",
    "  label: string;",
    "  href: string;",
    "};",
    "",
    "export type ContentBlockModel = {",
    "  id: string;",
    "  type: string;",
    "  content: string;",
    "  isPlaceholder: boolean;",
    "};",
    "",
    "export type ProductMenuItemPlaceholder = {",
    "  id: string;",
    "  name: string;",
    "  description?: string;",
    "  priceLabel?: string;",
    "  allergenLabel?: string;",
    "  dietaryLabel?: string;",
    "  availabilityLabel?: string;",
    "};",
    "",
    "export type FAQItem = {",
    "  id: string;",
    "  question: string;",
    "  answer: string;",
    "  isPlaceholder: boolean;",
    "};",
    "",
    "export type TestimonialPlaceholder = {",
    "  id: string;",
    "  quote: string;",
    "  author: string;",
    "  isConfirmed: boolean;",
    "};",
    "",
    "export type ContactDetailsModel = {",
    "  phone?: string;",
    "  email?: string;",
    "  address?: string;",
    "};",
    "",
    "export type OpeningHoursPlaceholder = {",
    "  id: string;",
    "  label: string;",
    "  value: string;",
    "};",
    "",
    "export type MissingDataReference = {",
    "  field: string;",
    "  label: string;",
    "};",
    "",
    "export type SectionBaseProps = {",
    "  id: string;",
    "  title: string;",
    "  name: string;",
    "  eyebrow: string | null;",
    "  description: string;",
    "  type: string;",
    "  order: number;",
    "  priority: number;",
    "  hierarchyLevel: string;",
    "  visualWeight: string;",
    "  purpose: string;",
    "  componentName: string;",
    "  isPlaceholder: boolean;",
    "  missingData: readonly string[];",
    "  contentBlocks: readonly string[];",
    "  primaryCTA: string | null;",
    "  secondaryCTA: string | null;",
    "  media: readonly string[];",
    "  ctaReferences: readonly string[];",
    "  mediaReferences: readonly string[];",
    "  headingLevel: 1 | 2 | 3;",
    "  sourcePatternIds: readonly string[];",
    "  className?: string;",
    "};",
    "",
    "export type SectionComponentProps = {",
    "  section: SectionBaseProps;",
    "};",
    "",
  ].join("\n");
}

export function sectionNamesFromProject(project: CompiledWebsiteProject): SectionComponentName[] {
  const names = new Set<SectionComponentName>();
  for (const page of project.pages) {
    for (const name of collectSectionComponents(buildPageConfig(page, project))) {
      names.add(name);
    }
  }
  return [...names].sort();
}

export function isClientComponent(name: GeneratedComponentName): boolean {
  return name === "SiteHeader" || name === "ContactForm" || name === "FAQSection";
}

export function isSharedPrimitive(name: GeneratedComponentName): boolean {
  return (SHARED_PRIMITIVES as readonly string[]).includes(name);
}

export function isSectionComponent(name: GeneratedComponentName): boolean {
  return name.endsWith("Section") && name !== "SectionHeading";
}
