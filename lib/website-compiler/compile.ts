import type { WebsiteBrief } from "@/lib/website-briefs.types";
import { resolveIndustryCompileAttachments } from "@/lib/core/registries/industry-module-registry";
import { resolveIndustryIdFromBrief } from "@/lib/core/registries/industry-registry";
import { ensureWebsiteEngineBootstrapped } from "@/lib/core/bootstrap";
import type { WebsiteBlueprintContent } from "@/lib/website-blueprints.types";
import {
  createPageDnaContext,
  getComponentTreeNodes,
  getPageSections,
  pageBusinessGoal,
  pageConversionGoal,
  pageUserIntent,
} from "@/lib/website-blueprint-page-dna";
import { resolvePatternId } from "@/lib/website-blueprint-pattern-library";
import { buildPageHierarchySpecification } from "@/lib/website-blueprint-visual-hierarchy";
import {
  assignUniqueSlugs,
  briefUsp,
  dedupeById,
  dedupeStrings,
  detectBusinessProfile,
  detectPageRole,
  detectStyleTier,
  normalizeComponentName,
  parseList,
  prefersMotionFromBrief,
  primaryCtaFromBrief,
  routePathFromSlug,
  secondaryCtaFromBrief,
  sortByOrder,
  stableId,
} from "@/lib/website-compiler/normalize";
import type {
  CompileResult,
  CompiledComponent,
  CompiledPage,
  CompiledSection,
  CompiledWebsiteProject,
  ComponentCategory,
  ContentBlock,
  ContentBlockType,
  DesignTokenModel,
  FeatureFlag,
  FeatureFlagName,
  FooterModel,
  FormDefinition,
  MediaPlaceholder,
  MissingDataEntry,
  NavigationItem,
  NavigationModel,
  PageSeoModel,
  RouteDefinition,
  StructuredDataRecommendation,
  WebsiteCompilerInput,
} from "@/lib/website-compiler/types";
import { COMPILER_VERSION } from "@/lib/website-compiler/types";

const KNOWN_COMPONENTS: Array<{
  name: string;
  category: ComponentCategory;
  purpose: string;
  patternIds: string[];
}> = [
  { name: "SiteHeader", category: "navigation", purpose: "Global header navigation", patternIds: ["navbar"] },
  { name: "SiteFooter", category: "layout", purpose: "Global footer", patternIds: ["footer"] },
  { name: "HeroSection", category: "hero", purpose: "Page hero", patternIds: ["hero"] },
  { name: "SectionHeading", category: "content", purpose: "Section titles", patternIds: ["feature-grid"] },
  { name: "CTASection", category: "conversion", purpose: "Conversion band", patternIds: ["cta-banner"] },
  { name: "Card", category: "content", purpose: "Generic content card", patternIds: ["feature-grid"] },
  { name: "ProductCard", category: "content", purpose: "Product/menu card", patternIds: ["menu-grid", "pricing"] },
  { name: "MenuCategory", category: "content", purpose: "Menu category block", patternIds: ["menu-grid"] },
  { name: "Gallery", category: "media", purpose: "Image gallery", patternIds: ["gallery"] },
  { name: "Testimonial", category: "content", purpose: "Testimonial block", patternIds: ["testimonials"] },
  { name: "FAQ", category: "content", purpose: "FAQ accordion", patternIds: ["faq"] },
  { name: "ContactForm", category: "form", purpose: "Contact form", patternIds: ["feature-grid"] },
  { name: "MapBlock", category: "utility", purpose: "Map embed", patternIds: ["location"] },
  { name: "OpeningHours", category: "utility", purpose: "Opening hours table", patternIds: ["location"] },
  { name: "SocialLinks", category: "utility", purpose: "Social profile links", patternIds: ["footer"] },
  { name: "MobileStickyCTA", category: "conversion", purpose: "Mobile sticky order/contact CTA", patternIds: ["reservation-block", "cta-banner"] },
];

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

function buildPageContextInput(
  pageName: string,
  brief: WebsiteBrief,
  sitemap: string[],
  profile: ReturnType<typeof detectBusinessProfile>,
  slugMap: Map<string, string>,
) {
  const role = detectPageRole(pageName);
  const primaryCta = primaryCtaFromBrief(brief.website_goal, profile);
  const secondaryCta = secondaryCtaFromBrief(profile, brief.location);
  const tier = detectStyleTier(
    brief.preferred_style,
    brief.additional_notes,
    brief.reference_websites,
  );

  return {
    page: pageName,
    role,
    brief,
    profile,
    sitemap,
    detectPageRole,
    slugFromPage: (page: string) =>
      routePathFromSlug(slugMap.get(page) ?? normalizePageSlug(page, detectPageRole(page))),
    pageMetaTitle: (page: string, sourceBrief: WebsiteBrief) =>
      `${page} | ${sourceBrief.business_name}`,
    pageMetaDescription: () => brief.website_goal.slice(0, 160),
    primaryCta,
    secondaryCta,
    usp: briefUsp(brief.unique_selling_points, brief.business_name, brief.website_goal),
    style:
      brief.preferred_style?.trim() ??
      "Modern, trustworthy, conversion-focused layout with strong hierarchy and generous whitespace.",
    requestedFeatures: parseList(brief.required_features),
    tier,
    prefersMotion: prefersMotionFromBrief(
      brief.preferred_style,
      brief.additional_notes,
      brief.reference_websites,
    ),
  };
}

