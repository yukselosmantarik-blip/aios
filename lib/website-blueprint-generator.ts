import type { WebsiteBrief } from "@/lib/website-briefs.types";
import type { WebsiteBlueprintContent } from "@/lib/website-blueprints.types";
import { WEBSITE_BLUEPRINT_LIMITS } from "@/lib/website-blueprint-validator";
import { buildPageDnaSpecification, createPageDnaContext } from "@/lib/website-blueprint-page-dna";
import { buildDesignSystemDna } from "@/lib/website-blueprint-design-system-dna";
import { buildPageComponentDna } from "@/lib/website-blueprint-component-dna";
import {
  buildGlobalContentDnaItems,
  buildGlobalContentDnaMarkdown,
  buildPageContentDna,
  type ContentDnaContext,
} from "@/lib/website-blueprint-content-dna";
import {
  buildBlueprintIntelligenceChecklistItems,
  buildBlueprintIntelligenceMarkdown,
} from "@/lib/website-blueprint-intelligence";
import {
  buildGlobalPatternLibraryMarkdown,
  buildPagePatternLibrary,
  createPatternLibraryContext,
} from "@/lib/website-blueprint-pattern-library";
import {
  buildComponentHierarchyRefs,
  buildPageDnaHierarchyIntegration,
  buildPageVisualHierarchyBlock,
  buildPatternLibraryHierarchyIntegration,
  buildVisualHierarchyEngineOverview,
} from "@/lib/website-blueprint-visual-hierarchy";
import { resolveIndustryRegistrationFromBrief } from "@/lib/core/registries/industry-registry";
import { ensureWebsiteEngineBootstrapped } from "@/lib/core/bootstrap";
import { detectBusinessProfile } from "@/lib/website-compiler/normalize";
import type { BusinessProfile } from "@/lib/website-blueprint-page-dna";

type PageRole =
  | "home"
  | "menu"
  | "about"
  | "gallery"
  | "contact"
  | "location"
  | "services"
  | "portfolio"
  | "reviews"
  | "team"
  | "treatments"
  | "generic";

const PAGE_ROLE_ALIASES: Record<string, PageRole> = {
  home: "home",
  start: "home",
  startseite: "home",
  menu: "menu",
  speisekarte: "menu",
  speisen: "menu",
  about: "about",
  "about us": "about",
  "über uns": "about",
  "uber uns": "about",
  gallery: "gallery",
  galerie: "gallery",
  contact: "contact",
  kontakt: "contact",
  location: "location",
  standort: "location",
  services: "services",
  leistungen: "services",
  portfolio: "portfolio",
  reviews: "reviews",
  bewertungen: "reviews",
  team: "team",
  treatments: "treatments",
  behandlungen: "treatments",
};

function truncateText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
}

function truncateArrayItem(value: string): string {
  return truncateText(value.trim(), WEBSITE_BLUEPRINT_LIMITS.arrayItemMaxLength);
}

function enforceBlueprintLimits(
  content: WebsiteBlueprintContent,
): WebsiteBlueprintContent {
  const recommendedPageSections = Object.fromEntries(
    Object.entries(content.recommendedPageSections)
      .map(([page, sections]) => [
        truncateText(page.trim(), WEBSITE_BLUEPRINT_LIMITS.pageKeyMaxLength),
        sections
          .map((section) => truncateArrayItem(section))
          .filter((section) => section.length > 0),
      ])
      .filter(([page, sections]) => page.length > 0 && sections.length > 0),
  );

  return {
    projectSummary: truncateText(
      content.projectSummary,
      WEBSITE_BLUEPRINT_LIMITS.textFieldMaxLength,
    ),
    targetAudienceSummary: truncateText(
      content.targetAudienceSummary,
      WEBSITE_BLUEPRINT_LIMITS.textFieldMaxLength,
    ),
    brandDirection: truncateText(
      content.brandDirection,
      WEBSITE_BLUEPRINT_LIMITS.textFieldMaxLength,
    ),
    recommendedSitemap: content.recommendedSitemap
      .map((page) => truncateArrayItem(page))
      .filter((page) => page.length > 0),
    recommendedPageSections,
    features: content.features
      .map((feature) => truncateArrayItem(feature))
      .filter((feature) => feature.length > 0),
    contentRequirements: content.contentRequirements
      .map((item) => truncateArrayItem(item))
      .filter((item) => item.length > 0),
    seoBasics: content.seoBasics
      .map((item) => truncateArrayItem(item))
      .filter((item) => item.length > 0),
    technicalRecommendation: truncateText(
      content.technicalRecommendation,
      WEBSITE_BLUEPRINT_LIMITS.textFieldMaxLength,
    ),
    implementationChecklist: content.implementationChecklist
      .map((item) => truncateArrayItem(item))
      .filter((item) => item.length > 0),
    masterPrompt: truncateText(
      content.masterPrompt,
      WEBSITE_BLUEPRINT_LIMITS.masterPromptMaxLength,
    ),
  };
}

function parseList(value: string | null): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizePageKey(page: string): string {
  return page.trim().toLowerCase();
}

function detectPageRole(page: string): PageRole {
  const key = normalizePageKey(page);
  return PAGE_ROLE_ALIASES[key] ?? "generic";
}

function resolveSitemap(brief: WebsiteBrief): string[] {
  const requestedPages = parseList(brief.required_pages);

  if (requestedPages.length > 0) {
    return requestedPages;
  }

  return [...resolveIndustryRegistrationFromBrief(brief).defaultSitemap];
}

function briefServices(brief: WebsiteBrief): string[] {
  const services = parseList(brief.services?.replace(/\r/g, "") ?? null);
  return services.length > 0 ? services : [];
}

function briefUsp(brief: WebsiteBrief): string {
  if (brief.unique_selling_points?.trim()) {
    return brief.unique_selling_points.trim();
  }

  return `Deliver a clear, trustworthy presentation of ${brief.business_name} that supports the stated website goal: ${brief.website_goal}.`;
}

function briefStyle(brief: WebsiteBrief): string {
  return (
    brief.preferred_style?.trim() ??
    "Modern, trustworthy, conversion-focused layout with strong hierarchy and generous whitespace."
  );
}

function primaryColor(brief: WebsiteBrief): string {
  return brief.primary_color?.trim() ?? "Define primary brand color from brief workshop";
}

function secondaryColor(brief: WebsiteBrief): string {
  return brief.secondary_color?.trim() ?? "Define secondary accent color from brief workshop";
}

