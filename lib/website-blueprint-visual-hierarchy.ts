import type { PageDnaContext, PageRole, PageSectionSpec } from "@/lib/website-blueprint-page-dna";
import {
  getComponentTreeNodes,
  getPageSections,
  pageBusinessGoal,
  pageConversionGoal,
  pageUserIntent,
} from "@/lib/website-blueprint-page-dna";
import {
  type PatternId,
  resolvePatternId,
} from "@/lib/website-blueprint-pattern-library";

export type HierarchyLevel =
  | "dominant"
  | "primary"
  | "secondary"
  | "supporting"
  | "utility";

export type VisualWeight =
  | "very-high"
  | "high"
  | "medium"
  | "low"
  | "minimal";

export type ContentPriority = "critical" | "high" | "medium" | "low";
export type CTAImportance = "dominant" | "primary" | "secondary" | "tertiary" | "inline" | "none";
export type MediaPriority = "lcp" | "high" | "medium" | "low" | "decorative";
export type MotionPriority = "dominant" | "supporting" | "utility" | "none";
export type DensityLevel = "spacious" | "balanced" | "compact" | "utility-dense";
export type WhitespaceLevel = "generous" | "balanced" | "tight";

export type ReadingFlow =
  | "F-pattern"
  | "Z-pattern"
  | "centered editorial"
  | "linear narrative"
  | "alternating split layout"
  | "card scanning"
  | "task-focused utility flow";

export type SectionEmphasis =
  | "size"
  | "contrast"
  | "position"
  | "whitespace"
  | "media-scale"
  | "background-change"
  | "border-treatment"
  | "elevation"
  | "motion"
  | "repetition";

export type HierarchyDecision = {
  element: string;
  hierarchyLevel: HierarchyLevel;
  visualWeight: VisualWeight;
  businessReason: string;
  userIntentReason: string;
  conversionReason: string;
  typographyTreatment: string;
  spacingTreatment: string;
  colorTreatment: string;
  mediaTreatment: string;
  motionTreatment: string;
  responsiveBehavior: string;
  accessibilityConsiderations: string;
  implementationNotes: string;
};

export type SectionPrioritySpec = {
  sectionName: string;
  patternId: PatternId;
  priorityScore: number;
  hierarchyLevel: HierarchyLevel;
  visualWeight: VisualWeight;
  recommendedOrder: number;
  reasonForPlacement: string;
  changeConditions: string;
};

export type PageObjectiveAnalysis = {
  primaryObjective: string;
  secondaryObjective: string;
  primaryUserAction: string;
  secondaryUserAction: string;
  primaryInformationNeed: string;
  mainTrustRequirement: string;
  mainFrictionPoint: string;
  expectedReadingDepth: string;
  conversionIntensity: string;
};

export type HierarchyScores = {
  clarity: number;
  focus: number;
  scanability: number;
  conversionHierarchy: number;
  typographyHierarchy: number;
  mediaBalance: number;
  mobileHierarchy: number;
  accessibilityHierarchy: number;
  overall: number;
  mainStrength: string;
  mainWeakness: string;
  highestPriorityImprovement: string;
};

export type VisualConflict = {
  severity: "critical" | "high" | "medium" | "low";
  affectedPage: string;
  affectedSections: string;
  reason: string;
  recommendedResolution: string;
};

export type PageHierarchySpecification = {
  page: string;
  role: PageRole;
  objectives: PageObjectiveAnalysis;
  readingFlow: ReadingFlow;
  dominantCta: string;
  sectionPriorities: SectionPrioritySpec[];
  hierarchyDecisions: HierarchyDecision[];
  scores: HierarchyScores;
  conflicts: VisualConflict[];
};

export const VALID_PATTERN_IDS: PatternId[] = [
  "hero",
  "feature-grid",
  "usp-block",
  "statistics",
  "gallery",
  "testimonials",
  "faq",
  "cta-banner",
  "pricing",
  "timeline",
  "team",
  "location",
  "footer",
  "navbar",
  "menu-grid",
  "reservation-block",
];

const DESIGN_TOKENS = {
  typography: [
    "displayXL",
    "displayL",
    "h1",
    "h2",
    "h3",
    "h4",
    "bodyLarge",
    "body",
    "bodySmall",
    "label",
    "caption",
    "button",
  ],
  color: [
    "color.background",
    "color.surface",
    "color.surfaceElevated",
    "color.primary",
    "color.accent",
    "color.muted",
    "color.border",
    "color.error",
  ],
  spacing: ["spacing.section", "spacing.block", "spacing.inline", "spacing.stack"],
} as const;