function normalizePageSlug(page: string, role: ReturnType<typeof detectPageRole>): string {
  const slugs = assignUniqueSlugs([{ pageName: page, role }]);
  return slugs.get(page) ?? "page";
}

function detectInputSections(
  brief: WebsiteBrief,
  blueprint: WebsiteBlueprintContent,
): CompiledWebsiteProject["detectedInputSections"] {
  const pageSpecText = Object.values(blueprint.recommendedPageSections).flat().join("\n");

  return {
    websiteBrief: Boolean(brief.business_name && brief.website_goal),
    blueprintContent: Boolean(blueprint.recommendedSitemap.length),
    pageDna: pageSpecText.includes("# Page DNA"),
    designSystemDna: Boolean(blueprint.technicalRecommendation.trim()),
    componentDna: pageSpecText.includes("Component DNA"),
    contentDna: pageSpecText.includes("Content DNA"),
    patternLibrary: pageSpecText.includes("Pattern Library"),
    visualHierarchy: pageSpecText.includes("Visual Hierarchy Engine"),
    blueprintIntelligence: blueprint.implementationChecklist.some((item) =>
      item.includes("Blueprint Intelligence"),
    ),
    navigation: blueprint.contentRequirements.length > 0,
    seoBasics: blueprint.seoBasics.length > 0,
  };
}

function buildDesignTokens(brief: WebsiteBrief, tier: ReturnType<typeof detectStyleTier>): DesignTokenModel {
  const primary = brief.primary_color?.trim() ?? "[PLACEHOLDER: primary color]";
  const secondary = brief.secondary_color?.trim() ?? "[PLACEHOLDER: secondary color]";
  const sectionSpacing = tier === "premium" ? "5rem" : tier === "modern" ? "4rem" : "3rem";

  return {
    colors: {
      name: "colors",
      tokens: {
        "color.background": "#FFFFFF",
        "color.surface": "#FAFAFA",
        "color.surfaceElevated": "#FFFFFF",
        "color.primary": primary,
        "color.secondary": secondary,
        "color.accent": secondary,
        "color.muted": "#6B7280",
        "color.border": "#E5E7EB",
        "color.error": "#DC2626",
        "color.text": "#111827",
        "color.textMuted": "#6B7280",
      },
    },
    typography: {
      name: "typography",
      tokens: {
        "font.displayXL": tier === "premium" ? "clamp(3rem, 6vw, 4.5rem)" : "clamp(2.5rem, 5vw, 3.75rem)",
        "font.displayL": "clamp(2.25rem, 4vw, 3rem)",
        "font.h1": "clamp(2rem, 3.5vw, 2.75rem)",
        "font.h2": "clamp(1.5rem, 2.5vw, 2rem)",
        "font.h3": "1.25rem",
        "font.h4": "1.125rem",
        "font.bodyLarge": "1.125rem",
        "font.body": "1rem",
        "font.bodySmall": "0.875rem",
        "font.label": "0.75rem",
        "font.caption": "0.75rem",
        "font.button": "0.875rem",
      },
    },
    spacing: {
      name: "spacing",
      tokens: {
        "spacing.section": sectionSpacing,
        "spacing.block": "1.5rem",
        "spacing.inline": "1rem",
        "spacing.stack": "0.75rem",
      },
    },
    radius: {
      name: "radius",
      tokens: { "radius.sm": "0.375rem", "radius.md": "0.75rem", "radius.lg": "1rem", "radius.full": "9999px" },
    },
    borders: {
      name: "borders",
      tokens: { "border.width": "1px", "border.style": "solid" },
    },
    shadows: {
      name: "shadows",
      tokens: { "shadow.sm": "0 1px 2px rgba(0,0,0,0.05)", "shadow.md": "0 4px 12px rgba(0,0,0,0.08)", "shadow.lg": "0 12px 32px rgba(0,0,0,0.12)" },
    },
    layoutWidths: {
      name: "layoutWidths",
      tokens: { "layout.maxWidth": "80rem", "layout.contentWidth": "65ch" },
    },
    breakpoints: {
      name: "breakpoints",
      tokens: { "breakpoint.sm": "640px", "breakpoint.md": "768px", "breakpoint.lg": "1024px", "breakpoint.xl": "1280px" },
    },
    transitions: {
      name: "transitions",
      tokens: { "transition.fast": "150ms", "transition.normal": "250ms", "transition.slow": "400ms" },
    },
    easing: {
      name: "easing",
      tokens: { "easing.standard": "cubic-bezier(0.4, 0, 0.2, 1)", "easing.emphasized": "cubic-bezier(0.2, 0, 0, 1)" },
    },
    zIndex: {
      name: "zIndex",
      tokens: { "zIndex.header": "40", "zIndex.sticky": "30", "zIndex.modal": "50" },
    },
    mediaRatios: {
      name: "mediaRatios",
      tokens: { "ratio.16x9": "16 / 9", "ratio.4x3": "4 / 3", "ratio.1x1": "1 / 1" },
    },
  };
}