function referencesLine(brief: WebsiteBrief): string | null {
  if (!brief.reference_websites?.trim()) {
    return null;
  }

  return parseList(brief.reference_websites.replace(/\r/g, "")).join(", ");
}

function primaryCta(brief: WebsiteBrief, profile: BusinessProfile): string {
  const goal = brief.website_goal.toLowerCase();

  if (/bestell|order|shop|kauf|purchase/.test(goal)) {
    return "Jetzt bestellen";
  }

  if (/termin|appointment|buchen|book/.test(goal)) {
    return "Termin vereinbaren";
  }

  if (/kontakt|contact|anfrage|lead/.test(goal)) {
    return "Kontakt aufnehmen";
  }

  if (profile === "restaurant") {
    return "Zur Speisekarte / Bestellen";
  }

  if (profile === "dentist") {
    return "Termin anfragen";
  }

  if (profile === "agency") {
    return "Projekt anfragen";
  }

  return "Anfrage senden";
}

function secondaryCta(brief: WebsiteBrief, profile: BusinessProfile): string {
  if (profile === "restaurant") {
    return "Standort & Öffnungszeiten";
  }

  if (profile === "dentist") {
    return "Leistungen ansehen";
  }

  if (profile === "agency") {
    return "Portfolio ansehen";
  }

  if (brief.location) {
    return `${brief.location} entdecken`;
  }

  return "Mehr erfahren";
}

type StyleTier = "premium" | "modern" | "default";

function detectStyleTier(brief: WebsiteBrief): StyleTier {
  const haystack = `${brief.preferred_style ?? ""} ${brief.additional_notes ?? ""} ${brief.reference_websites ?? ""}`.toLowerCase();

  if (/premium|elegant|apple|luxury|minimal|hochwertig/.test(haystack)) {
    return "premium";
  }

  if (/modern|contemporary|clean|bold|zeitgemäß|zeitgemass/.test(haystack)) {
    return "modern";
  }

  return "default";
}

function prefersMotion(brief: WebsiteBrief): boolean {
  return /animation|bewegung|motion|apple|transition|parallax/i.test(
    `${brief.preferred_style ?? ""} ${brief.additional_notes ?? ""} ${brief.reference_websites ?? ""}`,
  );
}

function brandPersonality(brief: WebsiteBrief, profile: BusinessProfile): string {
  const tier = detectStyleTier(brief);
  const traits: Record<StyleTier, string> = {
    premium: "Refined, confident, understated, quality-led",
    modern: "Contemporary, clear, forward-looking, efficient",
    default: "Professional, trustworthy, direct, approachable",
  };

  const profileTraits: Record<BusinessProfile, string> = {
    restaurant: "Hospitality-focused, appetizing, welcoming",
    dentist: "Calm, reassuring, competent, hygienic",
    agency: "Creative, results-oriented, expert, collaborative",
    business: "Service-led, dependable, local, relationship-focused",
    default: "Customer-centric, reliable, knowledgeable",
  };

  return `${traits[tier]}. ${profileTraits[profile]}.`;
}

function customerGoalsFromBrief(brief: WebsiteBrief): string[] {
  const goal = brief.website_goal.toLowerCase();
  const goals = [`Achieve the stated website goal: ${brief.website_goal}.`];

  if (/bestell|order|shop|kauf|purchase/.test(goal)) {
    goals.push(
      "Browse offerings and decide what to order.",
      "Complete an order or reach the ordering channel with minimal friction.",
    );
  }

  if (/termin|appointment|buchen|book/.test(goal)) {
    goals.push(
      "Understand available services or treatments.",
      "Book or request an appointment quickly.",
    );
  }

  if (/kunden|kunde|customer|lead|anfrage|kontakt|contact/.test(goal)) {
    goals.push(
      "Evaluate trust and credibility before contacting.",
      "Send an inquiry or start a conversation.",
    );
  }

  if (/info|inform|verstehen|learn|überzeug/.test(goal)) {
    goals.push("Understand what makes this business different.");
  }

  return goals;
}

function customerPainPoints(
  brief: WebsiteBrief,
  profile: BusinessProfile,
): string[] {
  const usp = (brief.unique_selling_points ?? "").toLowerCase();
  const points: string[] = [];

  const byProfile: Record<BusinessProfile, string[]> = {
    restaurant: [
      "Difficulty finding menu, prices, or ordering options online.",
      "Uncertainty about location, hours, or how to visit.",
    ],
    dentist: [
      "Anxiety about treatments or unclear service scope.",
      "Friction when trying to book or compare options.",
    ],
    agency: [
      "Hard to assess capability without clear proof or portfolio.",
      "Unclear process for starting a project or getting a quote.",
    ],
    business: [
      "Unclear service scope, pricing, or response times.",
      "Difficulty reaching a reliable local provider quickly.",
    ],
    default: [
      "Cannot quickly understand what the business offers.",
      "No clear next step to act on their interest.",
    ],
  };

  points.push(...byProfile[profile]);

  if (/halal|vegan|vegetar|allerg|diet/i.test(usp)) {
    points.push(
      "Need clarity on dietary or compliance requirements stated in brief USP.",
    );
  }

  if (!brief.location?.trim()) {
    points.push(
      "Location and visit planning details not yet confirmed in brief [PLACEHOLDER].",
    );
  }

  return points;
}

function customerBuyingTriggers(
  brief: WebsiteBrief,
  profile: BusinessProfile,
): string[] {
  const services = briefServices(brief);
  const triggers = [
    `USP from brief: ${briefUsp(brief)}`,
    `Clear alignment with target audience: ${brief.target_audience}`,
    `Obvious path to: ${primaryCta(brief, profile)}`,
  ];

  if (services.length > 0) {
    triggers.push(`Visible offerings from brief: ${services.join(", ")}.`);
  }

  if (/bestell|order|shop/i.test(brief.website_goal)) {
    triggers.push("Convenient online ordering path visible above the fold.");
  }

  if (brief.location) {
    triggers.push(`Local relevance: ${brief.location}.`);
  }

  return triggers;
}

function competitorPositioning(brief: WebsiteBrief): string {
  const refs = referencesLine(brief);

  if (refs) {
    return `Brief references ${refs} for visual and UX inspiration only. Differentiate through ${brief.business_name}'s USP (${briefUsp(brief).slice(0, 100)}) — do not copy competitor content or claims.`;
  }

  return `No competitor references provided in brief. Position ${brief.business_name} solely on stated USP, industry (${brief.industry}), and audience (${brief.target_audience}). Do not invent competitor comparisons.`;
}