function clampScore(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function haystack(ctx: PageDnaContext): string {
  return [
    ctx.brief.additional_notes ?? "",
    ctx.brief.website_goal,
    ctx.brief.required_features ?? "",
    ctx.brief.required_pages ?? "",
  ]
    .join(" ")
    .toLowerCase();
}

function hasTestimonials(ctx: PageDnaContext): boolean {
  return /testimonial|review|bewertung|kundenstimme/i.test(haystack(ctx));
}

function hasAddress(ctx: PageDnaContext): boolean {
  return Boolean(ctx.brief.location?.trim());
}

const VALID_PATTERN_ID_SET = new Set<string>(VALID_PATTERN_IDS);

function hasPhone(ctx: PageDnaContext): boolean {
  return /(\+?\d[\d\s\-/]{6,}\d)/.test(ctx.brief.additional_notes ?? "");
}

function hasGalleryMedia(ctx: PageDnaContext): boolean {
  return /bild|foto|photo|image|galerie|gallery/i.test(haystack(ctx));
}

function hasOrderFeature(ctx: PageDnaContext): boolean {
  return (
    /bestell|order|shop/i.test(ctx.brief.website_goal) ||
    ctx.requestedFeatures.some((feature) => /bestell|order|shop/i.test(feature))
  );
}

function scoreToHierarchyLevel(score: number, isHeroOrFinalCta: boolean): HierarchyLevel {
  if (isHeroOrFinalCta && score >= 80) {
    return "dominant";
  }
  if (score >= 75) {
    return "primary";
  }
  if (score >= 55) {
    return "secondary";
  }
  if (score >= 35) {
    return "supporting";
  }
  return "utility";
}

function scoreToVisualWeight(level: HierarchyLevel): VisualWeight {
  const map: Record<HierarchyLevel, VisualWeight> = {
    dominant: "very-high",
    primary: "high",
    secondary: "medium",
    supporting: "low",
    utility: "minimal",
  };
  return map[level];
}

function roleBaseWeight(sectionName: string, role: PageRole): number {
  const weights: Partial<Record<string, Partial<Record<PageRole, number>>>> = {
    TrustBar: { home: 22, generic: 10 },
    FeaturedItems: { home: 20, menu: 18, services: 18 },
    USPGrid: { home: 18, about: 16 },
    TestimonialSection: { home: 12, reviews: 24 },
    GalleryTeaser: { home: 14, gallery: 22 },
    FinalCTA: { home: 20, about: 18, menu: 16, contact: 12, generic: 14 },
    MenuOrderCTA: { menu: 22 },
    ContactForm: { contact: 24 },
    MapEmbed: { contact: 14, location: 22 },
    BrandStory: { about: 22 },
  };

  return weights[sectionName]?.[role] ?? weights[sectionName]?.generic ?? 8;
}

function conversionRelevance(sectionName: string, ctx: PageDnaContext): number {
  if (/CTA|Order|ContactForm|Navigate/i.test(sectionName)) {
    return 18;
  }
  if (/Featured|MenuCategory/i.test(sectionName) && hasOrderFeature(ctx)) {
    return 14;
  }
  if (/Trust|USP|Quality|Reviews/i.test(sectionName)) {
    return 10;
  }
  return 0;
}

function missingInfoPenalty(sectionName: string, ctx: PageDnaContext): number {
  let penalty = 0;
  if (/Testimonial|Reviews/i.test(sectionName) && !hasTestimonials(ctx)) {
    penalty += 28;
  }
  if (/Map|Location|Address|Directions/i.test(sectionName) && !hasAddress(ctx)) {
    penalty += 30;
  }
  if (/Gallery|Lightbox|Instagram/i.test(sectionName) && !hasGalleryMedia(ctx)) {
    penalty += 18;
  }
  return penalty;
}

function patternWeight(patternId: PatternId): number {
  const weights: Partial<Record<PatternId, number>> = {
    hero: 6,
    "cta-banner": 5,
    "reservation-block": 5,
    testimonials: 3,
    gallery: 3,
    location: 3,
    faq: 2,
    footer: 0,
    navbar: 1,
  };
  return weights[patternId] ?? 2;
}

function positionScore(index: number, total: number): number {
  if (total <= 1) {
    return 20;
  }
  const normalized = 1 - index / (total - 1);
  return Math.round(normalized * 18);
}

export function computeSectionPriorityScore(
  section: PageSectionSpec,
  index: number,
  total: number,
  ctx: PageDnaContext,
  patternId: PatternId,
): number {
  const score =
    40 +
    roleBaseWeight(section.name, ctx.role) +
    positionScore(index, total) +
    conversionRelevance(section.name, ctx) +
    patternWeight(patternId) -
    missingInfoPenalty(section.name, ctx);

  return clampScore(score);
}

export function analyzePageObjectives(ctx: PageDnaContext): PageObjectiveAnalysis {
  const trustGap = !hasTestimonials(ctx)
    ? "Verified testimonials [PLACEHOLDER]"
    : `USP: ${ctx.usp.slice(0, 80)}`;

  return {
    primaryObjective: pageBusinessGoal(ctx.role, ctx.brief, ctx.profile),
    secondaryObjective: pageUserIntent(ctx.role, ctx.brief),
    primaryUserAction: ctx.primaryCta,
    secondaryUserAction: ctx.secondaryCta,
    primaryInformationNeed:
      ctx.role === "menu"
        ? `Browse offerings: ${ctx.services.slice(0, 4).join(", ") || "[PLACEHOLDER: menu]"}`
        : `${ctx.brief.business_name} — ${ctx.brief.industry}`,
    mainTrustRequirement: trustGap,
    mainFrictionPoint: hasOrderFeature(ctx)
      ? "Order path clarity without invented pricing"
      : "Contact/visit details when address or phone missing from brief",
    expectedReadingDepth:
      ctx.role === "contact" || ctx.role === "location"
        ? "Shallow — task completion"
        : ctx.role === "about"
          ? "Medium — narrative scroll"
          : ctx.role === "menu"
            ? "Deep scan — category browsing"
            : "Medium — hero scan then selective sections",
    conversionIntensity: pageConversionGoal(ctx.role, ctx.brief, ctx.primaryCta).includes("Drive")
      ? "High"
      : /order|book|contact/i.test(ctx.brief.website_goal)
        ? "Medium-high"
        : "Medium",
  };
}

function selectReadingFlow(role: PageRole): ReadingFlow {
  const flows: Record<PageRole, ReadingFlow> = {
    home: "Z-pattern",
    menu: "card scanning",
    about: "linear narrative",
    gallery: "card scanning",
    contact: "task-focused utility flow",
    location: "task-focused utility flow",
    services: "alternating split layout",
    portfolio: "card scanning",
    reviews: "centered editorial",
    team: "card scanning",
    treatments: "linear narrative",
    generic: "F-pattern",
  };
  return flows[role];
}

function buildSectionPriorities(ctx: PageDnaContext): SectionPrioritySpec[] {
  const sections = getPageSections(ctx);
  return sections.map((section, index) => {
    const patternId = resolvePatternId(section.name, ctx);
    const score = computeSectionPriorityScore(section, index, sections.length, ctx, patternId);
    const isHeroLike = /Intro|TrustBar|Featured|BrandStory|PageIntro/i.test(section.name);
    const isFinal = /FinalCTA|OrderCTA|NavigateCTA/i.test(section.name);
    const level = scoreToHierarchyLevel(score, isHeroLike || isFinal);

    return {
      sectionName: section.name,
      patternId,
      priorityScore: score,
      hierarchyLevel: level,
      visualWeight: scoreToVisualWeight(level),
      recommendedOrder: index + 1,
      reasonForPlacement: sectionOrderingReason(ctx.role, section.name, index),
      changeConditions: changeConditions(section.name, ctx),
    };
  });
}

function sectionOrderingReason(role: PageRole, sectionName: string, index: number): string {
  const rules: Partial<Record<PageRole, string>> = {
    home:
      "Homepage rule: offer/trust near top; FAQ after core value; Final CTA before footer.",
    menu:
      "Menu rule: category navigation before long lists; order path visible; dietary notes near items.",
    about:
      "About rule: brand story before team placeholders; trust before final CTA.",
    contact:
      "Contact rule: primary contact path before secondary info; map high only when address confirmed.",
  };

  const base = rules[role] ?? "Page-specific order from Page DNA §3.";
  return `${base} Position ${index + 1}: ${sectionName}.`;
}

function changeConditions(sectionName: string, ctx: PageDnaContext): string {
  if (/Testimonial|Reviews/i.test(sectionName)) {
    return hasTestimonials(ctx)
      ? "Increase emphasis when verified quotes supplied."
      : "Keep supporting weight until client testimonials confirmed.";
  }
  if (/Map|Location|Address/i.test(sectionName)) {
    return hasAddress(ctx)
      ? "Raise to primary when full address verified."
      : "Do not raise above secondary until address in brief.";
  }
  return "Adjust if brief adds missing assets or changes conversion goal.";
}

function buildHeroDecision(ctx: PageDnaContext): HierarchyDecision {
  return {
    element: "Hero",
    hierarchyLevel: "dominant",
    visualWeight: "very-high",
    businessReason: `Communicate ${ctx.brief.business_name} offer for ${ctx.brief.target_audience}.`,
    userIntentReason: pageUserIntent(ctx.role, ctx.brief),
    conversionReason: `Primary action: ${ctx.primaryCta} aligned with ${ctx.brief.website_goal}.`,
    typographyTreatment: "Eyebrow: label token | H1: h1 or displayL | Lead: bodyLarge",
    spacingTreatment: ctx.tier === "premium" ? "spacing.section generous" : "spacing.section balanced",
    colorTreatment: "Dominant surface background; accent reserved for primary CTA only.",
    mediaTreatment: hasGalleryMedia(ctx)
      ? "Hero media LCP candidate 16:9 [PLACEHOLDER asset]"
      : "Text-first hero; media slot placeholder — no video-first layout.",
    motionTreatment: ctx.prefersMotion
      ? "One dominant hero reveal; Motion DNA durationNormal"
      : "Static hero; reduced-motion safe.",
    responsiveBehavior: "Mobile: stack copy then media; single dominant CTA full-width.",
    accessibilityConsiderations: "One H1; CTA min 44px; contrast AA on scrim if image background.",
    implementationNotes: "Reference Pattern Library hero pattern; do not duplicate Page DNA §2 prose.",
  };
}

function buildSectionDecision(
  priority: SectionPrioritySpec,
  ctx: PageDnaContext,
): HierarchyDecision {
  return {
    element: priority.sectionName,
    hierarchyLevel: priority.hierarchyLevel,
    visualWeight: priority.visualWeight,
    businessReason: `Supports ${ctx.brief.website_goal.slice(0, 80)}.`,
    userIntentReason: pageUserIntent(ctx.role, ctx.brief).slice(0, 100),
    conversionReason: /CTA|Order|Contact/i.test(priority.sectionName)
      ? `Conversion section — ${ctx.primaryCta}`
      : "Supports trust or information before action.",
    typographyTreatment: `Section H2: h2 token | body: body/bodySmall per Design System DNA`,
    spacingTreatment:
      priority.hierarchyLevel === "dominant" || priority.hierarchyLevel === "primary"
        ? "spacing.section + whitespace generous"
        : "spacing.block balanced",
    colorTreatment:
      priority.hierarchyLevel === "primary"
        ? "Elevated surface optional; accent on CTA only"
        : "Muted zone — minimal accent",
    mediaTreatment: /Gallery|Featured|MenuCategory/i.test(priority.sectionName)
      ? "Media priority medium; lazy-load below fold unless hero"
      : "Text-first; decorative media minimal",
    motionTreatment:
      priority.hierarchyLevel === "dominant"
        ? "Max one motion moment — scroll reveal"
        : "Supporting motion only or none",
    responsiveBehavior: "Follow Pattern Library responsive for pattern " + priority.patternId,
    accessibilityConsiderations: "Preserve DOM order = reading order; heading level follows Page DNA.",
    implementationNotes: `Pattern: ${priority.patternId} | Priority score: ${priority.priorityScore} (deterministic formula).`,
  };
}

export function buildPageHierarchySpecification(
  ctx: PageDnaContext,
): PageHierarchySpecification {
  const sectionPriorities = buildSectionPriorities(ctx);
  const heroDecision = buildHeroDecision(ctx);
  const sectionDecisions = sectionPriorities.map((priority) =>
    buildSectionDecision(priority, ctx),
  );
  const objectives = analyzePageObjectives(ctx);
  const readingFlow = selectReadingFlow(ctx.role);
  const conflicts = detectVisualConflicts(ctx, sectionPriorities);
  const scores = computeHierarchyScores(ctx, sectionPriorities, conflicts);

  return {
    page: ctx.page,
    role: ctx.role,
    objectives,
    readingFlow,
    dominantCta: ctx.primaryCta,
    sectionPriorities,
    hierarchyDecisions: [heroDecision, ...sectionDecisions],
    scores,
    conflicts,
  };
}

function detectVisualConflicts(
  ctx: PageDnaContext,
  priorities: SectionPrioritySpec[],
): VisualConflict[] {
  const conflicts: VisualConflict[] = [];
  const dominantSections = priorities.filter((item) => item.hierarchyLevel === "dominant");
  const highCtaSections = priorities.filter((item) =>
    /CTA|Order|Final|Navigate/i.test(item.sectionName),
  );

  if (dominantSections.length > 2) {
    conflicts.push({
      severity: "high",
      affectedPage: ctx.page,
      affectedSections: dominantSections.map((item) => item.sectionName).join(", "),
      reason: "Too many high-emphasis sections marked dominant.",
      recommendedResolution: "Limit to hero + one conversion band per viewport.",
    });
  }

  if (highCtaSections.filter((item) => item.priorityScore >= 75).length > 2) {
    conflicts.push({
      severity: "medium",
      affectedPage: ctx.page,
      affectedSections: highCtaSections.map((item) => item.sectionName).join(", "),
      reason: "Multiple competing high-priority CTA sections.",
      recommendedResolution: "One dominant CTA per viewport; demote duplicates to secondary.",
    });
  }

  priorities.forEach((item) => {
    if (/Testimonial|Reviews/i.test(item.sectionName) && !hasTestimonials(ctx) && item.priorityScore >= 60) {
      conflicts.push({
        severity: "medium",
        affectedPage: ctx.page,
        affectedSections: item.sectionName,
        reason: "Testimonials emphasized without confirmed testimonials in brief.",
        recommendedResolution: "Lower to supporting until [PLACEHOLDER] quotes verified.",
      });
    }
    if (/Map|Location|Address/i.test(item.sectionName) && !hasAddress(ctx) && item.priorityScore >= 55) {
      conflicts.push({
        severity: "high",
        affectedPage: ctx.page,
        affectedSections: item.sectionName,
        reason: "Map/location emphasized without confirmed address.",
        recommendedResolution: "Use [PLACEHOLDER] and reduce map visual weight until address supplied.",
      });
    }
    if (/Gallery|Lightbox/i.test(item.sectionName) && !hasGalleryMedia(ctx) && item.priorityScore >= 55) {
      conflicts.push({
        severity: "low",
        affectedPage: ctx.page,
        affectedSections: item.sectionName,
        reason: "Gallery emphasized without confirmed media assets.",
        recommendedResolution: "Placeholder grid with clear asset checklist.",
      });
    }
  });

  if (ctx.role === "menu" && hasOrderFeature(ctx)) {
    const stickyCandidates = priorities.filter((item) =>
      /OrderCTA|MenuOrder/i.test(item.sectionName),
    );
    if (stickyCandidates.length > 1) {
      conflicts.push({
        severity: "medium",
        affectedPage: ctx.page,
        affectedSections: stickyCandidates.map((item) => item.sectionName).join(", "),
        reason: "Excessive sticky/order CTAs may compete.",
        recommendedResolution: "Single mobile sticky CTA; avoid duplicate sticky bars.",
      });
    }
  }

  return conflicts;
}

function computeHierarchyScores(
  ctx: PageDnaContext,
  priorities: SectionPrioritySpec[],
  conflicts: VisualConflict[],
): HierarchyScores {
  const uspComplete = Boolean(ctx.brief.unique_selling_points?.trim());
  const clarity = clampScore(
    45 +
      (uspComplete ? 20 : 0) +
      (ctx.brief.website_goal.trim().length > 15 ? 15 : 5) +
      (priorities[0]?.priorityScore ?? 0) * 0.2,
  );
  const focus = clampScore(90 - conflicts.length * 12 - priorities.filter((p) => p.hierarchyLevel === "dominant").length * 8);
  const scanability = clampScore(
    50 + (ctx.tier === "premium" ? 15 : 8) + (priorities.length <= 8 ? 15 : 5),
  );
  const conversionHierarchy = clampScore(
    40 +
      (hasOrderFeature(ctx) && ctx.role === "menu" ? 25 : 15) +
      priorities.filter((p) => /CTA|Order|Final/i.test(p.sectionName)).length * 5,
  );
  const typographyHierarchy = clampScore(uspComplete ? 78 : 65);
  const mediaBalance = clampScore(
    hasGalleryMedia(ctx) ? 72 : 58 - (priorities.filter((p) => /Gallery/i.test(p.sectionName)).length * 5),
  );
  const mobileHierarchy = clampScore(70 + (ctx.role === "contact" ? 10 : 0));
  const accessibilityHierarchy = clampScore(75 - conflicts.filter((c) => c.severity === "critical").length * 10);

  const overall = clampScore(
    (clarity +
      focus +
      scanability +
      conversionHierarchy +
      typographyHierarchy +
      mediaBalance +
      mobileHierarchy +
      accessibilityHierarchy) /
      8,
  );

  const mainStrength =
    focus >= 75
      ? "Clear focus hierarchy with limited dominant zones."
      : clarity >= 75
        ? "Strong offer clarity from brief goal and USP."
        : "Structured section order aligned with Page DNA.";

  const mainWeakness =
    conflicts.length > 0
      ? `${conflicts.length} visual conflict(s) — see conflict report.`
      : !hasAddress(ctx) && /contact|location/i.test(ctx.role)
        ? "Contact/location pages lack verified address in brief."
        : !hasTestimonials(ctx)
          ? "Social proof sections must stay placeholder-weighted."
          : "Monitor accent usage — avoid multiple primary CTAs per viewport.";

  const highestPriorityImprovement =
    conflicts[0]?.recommendedResolution ??
    (!hasAddress(ctx) ? "Provide address before raising map emphasis." : "Supply missing assets marked [PLACEHOLDER].");

  return {
    clarity,
    focus,
    scanability,
    conversionHierarchy,
    typographyHierarchy,
    mediaBalance,
    mobileHierarchy,
    accessibilityHierarchy,
    overall,
    mainStrength,
    mainWeakness,
    highestPriorityImprovement,
  };
}

function formatTypographyHierarchy(ctx: PageDnaContext): string[] {
  const tierScale =
    ctx.tier === "premium" ? "displayXL/displayL for hero" : "displayL/h1 for hero";

  return [
    "## 6. Typography Hierarchy (Design System DNA tokens)",
    `- Eyebrow | Importance: medium | Token: label | Max lines: 1 | Max width: 40ch | Align: start | Contrast: muted | Scale: ${tierScale} | Wrap: no truncate`,
    `- H1 | Importance: dominant | Token: h1 | Max lines: 2 | Max width: 14–18ch headline | Align: start/center hero | Contrast: high | Scale: fluid clamp | Wrap: balance`,
    `- Lead paragraph | Token: bodyLarge | Max lines: 3 | Max width: 65ch | Contrast: high | Scale: md+`,
    `- Section heading | Token: h2 | Max lines: 2 | Max width: 50ch | Align: start`,
    `- Card heading | Token: h3/h4 | Max lines: 2 | Max width: 30ch`,
    `- Supporting text | Token: body/bodySmall | Max width: 65ch prose`,
    `- Utility text | Token: caption/label | Contrast: muted`,
    `- CTA label | Token: button | Max lines: 1 | No truncation`,
    `- Metadata | Token: caption | Contrast: muted | SEO/meta only`,
    `- Reference tokens: ${DESIGN_TOKENS.typography.join(", ")} — do not create conflicting sizes.`,
  ];
}

function formatCtaHierarchy(ctx: PageDnaContext, spec: PageHierarchySpecification): string[] {
  const sticky =
    (ctx.role === "menu" || ctx.role === "home") && hasOrderFeature(ctx)
      ? "Mobile sticky: yes — single bar only"
      : "Mobile sticky: omit unless Page DNA specifies order flow";

  return [
    "## 7. CTA Hierarchy",
    `- Primary | Importance: dominant | Treatment: button primary token | Placement: hero + final band | Repeat: 2–3× page max | Microcopy: brief goal | States: hover/focus/disabled | Mobile: full-width | Omit if: informational-only page`,
    `- Secondary | Importance: secondary | Treatment: ghost/secondary token | Placement: hero adjacent, mid-page | Repeat: 1–2× | Label: ${ctx.secondaryCta}`,
    `- Tertiary | Importance: tertiary | Treatment: text link underline | Placement: inline body | Repeat: sparse`,
    `- Inline | Importance: inline | Treatment: body link | Placement: within sections`,
    `- Exit | Importance: primary | Treatment: FinalCTA band | Placement: pre-footer | Label: ${ctx.primaryCta}`,
    `- Mobile sticky | ${sticky} | Rule: one dominant CTA per viewport; no fake urgency`,
    `- Dominant CTA this page: ${spec.dominantCta}`,
  ];
}

function formatReadingFlowSpec(flow: ReadingFlow, ctx: PageDnaContext): string[] {
  return [
    "## 8. Reading Flow",
    `- Selected flow: ${flow}`,
    `- Why it fits: ${pageUserIntent(ctx.role, ctx.brief).slice(0, 120)} — not universal for all users.`,
    `- Desktop: eye-entry top-left/hero center; path to primary CTA; endpoint FinalCTA`,
    `- Tablet: condensed grid; maintain CTA visibility`,
    `- Mobile: vertical stack; task-focused utility on contact/location`,
    `- Accessibility: DOM order matches visual order; no essential info in motion-only reveals`,
  ];
}

function formatAboveTheFold(ctx: PageDnaContext): string[] {
  const mustShow =
    ctx.role === "contact"
      ? "H1, primary contact method [PLACEHOLDER if missing], start of form or phone"
      : ctx.role === "menu"
        ? "H1, category anchors or first category, primary order CTA if applicable"
        : `H1, offer/USP line, primary CTA ${ctx.primaryCta}, trust cue (USP badge)`;

  return [
    "## 5. Above-the-Fold Strategy",
    `- Must appear: ${mustShow}`,
    `- May peek: first content section headline partially visible`,
    `- Primary CTA: hero inline — not below fold on mobile contact/menu`,
    `- Secondary CTA: ghost beside primary or below subhead`,
    `- Trust cue: TrustBar/USP snippet when on home`,
    `- Media: hero only if asset confirmed; else text-first`,
    `- Header: sticky navbar Pattern Library — transparent-over-hero optional premium`,
    `- First scroll: reveal TrustBar or FeaturedItems — not multiple motion moments`,
    `- Mobile ATF: single column; avoid overcrowding — max H1+lead+1 CTA+1 trust row`,
    `- Tablet ATF: optional 50/50 hero split`,
    `- Desktop ATF: split or centered max-w-4xl text column`,
  ];
}

function formatMediaHierarchy(ctx: PageDnaContext): string[] {
  return [
    "## 9. Media Hierarchy",
    `- Hero media | Priority: ${hasGalleryMedia(ctx) ? "LCP" : "decorative placeholder"} | Size: viewport 40–60vh max | Ratio: 16:9 | Position: right/background | Crop: object-cover | Overlay: scrim for text | Load: eager if LCP | Mobile: below copy | Alt: factual [PLACEHOLDER]`,
    `- Product media | Priority: high on menu | Size: card thumb 1:1 | Lazy-load`,
    `- Gallery media | Priority: ${hasGalleryMedia(ctx) ? "medium" : "low placeholder"} | Lazy-load | Alt required`,
    `- Supporting | Priority: low | Inline 4:3`,
    `- Decorative | Priority: minimal | alt="" if redundant`,
    `- Rule: decorative media must not overpower conversion content; no video-first without asset`,
  ];
}

function formatColorHierarchy(ctx: PageDnaContext): string[] {
  return [
    "## 10. Color and Contrast Hierarchy",
    `- Dominant surface: ${DESIGN_TOKENS.color[0]} | Elevated: ${DESIGN_TOKENS.color[2]}`,
    `- Accent usage: ${DESIGN_TOKENS.color[4]} sparingly — CTA and key links only`,
    `- CTA accent: single primary button style sitewide; brief primary ${ctx.brief.primary_color ?? "[PLACEHOLDER]"} via Design System token`,
    `- Muted zones: supporting sections use ${DESIGN_TOKENS.color[5]}`,
    `- Dividers: ${DESIGN_TOKENS.color[6]} between conversion/information bands`,
    `- High-attention: primary CTA + H1 only — not every card`,
    `- Warning/error: ${DESIGN_TOKENS.color[7]} forms validation only`,
    `- WCAG: target AA — verify with real tokens; do not claim compliance without audit`,
  ];
}

function formatWhitespaceDensity(ctx: PageDnaContext, priorities: SectionPrioritySpec[]): string[] {
  const pageDensity: DensityLevel =
    ctx.tier === "premium" ? "spacious" : ctx.role === "menu" ? "compact" : "balanced";
  const whitespace: WhitespaceLevel =
    ctx.tier === "premium" ? "generous" : "balanced";

  return [
    "## 11. Whitespace and Density",
    `- Page density: ${pageDensity} | Whitespace: ${whitespace}`,
    `- Vertical spacing: ${DESIGN_TOKENS.spacing[0]} tier-adjusted`,
    `- Internal component: ${DESIGN_TOKENS.spacing[2]}`,
    `- Reading width: max-w-prose / max-w-3xl editorial`,
    `- Card density: ${ctx.role === "menu" ? "compact grid" : "balanced"}`,
    `- Grid density: menu 2–3 col desktop; home featured 3 col`,
    `- Mobile adjustment: reduce py-20→py-12; maintain tap targets`,
    `- Conversion/information separation: FinalCTA band extra ${DESIGN_TOKENS.spacing[0]} above footer`,
    ...priorities.slice(0, 4).map(
      (item) =>
        `- Section ${item.sectionName} | Density: ${item.hierarchyLevel === "primary" ? "balanced" : "compact"} | Whitespace: ${item.hierarchyLevel === "dominant" ? "generous" : "balanced"}`,
    ),
  ];
}

function formatSectionEmphasis(priorities: SectionPrioritySpec[]): string[] {
  const lines = ["## 12. Section Emphasis Rules"];
  priorities.slice(0, 6).forEach((item) => {
    const primary: SectionEmphasis =
      item.hierarchyLevel === "dominant"
        ? "size"
        : item.hierarchyLevel === "primary"
          ? "contrast"
          : "whitespace";
    const secondary: SectionEmphasis =
      primary === "size" ? "contrast" : "position";
    lines.push(
      `- ${item.sectionName} | Primary: ${primary} | Secondary: ${secondary} | Avoid combining: motion+elevation+background-change | Reason: ${item.reasonForPlacement.slice(0, 80)}`,
    );
  });
  return lines;
}

function formatMotionHierarchy(): string[] {
  return [
    "## 13. Motion Hierarchy (Motion DNA reference)",
    `- Dominant moment: hero reveal only (one per viewport)`,
    `- Supporting: section scroll-reveal stagger`,
    `- Utility: accordion/filter transitions`,
    `- Motion-free: trust badges, legal, form labels`,
    `- Scroll-reveal priority: primary sections before supporting`,
    `- Hover: cards desktop only; CTAs subtle`,
    `- Page transition: none v1 marketing site`,
    `- Reduced-motion: static layout; opacity-only optional`,
  ];
}

function formatResponsiveHierarchy(ctx: PageDnaContext): string[] {
  const stickyNote =
    (ctx.role === "menu" || ctx.role === "home") && hasOrderFeature(ctx)
      ? "sticky order CTA if menu/home order flow"
      : "minimal sticky elements";
  return [
    "## 14. Responsive Hierarchy",
    `- Mobile: stack hero; ${stickyNote}; hide decorative media if crowded`,
    `- Tablet: 2-col grids; hero split optional`,
    `- Desktop: full grid; inline CTAs`,
    `- Wide desktop: max-w-7xl container; avoid ultra-wide text lines`,
    `- Reordered: contact form before map when address missing`,
    `- CTA relocation: mobile sticky single primary`,
    `- Typography: fluid clamp down one step on mobile for display tokens`,
    `- Grid collapse: 4→2→1 cols | Sticky: one element max`,
    `- Navigation: hamburger mobile; full nav desktop`,
  ];
}

function formatAccessibilityHierarchy(ctx: PageDnaContext): string[] {
  const phoneNote = hasPhone(ctx)
    ? "tel: link high priority in contact stack"
    : "phone [PLACEHOLDER] — defer click-to-call emphasis";
  return [
    "## 15. Accessibility Hierarchy",
    "- Logical heading order: one H1; H2 sections; no skipped levels",
    "- DOM order = reading order; no CSS-only reorder that breaks focus",
    "- Focus order: skip link → header → main → footer",
    "- Skip links: to main content and first category on menu",
    "- Focus visibility: Design System focus ring tokens",
    "- Landmarks: header nav main footer",
    "- Screen-reader priority: H1 → primary CTA → key offer text",
    "- Reduced motion: disable scroll reveals",
    "- Decorative: alt=\"\" when redundant",
    `- CTA accessible names: ${ctx.primaryCta} — no icon-only buttons`,
    `- Contact phone a11y: ${phoneNote}`,
    "- Avoid color-only meaning for dietary badges",
  ];
}

function formatConversionSequence(
  ctx: PageDnaContext,
  priorities: SectionPrioritySpec[],
): string[] {
  const awareness = priorities.filter((p) => /Intro|Featured|Hero|PageIntro/i.test(p.sectionName));
  const trust = priorities.filter((p) => /Trust|USP|Testimonial|Quality|Reviews/i.test(p.sectionName));
  const action = priorities.filter((p) => /CTA|Order|ContactForm|Navigate/i.test(p.sectionName));

  return [
    "## 16. Conversion Hierarchy",
    `- Awareness: ${awareness.map((p) => p.sectionName).join(", ") || "Hero"}`,
    `- Interest: Featured/menu categories`,
    `- Trust: ${trust.map((p) => p.sectionName).join(", ") || "USP sections"}`,
    `- Decision: FAQ / dietary / pricing placeholders`,
    `- Action: ${action.map((p) => p.sectionName).join(", ") || "FinalCTA"}`,
    `- Entry point: hero primary CTA`,
    `- Objection point: FAQ section mid-page`,
    `- Trust reinforcement: TrustBar / USP before high-friction order`,
    `- Primary action: FinalCTA + hero`,
    `- Exit action: footer secondary links`,
    `- Friction reduction: show [PLACEHOLDER] clearly; no fake urgency`,
  ];
}

function formatOrderingRules(role: PageRole, ctx: PageDnaContext): string[] {
  const rules: Record<PageRole, string[]> = {
    home: [
      "Clear offer before detailed explanation",
      "Primary conversion path near top",
      "Trust before high-friction conversion",
      "FAQ after core objections relevant",
      "Final CTA before footer",
    ],
    menu: [
      "Category navigation before long item lists",
      "Featured items before secondary categories",
      "Ordering path remains visible",
      "Dietary info near relevant items",
      "Contact must not interrupt browsing flow",
    ],
    about: [
      "Brand story before team placeholders",
      "Mission/values before final CTA",
      "Trust elements before conversion prompt",
    ],
    contact: [
      "Primary contact path before secondary info",
      "Critical details before long forms",
      "Map high emphasis only when address exists",
    `- Click-to-call high on mobile when phone in brief: ${hasPhone(ctx) ? "yes" : "[PLACEHOLDER: add phone to brief]"}`,
    ],
    gallery: ["Filters before grid", "Lightbox after grid exposure", "CTA after visual proof"],
    location: ["Address before map", "Hours visible early", "Directions CTA after map"],
    services: ["Offer clarity first", "Proof/portfolio mid", "CTA after value"],
    portfolio: ["Showcase grid primary", "Case detail linked", "CTA after samples"],
    reviews: ["Summary [PLACEHOLDER] then quotes", "CTA after trust built"],
    team: ["Team grid primary", "Story link secondary"],
    treatments: ["List treatments", "Reassurance copy", "Book CTA"],
    generic: ["Intro → content → CTA standard funnel"],
  };

  return [
    "## 4. Section Ordering Rules",
    ...rules[role].map((rule) => `- ${rule}`),
  ];
}

export function buildPageVisualHierarchyBlock(ctx: PageDnaContext): string[] {
  const spec = buildPageHierarchySpecification(ctx);
  const lines: string[] = [
    "",
    `# Visual Hierarchy Engine — ${ctx.page}`,
    `Role: ${ctx.role} | Profile: ${ctx.profile} | Route: ${ctx.slug}`,
    "Deterministic hierarchy from Website Brief + Page DNA + Pattern Library + Design System DNA references.",
    "",
    "## 2. Page Objective Analysis",
    `- Primary objective: ${spec.objectives.primaryObjective}`,
    `- Secondary objective: ${spec.objectives.secondaryObjective}`,
    `- Primary user action: ${spec.objectives.primaryUserAction}`,
    `- Secondary user action: ${spec.objectives.secondaryUserAction}`,
    `- Primary information need: ${spec.objectives.primaryInformationNeed}`,
    `- Main trust requirement: ${spec.objectives.mainTrustRequirement}`,
    `- Main friction point: ${spec.objectives.mainFrictionPoint}`,
    `- Expected reading depth: ${spec.objectives.expectedReadingDepth}`,
    `- Conversion intensity: ${spec.objectives.conversionIntensity}`,
    "",
    formatOrderingRules(ctx.role, ctx).join("\n"),
    "",
    formatAboveTheFold(ctx).join("\n"),
    "",
    "## 3. Section Priority Engine",
    ...spec.sectionPriorities.map(
      (item) =>
        `- ${item.sectionName} | Score: ${item.priorityScore}/100 | Level: ${item.hierarchyLevel} | Weight: ${item.visualWeight} | Order: ${item.recommendedOrder} | Pattern: ${item.patternId} | Reason: ${item.reasonForPlacement.slice(0, 100)} | Change if: ${item.changeConditions.slice(0, 80)}`,
    ),
    "",
    ...formatTypographyHierarchy(ctx),
    "",
    ...formatCtaHierarchy(ctx, spec),
    "",
    ...formatReadingFlowSpec(spec.readingFlow, ctx),
    "",
    ...formatMediaHierarchy(ctx),
    "",
    ...formatColorHierarchy(ctx),
    "",
    ...formatWhitespaceDensity(ctx, spec.sectionPriorities),
    "",
    ...formatSectionEmphasis(spec.sectionPriorities),
    "",
    ...formatMotionHierarchy(),
    "",
    ...formatResponsiveHierarchy(ctx),
    "",
    ...formatAccessibilityHierarchy(ctx),
    "",
    ...formatConversionSequence(ctx, spec.sectionPriorities),
    "",
    "## 17. Visual Conflict Detection",
    ...(spec.conflicts.length
      ? spec.conflicts.map(
          (c) =>
            `- [${c.severity}] ${c.affectedSections} | Reason: ${c.reason} | Resolution: ${c.recommendedResolution}`,
        )
      : ["- No conflicts detected for current brief state."]),
    "",
    "## 18. Hierarchy Score",
    `- Overall: ${spec.scores.overall}/100 | Clarity: ${spec.scores.clarity} | Focus: ${spec.scores.focus} | Scanability: ${spec.scores.scanability}`,
    `- Conversion hierarchy: ${spec.scores.conversionHierarchy} | Typography: ${spec.scores.typographyHierarchy} | Media balance: ${spec.scores.mediaBalance}`,
    `- Mobile: ${spec.scores.mobileHierarchy} | Accessibility: ${spec.scores.accessibilityHierarchy}`,
    `- Strength: ${spec.scores.mainStrength}`,
    `- Weakness: ${spec.scores.mainWeakness}`,
    `- Top improvement: ${spec.scores.highestPriorityImprovement}`,
    "",
    "## 19. Implementation Notes",
    "- Apply hierarchy via Design System tokens — no second typography system.",
    "- Pattern Library patterns unchanged; adjust emphasis and order only.",
    "- One dominant CTA per viewport; respect prefers-reduced-motion.",
    "",
    "## 1. Hierarchy Decisions (typed)",
    ...spec.hierarchyDecisions.slice(0, 8).map(
      (decision) =>
        `- ${decision.element} | Level: ${decision.hierarchyLevel} | Weight: ${decision.visualWeight} | Typography: ${decision.typographyTreatment} | Spacing: ${decision.spacingTreatment} | Color: ${decision.colorTreatment} | Motion: ${decision.motionTreatment} | A11y: ${decision.accessibilityConsiderations.slice(0, 80)}`,
    ),
  ];

  return lines;
}

export function buildPageDnaHierarchyIntegration(ctx: PageDnaContext): string[] {
  const spec = buildPageHierarchySpecification(ctx);
  return [
    "",
    "## 10. Visual Hierarchy Integration (Page DNA)",
    "Augments Page DNA §3 section order with priority labels — does not replace Page DNA.",
    ...spec.sectionPriorities.map(
      (item) =>
        `Hierarchy | Section ${String(item.recommendedOrder).padStart(2, "0")} ${item.sectionName} | Priority: ${item.priorityScore} | Level: ${item.hierarchyLevel} | Weight: ${item.visualWeight} | CTA importance: ${/CTA|Order|ContactForm/i.test(item.sectionName) ? "primary" : "none"} | Responsive: mobile stack preserves order ${item.recommendedOrder}`,
    ),
    `- Hero hierarchy reference: dominant | Primary CTA: ${spec.dominantCta} | Reading flow: ${spec.readingFlow}`,
  ];
}

export function buildPatternLibraryHierarchyIntegration(
  ctx: PageDnaContext,
): string[] {
  const spec = buildPageHierarchySpecification(ctx);
  const lines = [
    "",
    "## Pattern Library Hierarchy Integration",
    "Pattern IDs unchanged — emphasis and ordering adjustments only.",
  ];

  spec.sectionPriorities.forEach((item) => {
    if (!VALID_PATTERN_ID_SET.has(item.patternId)) {
      lines.push(
        `- INCOMPATIBILITY: unknown pattern ${item.patternId} for ${item.sectionName}`,
      );
      return;
    }
    if (item.priorityScore < 35 && item.patternId === "gallery") {
      lines.push(
        `- ${item.sectionName} | Pattern: ${item.patternId} | Note: low priority — reduce media scale; pattern retained`,
      );
    } else {
      lines.push(
        `- ${item.sectionName} | Pattern: ${item.patternId} | Emphasis: ${item.visualWeight} | Compatible`,
      );
    }
  });

  return lines;
}

export function buildComponentHierarchyRefs(ctx: PageDnaContext): string[] {
  const spec = buildPageHierarchySpecification(ctx);
  const tree = getComponentTreeNodes(ctx.role, ctx);
  const lines = [
    "",
    "## Component DNA Hierarchy References",
    "Compact hierarchy refs — full component specs remain in Component DNA §9.",
  ];

  tree.slice(0, 10).forEach((component, index) => {
    const priority = spec.sectionPriorities[index] ?? spec.sectionPriorities[0];
    lines.push(
      `- ${component} | Visual weight: ${priority?.visualWeight ?? "medium"} | Hierarchy role: ${priority?.hierarchyLevel ?? "secondary"} | CTA importance: ${/CTA|Button|Order/i.test(component) ? "primary" : "none"} | Motion: ${index === 0 ? "dominant" : "supporting"} | Responsive: ${index < 3 ? "high" : "medium"} | A11y: landmark/focus order position ${index + 1}`,
    );
  });

  return lines;
}

export function buildVisualHierarchyEngineOverview(): string[] {
  return [
    "# Visual Hierarchy Engine",
    "Deterministic visual priority system using Website Brief, Page DNA, Pattern Library, Design System DNA, Component DNA, Content DNA, and Blueprint Intelligence context.",
    "Types: HierarchyLevel (dominant→utility) | VisualWeight (very-high→minimal) | ReadingFlow | DensityLevel | SectionEmphasis.",
    "Per-page specifications appear in Page DNA blocks and Visual Hierarchy Engine sections.",
    "Scoring formula (section priority): base 40 + roleWeight + position + conversion + pattern − missingInfoPenalty → clamp 0–100.",
    "Rules: one dominant CTA per viewport; no invented facts; reference Design System tokens only.",
  ];
}

export function extractVisualHierarchyWordCount(text: string): number {
  const matches = text.match(/# Visual Hierarchy Engine/g);
  if (!matches) {
    return 0;
  }
  const parts = text.split("# Visual Hierarchy Engine");
  return parts
    .slice(1)
    .join(" ")
    .split(/\s+/).filter(Boolean).length;
}

export function serializePageHierarchySpecification(
  spec: PageHierarchySpecification,
): string {
  return JSON.stringify(spec);
}