function inferContentBlockType(sectionName: string): ContentBlockType {
  if (/FAQ/i.test(sectionName)) return "faq-collection";
  if (/Testimonial|Reviews/i.test(sectionName)) return "testimonial-placeholder";
  if (/MenuCategory|Featured|Product|Treatment/i.test(sectionName)) return "product-collection";
  if (/Gallery/i.test(sectionName)) return "card-collection";
  if (/ContactForm/i.test(sectionName)) return "rich-text-placeholder";
  if (/ContactDetails|Address/i.test(sectionName)) return "contact-details";
  if (/OpeningHours/i.test(sectionName)) return "opening-hours";
  if (/Map/i.test(sectionName)) return "map-placeholder";
  if (/FinalCTA|OrderCTA|NavigateCTA/i.test(sectionName)) return "cta";
  if (/BrandStory|Mission|Intro|MainContent/i.test(sectionName)) return "rich-text-placeholder";
  return "paragraph";
}

function compileContentBlock(
  section: CompiledSection,
  pageId: string,
  sectionSpecContent: string,
  isPlaceholder: boolean,
): ContentBlock {
  return {
    id: stableId("content-block", `${pageId}-${section.name}`),
    type: inferContentBlockType(section.name),
    content: {
      heading: section.name,
      body: sectionSpecContent,
      placeholder: isPlaceholder ? "[PLACEHOLDER]" : "",
    },
    source: isPlaceholder ? "placeholder" : section.requiredData.length ? "brief" : "derived",
    isPlaceholder,
    required: section.requiredData.length > 0,
    editable: true,
    validationRules: isPlaceholder ? ["Must be replaced before launch"] : [],
    pageUsage: [pageId],
  };
}

function compileSectionsForPage(
  pageName: string,
  pageId: string,
  ctx: ReturnType<typeof createPageDnaContext>,
): { sections: CompiledSection[]; contentBlocks: ContentBlock[] } {
  const pageSections = getPageSections(ctx);
  const hierarchy = buildPageHierarchySpecification(ctx);
  const contentBlocks: ContentBlock[] = [];

  const sections = pageSections.map((sectionSpec, index) => {
    const patternId = resolvePatternId(sectionSpec.name, ctx);
    const prioritySpec = hierarchy.sectionPriorities.find(
      (item) => item.sectionName === sectionSpec.name,
    );
    const isPlaceholder = /\[PLACEHOLDER/i.test(sectionSpec.contentRequirements);
    const missingData = sectionSpec.contentRequirements
      .match(/\[PLACEHOLDER:[^\]]+\]/g)
      ?.map((match) => match.slice(1, -1)) ?? [];

    const compiledSection: CompiledSection = {
      id: stableId("section", `${pageName}-${sectionSpec.name}`),
      type: patternId,
      name: sectionSpec.name,
      order: index + 1,
      priority: prioritySpec?.priorityScore ?? 50,
      hierarchyLevel: prioritySpec?.hierarchyLevel ?? "secondary",
      visualWeight: prioritySpec?.visualWeight ?? "medium",
      purpose: sectionSpec.purpose,
      contentBlocks: [],
      componentReferences: dedupeStrings(
        sectionSpec.components.split(",").map((item) => normalizeComponentName(item.trim())),
      ),
      ctaReferences: /CTA|Order|Contact/i.test(sectionSpec.ctaBehavior)
        ? [ctx.primaryCta]
        : [],
      mediaReferences: isPlaceholder ? ["[PLACEHOLDER: media asset]"] : [],
      responsiveBehavior: sectionSpec.responsive,
      motionBehavior: sectionSpec.motion,
      accessibilityRequirements: [sectionSpec.accessibility],
      requiredData: isPlaceholder ? [] : [sectionSpec.contentRequirements],
      missingData,
      sourcePatternIds: [patternId],
    };

    const block = compileContentBlock(
      compiledSection,
      pageId,
      sectionSpec.contentRequirements,
      isPlaceholder,
    );
    compiledSection.contentBlocks = [block.id];
    contentBlocks.push(block);

    return compiledSection;
  });

  return { sections, contentBlocks };
}