function brandToneOfVoice(brief: WebsiteBrief, profile: BusinessProfile): string {
  const tier = detectStyleTier(brief);
  const audience = brief.target_audience;

  const tierTone: Record<StyleTier, string> = {
    premium: "Concise, polished sentences. Avoid hype. Let quality claims come from brief USP only.",
    modern: "Direct, active voice. Short paragraphs. Benefit-led headlines.",
    default: "Friendly professional tone. Plain language. No jargon without explanation.",
  };

  const profileTone: Record<BusinessProfile, string> = {
    restaurant: "Sensory, inviting language tied to food and experience — no invented dish descriptions.",
    dentist: "Reassuring, calm, factual — no fear-based messaging.",
    agency: "Confident, outcome-focused — reference brief services only.",
    business: "Clear, practical, trust-building — emphasize reliability and local service.",
    default: "Helpful and credible — stick to brief-provided copy.",
  };

  return `${tierTone[tier]} ${profileTone[profile]} Address ${audience} consistently across all pages.`;
}

function buildBusinessDna(
  brief: WebsiteBrief,
  profile: BusinessProfile,
  sitemap: string[],
): string {
  const services = briefServices(brief);

  return [
    "# Business DNA",
    "",
    "## Brand positioning",
    `${brief.business_name} in ${brief.industry}${brief.location ? ` (${brief.location})` : ""}.`,
    `Position as a trustworthy choice for ${brief.target_audience}, driven by: ${briefUsp(brief)}.`,
    `Website goal anchors all messaging: ${brief.website_goal}.`,
    `Primary CTA: ${primaryCta(brief, profile)}.`,
    "",
    "## Brand personality",
    brandPersonality(brief, profile),
    brief.preferred_style?.trim()
      ? `Style direction from brief: ${brief.preferred_style.trim()}.`
      : "",
    "",
    "## Target customer profile",
    brief.target_audience,
    services.length
      ? `Interested in: ${services.join(", ")} (from brief services).`
      : `Industry context: ${brief.industry} — use neutral offering placeholders until services are confirmed.`,
    "",
    "## Customer goals",
    ...customerGoalsFromBrief(brief).map((goal) => `- ${goal}`),
    "",
    "## Customer pain points",
    ...customerPainPoints(brief, profile).map((point) => `- ${point}`),
    "",
    "## Customer buying triggers",
    ...customerBuyingTriggers(brief, profile).map((trigger) => `- ${trigger}`),
    "",
    "## Competitor positioning",
    competitorPositioning(brief),
    "",
    "## Brand tone of voice",
    brandToneOfVoice(brief, profile),
    "",
    "## Site scope",
    `Pages (${sitemap.length}): ${sitemap.join(" → ")}.`,
    brief.additional_notes?.trim()
      ? `\n## Brief notes\n${brief.additional_notes.trim()}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function neutralPalette(primary: string): string {
  const isDarkPrimary = /^#([0-3]|0[a-f])/i.test(primary.trim());

  if (isDarkPrimary) {
    return [
      "Background: #FFFFFF (primary surface), #F9FAFB (secondary surface).",
      "Text: #111827 (primary), #6B7280 (muted).",
      "Border: #E5E7EB.",
    ].join(" ");
  }

  return [
    "Background: #FFFFFF (primary surface), #F3F4F6 (secondary surface).",
    "Text: #1F2937 (primary), #6B7280 (muted).",
    "Border: #D1D5DB.",
  ].join(" ");
}

function buildVisualDna(brief: WebsiteBrief): string {
  const tier = detectStyleTier(brief);
  const refs = referencesLine(brief);
  const primary = primaryColor(brief);
  const secondary = secondaryColor(brief);
  const style = briefStyle(brief);

  const typography: Record<StyleTier, string[]> = {
    premium: [
      "Font stack: Inter, system-ui, sans-serif (reference: brief premium/minimal direction).",
      "H1: 3.5–4rem / font-weight 600 / letter-spacing -0.02em / line-height 1.1.",
      "H2: 2.25–2.5rem / font-weight 600 / line-height 1.2.",
      "H3: 1.5rem / font-weight 600 / line-height 1.3.",
      "H4: 1.125rem / font-weight 600 / line-height 1.4.",
      "Body: 1.0625rem (17px) / font-weight 400 / line-height 1.6.",
      "Small/caption: 0.875rem / font-weight 400 / line-height 1.5.",
    ],
    modern: [
      "Font stack: Inter or DM Sans, sans-serif.",
      "H1: 2.5–3.5rem / font-weight 700 / line-height 1.15.",
      "H2: 2rem / font-weight 700 / line-height 1.25.",
      "H3: 1.375rem / font-weight 600 / line-height 1.35.",
      "H4: 1.125rem / font-weight 600 / line-height 1.4.",
      "Body: 1rem (16px) / font-weight 400 / line-height 1.6.",
      "Small/caption: 0.875rem / font-weight 500 for labels.",
    ],
    default: [
      "Font stack: Inter, system-ui, sans-serif.",
      "H1: 2.25–3rem / font-weight 700 / line-height 1.2.",
      "H2: 1.875rem / font-weight 700 / line-height 1.25.",
      "H3: 1.5rem / font-weight 600 / line-height 1.35.",
      "H4: 1.125rem / font-weight 600 / line-height 1.4.",
      "Body: 1rem / font-weight 400 / line-height 1.6.",
      "Small/caption: 0.875rem / font-weight 400.",
    ],
  };

  const fontWeights: Record<StyleTier, string> = {
    premium: "400 (body), 500 (labels/emphasis), 600 (headings), 700 (hero display optional).",
    modern: "400 (body), 500 (labels), 600 (subheads), 700 (headings/CTA).",
    default: "400 (body), 500 (medium emphasis), 600 (headings), 700 (hero only).",
  };

  const radius: Record<StyleTier, string> = {
    premium: "Buttons: 0.5rem (8px). Cards: 0.75rem (12px). Modals/dialogs: 1rem (16px). Inputs: 0.5rem.",
    modern: "Buttons: 0.375rem (6px). Cards: 0.625rem (10px). Modals: 0.75rem. Inputs: 0.375rem.",
    default: "Buttons: 0.25rem (4px). Cards: 0.5rem (8px). Modals: 0.5rem. Inputs: 0.25rem.",
  };

  const shadows: Record<StyleTier, string> = {
    premium: "sm: 0 1px 2px rgba(0,0,0,0.04). md: 0 4px 12px rgba(0,0,0,0.06). lg: 0 12px 32px rgba(0,0,0,0.08). Use sparingly — premium feel relies on whitespace.",
    modern: "sm: 0 1px 3px rgba(0,0,0,0.08). md: 0 4px 16px rgba(0,0,0,0.1). lg: 0 8px 24px rgba(0,0,0,0.12).",
    default: "sm: 0 1px 2px rgba(0,0,0,0.05). md: 0 2px 8px rgba(0,0,0,0.08). lg: 0 4px 16px rgba(0,0,0,0.1).",
  };

  const buttonRadius: Record<StyleTier, string> = {
    premium: "8px",
    modern: "6px",
    default: "4px",
  };

  return [
    "# Visual DNA",
    "",
    "## Design direction (from brief)",
    style,
    refs ? `Reference inspiration: ${refs}.` : "",
    "",
    "## Color palette",
    `Primary brand: ${primary}.`,
    `Secondary / accent: ${secondary}.`,
    `Neutrals (derived from primary tone): ${neutralPalette(primary)}.`,
    `CTA buttons: background ${secondary}; text contrast per WCAG AA.`,
    `Links and interactive accents: ${secondary} on neutral backgrounds.`,
    "",
    "## Typography hierarchy",
    ...typography[tier].map((line) => `- ${line}`),
    "",
    "## Font weights",
    fontWeights[tier],
    "",
    "## Border radius",
    radius[tier],
    "",
    "## Spacing scale",
    "Base unit: 4px. Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96px.",
    "Section vertical padding: 64px mobile, 96px desktop.",
    "Component internal padding: 16–24px.",
    "Grid gap: 16px mobile, 24px tablet, 32px desktop.",
    brief.additional_notes?.match(/mobile first|schnell|schnelle/i)
      ? "Brief note: prioritize compact mobile spacing for fast scanning."
      : "",
    "",
    "## Container widths",
    "Content max-width: 1280px (max-w-7xl). Text prose max-width: 65ch (max-w-prose).",
    "Full-bleed sections: 100vw with inner container constraint.",
    "Hero inner padding: px-4 sm:px-6 lg:px-8.",
    "",
    "## Grid recommendations",
    "Mobile: 1 column (grid-cols-1).",
    "Tablet (md): 2 columns for cards/features (grid-cols-2).",
    "Desktop (lg+): 3–4 columns for grids (grid-cols-3 or grid-cols-4).",
    "12-column underlying grid for complex layouts; gutter 24px.",
    "",
    "## Shadow system",
    shadows[tier],
    "",
    "## Icon style",
    tier === "premium"
      ? "Outline icons, 1.5px stroke, 20–24px, monochrome matching text color."
      : "Outline icons, 2px stroke, 20px default, consistent family (Lucide).",
    "",
    "## Image style",
    "Authentic photography placeholders until client assets supplied.",
    `Imagery mood aligned with brief style: ${style.slice(0, 80)}.`,
    "Aspect ratios: hero 16:9 or 21:9; cards 4:3 or 1:1; team portraits 1:1.",
    "Border-radius on images matches card radius. object-fit: cover.",
    "",
    "## Button variants",
    `Primary: filled ${secondary}, white/near-white text, ${buttonRadius[tier]} radius.`,
    "Secondary: outline 1px border primary text color, transparent background.",
    "Ghost: text-only with hover underline or subtle background.",
    "Disabled: 50% opacity, no pointer events.",
    "Sizes: sm (h-9), md (h-11 default, min 44px touch), lg (h-13 hero).",
    "",
    "## Card variants",
    "Elevated: white background + shadow-md + radius from scale.",
    "Outlined: 1px border neutral, no shadow, hover shadow-sm transition.",
    "Flat: background secondary surface (#F9FAFB), no shadow.",
    "Interactive cards: hover lift (translateY -2px) + shadow increase on desktop only.",
    "",
    "## Token reference",
    "Implementation-ready semantic tokens, scales, and component specs: see Design System DNA (technicalRecommendation field and master prompt).",
    "Page DNA component specs reference these shared tokens — do not duplicate hex values per page.",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildMotionDna(brief: WebsiteBrief): string[] {
  const tier = detectStyleTier(brief);
  const motion = prefersMotion(brief);
  const duration = motion || tier === "premium" ? "400–600ms" : "200–300ms";
  const easing = tier === "premium" ? "cubic-bezier(0.16, 1, 0.3, 1)" : "ease-out";

  return [
    "# Motion DNA",
    `Style tier: ${tier}${motion ? " (motion emphasis from brief)" : ""}.`,
    `Default duration: ${duration}. Easing: ${easing}. Respect prefers-reduced-motion: reduce all to 0ms or opacity-only.`,
    "",
    `Hero animation: headline fade+translateY(12px→0) stagger 80ms; CTA follows 120ms; duration ${duration}.`,
    `Section reveal: intersection observer fade+translateY(16px→0); stagger children 60ms; once only.`,
    `Hover effects: buttons scale(1.02); cards translateY(-2px)+shadow; links underline width 0→100%.`,
    `Button animation: active scale(0.98); loading spinner replace label; success checkmark crossfade.`,
    `Card animation: hover elevation transition ${motion ? "300ms" : "200ms"}; image zoom scale(1.03) inside overflow-hidden.`,
    "Navbar behavior: sticky after scroll 64px; backdrop-blur bg-white/80; mobile menu slide-down 250ms.",
    "Scroll behavior: smooth scroll for anchor links; no scroll-jacking; optional progress bar [PLACEHOLDER].",
    "Loading states: skeleton pulse for grids; form submit spinner; image blur-up placeholder.",
    `Page transitions: ${motion ? "subtle fade between routes 200ms" : "instant or fade 150ms"}; prefer CSS-only.`,
  ];
}

function buildUxDna(
  brief: WebsiteBrief,
  profile: BusinessProfile,
  sitemap: string[],
): string {
  const services = briefServices(brief);
  const primary = primaryCta(brief, profile);
  const secondary = secondaryCta(brief, profile);
  const homePage = sitemap[0] ?? "Home";
  const contactPage =
    sitemap.find((p) => detectPageRole(p) === "contact") ?? sitemap[sitemap.length - 1];
  const actionPage =
    sitemap.find((p) => {
      const role = detectPageRole(p);
      return role === "menu" || role === "contact" || role === "services";
    }) ?? contactPage;

  const journeySteps = [
    `1. Land on ${homePage} — understand value in ≤5 seconds.`,
    services.length
      ? `2. Explore offerings (${services.slice(0, 2).join(", ")}${services.length > 2 ? "…" : ""}) via sitemap.`
      : "2. Explore relevant sitemap pages for offerings.",
    `3. Build trust via About/Reviews/Gallery pages if present.`,
    `4. Convert on ${actionPage} with „${primary}".`,
  ];

  return [
    "# UX DNA",
    "",
    "## User journey",
    ...journeySteps,
    `Full path: ${sitemap.join(" → ")} → ${primary}.`,
    "",
    "## Conversion flow",
    `Entry: ${homePage} hero → interest via USP/services → trust sections → action.`,
    `Primary conversion: „${primary}" on ${actionPage}.`,
    `Secondary path: „${secondary}" for users needing more information first.`,
    `Goal alignment: every page includes at least one path toward ${brief.website_goal}.`,
    "",
    "## CTA placement strategy",
    "Header: persistent primary CTA button (desktop) or icon (mobile).",
    "Hero: primary + secondary CTA above the fold.",
    "Mid-page: repeat primary CTA after trust/proof sections.",
    "Page end: full-width CTA band before footer.",
    "Mobile: sticky bottom bar with primary CTA on Home, Menu/Services, Contact.",
    `Contact touchpoints: header, hero, footer, ${contactPage} form.`,
    "",
    "## Mobile-first behavior",
    "Design mobile layout first; single column; hamburger nav; 44px min tap targets.",
    "Hero content visible without scroll on 390px viewport.",
    brief.additional_notes?.match(/mobile first/i)
      ? "Brief explicitly requests Mobile First — validate all flows at 375px before desktop."
      : "",
    "Collapsible sections for long content; horizontal scroll only for category nav.",
    "",
    "## Desktop behavior",
    "Multi-column layouts from lg breakpoint; hover states enabled.",
    "Max content width 1280px; split hero option (text left, media right).",
    "Persistent horizontal navigation with active page indicator.",
    "",
    "## Accessibility recommendations",
    "WCAG 2.1 AA: contrast 4.5:1 body text, 3:1 large text and UI components.",
    "Keyboard: full tab order, visible focus rings (2px offset), skip-to-content link.",
    "Screen readers: semantic landmarks (header, main, nav, footer), aria-labels on icons.",
    "Forms: explicit labels, aria-describedby for errors, aria-live for submit feedback.",
    "Motion: honor prefers-reduced-motion; no essential info conveyed by animation alone.",
    "Images: descriptive alt text from content modules; decorative images alt=\"\".",
  ]
    .filter(Boolean)
    .join("\n");
}

