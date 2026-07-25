import type { CompiledWebsiteProject } from "@/lib/website-compiler/types";
import {
  ALL_GENERATED_COMPONENTS,
  collectRequiredComponents,
  type GeneratedComponentName,
} from "@/lib/project-generator/react-component-utils";
import { isFeatureEnabled } from "@/lib/project-generator/react-utils";

export const VISUAL_SPRINT = "8.3";

export const VISUAL_LAYOUT_PRIMITIVES = [
  "Container",
  "SectionShell",
  "Card",
  "Badge",
  "Stack",
  "Cluster",
  "ResponsiveGrid",
  "MediaFrame",
  "Divider",
  "Placeholder",
] as const;

export type VisualLayoutPrimitive = (typeof VISUAL_LAYOUT_PRIMITIVES)[number];

export type HeaderVariant =
  | "static"
  | "sticky"
  | "transparent-to-solid"
  | "compact"
  | "cta-focused";

export type FooterVariant =
  | "compact"
  | "multi-column"
  | "local-business"
  | "conversion"
  | "social-first";

export const STYLE_IMPORT = "import { cn, variants } from '@/styles/tailwind-mapping';";

export function headerComment(name: string): string {
  return [
    "/**",
    ` * GENERATED COMPONENT — ${name}`,
    ` * Sprint ${VISUAL_SPRINT} — premium visual component library`,
    " */",
    "",
  ].join("\n");
}

export function primitiveFilePath(name: VisualLayoutPrimitive): string {
  return `components/generated/${name}.tsx`;
}

export function collectRequiredVisualComponents(
  project: CompiledWebsiteProject,
): GeneratedComponentName[] {
  return collectRequiredComponents(project);
}

export function collectRequiredVisualFiles(
  project: CompiledWebsiteProject,
): Array<GeneratedComponentName | VisualLayoutPrimitive> {
  const required = new Set<string>([
    ...collectRequiredComponents(project),
    ...VISUAL_LAYOUT_PRIMITIVES,
  ]);
  const ordered = [...ALL_GENERATED_COMPONENTS, ...VISUAL_LAYOUT_PRIMITIVES];
  return ordered.filter((name) => required.has(name));
}

export function headerVariantForProject(project: CompiledWebsiteProject): HeaderVariant {
  const sticky = project.navigation.stickyBehavior.toLowerCase();
  const scroll = project.navigation.scrollBehavior.toLowerCase();

  if (project.site.styleTier === "premium" && /transparent|hero/.test(scroll)) {
    return "transparent-to-solid";
  }
  if (/sticky/.test(sticky)) {
    return "sticky";
  }
  if (project.site.styleTier === "premium") {
    return "cta-focused";
  }
  if (project.navigation.primaryNavigationItems.length <= 3) {
    return "compact";
  }
  return "static";
}

export function footerVariantForProject(project: CompiledWebsiteProject): FooterVariant {
  if (project.business.profile === "restaurant" || project.business.profile === "dentist") {
    return "local-business";
  }
  if (project.footer.socialPlaceholders.length >= 3) {
    return "social-first";
  }
  if (project.site.styleTier === "premium") {
    return "multi-column";
  }
  if (isFeatureEnabled(project.featureFlags, "onlineOrdering") || isFeatureEnabled(project.featureFlags, "contactForm")) {
    return "conversion";
  }
  return "compact";
}

export function countComponentVariants(project: CompiledWebsiteProject): number {
  let count = 0;
  count += 5;
  count += 5;
  count += 6;
  count += 5;
  if (collectRequiredComponents(project).includes("HeroSection")) {
    count += 1;
  }
  if (collectRequiredComponents(project).includes("MenuSection")) {
    count += 1;
  }
  return count;
}

export function buildVisualSharedTypesFile(): string {
  return [
    "/**",
    " * GENERATED SHARED TYPES — Sprint 8.3",
    " */",
    "",
    "export type CTA = {",
    "  label: string;",
    "  href: string;",
    "  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'text' | 'destructive';",
    "  external?: boolean;",
    "  disabled?: boolean;",
    "  loading?: boolean;",
    "};",
    "",
    "export type PlaceholderCategory =",
    "  | 'logo'",
    "  | 'image'",
    "  | 'price'",
    "  | 'address'",
    "  | 'phone'",
    "  | 'email'",
    "  | 'opening-hours'",
    "  | 'testimonial'",
    "  | 'legal'",
    "  | 'map'",
    "  | 'social-link'",
    "  | 'product-data'",
    "  | 'trust'",
    "  | 'other';",
    "",
    "export type CardVariant =",
    "  | 'standard'",
    "  | 'elevated'",
    "  | 'bordered'",
    "  | 'feature'",
    "  | 'product'",
    "  | 'testimonial'",
    "  | 'media'",
    "  | 'placeholder'",
    "  | 'interactive';",
    "",
    "export type MediaAssetId = 'logo' | 'favicon' | 'hero' | 'gallery' | 'product' | 'map' | 'avatar';",
    "",
    "export type MediaPlaceholderModel = {",
    "  id: string;",
    "  label: string;",
    "  aspectRatio?: string;",
    "  altText?: string;",
    "  assetId?: MediaAssetId;",
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
    "  featured?: boolean;",
    "  category?: string;",
    "};",
    "",
    "export type FAQItem = {",
    "  id: string;",
    "  question: string;",
    "  answer: string;",
    "  isPlaceholder: boolean;",
    "  category?: string;",
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
    "  heroLayout?: 'premium-restaurant' | 'legacy';",
    "  tagline?: string | null;",
    "  primaryCtaHref?: string;",
    "  secondaryCtaHref?: string;",
    "  phone?: string | null;",
    "  address?: string | null;",
    "};",
    "",
    "export type SectionComponentProps = {",
    "  section: SectionBaseProps;",
    "};",
    "",
  ].join("\n");
}

export function premiumSectionImports(extraImports: string[] = []): string[] {
  return [
    "import type { SectionComponentProps } from './types';",
    "import { SectionHeading } from './SectionHeading';",
    "import { SectionShell } from './SectionShell';",
    "import { Container } from './Container';",
    "import { Stack } from './Stack';",
    STYLE_IMPORT,
    ...extraImports,
  ];
}

export function premiumSectionOpen(): string[] {
  return [
    "  return (",
    "    <SectionShell id={section.id} headingId={`${section.id}-heading`} className={section.className}>",
    "      <Container>",
    "        <Stack gap=\"lg\">",
    "          <SectionHeading section={section} />",
  ];
}

export function premiumSectionClose(): string[] {
  return [
    "        </Stack>",
    "      </Container>",
    "    </SectionShell>",
    "  );",
  ];
}

export function generatePremiumSectionWrapper(
  name: string,
  innerLines: string[],
  extraImports: string[] = [],
  client = false,
): string {
  return [
    headerComment(name),
    client ? "'use client';\n\n" : "",
    ...premiumSectionImports(extraImports),
    "",
    `export function ${name}({ section }: SectionComponentProps) {`,
    ...premiumSectionOpen(),
    ...innerLines,
    ...premiumSectionClose(),
    "}",
    "",
  ].join("\n");
}
