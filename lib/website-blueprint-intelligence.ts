import type { WebsiteBrief } from "@/lib/website-briefs.types";

export type FieldStatus = "Complete" | "Partial" | "Missing";
export type Importance = "Critical" | "High" | "Medium" | "Low";
export type RiskSeverity = "Critical" | "High" | "Medium" | "Low";

export type FieldAnalysis = {
  field: string;
  status: FieldStatus;
  value: string;
  importance: Importance;
  effectIfMissing: string;
  recommendation: string;
};

export type ReadinessScores = {
  overall: number;
  business: number;
  content: number;
  design: number;
  seo: number;
  conversion: number;
  technical: number;
  explanations: Record<
    keyof Omit<ReadinessScores, "explanations">,
    string
  >;
};

export const INTELLIGENCE_SECTION_TITLES = [
  "1. Completeness Analysis",
  "2. Risk Analysis",
  "3. Conversion Analysis",
  "4. SEO Readiness",
  "5. Design Readiness",
  "6. Content Readiness",
  "7. Technical Readiness",
  "8. Missing Assets",
  "9. Readiness Score",
  "10. Launch Checklist",
] as const;

type BriefIntelContext = {
  brief: WebsiteBrief;
  services: string[];
  features: string[];
  pages: string[];
  profile: "restaurant" | "dentist" | "agency" | "default";
  notes: string;
  haystack: string;
};