function internalLinksForPage(page: string, sitemap: string[]): string {
  const others = sitemap.filter((entry) => entry !== page);
  if (others.length === 0) {
    return "No additional internal pages defined in brief.";
  }

  return others.join(", ");
}

function pagePurpose(page: string, role: PageRole, brief: WebsiteBrief): string {
  const purposes: Record<PageRole, string> = {
    home: `Introduce ${brief.business_name}, communicate core value, and route visitors toward ${brief.website_goal.toLowerCase()}.`,
    menu: `Present offerings from the brief so visitors can browse items and move toward ordering or visiting.`,
    about: `Explain brand story, credibility, and positioning for ${brief.target_audience}.`,
    gallery: `Show visual proof of ambience, products, or results using photography placeholders until client assets are supplied.`,
    contact: `Reduce friction for inquiries, orders, visits, or appointments.`,
    location: `Provide location, directions, hours, and visit planning information${brief.location ? ` for ${brief.location}` : ""}.`,
    services: `Explain service scope${briefServices(brief).length ? `: ${briefServices(brief).join(", ")}` : ` relevant to ${brief.industry}`}.`,
    portfolio: `Demonstrate proof of work and outcomes to build trust with ${brief.target_audience}.`,
    reviews: `Show social proof through testimonials and ratings placeholders.`,
    team: `Introduce people behind the business to increase trust.`,
    treatments: `Explain treatment categories and help visitors choose the next step.`,
    generic: `Support the website goal (${brief.website_goal}) with focused content for ${brief.target_audience}.`,
  };

  return purposes[role];
}