function compileSeoForPage(
  pageName: string,
  route: RouteDefinition,
  brief: WebsiteBrief,
  ctx: ReturnType<typeof createPageDnaContext>,
): PageSeoModel {
  const services = parseList(brief.services);
  const missing: string[] = [];
  if (!brief.location) {
    missing.push("location");
  }

  return {
    title: `${pageName} | ${brief.business_name}`.slice(0, 60),
    titlePattern: "{page} | {businessName}",
    metaDescription: `${brief.website_goal.slice(0, 120)} — ${brief.target_audience}`.slice(0, 160),
    canonical: route.canonicalPath,
    robots: "index,follow",
    openGraph: {
      title: `${brief.business_name} — ${pageName}`,
      description: brief.website_goal.slice(0, 120),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${brief.business_name} — ${pageName}`,
      description: brief.website_goal.slice(0, 120),
    },
    primaryKeyword: services[0] ?? brief.industry,
    supportingKeywords: dedupeStrings([...services.slice(0, 4), brief.industry]),
    h1Direction: `${brief.business_name} — ${pageUserIntent(ctx.role, brief).slice(0, 60)}`,
    structuredDataType:
      ctx.role === "contact" || ctx.role === "location"
        ? "LocalBusiness"
        : ctx.role === "home"
          ? "Organization"
          : "WebPage",
    breadcrumbRecommendation: ["Home", pageName],
    internalLinks: route.internalLinks,
    missingSeoInputs: missing,
  };
}

function compileFeatureFlags(brief: WebsiteBrief): FeatureFlag[] {
  const features = parseList(brief.required_features).join(" ").toLowerCase();
  const notes = `${brief.additional_notes ?? ""}`.toLowerCase();

  const flag = (
    name: FeatureFlagName,
    enabled: boolean,
    source: string,
    requiredInputs: string[],
    missingInputs: string[],
  ): FeatureFlag => ({
    name,
    enabled,
    source,
    requiredInputs,
    missingInputs,
    implementationStatus:
      missingInputs.length > 0 ? "placeholder" : enabled ? "ready" : "blocked",
  });

  return [
    flag("onlineOrdering", /bestell|order|shop/.test(features + brief.website_goal.toLowerCase()), "brief.goal/features", ["order endpoint"], []),
    flag("reservation", /termin|reserv|book/.test(features + brief.website_goal.toLowerCase()), "brief.goal/features", ["booking provider"], []),
    flag("contactForm", /form|kontakt|contact/.test(features), "brief.features", ["form destination email"], brief.location ? [] : ["address optional"]),
    flag("maps", /maps|google/.test(features), "brief.features", ["address", "maps URL"], brief.location ? ["maps URL"] : ["address", "maps URL"]),
    flag("instagram", /instagram|social/.test(features + notes), "brief.features/notes", ["instagram URL"], ["instagram URL"]),
    flag("clickToCall", /(\+?\d[\d\s\-/]{6,}\d)/.test(brief.additional_notes ?? ""), "brief.notes", ["phone"], /(\+?\d[\d\s\-/]{6,}\d)/.test(brief.additional_notes ?? "") ? [] : ["phone"]),
    flag("openingHours", /öffnungs|hours|uhr/.test(notes), "brief.notes", ["opening hours"], /öffnungs|hours|uhr/.test(notes) ? [] : ["opening hours"]),
    flag("gallery", /galerie|gallery/.test(features), "brief.features", ["gallery images"], /bild|foto|image|gallery/.test(notes) ? [] : ["gallery images"]),
    flag("animations", prefersMotionFromBrief(brief.preferred_style, brief.additional_notes, brief.reference_websites), "brief.style", [], []),
    flag("analytics", /analytics|tracking|ga4|matomo/.test(features + notes), "brief.features", ["analytics config"], ["analytics config"]),
    flag("cms", false, "default v1", ["cms selection"], ["cms selection"]),
    flag("newsletter", /newsletter/.test(features), "brief.features", ["newsletter provider"], /newsletter/.test(features) ? ["newsletter provider"] : []),
    flag("multilingual", /english|sprache|language/.test(notes), "brief.notes", ["translation set"], /english|sprache|language/.test(notes) ? ["translation set"] : []),
    flag("darkMode", /dark mode|dark theme/.test(notes), "brief.notes", ["theme decision"], /dark mode|dark theme/.test(notes) ? [] : []),
  ];
}

function compileMissingDataRegistry(
  brief: WebsiteBrief,
  sitemap: string[],
): MissingDataEntry[] {
  const pages = sitemap.map((page) => stableId("page", page));
  const entries: MissingDataEntry[] = [];

  const add = (
    field: string,
    category: string,
    placeholder: string,
    recommendation: string,
    severity: MissingDataEntry["severity"],
    blocksLaunch: boolean,
    affectedComponents: string[] = [],
  ) => {
    entries.push({
      id: stableId("missing", field),
      category,
      field,
      affectedPages: pages,
      affectedComponents,
      severity,
      placeholder: `[PLACEHOLDER: ${placeholder}]`,
      recommendation,
      blocksGeneration: false,
      blocksLaunch,
    });
  };

  if (!brief.location?.trim()) {
    add("address", "contact", "street, PLZ city", "Provide full address in brief", "high", true, ["MapBlock"]);
  }
  if (!/(\+?\d[\d\s\-/]{6,}\d)/.test(brief.additional_notes ?? "")) {
    add("phone", "contact", "phone", "Add phone to brief notes", "medium", false, ["ContactForm"]);
  }
  if (!/[\w.+-]+@[\w.-]+\.\w+/.test(brief.additional_notes ?? "")) {
    add("email", "contact", "email", "Add email to brief notes", "medium", false, ["ContactForm"]);
  }
  if (!/öffnungs|opening|uhr|hours|mo-|di-/i.test(brief.additional_notes ?? "")) {
    add("opening hours", "operations", "opening hours", "Provide weekly hours", "medium", false, ["OpeningHours"]);
  }
  if (!/logo/i.test(brief.additional_notes ?? "") && !brief.primary_color) {
    add("logo", "brand", "logo asset", "Upload logo asset", "high", false, ["SiteHeader"]);
  }
  if (!/bild|foto|photo|image|gallery/i.test(`${brief.additional_notes ?? ""}`)) {
    add("product images", "media", "product images", "Upload photography", "high", false, ["Gallery", "ProductCard"]);
  }
  if (!/testimonial|review|bewertung/i.test(`${brief.additional_notes ?? ""} ${brief.required_features ?? ""}`)) {
    add("testimonials", "trust", "testimonials", "Collect verified testimonials", "medium", false, ["Testimonial"]);
  }
  if (!/impressum|datenschutz|legal|privacy/i.test(`${brief.required_pages ?? ""} ${brief.required_features ?? ""}`)) {
    add("legal text", "legal", "Impressum & Datenschutz", "Supply legal copy", "high", true, ["SiteFooter"]);
  }
  add("domain", "launch", "production domain", "Confirm production domain", "medium", true);
  if (parseList(brief.services).some(() => true)) {
    add("product prices", "commerce", "EUR prices", "Confirm whether prices should be shown", "medium", false, ["ProductCard"]);
  }

  return dedupeById(entries);
}

function compileComponents(pageUsageMap: Map<string, Set<string>>): CompiledComponent[] {
  return KNOWN_COMPONENTS.map((definition) => {
    const pages = [...(pageUsageMap.get(definition.name) ?? [])];
    return {
      id: stableId("component", definition.name),
      name: definition.name,
      category: definition.category,
      purpose: definition.purpose,
      propsSchema: {
        title: "string",
        description: "string",
        ctaLabel: "string | optional",
        items: "array | optional",
      },
      variants: ["default", "compact"],
      states: ["default", "hover", "focus", "disabled", "loading"],
      responsiveBehavior: "Mobile-first stack; desktop grid where applicable",
      accessibilityRequirements: ["Keyboard accessible", "Visible focus", "Semantic landmarks where applicable"],
      motionBehavior: "Respect prefers-reduced-motion",
      designTokenReferences: ["color.primary", "font.h2", "spacing.block", "radius.md"],
      pageUsage: pages,
      sourcePatternIds: definition.patternIds as CompiledComponent["sourcePatternIds"],
      missingDataRequirements:
        definition.name === "MapBlock"
          ? ["address", "maps URL"]
          : definition.name === "Testimonial"
            ? ["testimonials"]
            : definition.name === "SocialLinks"
              ? ["social URLs"]
              : [],
    };
  });
}

function compileNavigation(routes: RouteDefinition[], primaryCta: string): NavigationModel {
  const items: NavigationItem[] = routes.map((route, index) => ({
    id: stableId("nav-item", route.pageName),
    label: route.navigationLabel,
    routeId: route.id,
    routePath: route.routePath,
    order: index + 1,
  }));

  const homeRoute = routes.find((route) => route.pageRole === "home") ?? routes[0];

  return {
    desktopNavigation: items,
    mobileNavigation: items,
    primaryNavigationItems: items,
    ctaItem: {
      id: stableId("nav-item", "primary-cta"),
      label: primaryCta,
      routeId: homeRoute?.id ?? routes[0].id,
      routePath: homeRoute?.routePath ?? routes[0].routePath,
      order: items.length + 1,
    },
    activeStateBehavior: "Underline or color token active state on current route",
    focusBehavior: "Visible focus ring on all nav links",
    mobileOpenCloseBehavior: "Drawer with aria-expanded toggle",
    stickyBehavior: "Sticky header after scroll",
    scrollBehavior: "Optional shrink on scroll; no scroll-jacking",
  };
}

function compileFooter(routes: RouteDefinition[], primaryCta: string): FooterModel {
  return {
    variant: "standard",
    navigationGroups: [
      {
        title: "Seiten",
        items: routes.map((route, index) => ({
          id: stableId("footer-item", route.pageName),
          label: route.navigationLabel,
          routeId: route.id,
          routePath: route.routePath,
          order: index + 1,
        })),
      },
    ],
    contactPlaceholders: [],
    legalPlaceholders: [],
    socialPlaceholders: [],
    ctaArea: {
      label: primaryCta,
      routeId: routes.find((route) => route.pageRole === "contact")?.id ?? routes[0].id,
    },
    mobileStackingOrder: ["brand", "navigation", "contact", "legal", "social"],
    accessibilityRequirements: ["Footer landmark", "Link lists as ul", "Legal links text labels"],
  };
}

function compileForms(brief: WebsiteBrief, sitemap: string[]): FormDefinition[] {
  const features = parseList(brief.required_features).join(" ").toLowerCase();
  if (!/form|kontakt|contact/.test(features)) {
    return [];
  }

  const contactPage = sitemap.find((page) => detectPageRole(page) === "contact") ?? sitemap[0];

  return [
    {
      id: stableId("form", "contact"),
      name: "ContactForm",
      purpose: `Capture inquiries aligned with goal: ${brief.website_goal}`,
      fields: [
        {
          id: stableId("field", "name"),
          name: "name",
          type: "text",
          label: "Name",
          placeholder: "Max Mustermann",
          required: true,
          validationRules: ["required"],
          errorMessage: "Bitte füllen Sie dieses Feld aus.",
        },
        {
          id: stableId("field", "email"),
          name: "email",
          type: "email",
          label: "E-Mail",
          placeholder: "ihre@email.de",
          required: true,
          validationRules: ["required", "email"],
          errorMessage: "Bitte gültige E-Mail eingeben.",
        },
        {
          id: stableId("field", "message"),
          name: "message",
          type: "textarea",
          label: "Nachricht",
          placeholder: "Wie können wir helfen?",
          required: true,
          validationRules: ["required", "minLength:10"],
          errorMessage: "Bitte füllen Sie dieses Feld aus.",
        },
      ],
      requiredFields: ["name", "email", "message"],
      successMessage: "Vielen Dank — wir melden uns [PLACEHOLDER: timeframe].",
      privacyPlaceholder: "[PLACEHOLDER: Datenschutz-Link]",
      submissionBehaviorPlaceholder: "[PLACEHOLDER: form submission endpoint — no backend in Sprint 8.1]",
      accessibilityRequirements: ["Labels linked to inputs", "Error text associated with fields", "Focus management on submit"],
      pageUsage: [stableId("page", contactPage)],
    },
  ];
}

function compileRoutes(
  brief: WebsiteBrief,
  sitemap: string[],
  requestedFeatures: string[],
  slugMap: Map<string, string>,
): RouteDefinition[] {
  return sitemap.map((pageName, index) => {
    const role = detectPageRole(pageName);
    const slug = slugMap.get(pageName) ?? "page";
    const routePath = routePathFromSlug(slug);
    const missing: string[] = [];
    if ((role === "contact" || role === "location") && !brief.location) {
      missing.push("address");
    }
    if (/form|kontakt|contact/i.test(requestedFeatures.join(" ")) && role === "contact") {
      if (!/[\w.+-]+@[\w.-]+\.\w+/.test(brief.additional_notes ?? "")) {
        missing.push("email");
      }
    }

    return {
      id: stableId("route", pageName),
      pageName,
      slug,
      routePath,
      pageRole: role,
      isIndexable: true,
      canonicalPath: routePath,
      navigationLabel: pageName,
      priority: role === "home" ? 1 : index + 2,
      parentRouteId: null,
      childRouteIds: [],
      internalLinks: sitemap
        .filter((entry) => entry !== pageName)
        .map((entry) =>
          routePathFromSlug(slugMap.get(entry) ?? normalizePageSlug(entry, detectPageRole(entry))),
        ),
      requiredFeatures: requestedFeatures,
      missingRequirements: missing,
    };
  });
}

function compileMediaPlaceholders(
  pages: CompiledPage[],
  brief: WebsiteBrief,
): MediaPlaceholder[] {
  const hasImages = /bild|foto|photo|image|gallery|logo/i.test(`${brief.additional_notes ?? ""}`);
  const placeholders: MediaPlaceholder[] = [
    {
      id: stableId("media", "hero"),
      role: "hero",
      aspectRatio: "16:9",
      loadingPriority: "eager",
      altTextRule: "Describe confirmed subject; [PLACEHOLDER] until asset supplied",
      affectedPages: pages.map((page) => page.id),
      isPlaceholder: !hasImages,
    },
    {
      id: stableId("media", "logo"),
      role: "logo",
      aspectRatio: "auto",
      loadingPriority: "eager",
      altTextRule: `${brief.business_name} logo`,
      affectedPages: pages.map((page) => page.id),
      isPlaceholder: !/logo/i.test(brief.additional_notes ?? ""),
    },
  ];

  pages.forEach((page) => {
    if (page.pageRole === "menu" || page.pageRole === "gallery") {
      placeholders.push({
        id: stableId("media", `${page.pageName}-grid`),
        role: page.pageRole === "menu" ? "product" : "gallery",
        aspectRatio: page.pageRole === "menu" ? "1:1" : "4:3",
        loadingPriority: "lazy",
        altTextRule: "Item or scene description from brief only",
        affectedPages: [page.id],
        isPlaceholder: !hasImages,
      });
    }
  });

  return dedupeById(placeholders);
}

function compileStructuredData(
  routes: RouteDefinition[],
  brief: WebsiteBrief,
): StructuredDataRecommendation[] {
  const homeRoute = routes.find((route) => route.pageRole === "home");
  const contactRoute = routes.find((route) => route.pageRole === "contact" || route.pageRole === "location");
  const recommendations: StructuredDataRecommendation[] = [];

  if (homeRoute) {
    recommendations.push({
      id: stableId("schema", "organization"),
      type: "Organization",
      pageRouteIds: [homeRoute.id],
      requiredFields: ["name"],
      missingFields: brief.location ? [] : ["address"],
    });
  }

  if (contactRoute) {
    recommendations.push({
      id: stableId("schema", "local-business"),
      type: "LocalBusiness",
      pageRouteIds: [contactRoute.id],
      requiredFields: ["name", "address"],
      missingFields: brief.location ? ["telephone", "openingHours"] : ["address", "telephone", "openingHours"],
    });
  }

  recommendations.push({
    id: stableId("schema", "faq"),
    type: "FAQPage",
    pageRouteIds: routes.filter((route) => route.pageRole === "home").map((route) => route.id),
    requiredFields: ["question", "answer"],
    missingFields: ["confirmed FAQ answers"],
  });

  return recommendations;
}

export function compileWebsiteProject(input: WebsiteCompilerInput): CompileResult {
  ensureWebsiteEngineBootstrapped();
  const { brief, blueprint } = input;
  const profile = resolveIndustryIdFromBrief(brief);
  const sitemap = blueprint.recommendedSitemap.length
    ? blueprint.recommendedSitemap
    : ["Home"];
  const requestedFeatures = parseList(brief.required_features);
  const primaryCta = primaryCtaFromBrief(brief.website_goal, profile);
  const secondaryCta = secondaryCtaFromBrief(profile, brief.location);
  const tier = detectStyleTier(
    brief.preferred_style,
    brief.additional_notes,
    brief.reference_websites,
  );
  const slugMap = assignUniqueSlugs(
    sitemap.map((pageName) => ({ pageName, role: detectPageRole(pageName) })),
  );
  const routes = compileRoutes(brief, sitemap, requestedFeatures, slugMap);
  const routeByPage = new Map(routes.map((route) => [route.pageName, route]));
  const pageUsageMap = new Map<string, Set<string>>();
  const registerUsage = (componentName: string, pageId: string) => {
    const normalized = normalizeComponentName(componentName);
    const current = pageUsageMap.get(normalized) ?? new Set<string>();
    current.add(pageId);
    pageUsageMap.set(normalized, current);
  };

  const pages: CompiledPage[] = [];
  const allContentBlocks: ContentBlock[] = [];
  const allSections: CompiledSection[] = [];

  sitemap.forEach((pageName) => {
    const ctx = createPageDnaContext(
      buildPageContextInput(pageName, brief, sitemap, profile, slugMap),
    );
    const route = routeByPage.get(pageName)!;
    const pageId = stableId("page", pageName);
    const hierarchy = buildPageHierarchySpecification(ctx);
    const { sections, contentBlocks } = compileSectionsForPage(pageName, pageId, ctx);
    const componentTree = getComponentTreeNodes(ctx.role, ctx).map(normalizeComponentName);
    componentTree.forEach((component) => registerUsage(component, pageId));
    registerUsage("SiteHeader", pageId);
    registerUsage("SiteFooter", pageId);

    allSections.push(...sections);
    allContentBlocks.push(...contentBlocks);

    pages.push({
      id: pageId,
      routeId: route.id,
      pageName,
      pageRole: ctx.role,
      pageObjective: pageBusinessGoal(ctx.role, brief, profile),
      userIntent: pageUserIntent(ctx.role, brief),
      primaryCta,
      secondaryCta,
      hierarchyScore: hierarchy.scores.overall,
      readingFlow: hierarchy.readingFlow,
      selectedPatternIds: dedupeStrings([
        "hero",
        "navbar",
        "footer",
        ...sections.flatMap((section) => section.sourcePatternIds),
      ]) as CompiledPage["selectedPatternIds"],
      componentTree,
      orderedSections: sortByOrder(sections),
      responsiveRules: [sections.map((section) => section.responsiveBehavior).join(" | ")],
      interactionRules: blueprint.contentRequirements.filter((entry) => entry.includes("CTA")),
      accessibilityRules: sections.map((section) => section.accessibilityRequirements.join("; ")),
      seo: compileSeoForPage(pageName, route, brief, ctx),
      contentRequirements: sections.flatMap((section) => section.requiredData),
      mediaRequirements: sections.flatMap((section) => section.mediaReferences),
      conversionFlow: [
        pageConversionGoal(ctx.role, brief, primaryCta),
        ...sections.filter((section) => section.ctaReferences.length).map((section) => section.name),
      ],
      implementationWarnings: hierarchy.conflicts.map(
        (conflict) => `${conflict.severity}: ${conflict.reason}`,
      ),
    });
  });

  const components = compileComponents(pageUsageMap);
  const featureFlags = compileFeatureFlags(brief);
  const missingData = compileMissingDataRegistry(brief, sitemap);
  const warnings = compileWarnings(routes, pages, allSections, components, missingData, featureFlags);
  const forms = compileForms(brief, sitemap);
  const seo = pages.map((page) => page.seo);
  const mediaPlaceholders = compileMediaPlaceholders(pages, brief);
  const structuredData = compileStructuredData(routes, brief);
  const designTokens = buildDesignTokens(brief, tier);
  const navigation = compileNavigation(routes, primaryCta);
  const footer = compileFooter(routes, primaryCta);
  const industryId = resolveIndustryIdFromBrief(brief);
  const industryAttachments = resolveIndustryCompileAttachments(input, industryId);
  const resolvedRestaurantAssets = industryAttachments.restaurantAssets;
  const resolvedRestaurantBusinessProfile = industryAttachments.restaurantBusinessProfile;

  const project: CompiledWebsiteProject = {
    metadata: {
      projectId: stableId("project", brief.business_name),
      projectName: brief.business_name,
      generatedAt: input.generatedAt ?? "1970-01-01T00:00:00.000Z",
      compilerVersion: COMPILER_VERSION,
      sourceBlueprintId: input.sourceBlueprintId ?? stableId("blueprint", brief.id),
      sourceBriefId: input.sourceBriefId ?? brief.id,
      generationMode: input.generationMode ?? "deterministic",
      targetFramework: "nextjs",
      language: "de",
      locale: "de-DE",
      status: "compiled",
    },
    business: {
      businessName: brief.business_name,
      industry: brief.industry,
      location: brief.location,
      websiteGoal: brief.website_goal,
      targetAudience: brief.target_audience,
      usp: brief.unique_selling_points,
      services: parseList(brief.services),
      profile,
    },
    site: {
      sitemap,
      primaryCta,
      secondaryCta,
      styleTier: tier,
      prefersMotion: prefersMotionFromBrief(
        brief.preferred_style,
        brief.additional_notes,
        brief.reference_websites,
      ),
      referenceWebsites: parseList(brief.reference_websites),
    },
    locale: {
      primaryLanguage: "de",
      formalAddress: "Sie",
      numberFormat: "de-DE",
      dateFormat: "DD.MM.YYYY",
      timeFormat: "24h",
      currencyPlaceholder: "[PLACEHOLDER: EUR]",
    },
    theme: {
      mode: "light",
      primaryColor: brief.primary_color?.trim() ?? "[PLACEHOLDER: primary color]",
      secondaryColor: brief.secondary_color?.trim() ?? "[PLACEHOLDER: secondary color]",
      styleDescription:
        brief.preferred_style?.trim() ??
        "Modern, trustworthy, conversion-focused layout with strong hierarchy and generous whitespace.",
    },
    designTokens,
    navigation,
    footer,
    routes,
    pages,
    components,
    contentBlocks: dedupeById(allContentBlocks),
    mediaPlaceholders,
    forms,
    seo,
    structuredData,
    featureFlags,
    accessibility: {
      headingOrder: "One H1 per page; H2 sections; no skipped levels",
      domOrder: "DOM order matches reading order",
      focusOrder: "Skip link → header → main → footer",
      skipLinks: ["Skip to main content"],
      focusVisibility: "Design System focus ring tokens",
      landmarks: ["header", "main", "footer", "nav"],
      reducedMotion: "Disable non-essential motion when prefers-reduced-motion",
    },
    performance: {
      lcpMediaIds: mediaPlaceholders.filter((item) => item.loadingPriority === "eager").map((item) => item.id),
      lazyLoadBelowFold: true,
      imageOptimization: "Next.js Image component with responsive sizes",
      motionBudget: "One dominant motion moment per viewport",
    },
    warnings,
    missingData,
    detectedInputSections: detectInputSections(brief, blueprint),
    ...(resolvedRestaurantAssets ? { restaurantAssets: resolvedRestaurantAssets } : {}),
    ...(input.websiteTheme ? { websiteTheme: input.websiteTheme } : {}),
    ...(resolvedRestaurantBusinessProfile
      ? { restaurantBusinessProfile: resolvedRestaurantBusinessProfile }
      : {}),
  };

  return { project, warnings };
}

function compileWarnings(
  routes: RouteDefinition[],
  pages: CompiledPage[],
  sections: CompiledSection[],
  components: CompiledComponent[],
  missingData: MissingDataEntry[],
  featureFlags: FeatureFlag[],
): CompileResult["warnings"] {
  const warnings: CompileResult["warnings"] = [];
  const routePaths = routes.map((route) => route.routePath);
  const duplicateRoutes = routePaths.filter(
    (path, index) => routePaths.indexOf(path) !== index,
  );

  if (duplicateRoutes.length) {
    warnings.push({
      code: "DUPLICATE_ROUTE",
      severity: "critical",
      message: `Duplicate route paths detected: ${dedupeStrings(duplicateRoutes).join(", ")}`,
      affectedEntity: "routes",
      recommendedAction: "Normalize slugs to ensure unique route paths",
    });
  }

  const homepageRoutes = routes.filter((route) => route.routePath === "/");
  if (homepageRoutes.length !== 1) {
    warnings.push({
      code: "HOMEPAGE_ROUTE",
      severity: homepageRoutes.length === 0 ? "critical" : "high",
      message: "Expected exactly one homepage route at /",
      affectedEntity: "routes",
      recommendedAction: "Ensure one page resolves to role home and path /",
    });
  }

  pages.forEach((page) => {
    const dominantCtas = page.orderedSections.filter(
      (section) => section.ctaReferences.length > 0 && section.priority >= 75,
    );
    if (dominantCtas.length > 2) {
      warnings.push({
        code: "CONFLICTING_CTAS",
        severity: "medium",
        message: `Multiple high-priority CTA sections on ${page.pageName}`,
        affectedEntity: page.id,
        recommendedAction: "Keep one dominant CTA per viewport",
      });
    }
  });

  missingData
    .filter((entry) => entry.severity === "high" || entry.severity === "critical")
    .forEach((entry) => {
      warnings.push({
        code: "MISSING_REQUIRED_DATA",
        severity: entry.severity,
        message: `Missing ${entry.field}`,
        affectedEntity: entry.id,
        recommendedAction: entry.recommendation,
      });
    });

  featureFlags
    .filter((flag) => flag.enabled && flag.missingInputs.length > 0)
    .forEach((flag) => {
      warnings.push({
        code: "FEATURE_MISSING_INPUTS",
        severity: "medium",
        message: `Feature ${flag.name} enabled but missing inputs: ${flag.missingInputs.join(", ")}`,
        affectedEntity: flag.name,
        recommendedAction: "Provide required inputs or disable feature flag",
      });
    });

  const sectionIds = sections.map((section) => section.id);
  const duplicateSectionIds = sectionIds.filter(
    (id, index) => sectionIds.indexOf(id) !== index,
  );
  if (duplicateSectionIds.length) {
    warnings.push({
      code: "DUPLICATE_SECTION_ID",
      severity: "high",
      message: "Duplicate section IDs detected",
      affectedEntity: dedupeStrings(duplicateSectionIds).join(", "),
      recommendedAction: "Ensure stableId inputs are unique per section",
    });
  }

  const componentIds = components.map((component) => component.id);
  if (new Set(componentIds).size !== componentIds.length) {
    warnings.push({
      code: "DUPLICATE_COMPONENT_ID",
      severity: "high",
      message: "Duplicate component IDs detected",
      affectedEntity: "components",
      recommendedAction: "Normalize component registry IDs",
    });
  }

  components.forEach((component) => {
    component.designTokenReferences.forEach((token) => {
      if (!VALID_TOKEN_NAMES.has(token)) {
        warnings.push({
          code: "UNKNOWN_DESIGN_TOKEN",
          severity: "low",
          message: `Unknown design token reference ${token} on ${component.name}`,
          affectedEntity: component.id,
          recommendedAction: "Map to existing Design System DNA token names",
        });
      }
    });
  });

  return warnings;
}

export function serializeCompiledWebsiteProject(
  project: CompiledWebsiteProject,
  options?: { includeGeneratedAt?: boolean },
): string {
  const payload =
    options?.includeGeneratedAt === false
      ? { ...project, metadata: { ...project.metadata, generatedAt: "1970-01-01T00:00:00.000Z" } }
      : project;
  return JSON.stringify(payload, null, 2);
}