function parseList(value: string | null | undefined): string[] {
  if (!value?.trim()) {
    return [];
  }

  return value
    .replace(/\r/g, "")
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function detectProfile(brief: WebsiteBrief): BriefIntelContext["profile"] {
  const haystack = `${brief.industry} ${brief.business_name}`.toLowerCase();

  if (/burger|restaurant|imbiss|gastro|café|cafe|bistro|food|smashburger/.test(
    haystack,
  )) {
    return "restaurant";
  }

  if (/dentist|zahnarzt|dental|zahn|orthodont/.test(haystack)) {
    return "dentist";
  }

  if (/agency|agentur|marketing|design studio|studio|consulting|beratung/.test(
    haystack,
  )) {
    return "agency";
  }

  return "default";
}

function buildContext(brief: WebsiteBrief): BriefIntelContext {
  const notes = brief.additional_notes?.trim() ?? "";
  return {
    brief,
    services: parseList(brief.services),
    features: parseList(brief.required_features),
    pages: parseList(brief.required_pages),
    profile: detectProfile(brief),
    notes,
    haystack: [
      notes,
      brief.website_goal,
      brief.required_features ?? "",
      brief.required_pages ?? "",
      brief.reference_websites ?? "",
    ]
      .join(" ")
      .toLowerCase(),
  };
}

function statusScore(status: FieldStatus): number {
  if (status === "Complete") {
    return 1;
  }
  if (status === "Partial") {
    return 0.5;
  }
  return 0;
}

function weightedScore(
  items: Array<{ status: FieldStatus; weight: number }>,
): number {
  if (items.length === 0) {
    return 0;
  }

  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  const earned = items.reduce(
    (sum, item) => sum + statusScore(item.status) * item.weight,
    0,
  );

  return Math.round((earned / totalWeight) * 100);
}

function displayValue(value: string | null | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
}

function sectionHeader(title: string): string {
  return `# Blueprint Intelligence — ${title}`;
}

function analyzeCompletenessFields(ctx: BriefIntelContext): FieldAnalysis[] {
  const { brief, services, features, pages, notes, haystack } = ctx;

  const businessNameStatus: FieldStatus =
    brief.business_name.trim().length >= 2 ? "Complete" : "Missing";

  const logoStatus: FieldStatus = /logo/i.test(notes)
    ? /folg|pending|upload|später|later|tbd/i.test(notes)
      ? "Partial"
      : "Complete"
    : "Missing";

  const hasPrimary = Boolean(brief.primary_color?.trim());
  const hasSecondary = Boolean(brief.secondary_color?.trim());
  const colorStatus: FieldStatus =
    hasPrimary && hasSecondary
      ? "Complete"
      : hasPrimary || hasSecondary
        ? "Partial"
        : "Missing";

  const location = brief.location?.trim() ?? "";
  const addressStatus: FieldStatus =
    location.length >= 20
      ? "Complete"
      : location.length > 0
        ? "Partial"
        : "Missing";

  const phoneStatus: FieldStatus = /(\+?\d[\d\s\-/]{6,}\d)/.test(notes)
    ? "Complete"
    : "Missing";

  const emailStatus: FieldStatus = /[\w.+-]+@[\w.-]+\.\w+/.test(notes)
    ? "Complete"
    : "Missing";

  const hoursStatus: FieldStatus = /öffnungs|opening|uhr|hours|mo-|di-/i.test(
    notes,
  )
    ? "Complete"
    : "Missing";

  const imagesStatus: FieldStatus = /bild|foto|photo|image|galerie|gallery/i.test(
    notes,
  )
    ? /folg|pending|upload|später|later|tbd/i.test(notes)
      ? "Partial"
      : "Complete"
    : "Missing";

  const socialStatus: FieldStatus = /social|instagram|facebook|tiktok|linkedin/i.test(
    haystack,
  )
    ? "Complete"
    : "Missing";

  const instagramStatus: FieldStatus = /instagram/i.test(haystack)
    ? "Complete"
    : "Missing";

  const mapsStatus: FieldStatus = /google.?maps|maps|standort/i.test(haystack)
    ? "Complete"
    : "Missing";

  const servicesStatus: FieldStatus =
    services.length >= 3
      ? "Complete"
      : services.length > 0
        ? "Partial"
        : "Missing";

  const audienceStatus: FieldStatus =
    brief.target_audience.trim().length >= 15
      ? "Complete"
      : brief.target_audience.trim().length > 0
        ? "Partial"
        : "Missing";

  const uspText = brief.unique_selling_points?.trim() ?? "";
  const uspStatus: FieldStatus =
    uspText.length >= 20
      ? "Complete"
      : uspText.length > 0
        ? "Partial"
        : "Missing";

  const goalText = brief.website_goal.trim();
  const ctaStatus: FieldStatus =
    goalText.length >= 20 &&
    /bestell|termin|kontakt|anfrage|buchen|order|book|contact|kauf|shop/i.test(
      goalText,
    )
      ? "Complete"
      : goalText.length > 0
        ? "Partial"
        : "Missing";

  const legalStatus: FieldStatus =
    /impressum|datenschutz|privacy|legal|agb/i.test(haystack)
      ? "Complete"
      : pages.some((page) => /impressum|datenschutz|legal|privacy/i.test(page))
        ? "Partial"
        : "Missing";

  const domainStatus: FieldStatus = "Missing";

  const languageStatus: FieldStatus = /english|englisch|deutsch|german|language|sprache/i.test(
    notes,
  )
    ? "Complete"
    : "Partial";

  return [
    {
      field: "Business Name",
      status: businessNameStatus,
      value: displayValue(brief.business_name, "[PLACEHOLDER: business name]"),
      importance: "Critical",
      effectIfMissing: "Brand cannot be identified anywhere on the site.",
      recommendation:
        businessNameStatus === "Complete"
          ? "Use brief name verbatim in header, meta, and schema."
          : "Collect official business name before blueprint finalization.",
    },
    {
      field: "Logo",
      status: logoStatus,
      value:
        logoStatus === "Missing"
          ? "[PLACEHOLDER: logo asset]"
          : notes.match(/logo[^.]*/i)?.[0] ?? "Mentioned in brief notes",
      importance: "High",
      effectIfMissing: "Header and social sharing lack brand recognition.",
      recommendation:
        logoStatus === "Missing"
          ? "Upload logo (SVG or PNG, transparent background)."
          : "Confirm logo file delivery before development handoff.",
    },
    {
      field: "Brand Colors",
      status: colorStatus,
      value:
        hasPrimary && hasSecondary
          ? `${brief.primary_color}, ${brief.secondary_color}`
          : hasPrimary
            ? `${brief.primary_color}; secondary [PLACEHOLDER]`
            : "[PLACEHOLDER: primary and secondary colors]",
      importance: "High",
      effectIfMissing: "Design System DNA must use generic tokens only.",
      recommendation:
        colorStatus === "Complete"
          ? "Validate contrast (WCAG AA) before token lock-in."
          : "Provide primary and secondary hex values from brand guidelines.",
    },
    {
      field: "Address",
      status: addressStatus,
      value: displayValue(brief.location, "[PLACEHOLDER: street, PLZ, city]"),
      importance: "High",
      effectIfMissing: "Local SEO, maps, and visit planning cannot be verified.",
      recommendation:
        addressStatus === "Complete"
          ? "Use structured address in footer, contact, and LocalBusiness schema."
          : "Provide full postal address; brief location field is incomplete.",
    },
    {
      field: "Phone",
      status: phoneStatus,
      value: phoneStatus === "Complete" ? "Found in brief notes" : "[PLACEHOLDER: phone]",
      importance: "High",
      effectIfMissing: "Contact and conversion paths lack direct reach.",
      recommendation: "Add business phone to brief or contact page content module.",
    },
    {
      field: "Email",
      status: emailStatus,
      value: emailStatus === "Complete" ? "Found in brief notes" : "[PLACEHOLDER: email]",
      importance: "Medium",
      effectIfMissing: "Forms may lack destination; trust signals weaker.",
      recommendation: "Add contact email to brief for form routing and footer.",
    },
    {
      field: "Opening Hours",
      status: hoursStatus,
      value:
        hoursStatus === "Complete"
          ? "Found in brief notes"
          : "[PLACEHOLDER: opening hours]",
      importance: ctx.profile === "restaurant" ? "Critical" : "Medium",
      effectIfMissing: "Visitors cannot plan visits; restaurant trust drops.",
      recommendation: "Provide weekly opening hours table for contact/location pages.",
    },
    {
      field: "Images",
      status: imagesStatus,
      value:
        imagesStatus === "Missing"
          ? "[PLACEHOLDER: photography assets]"
          : "Referenced in brief notes",
      importance: "High",
      effectIfMissing: "Hero, gallery, and menu sections rely on placeholders.",
      recommendation: "Upload brand photography before content population.",
    },
    {
      field: "Social Links",
      status: socialStatus,
      value:
        socialStatus === "Complete"
          ? features.filter((f) => /social|instagram|facebook/i.test(f)).join(", ") ||
            "Requested in brief"
          : "[PLACEHOLDER: social profile URLs]",
      importance: "Medium",
      effectIfMissing: "Footer and trust band lack social proof links.",
      recommendation: "Add social profile URLs or confirm social feature scope.",
    },
    {
      field: "Instagram",
      status: instagramStatus,
      value:
        instagramStatus === "Complete"
          ? "Mentioned in brief/features"
          : "[PLACEHOLDER: Instagram URL]",
      importance: "Low",
      effectIfMissing: "Instagram CTA cannot link to verified profile.",
      recommendation: "Provide Instagram handle/URL if social proof is required.",
    },
    {
      field: "Google Maps",
      status: mapsStatus,
      value:
        mapsStatus === "Complete"
          ? "Requested in brief features/pages"
          : "[PLACEHOLDER: Google Maps embed URL]",
      importance: ctx.profile === "restaurant" ? "High" : "Medium",
      effectIfMissing: "Location page cannot embed verified map.",
      recommendation: "Add Google Maps URL or enable maps feature with address first.",
    },
    {
      field: "Services",
      status: servicesStatus,
      value:
        services.length > 0
          ? services.join(", ")
          : "[PLACEHOLDER: services or menu items]",
      importance: "Critical",
      effectIfMissing: "Offer clarity and menu/service pages lack substance.",
      recommendation:
        servicesStatus === "Complete"
          ? "Use service list as single source for menu/services copy."
          : "Expand services field with all customer-facing offerings.",
    },
    {
      field: "Target Audience",
      status: audienceStatus,
      value: displayValue(
        brief.target_audience,
        "[PLACEHOLDER: target audience segments]",
      ),
      importance: "High",
      effectIfMissing: "Messaging and UX DNA lack audience focus.",
      recommendation: "Define 1–3 audience segments with needs and objections.",
    },
    {
      field: "USP",
      status: uspStatus,
      value: displayValue(
        brief.unique_selling_points,
        "[PLACEHOLDER: unique selling points]",
      ),
      importance: "Critical",
      effectIfMissing: "Differentiation and trust copy rely on placeholders.",
      recommendation: "Confirm factual USPs only — no unverified superlatives.",
    },
    {
      field: "CTA",
      status: ctaStatus,
      value:
        ctaStatus === "Missing"
          ? "[PLACEHOLDER: primary conversion action]"
          : `Derived from goal: ${brief.website_goal}`,
      importance: "Critical",
      effectIfMissing: "Conversion path and CTA labels stay generic.",
      recommendation:
        "State primary action explicitly in website goal (order, book, contact).",
    },
    {
      field: "Legal Pages",
      status: legalStatus,
      value:
        legalStatus === "Complete"
          ? "Legal pages referenced in brief"
          : "[PLACEHOLDER: Impressum & Datenschutz text]",
      importance: "High",
      effectIfMissing: "Launch blocked in DE/EU without legal content placeholders visible.",
      recommendation: "Add legal pages to sitemap and supply client legal copy.",
    },
    {
      field: "Domain",
      status: domainStatus,
      value: "[PLACEHOLDER: production domain]",
      importance: "Medium",
      effectIfMissing: "SEO canonical URLs and launch checklist incomplete.",
      recommendation: "Confirm production domain before launch checklist finalization.",
    },
    {
      field: "Language",
      status: languageStatus,
      value:
        languageStatus === "Complete"
          ? "Specified in brief notes"
          : "German (de-DE) assumed from project — confirm with client",
      importance: "Medium",
      effectIfMissing: "Localization rules in Content DNA may mismatch client expectation.",
      recommendation: "Confirm primary site language and formal/informal address (Sie/du).",
    },
  ];
}

function formatFieldLine(field: FieldAnalysis): string {
  return `- ${field.field} | Status: ${field.status} | Value: ${field.value} | Importance: ${field.importance} | If missing: ${field.effectIfMissing} | Recommendation: ${field.recommendation}`;
}

function section1Completeness(ctx: BriefIntelContext): string[] {
  return [
    sectionHeader(INTELLIGENCE_SECTION_TITLES[0]),
    "Classifies brief inputs only — never invents missing business data.",
    ...analyzeCompletenessFields(ctx).map(formatFieldLine),
  ];
}

function section2Risks(ctx: BriefIntelContext): string[] {
  const fields = analyzeCompletenessFields(ctx);
  const missing = (name: string) =>
    fields.find((field) => field.field === name)?.status === "Missing";
  const partial = (name: string) =>
    fields.find((field) => field.field === name)?.status === "Partial";

  type Risk = {
    title: string;
    severity: RiskSeverity;
    impact: string;
    recommendation: string;
  };

  const risks: Risk[] = [];

  if (missing("Phone") && missing("Email")) {
    risks.push({
      title: "Missing contact information",
      severity: "Critical",
      impact: "Contact page and forms cannot provide verified reach paths.",
      recommendation: "Add phone and email to brief before launch.",
    });
  }

  if (missing("Logo") || partial("Brand Colors")) {
    risks.push({
      title: "Missing brand identity assets",
      severity: "High",
      impact: "Visual DNA and header brand lockup remain placeholder-driven.",
      recommendation: "Deliver logo and color tokens before design implementation.",
    });
  }

  if (missing("Services") || partial("Services")) {
    risks.push({
      title: "Missing or thin product/service data",
      severity: ctx.profile === "restaurant" ? "Critical" : "High",
      impact: "Menu/services pages cannot ship factual offer copy.",
      recommendation: "Complete services/menu list with names; prices as [PLACEHOLDER] if unknown.",
    });
  }

  if (missing("Opening Hours") && ctx.profile === "restaurant") {
    risks.push({
      title: "Missing opening hours",
      severity: "High",
      impact: "Local visit and order timing assumptions stay unverified.",
      recommendation: "Provide weekly hours before location/contact content goes live.",
    });
  }

  if (missing("Address")) {
    risks.push({
      title: "Missing address",
      severity: "High",
      impact: "Maps, local SEO, and visit CTAs lack verified location.",
      recommendation: "Add full address to brief location field.",
    });
  }

  if (missing("Services") && ctx.profile === "restaurant") {
    risks.push({
      title: "Missing menu detail",
      severity: "High",
      impact: "Menu page structure exists but item copy stays placeholder-heavy.",
      recommendation: "Provide menu categories and item names; mark prices [PLACEHOLDER] until confirmed.",
    });
  }

  if (!/preis|price|€|\$/i.test(ctx.haystack)) {
    risks.push({
      title: "Missing pricing",
      severity: "Medium",
      impact: "Product cards must use [PLACEHOLDER: EUR] — conversion friction may increase.",
      recommendation: "Confirm whether prices should be shown; if yes, supply verified price list.",
    });
  }

  if (missing("USP") || partial("USP")) {
    risks.push({
      title: "No clear trust signals in brief",
      severity: "High",
      impact: "Hero and trust sections depend on generic placeholders.",
      recommendation: "Strengthen USP with factual, verifiable differentiators.",
    });
  }

  if (!/testimonial|review|bewertung|kundenstimme/i.test(ctx.haystack)) {
    risks.push({
      title: "No testimonials or reviews in brief",
      severity: "Medium",
      impact: "Social proof blocks must remain [PLACEHOLDER] — no fabricated quotes.",
      recommendation: "Collect real testimonials with name/context or link review source.",
    });
  }

  if (missing("Images") || partial("Images")) {
    risks.push({
      title: "No imagery confirmed",
      severity: "High",
      impact: "Gallery, hero, and menu visuals cannot reflect real brand.",
      recommendation: "Upload photography or confirm stock/placeholder strategy explicitly.",
    });
  }

  return [
    sectionHeader(INTELLIGENCE_SECTION_TITLES[1]),
    ...risks.map(
      (risk) =>
        `- ${risk.title} | Severity: ${risk.severity} | Impact: ${risk.impact} | Recommendation: ${risk.recommendation}`,
    ),
  ];
}

type ConversionMetric = {
  name: string;
  score: number;
  status: FieldStatus;
  recommendation: string;
};

function conversionMetrics(ctx: BriefIntelContext): ConversionMetric[] {
  const fields = analyzeCompletenessFields(ctx);
  const statusOf = (name: string): FieldStatus =>
    fields.find((field) => field.field === name)?.status ?? "Missing";

  const offerStatus = statusOf("Services");
  const ctaStatus = statusOf("CTA");
  const uspStatus = statusOf("USP");
  const trustStatuses = [
    statusOf("USP"),
    statusOf("Images"),
    /testimonial|review|bewertung/i.test(ctx.haystack) ? "Complete" : "Missing",
  ] as FieldStatus[];
  const socialProofStatus: FieldStatus = /testimonial|review|bewertung/i.test(
    ctx.haystack,
  )
    ? "Complete"
    : "Missing";
  const urgencyStatus: FieldStatus = /urgent|sofort|limited|nur heute|deadline/i.test(
    ctx.notes,
  )
    ? "Complete"
    : "Missing";
  const differentiationStatus = uspStatus;

  const scoreFromStatus = (
    status: FieldStatus,
    weights?: Partial<Record<FieldStatus, number>>,
  ) => {
    const map = weights ?? { Complete: 100, Partial: 55, Missing: 15 };
    return map[status] ?? 15;
  };

  const trustScore = Math.round(
    (trustStatuses.reduce((sum, status) => sum + statusScore(status), 0) /
      trustStatuses.length) *
      100,
  );

  const pathScore = Math.round(
    weightedScore([
      { status: ctaStatus, weight: 3 },
      {
        status: /kontakt|contact|form|bestell|order|termin|book/i.test(
          ctx.haystack,
        )
          ? "Complete"
          : "Partial",
        weight: 2,
      },
      { status: ctx.pages.length > 0 ? "Complete" : "Partial", weight: 1 },
    ]),
  );

  return [
    {
      name: "Offer clarity",
      score: scoreFromStatus(offerStatus),
      status: offerStatus,
      recommendation:
        offerStatus === "Complete"
          ? "Mirror services list in hero and menu/services page above fold."
          : "Complete services/menu field so offer is scannable in first screen.",
    },
    {
      name: "CTA clarity",
      score: scoreFromStatus(ctaStatus),
      status: ctaStatus,
      recommendation:
        "Align primary CTA label with explicit goal action from brief.",
    },
    {
      name: "Trust",
      score: trustScore,
      status:
        trustScore >= 80 ? "Complete" : trustScore >= 45 ? "Partial" : "Missing",
      recommendation:
        "Combine USP, real imagery, and verified testimonials — no fabricated proof.",
    },
    {
      name: "Social proof",
      score: scoreFromStatus(socialProofStatus),
      status: socialProofStatus,
      recommendation:
        socialProofStatus === "Missing"
          ? "Add review source or testimonial placeholders with proof-owner checklist."
          : "Use only confirmed quotes and cite source.",
    },
    {
      name: "Urgency",
      score: scoreFromStatus(urgencyStatus, {
        Complete: 100,
        Partial: 50,
        Missing: 70,
      }),
      status: urgencyStatus,
      recommendation:
        urgencyStatus === "Missing"
          ? "Avoid fake urgency — not stated in brief (recommended)."
          : "Use urgency copy only if factually supported in brief.",
    },
    {
      name: "Value proposition",
      score: scoreFromStatus(uspStatus),
      status: uspStatus,
      recommendation: "Keep USP factual; expand with benefit-outcome phrasing in Content DNA.",
    },
    {
      name: "Differentiation",
      score: scoreFromStatus(differentiationStatus),
      status: differentiationStatus,
      recommendation:
        "State verifiable differentiators; avoid unsupported superlatives.",
    },
    {
      name: "Conversion path",
      score: pathScore,
      status:
        pathScore >= 80 ? "Complete" : pathScore >= 45 ? "Partial" : "Missing",
      recommendation:
        "Ensure sitemap includes contact/menu + primary CTA on home, menu, and sticky mobile.",
    },
  ];
}

function section3Conversion(ctx: BriefIntelContext): string[] {
  return [
    sectionHeader(INTELLIGENCE_SECTION_TITLES[2]),
    ...conversionMetrics(ctx).map(
      (metric) =>
        `- ${metric.name} | Score: ${metric.score}/100 | Status: ${metric.status} | Recommendation: ${metric.recommendation}`,
    ),
  ];
}

function section4Seo(ctx: BriefIntelContext): string[] {
  const fields = analyzeCompletenessFields(ctx);
  const businessName = fields.find((field) => field.field === "Business Name")!;
  const services = fields.find((field) => field.field === "Services")!;
  const address = fields.find((field) => field.field === "Address")!;

  const keywordStatus: FieldStatus =
    ctx.services.length >= 2 && ctx.brief.industry.trim().length > 0
      ? "Complete"
      : ctx.brief.industry.trim().length > 0
        ? "Partial"
        : "Missing";

  const metaStatus: FieldStatus =
    businessName.status === "Complete" &&
    ctx.brief.website_goal.trim().length > 0
      ? "Complete"
      : "Partial";

  const pagesStatus: FieldStatus =
    ctx.pages.length >= 4 ? "Complete" : ctx.pages.length > 0 ? "Partial" : "Missing";

  const structuredStatus: FieldStatus =
    businessName.status === "Complete" &&
    (services.status !== "Missing" || address.status !== "Missing")
      ? "Partial"
      : "Missing";

  const localStatus: FieldStatus = address.status;

  return [
    sectionHeader(INTELLIGENCE_SECTION_TITLES[3]),
    `- Business Name | Status: ${businessName.status} | Value: ${businessName.value} | Recommendation: Use in title template and Organization schema name.`,
    `- Target Keywords | Status: ${keywordStatus} | Value: ${ctx.services.slice(0, 4).join(", ") || ctx.brief.industry || "[PLACEHOLDER: keywords]"} | Recommendation: Derive from services + industry; no stuffing.`,
    `- Locations | Status: ${address.status} | Value: ${address.value} | Recommendation: Include city/region naturally in meta and LocalBusiness fields.`,
    `- Services | Status: ${services.status} | Value: ${services.value} | Recommendation: One indexable page or section per major service cluster.`,
    `- Meta possibilities | Status: ${metaStatus} | Value: Goal + audience available for meta descriptions | Recommendation: Unique meta per sitemap page.`,
    `- Internal pages | Status: ${pagesStatus} | Value: ${ctx.pages.join(", ") || "[PLACEHOLDER: sitemap pages]"} | Recommendation: Cross-link services, contact, and about.`,
    `- Structured data readiness | Status: ${structuredStatus} | Value: Partial schema possible from brief facts | Recommendation: Add address/hours before LocalBusiness JSON-LD.`,
    `- Local SEO readiness | Status: ${localStatus} | Value: ${address.value} | Recommendation: NAP consistency across footer, contact, and maps.`,
  ];
}

function section5Design(ctx: BriefIntelContext): string[] {
  const fields = analyzeCompletenessFields(ctx);
  const colors = fields.find((field) => field.field === "Brand Colors")!;
  const logo = fields.find((field) => field.field === "Logo")!;
  const images = fields.find((field) => field.field === "Images")!;
  const styleStatus: FieldStatus = ctx.brief.preferred_style?.trim()
    ? "Complete"
    : "Partial";
  const motionStatus: FieldStatus = /animation|motion|bewegung|apple/i.test(
    ctx.haystack,
  )
    ? "Complete"
    : "Partial";
  const referencesStatus: FieldStatus = ctx.brief.reference_websites?.trim()
    ? "Complete"
    : "Missing";
  const iconsStatus: FieldStatus = "Partial";
  const darkLightStatus: FieldStatus = /dark|light|mode|theme/i.test(ctx.notes)
    ? "Complete"
    : "Partial";

  const line = (
    topic: string,
    status: FieldStatus,
    value: string,
    recommendation: string,
  ) =>
    `- ${topic} | Status: ${status} | Value: ${value} | Recommendation: ${recommendation}`;

  return [
    sectionHeader(INTELLIGENCE_SECTION_TITLES[4]),
    line(
      "Brand colors",
      colors.status,
      colors.value,
      colors.status === "Complete"
        ? "Lock tokens in Design System DNA."
        : "Collect hex values before visual implementation.",
    ),
    line(
      "Typography",
      styleStatus,
      displayValue(ctx.brief.preferred_style, "[PLACEHOLDER: type direction]"),
      "Map preferred style to font pairing in Design System DNA.",
    ),
    line(
      "Logo",
      logo.status,
      logo.value,
      "Do not substitute generated mark — use [PLACEHOLDER] until asset arrives.",
    ),
    line(
      "Photography",
      images.status,
      images.value,
      "Plan hero/gallery assets; alt text from factual descriptions only.",
    ),
    line(
      "Illustrations",
      "Missing",
      "[PLACEHOLDER: illustration need not stated in brief]",
      "Confirm if custom illustrations are required or photography-only.",
    ),
    line(
      "Motion",
      motionStatus,
      motionStatus === "Complete" ? ctx.brief.preferred_style ?? ctx.notes : "Subtle motion assumed",
      "Apply Motion DNA with prefers-reduced-motion support.",
    ),
    line(
      "Icons",
      iconsStatus,
      "Standard UI icon set assumed",
      "Use consistent icon library per Design System DNA.",
    ),
    line(
      "Dark/Light mode",
      darkLightStatus,
      darkLightStatus === "Complete" ? "Specified in notes" : "Light mode default",
      "Confirm theme strategy before token finalization.",
    ),
    line(
      "Spacing",
      styleStatus,
      "Derived from style tier in Design System DNA",
      "Use spacing scale from Design System DNA — no ad-hoc values.",
    ),
    line(
      "Visual references",
      referencesStatus,
      displayValue(ctx.brief.reference_websites, "[PLACEHOLDER: reference URLs]"),
      "Extract layout/typography cues only — do not copy branding.",
    ),
  ];
}

function section6Content(ctx: BriefIntelContext): string[] {
  const pageBlob = ctx.pages.join(" ").toLowerCase();
  const hasPage = (pattern: RegExp) =>
    pattern.test(pageBlob) || pattern.test(ctx.haystack);

  const evaluate = (
    area: string,
    status: FieldStatus,
    value: string,
    recommendation: string,
  ) =>
    `- ${area} | Status: ${status} | Value: ${value} | Recommendation: ${recommendation}`;

  const homepageStatus: FieldStatus =
    hasPage(/home|start/) && ctx.brief.website_goal.trim()
      ? "Complete"
      : "Partial";

  return [
    sectionHeader(INTELLIGENCE_SECTION_TITLES[5]),
    evaluate(
      "Homepage",
      homepageStatus,
      ctx.brief.website_goal || "[PLACEHOLDER: homepage goal copy]",
      "Ensure hero states offer + USP + primary CTA per Content DNA.",
    ),
    evaluate(
      "About",
      hasPage(/about|über/) ? "Complete" : "Partial",
      hasPage(/about|über/) ? "In sitemap" : "[PLACEHOLDER: about narrative]",
      "Supply founding story and team facts — do not invent history.",
    ),
    evaluate(
      "Services",
      analyzeCompletenessFields(ctx).find((field) => field.field === "Services")!
        .status,
      ctx.services.join(", ") || "[PLACEHOLDER: services copy]",
      "Use brief services as single source for service/menu modules.",
    ),
    evaluate(
      "FAQ",
      /faq|fragen|help/i.test(ctx.haystack) ? "Complete" : "Partial",
      "FAQ page not explicitly required",
      "Add FAQ categories from Content DNA; answers must not invent facts.",
    ),
    evaluate(
      "Gallery",
      hasPage(/galerie|gallery/) ? "Complete" : "Partial",
      hasPage(/galerie|gallery/) ? "In sitemap" : "Optional unless photography supplied",
      "Populate only with client-provided images.",
    ),
    evaluate(
      "Testimonials",
      /testimonial|review|bewertung/i.test(ctx.haystack) ? "Partial" : "Missing",
      "[PLACEHOLDER: testimonials]",
      "Never fabricate quotes; track proof owner in Content DNA governance.",
    ),
    evaluate(
      "Contact",
      hasPage(/kontakt|contact/) ? "Complete" : "Partial",
      hasPage(/kontakt|contact/) ? "In sitemap" : "Add contact page to sitemap",
      "Pair contact page with verified phone/email/address when available.",
    ),
    evaluate(
      "Legal",
      analyzeCompletenessFields(ctx).find((field) => field.field === "Legal Pages")!
        .status,
      "[PLACEHOLDER: Impressum & Datenschutz]",
      "Legal copy must come from client — visible placeholders until approved.",
    ),
  ];
}

function section7Technical(ctx: BriefIntelContext): string[] {
  const featureBlob = ctx.features.join(" ").toLowerCase();
  const hasFeature = (pattern: RegExp) => pattern.test(featureBlob) || pattern.test(ctx.haystack);

  const line = (
    topic: string,
    status: FieldStatus,
    recommendation: string,
  ) =>
    `- ${topic} | Status: ${status} | Recommendation: ${recommendation}`;

  return [
    sectionHeader(INTELLIGENCE_SECTION_TITLES[6]),
    line(
      "Forms",
      hasFeature(/form|kontakt|contact|anfrage/) ? "Complete" : "Partial",
      "Implement accessible form per Content DNA microcopy; confirm submission endpoint.",
    ),
    line(
      "Maps",
      hasFeature(/maps|google.?maps|standort/) ? "Complete" : "Missing",
      "Embed maps only after verified address is supplied.",
    ),
    line(
      "Ordering",
      hasFeature(/bestell|order|shop/) || /bestell|order|shop/i.test(ctx.brief.website_goal)
        ? "Complete"
        : "Missing",
      "If ordering is in scope, define flow and payment [PLACEHOLDER] before build.",
    ),
    line(
      "Booking",
      hasFeature(/termin|book|appointment|buchen/) ? "Complete" : "Missing",
      "Add booking provider/link to brief if appointments are required.",
    ),
    line(
      "CMS",
      "Partial",
      "Typed content modules assumed v1 — confirm CMS need with client.",
    ),
    line(
      "Analytics",
      /analytics|tracking|matomo|ga4|google analytics/i.test(ctx.haystack)
        ? "Partial"
        : "Missing",
      "Add analytics requirement and privacy consent copy [PLACEHOLDER].",
    ),
    line(
      "Performance",
      /schnell|performance|ladezeit|speed/i.test(ctx.haystack) ? "Partial" : "Partial",
      "Meet performance goals from development notes; optimize images when assets arrive.",
    ),
    line(
      "Accessibility",
      "Partial",
      "Follow UX DNA + WCAG-oriented patterns; validate keyboard and contrast.",
    ),
    line(
      "Responsive",
      "Complete",
      "Mobile-first required — stated by project delivery checklist.",
    ),
    line(
      "Hosting",
      "Missing",
      "Confirm hosting/domain/DNS [PLACEHOLDER] before launch checklist.",
    ),
  ];
}

function missingAssetItems(ctx: BriefIntelContext): string[] {
  const fields = analyzeCompletenessFields(ctx);
  const needsAsset = (name: string) =>
    fields.find((field) => field.field === name)?.status !== "Complete";

  const items: string[] = [];

  if (needsAsset("Logo")) {
    items.push("- [ ] Upload Logo");
  }
  if (needsAsset("Images")) {
    items.push("- [ ] Upload Images");
  }
  if (ctx.profile === "restaurant" && needsAsset("Services")) {
    items.push("- [ ] Provide Menu");
  } else if (needsAsset("Services")) {
    items.push("- [ ] Provide Services List");
  }
  if (needsAsset("Address")) {
    items.push("- [ ] Provide Address");
  }
  if (needsAsset("Phone")) {
    items.push("- [ ] Provide Phone");
  }
  if (needsAsset("Opening Hours")) {
    items.push("- [ ] Provide Opening Hours");
  }
  if (needsAsset("Legal Pages")) {
    items.push("- [ ] Provide Legal Text (Impressum & Datenschutz)");
  }
  if (needsAsset("Social Links")) {
    items.push("- [ ] Provide Social Links");
  }
  if (needsAsset("Google Maps")) {
    items.push("- [ ] Provide Google Maps URL");
  }
  if (needsAsset("Domain")) {
    items.push("- [ ] Confirm Production Domain");
  }

  if (items.length === 0) {
    items.push("- [ ] Brief inputs sufficient for v1 — verify assets before launch.");
  }

  return items;
}

function section8MissingAssets(ctx: BriefIntelContext): string[] {
  return [sectionHeader(INTELLIGENCE_SECTION_TITLES[7]), ...missingAssetItems(ctx)];
}

export function computeReadinessScores(brief: WebsiteBrief): ReadinessScores {
  const ctx = buildContext(brief);
  const fields = analyzeCompletenessFields(ctx);
  const byName = (name: string) =>
    fields.find((field) => field.field === name)!;

  const business = weightedScore([
    { status: byName("Business Name").status, weight: 3 },
    { status: byName("Address").status, weight: 3 },
    { status: byName("Phone").status, weight: 2 },
    { status: byName("Email").status, weight: 2 },
    { status: byName("Opening Hours").status, weight: ctx.profile === "restaurant" ? 3 : 1 },
    { status: byName("Domain").status, weight: 1 },
    { status: byName("Language").status, weight: 1 },
  ]);

  const content = weightedScore([
    { status: byName("Services").status, weight: 3 },
    { status: byName("USP").status, weight: 3 },
    { status: byName("Target Audience").status, weight: 2 },
    { status: byName("Legal Pages").status, weight: 2 },
    { status: /testimonial|review|bewertung/i.test(ctx.haystack) ? "Partial" : "Missing", weight: 1 },
    { status: byName("Images").status, weight: 2 },
  ]);

  const design = weightedScore([
    { status: byName("Brand Colors").status, weight: 3 },
    { status: byName("Logo").status, weight: 3 },
    { status: ctx.brief.preferred_style?.trim() ? "Complete" : "Partial", weight: 2 },
    { status: byName("Images").status, weight: 2 },
    { status: ctx.brief.reference_websites?.trim() ? "Complete" : "Missing", weight: 1 },
  ]);

  const seo = weightedScore([
    { status: byName("Business Name").status, weight: 2 },
    { status: byName("Services").status, weight: 2 },
    { status: byName("Address").status, weight: 2 },
    { status: ctx.pages.length >= 3 ? "Complete" : ctx.pages.length > 0 ? "Partial" : "Missing", weight: 2 },
    { status: byName("USP").status, weight: 1 },
  ]);

  const conversion = Math.round(
    conversionMetrics(ctx).reduce((sum, metric) => sum + metric.score, 0) /
      conversionMetrics(ctx).length,
  );

  const technical = weightedScore([
    {
      status: /form|kontakt|contact/i.test(ctx.haystack) ? "Complete" : "Partial",
      weight: 2,
    },
    {
      status: /maps|google.?maps/i.test(ctx.haystack) ? "Complete" : "Missing",
      weight: 2,
    },
    {
      status:
        /bestell|order|shop/i.test(ctx.brief.website_goal) ||
        /bestell|order|shop/i.test(ctx.haystack)
          ? "Complete"
          : "Missing",
      weight: 2,
    },
    { status: "Partial", weight: 2 },
    { status: "Partial", weight: 1 },
  ]);

  const overall = Math.round(
    (business + content + design + seo + conversion + technical) / 6,
  );

  return {
    overall,
    business,
    content,
    design,
    seo,
    conversion,
    technical,
    explanations: {
      overall: `Average of six category scores (${business}+${content}+${design}+${seo}+${conversion}+${technical})/6.`,
      business: `Weighted brief fields: name, address, contact, hours, domain, language.`,
      content: `Weighted: services, USP, audience, legal, imagery, social proof signals.`,
      design: `Weighted: colors, logo, style, photography, references.`,
      seo: `Weighted: name, services, location, sitemap depth, USP for meta copy.`,
      conversion: `Mean of eight conversion metric scores from brief goal, USP, CTA, and path signals.`,
      technical: `Weighted: forms, maps, ordering scope, baseline performance/accessibility assumptions.`,
    },
  };
}

function section9ReadinessScore(ctx: BriefIntelContext): string[] {
  const scores = computeReadinessScores(ctx.brief);

  return [
    sectionHeader(INTELLIGENCE_SECTION_TITLES[8]),
    `- Overall: ${scores.overall}/100 — ${scores.explanations.overall}`,
    `- Business: ${scores.business}/100 — ${scores.explanations.business}`,
    `- Content: ${scores.content}/100 — ${scores.explanations.content}`,
    `- Design: ${scores.design}/100 — ${scores.explanations.design}`,
    `- SEO: ${scores.seo}/100 — ${scores.explanations.seo}`,
    `- Conversion: ${scores.conversion}/100 — ${scores.explanations.conversion}`,
    `- Technical: ${scores.technical}/100 — ${scores.explanations.technical}`,
    "- Scores are deterministic from brief field status only — no AI, no invented facts.",
  ];
}

function section10LaunchChecklist(ctx: BriefIntelContext): string[] {
  const fields = analyzeCompletenessFields(ctx);

  const beforeDesign = [
    "- [ ] Confirm brand colors and logo delivery",
    "- [ ] Confirm preferred style and reference sites",
    "- [ ] Resolve Missing assets from section 8",
  ];

  const beforeDevelopment = [
    "- [ ] Finalize sitemap pages",
    "- [ ] Confirm required features (forms, maps, ordering)",
    "- [ ] Approve Design System DNA token direction",
    ...ctx.pages.map((page) => `- [ ] Confirm route scope: ${page}`),
  ];

  const beforeContent = [
    "- [ ] Replace [PLACEHOLDER] copy with client-approved text",
    "- [ ] Supply menu/services with verified names",
    "- [ ] Provide legal text for Impressum/Datenschutz",
    fields.find((field) => field.field === "USP")?.status === "Complete"
      ? "- [ ] Verify USP claims with client sign-off"
      : "- [ ] Define factual USP before hero copy goes live",
  ];

  const beforeLaunch = [
    "- [ ] Validate contact details (phone, email, address)",
    "- [ ] Confirm domain and hosting",
    "- [ ] Run accessibility and SEO checks per Content QA checklist",
    "- [ ] Ensure no fabricated testimonials, prices, or statistics",
  ];

  const afterLaunch = [
    "- [ ] Monitor analytics [PLACEHOLDER: tooling]",
    "- [ ] Review conversion CTAs after first traffic week",
    "- [ ] Schedule content updates for menu/prices/hours",
  ];

  return [
    sectionHeader(INTELLIGENCE_SECTION_TITLES[9]),
    "## Before Design",
    ...beforeDesign,
    "## Before Development",
    ...beforeDevelopment,
    "## Before Content",
    ...beforeContent,
    "## Before Launch",
    ...beforeLaunch,
    "## After Launch",
    ...afterLaunch,
  ];
}

function buildAllSections(ctx: BriefIntelContext): string[][] {
  return [
    section1Completeness(ctx),
    section2Risks(ctx),
    section3Conversion(ctx),
    section4Seo(ctx),
    section5Design(ctx),
    section6Content(ctx),
    section7Technical(ctx),
    section8MissingAssets(ctx),
    section9ReadinessScore(ctx),
    section10LaunchChecklist(ctx),
  ];
}

export function buildBlueprintIntelligenceMarkdown(brief: WebsiteBrief): string {
  const ctx = buildContext(brief);
  return [
    "# Blueprint Intelligence",
    "",
    "Pre-generation brief analysis. Validates and improves the Website Brief before Website DNA is built.",
    "Uses brief fields only — never invents business facts. Mark gaps as [PLACEHOLDER].",
    "",
    ...buildAllSections(ctx).flatMap((section) => [...section, ""]),
  ].join("\n");
}

export function buildBlueprintIntelligenceChecklistItems(
  brief: WebsiteBrief,
): string[] {
  const ctx = buildContext(brief);
  const scores = computeReadinessScores(brief);

  return [
    "# Blueprint Intelligence Summary",
    `Overall readiness: ${scores.overall}/100 (Business ${scores.business}, Content ${scores.content}, Design ${scores.design}, SEO ${scores.seo}, Conversion ${scores.conversion}, Technical ${scores.technical})`,
    ...section8MissingAssets(ctx).slice(0, 12),
    ...section10LaunchChecklist(ctx).slice(0, 20),
  ];
}

export function allIntelligenceSectionsPresent(text: string): boolean {
  return INTELLIGENCE_SECTION_TITLES.every((title) => text.includes(title));
}

export function extractIntelligenceWordCount(masterPrompt: string): number {
  const start = masterPrompt.indexOf("# Blueprint Intelligence");
  const end = masterPrompt.indexOf("# Website DNA & Build Specification", start);
  if (start < 0) {
    return 0;
  }

  const block = masterPrompt.slice(start, end > start ? end : undefined);
  return block.split(/\s+/).filter(Boolean).length;
}