function pageUserGoal(role: PageRole, brief: WebsiteBrief): string {
  const goals: Record<PageRole, string> = {
    home: "Understand what the business offers and take the primary next step within 10 seconds.",
    menu: "Find relevant items quickly and decide to order or visit.",
    about: "Build confidence in the brand before converting.",
    gallery: "Experience the visual quality and atmosphere of the business.",
    contact: "Complete the intended conversion action with minimal fields.",
    location: "Confirm where to go, when to visit, and how to get there.",
    services: "Compare offerings and identify the best fit.",
    portfolio: "Evaluate capability through examples.",
    reviews: "Validate quality through third-party proof.",
    team: "Trust the people delivering the service.",
    treatments: "Understand options and book or inquire.",
    generic: `Move one step closer to: ${brief.website_goal}.`,
  };

  return goals[role];
}

function buildExecutiveSummary(
  brief: WebsiteBrief,
  sitemap: string[],
  profile: BusinessProfile,
): string {
  const services = briefServices(brief);
  const locationLine = brief.location
    ? `Location: ${brief.location}.`
    : "Location: [PLACEHOLDER — not in brief].";

  return [
    "## Executive Summary",
    "",
    `${brief.business_name} — ${brief.industry}. ${locationLine}`,
    services.length
      ? `Offerings: ${services.join(", ")}.`
      : `Industry: ${brief.industry} (no specific services listed in brief).`,
    `Goal: ${brief.website_goal}.`,
    `Audience: ${brief.target_audience}.`,
    `USP: ${briefUsp(brief)}.`,
    `Architecture (${sitemap.length} pages): ${sitemap.join(" → ")}.`,
    `Primary CTA: ${primaryCta(brief, profile)}.`,
  ].join("\n");
}

function buildNavigationEntries(
  brief: WebsiteBrief,
  sitemap: string[],
  profile: BusinessProfile,
): string[] {
  return sitemap.map((page) => {
    const role = detectPageRole(page);
    return [
      `Page: ${page}`,
      `Purpose: ${pagePurpose(page, role, brief)}`,
      `User goal: ${pageUserGoal(role, brief)}`,
      `Main CTA: ${primaryCta(brief, profile)}`,
      `Internal links: ${internalLinksForPage(page, sitemap)}`,
    ].join(" | ");
  });
}

function slugFromPage(page: string): string {
  const role = detectPageRole(page);
  const slugMap: Partial<Record<PageRole, string>> = {
    home: "/",
    menu: "/menu",
    about: "/about",
    gallery: "/gallery",
    contact: "/contact",
    location: "/location",
    services: "/services",
    portfolio: "/portfolio",
    reviews: "/reviews",
    team: "/team",
    treatments: "/treatments",
  };

  if (slugMap[role]) {
    return slugMap[role]!;
  }

  return `/${page
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")}`;
}

function pageMetaTitle(page: string, brief: WebsiteBrief): string {
  const role = detectPageRole(page);
  const locationSuffix = brief.location ? ` | ${brief.location}` : "";

  const titles: Record<PageRole, string> = {
    home: `${brief.business_name} | ${brief.industry}${locationSuffix}`,
    menu: `Speisekarte | ${brief.business_name}`,
    about: `Über uns | ${brief.business_name}`,
    gallery: `Galerie | ${brief.business_name}`,
    contact: `Kontakt | ${brief.business_name}`,
    location: `Standort | ${brief.business_name}`,
    services: `Leistungen | ${brief.business_name}`,
    portfolio: `Portfolio | ${brief.business_name}`,
    reviews: `Bewertungen | ${brief.business_name}`,
    team: `Team | ${brief.business_name}`,
    treatments: `Behandlungen | ${brief.business_name}`,
    generic: `${page} | ${brief.business_name}`,
  };

  return titles[role];
}

function pageMetaDescription(
  page: string,
  role: PageRole,
  brief: WebsiteBrief,
): string {
  const goalSnippet = brief.website_goal.slice(0, 80);
  const descriptions: Record<PageRole, string> = {
    home: `${brief.business_name} — ${brief.industry}. ${briefUsp(brief).slice(0, 90)}. Ziel: ${goalSnippet}.`,
    menu: `Entdecken Sie das Angebot von ${brief.business_name}: ${briefServices(brief).join(", ") || "[PLACEHOLDER: Menüpunkte aus Brief]"}.`,
    about: `Erfahren Sie mehr über ${brief.business_name}, unsere Werte und ${briefUsp(brief).slice(0, 70)}.`,
    gallery: `Bilder und Eindrücke von ${brief.business_name}. [PLACEHOLDER: Client-Fotos einfügen].`,
    contact: `Kontaktieren Sie ${brief.business_name}. ${brief.website_goal.slice(0, 90)}.`,
    location: `Besuchen Sie ${brief.business_name}${brief.location ? ` in ${brief.location}` : ""}. [PLACEHOLDER: Adresse & Öffnungszeiten].`,
    services: `Leistungen von ${brief.business_name}: ${briefServices(brief).join(", ") || brief.industry}.`,
    portfolio: `Referenzen und Projekte von ${brief.business_name} für ${brief.target_audience}.`,
    reviews: `Kundenstimmen zu ${brief.business_name}. [PLACEHOLDER: echte Bewertungen einfügen].`,
    team: `Lernen Sie das Team von ${brief.business_name} kennen. [PLACEHOLDER: Teamdaten].`,
    treatments: `Behandlungen bei ${brief.business_name}. Termin vereinbaren.`,
    generic: `${page} — ${brief.business_name}. ${goalSnippet}.`,
  };

  return descriptions[role].slice(0, 160);
}


function buildDetailedPageSpecification(
  page: string,
  role: PageRole,
  brief: WebsiteBrief,
  sitemap: string[],
  profile: BusinessProfile,
): string[] {
  const input = {
    page,
    role,
    brief,
    profile,
    sitemap,
    detectPageRole,
    slugFromPage,
    pageMetaTitle,
    pageMetaDescription,
    primaryCta: primaryCta(brief, profile),
    secondaryCta: secondaryCta(brief, profile),
    usp: briefUsp(brief),
    style: briefStyle(brief),
    requestedFeatures: parseList(
      brief.required_features?.replace(/\r/g, "") ?? null,
    ),
    tier: detectStyleTier(brief),
    prefersMotion: prefersMotion(brief),
  };

  const pageCtx = createPageDnaContext(input);
  const pageDna = buildPageDnaSpecification(input);
  const pageDnaHierarchy = buildPageDnaHierarchyIntegration(pageCtx);
  const componentDna = buildPageComponentDna(pageCtx);
  const componentHierarchyRefs = buildComponentHierarchyRefs(pageCtx);
  const pageContentDna = buildPageContentDna(pageCtx);
  const pagePatternLibrary = buildPagePatternLibrary(pageCtx);
  const patternHierarchy = buildPatternLibraryHierarchyIntegration(pageCtx);
  const pageVisualHierarchy = buildPageVisualHierarchyBlock(pageCtx);

  return [
    ...pageDna,
    "",
    ...pageDnaHierarchy,
    "",
    ...componentDna,
    "",
    ...componentHierarchyRefs,
    "",
    ...pageContentDna,
    "",
    ...pagePatternLibrary,
    "",
    ...patternHierarchy,
    "",
    ...pageVisualHierarchy,
  ];
}

function buildPageSpecifications(
  brief: WebsiteBrief,
  sitemap: string[],
  profile: BusinessProfile,
): Record<string, string[]> {
  const specs: Record<string, string[]> = {};

  for (const page of sitemap) {
    specs[page] = buildDetailedPageSpecification(
      page,
      detectPageRole(page),
      brief,
      sitemap,
      profile,
    );
  }

  return specs;
}

function buildContentDnaContext(
  brief: WebsiteBrief,
  profile: BusinessProfile,
  sitemap: string[],
): ContentDnaContext {
  return {
    brief,
    profile,
    sitemap,
    services: briefServices(brief),
    primaryCta: primaryCta(brief, profile),
    secondaryCta: secondaryCta(brief, profile),
    usp: briefUsp(brief),
    style: briefStyle(brief),
    tier: detectStyleTier(brief),
    requestedFeatures: parseList(
      brief.required_features?.replace(/\r/g, "") ?? null,
    ),
  };
}

function buildFeatures(
  brief: WebsiteBrief,
  profile: BusinessProfile,
  sitemap: string[],
): string[] {
  const requested = parseList(brief.required_features?.replace(/\r/g, "") ?? null);
  const contentDna = buildGlobalContentDnaItems(
    buildContentDnaContext(brief, profile, sitemap),
  );

  const conversion = [
    "# Conversion Strategy",
    `Primary CTA: ${primaryCta(brief, profile)}`,
    `Secondary CTA: ${secondaryCta(brief, profile)}`,
    "Trust elements: brief USP block, testimonials placeholders, quality badges, transparent contact details.",
    `Social proof: reviews/testimonials section for ${brief.target_audience}.`,
    "Urgency: only use if explicitly stated in brief; otherwise avoid fake urgency.",
    "Contact opportunities: header CTA, hero CTA, footer contact, sticky mobile CTA.",
    `Lead generation: align forms and CTAs with goal — ${brief.website_goal}.`,
  ];

  return [
    ...contentDna,
    ...buildMotionDna(brief),
    ...conversion,
    ...requested.map((feature) => `Required feature from brief: ${feature}`),
    "Apply Design System DNA tokens consistently across all components",
    "Follow UX DNA journey and CTA placement on every page",
  ];
}

function buildSeoStrategy(brief: WebsiteBrief, sitemap: string[]): string[] {
  const locationKeyword = brief.location ? ` ${brief.location}` : "";
  const services = briefServices(brief);
  const keywordBase = [
    brief.business_name,
    brief.industry,
    ...services,
    brief.location ?? "",
  ]
    .filter(Boolean)
    .join(", ");

  return [
    "# 7. SEO Strategy",
    `Title strategy: "${brief.business_name} | ${brief.industry}${locationKeyword}" on Home; unique title per page with page intent + brand.`,
    `Meta descriptions: mention ${brief.target_audience} and ${brief.website_goal.toLowerCase()} on Home; unique per page, 150–160 chars.`,
    "Heading hierarchy: exactly one H1 per page; logical H2/H3 structure matching section order.",
    `Internal linking: connect ${sitemap.join(" ↔ ")} using contextual text links in body copy and footer.`,
    brief.location
      ? `Local SEO: embed ${brief.location} in titles, meta, footer NAP block, and map section.`
      : "Local SEO: not specified in brief — skip geo-specific schema until location is confirmed.",
    `Structured data: LocalBusiness or Restaurant schema if ${brief.industry} fits; WebSite + BreadcrumbList sitewide.`,
    "Performance recommendations: optimize images (WebP/AVIF), lazy-load below fold, preload hero, minimize JS bundle.",
    `Target keywords from brief: ${keywordBase}.`,
    `Indexable pages: ${sitemap.join(", ")}.`,
  ];
}

function buildTechnicalRecommendations(
  brief: WebsiteBrief,
  sitemap: string[],
): string {
  const requested = parseList(brief.required_features?.replace(/\r/g, "") ?? null);

  return [
    "# Technical Recommendations",
    "",
    "## Website DNA implementation",
    "Implement Design System DNA as Tailwind theme extensions or CSS variables — single source of truth for colors, spacing, radius, shadows, typography.",
    "Implement Motion DNA with CSS transitions and intersection observer; respect prefers-reduced-motion.",
    "Follow UX DNA conversion flow and CTA placement on every page template.",
    "",
    "## Stack",
    "Next.js App Router, TypeScript, Tailwind CSS — as defined by AIOS conventions.",
    "",
    "## Components",
    "SiteHeader, SiteFooter, HeroSection, SectionHeading, FeatureGrid, GalleryGrid, ContactForm, CTAButton, TestimonialCarousel, FAQAccordion, MapEmbed.",
    "",
    "## Reusable sections",
    "Compose each page from shared section components driven by typed content modules per page slug.",
    "",
    "## CMS recommendations",
    "Store page copy in typed TS/JSON content modules for v1; optional headless CMS later for menu/items.",
    "",
    "## Performance optimizations",
    "Static generation for marketing pages, next/image, font subsetting, route-level metadata, minimal client JS.",
    "",
    "## Image optimization",
    "Provide width/height, responsive sizes, priority only for LCP hero image.",
    "",
    "## Lazy loading",
    "Lazy-load gallery and below-fold images; defer noncritical scripts.",
    "",
    "## Accessibility",
    "Semantic HTML, labels for all inputs, focus management in dialogs/mobile menu, aria attributes for accordion and lightbox.",
    "",
    "## Pages to implement",
    sitemap.join(", "),
    requested.length
      ? `\n## Required features from brief\n${requested.join("\n")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildDevelopmentNotes(
  brief: WebsiteBrief,
  sitemap: string[],
): string[] {
  const notes = [
    "# Development Notes",
    "Implement Website DNA before page builds: Business DNA → Design System DNA tokens → Motion DNA → UX DNA → Page DNA → Component DNA.",
    "Implement one reusable component per Component DNA type; compose pages from content modules.",
    "Apply Motion DNA via CSS transitions; gate behind prefers-reduced-motion.",
    "Implement pages in sitemap order; start with shared layout, tokens, and section components.",
    "Map each page to a typed content file — do not hardcode copy inside components.",
    "Use brief-provided copy verbatim where available; otherwise neutral placeholders clearly marked [PLACEHOLDER].",
    "Do not invent prices, team names, addresses, or awards not present in the brief.",
    `Primary business: ${brief.business_name}; industry: ${brief.industry}.`,
    `Verify all CTAs align with goal: ${brief.website_goal}.`,
    ...sitemap.map((page) => `Build route and content module for page: ${page}.`),
    "Add metadata export per page for SEO section requirements.",
    "Test mobile-first (375px), then tablet and desktop breakpoints.",
    "Validate forms with accessible error states per UX DNA.",
    "Run Lighthouse performance and accessibility checks before handoff.",
  ];

  if (brief.reference_websites?.trim()) {
    notes.push(
      `Compare spacing, typography rhythm, and animation restraint with references: ${referencesLine(brief)}.`,
    );
  }

  if (brief.additional_notes?.trim()) {
    notes.push(`Brief implementation notes: ${brief.additional_notes.trim()}`);
  }

  return notes;
}

function buildMasterPrompt(
  brief: WebsiteBrief,
  sections: {
    businessDna: string;
    executiveSummary: string;
    visualDna: string;
    designSystemDna: string;
    uxDna: string;
    contentDna: string;
    patternLibrary: string;
    visualHierarchy: string;
    motionDna: string[];
    navigation: string[];
    pageSpecs: Record<string, string[]>;
    features: string[];
    seo: string[];
    technical: string;
    developmentNotes: string[];
  },
): string {
  const pageSpecBlocks = Object.entries(sections.pageSpecs)
    .map(
      ([page, items]) =>
        `### Page: ${page}\n${items.map((item) => `- ${item}`).join("\n")}`,
    )
    .join("\n\n");

  return [
    "# Website DNA & Build Specification",
    "",
    "You are an expert frontend engineer and product designer.",
    "Build the complete marketing website from this Website DNA specification alone.",
    "Do not ask clarifying questions. Use [PLACEHOLDER] where the brief lacks data.",
    "Never invent business facts, prices, staff names, or locations not in the brief.",
    "",
    "---",
    "",
    sections.businessDna,
    "",
    sections.executiveSummary,
    "",
    sections.visualDna,
    "",
    sections.designSystemDna,
    "",
    sections.uxDna,
    "",
    sections.contentDna,
    "",
    sections.patternLibrary,
    "",
    sections.visualHierarchy,
    "",
    "# Motion DNA",
    "",
    ...sections.motionDna.map((item) => `- ${item}`),
    "",
    "# Navigation Structure",
    "",
    ...sections.navigation.map((entry) => `- ${entry}`),
    "",
    "# Page DNA Specifications",
    "",
    pageSpecBlocks,
    "",
    "# Conversion, Motion & Features",
    "",
    ...sections.features.map((item) => `- ${item}`),
    "",
    "# SEO Strategy",
    "",
    ...sections.seo.map((item) => `- ${item}`),
    "",
    sections.technical,
    "",
    "# Development Notes",
    "",
    ...sections.developmentNotes.map((item) => `- ${item}`),
    "",
    "---",
    "",
    "## Source Brief Snapshot",
    `- Business: ${brief.business_name}`,
    `- Industry: ${brief.industry}`,
    brief.location ? `- Location: ${brief.location}` : null,
    `- Goal: ${brief.website_goal}`,
    `- Audience: ${brief.target_audience}`,
    brief.services ? `- Services:\n${brief.services}` : null,
    brief.unique_selling_points ? `- USP: ${brief.unique_selling_points}` : null,
    brief.preferred_style ? `- Style: ${brief.preferred_style}` : null,
    brief.primary_color ? `- Primary color: ${brief.primary_color}` : null,
    brief.secondary_color ? `- Secondary color: ${brief.secondary_color}` : null,
    brief.reference_websites ? `- References: ${brief.reference_websites}` : null,
    brief.required_features ? `- Features: ${brief.required_features}` : null,
    brief.additional_notes ? `- Notes: ${brief.additional_notes}` : null,
    "",
    "## Delivery checklist",
    "- Next.js + TypeScript + Tailwind CSS",
    "- Design System DNA tokens + Component DNA reusable components implemented",
    "- Motion DNA with prefers-reduced-motion support",
    "- All pages in sitemap implemented",
    "- Responsive, accessible, SEO metadata complete",
    "- Reusable components; no monolithic page files",
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}

export function generateWebsiteBlueprintContent(
  brief: WebsiteBrief,
): WebsiteBlueprintContent {
  ensureWebsiteEngineBootstrapped();
  const profile = detectBusinessProfile(brief.industry, brief.business_name);
  const recommendedSitemap = resolveSitemap(brief);
  const recommendedPageSections = buildPageSpecifications(
    brief,
    recommendedSitemap,
    profile,
  );

  const executiveSummary = buildExecutiveSummary(
    brief,
    recommendedSitemap,
    profile,
  );
  const businessDna = buildBusinessDna(brief, profile, recommendedSitemap);
  const visualDna = buildVisualDna(brief);
  const uxDna = buildUxDna(brief, profile, recommendedSitemap);
  const motionDna = buildMotionDna(brief);
  const navigation = buildNavigationEntries(
    brief,
    recommendedSitemap,
    profile,
  );
  const contentDnaContext = buildContentDnaContext(
    brief,
    profile,
    recommendedSitemap,
  );
  const features = buildFeatures(brief, profile, recommendedSitemap);
  const seoBasics = buildSeoStrategy(brief, recommendedSitemap);
  const designSystemDna = buildDesignSystemDna({
    brief,
    profile,
    tier: detectStyleTier(brief),
    prefersMotion: prefersMotion(brief),
    primary: primaryColor(brief),
    secondary: secondaryColor(brief),
    style: briefStyle(brief),
    primaryCta: primaryCta(brief, profile),
  });
  const technicalStack = buildTechnicalRecommendations(
    brief,
    recommendedSitemap,
  );
  const technicalRecommendation = `${designSystemDna}\n\n---\n\n${technicalStack}`;
  const developmentNotes = buildDevelopmentNotes(
    brief,
    recommendedSitemap,
  );
  const implementationChecklist = [
    ...buildBlueprintIntelligenceChecklistItems(brief),
    ...developmentNotes,
  ];

  const patternLibraryContext = createPatternLibraryContext({
    brief,
    profile,
    tier: detectStyleTier(brief),
    prefersMotion: prefersMotion(brief),
    primaryCta: primaryCta(brief, profile),
    secondaryCta: secondaryCta(brief, profile),
  });

  const masterPrompt = [
    buildBlueprintIntelligenceMarkdown(brief),
    "",
    "---",
    "",
    buildMasterPrompt(brief, {
      businessDna,
      executiveSummary,
      visualDna,
      designSystemDna,
      uxDna,
      contentDna: buildGlobalContentDnaMarkdown(contentDnaContext),
      patternLibrary: buildGlobalPatternLibraryMarkdown(patternLibraryContext),
      visualHierarchy: buildVisualHierarchyEngineOverview().join("\n"),
      motionDna,
      navigation,
      pageSpecs: recommendedPageSections,
      features,
      seo: seoBasics,
      technical: technicalStack,
      developmentNotes,
    }),
  ].join("\n");

  return enforceBlueprintLimits({
    projectSummary: `${businessDna}\n\n${executiveSummary}`,
    targetAudienceSummary: uxDna,
    brandDirection: visualDna,
    recommendedSitemap,
    recommendedPageSections,
    features,
    contentRequirements: navigation,
    seoBasics,
    technicalRecommendation,
    implementationChecklist,
    masterPrompt,
  });
}
