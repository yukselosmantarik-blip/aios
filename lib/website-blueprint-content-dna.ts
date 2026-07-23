import type { WebsiteBrief } from "@/lib/website-briefs.types";
import type {
  BusinessProfile,
  PageDnaContext,
} from "@/lib/website-blueprint-page-dna";
import {
  getPageSections,
  pageBusinessGoal,
  pageH1Direction,
  pageSearchIntent,
  pageUserIntent,
} from "@/lib/website-blueprint-page-dna";

export type StyleTier = "premium" | "modern" | "default";

export type ContentDnaContext = {
  brief: WebsiteBrief;
  profile: BusinessProfile;
  sitemap: string[];
  services: string[];
  primaryCta: string;
  secondaryCta: string;
  usp: string;
  style: string;
  tier: StyleTier;
  requestedFeatures: string[];
};

export const CONTENT_DNA_SECTION_TITLES = [
  "1. Messaging Foundation",
  "2. Tone of Voice",
  "3. Audience Messaging",
  "4. Messaging Hierarchy",
  "5. Headline System",
  "6. Hero Copy DNA",
  "7. Section Copy DNA",
  "8. CTA System",
  "9. Benefit and Feature Copy",
  "10. Product or Service Copy",
  "11. Trust and Social Proof Copy",
  "12. About and Brand Story Content",
  "13. FAQ Content Strategy",
  "14. Form Microcopy",
  "15. Navigation and Utility Copy",
  "16. SEO Copy DNA",
  "17. Social and Open Graph Copy",
  "18. Localization Rules",
  "19. Content Length Guidelines",
  "20. Content Governance",
  "21. Page-Level Content Specification",
  "22. Content QA Checklist",
] as const;

function parseAudienceSegments(audience: string): string[] {
  return audience
    .split(/[,;]+/)
    .map((segment) => segment.trim())
    .filter(Boolean);
}

function hasOrderGoal(ctx: ContentDnaContext): boolean {
  return (
    /bestell|order|shop/i.test(ctx.brief.website_goal) ||
    ctx.requestedFeatures.some((f) => /bestell|order|shop/i.test(f))
  );
}

function hasDietaryNotes(brief: WebsiteBrief): boolean {
  return /halal|vegan|vegetar|allerg|gluten|lactose/i.test(
    `${brief.unique_selling_points ?? ""} ${brief.services ?? ""}`,
  );
}

function sectionHeader(title: string): string {
  return `# Content DNA — ${title}`;
}

function section1Messaging(ctx: ContentDnaContext): string[] {
  const confirmed = [
    `CONFIRMED: Business ${ctx.brief.business_name}; industry ${ctx.brief.industry}.`,
    ctx.brief.location ? `CONFIRMED: Location ${ctx.brief.location}.` : null,
    ctx.services.length
      ? `CONFIRMED: Offerings ${ctx.services.join(", ")}.`
      : null,
    `CONFIRMED: Goal ${ctx.brief.website_goal}.`,
    `CONFIRMED: USP ${ctx.usp}.`,
  ].filter(Boolean);

  return [
    sectionHeader(CONTENT_DNA_SECTION_TITLES[0]),
    ...confirmed.map((line) => `- ${line}`),
    `- Core brand message: ${ctx.brief.business_name} helps ${ctx.brief.target_audience} achieve ${ctx.brief.website_goal.toLowerCase()}.`,
    `- Primary value proposition: ${ctx.usp}`,
    `- Supporting value propositions: ${ctx.services.length ? ctx.services.map((s) => `Quality ${s} experience`).join("; ") : "[PLACEHOLDER: supporting benefits from brief services]"}.`,
    `- Brand promise: Deliver on brief USP — no additional promises without client proof.`,
    `- Customer outcome: Visitor can ${ctx.brief.website_goal.toLowerCase()} with confidence.`,
    `- Main differentiation: ${ctx.usp} (from brief — do not expand with unverified claims).`,
    `- Communication priorities: (1) Offer clarity (2) Trust via USP (3) CTA ${ctx.primaryCta} (4) Audience fit for ${ctx.brief.target_audience}.`,
    "- COPY DIRECTION: Label unconfirmed proof as [PLACEHOLDER]; never present suggestions as facts.",
  ];
}

function section2Tone(ctx: ContentDnaContext): string[] {
  const tierTone: Record<StyleTier, string> = {
    premium: "Refined, confident, understated",
    modern: "Direct, energetic, contemporary",
    default: "Professional, approachable, clear",
  };
  const formality =
    ctx.tier === "premium" ? "Semi-formal Sie acceptable; premium brands often use Sie in DE" : "Friendly Sie; clear and respectful";
  const urgency = /urgent|sofort|limited/i.test(ctx.brief.additional_notes ?? "")
    ? "Only if explicitly in brief notes — otherwise avoid fake urgency"
    : "Avoid fake urgency — not stated in brief";

  return [
    sectionHeader(CONTENT_DNA_SECTION_TITLES[1]),
    `- Brand personality: ${tierTone[ctx.tier]}; profile ${ctx.profile}.`,
    `- Formality: ${formality}.`,
    `- Energy: ${ctx.tier === "modern" ? "Medium-high" : "Medium"}.`,
    `- Emotional tone: Reassuring + appetizing/ competent for ${ctx.brief.industry}.`,
    "- Sentence length: Headlines 6–10 words; body 12–20 words max per sentence.",
    "- Vocabulary: Plain German; industry terms only when needed; no jargon walls.",
    `- Technical language: Low — audience ${ctx.brief.target_audience}.`,
    "- Humor: Minimal; only light warmth unless brief requests playful tone.",
    `- Urgency: ${urgency}.`,
    "- Emojis: Avoid in body copy; none in headlines.",
    `- Words to prefer: frisch, qualität, ${ctx.services.slice(0, 2).join(", ") || "service names from brief"}.`,
    "- Words to avoid: bester der stadt, führend, garantiert (without proof), billig (unless brief positioning).",
    `- GOOD: „${ctx.usp.slice(0, 60)} — ${ctx.primaryCta}."`,
    `- BAD: „Die besten Burger der Welt mit 10.000 zufriedenen Kunden!" (unsupported superlative + fake stat).`,
    "- Consistency: One voice across Page DNA sections; reference Component DNA labels only.",
  ];
}

function section3Audience(ctx: ContentDnaContext): string[] {
  const segments = parseAudienceSegments(ctx.brief.target_audience);
  const lines = [sectionHeader(CONTENT_DNA_SECTION_TITLES[2])];

  segments.forEach((segment, index) => {
    lines.push(
      `- Segment ${index + 1}: ${segment} | Need: Understand ${ctx.brief.industry} offering quickly | Motivation: ${ctx.brief.website_goal.slice(0, 60)} | Objection: Unclear menu/pricing/trust [PLACEHOLDER if unaddressed] | Trust: USP ${ctx.usp.slice(0, 50)} | Angle: Benefit-led, factual | CTA: ${ctx.primaryCta}`,
    );
  });

  if (segments.length === 0) {
    lines.push(
      `- Audience (brief): ${ctx.brief.target_audience} — do not invent demographics beyond brief text.`,
    );
  }

  return lines;
}

function section4Hierarchy(ctx: ContentDnaContext): string[] {
  return [
    sectionHeader(CONTENT_DNA_SECTION_TITLES[3]),
    `1. What: ${ctx.brief.business_name} — ${ctx.brief.industry}${ctx.services.length ? ` (${ctx.services.join(", ")})` : ""}.`,
    `2. Why it matters: Supports goal — ${ctx.brief.website_goal}.`,
    `3. Why trust: USP ${ctx.usp}; social proof [PLACEHOLDER until client supplies].`,
    `4. Why different: Brief USP only — no competitor claims unless in brief references.`,
    `5. Next step: ${ctx.primaryCta} (secondary: ${ctx.secondaryCta}).`,
  ];
}

function section5Headlines(ctx: ContentDnaContext): string[] {
  const biz = ctx.brief.business_name;
  return [
    sectionHeader(CONTENT_DNA_SECTION_TITLES[4]),
    "- Hero: 6–10 words | Structure: [Benefit] + [Brand or Offer] | Tone: Confident, specific | Capitalization: Sentence case | Punctuation: No trailing period on H1",
    `- Hero pattern: „${biz} — ${ctx.usp.slice(0, 40)}" (adapt; no unsupported claims)`,
    "- Section: 3–6 words | Structure: Noun phrase or benefit | Tone: Scannable | Sentence case",
    '- Benefit: Verb-led | „[Benefit] für [audience segment]"',
    `- Product/service: Use brief name verbatim — e.g. „${ctx.services[0] ?? "[PLACEHOLDER: service name]"}"`,
    '- Testimonial heading: „Das sagen unsere Gäste" / „Kundenstimmen" — no fake ratings in heading',
    '- FAQ: „Häufige Fragen" or topic-specific H2',
    `- Final CTA: Action-led 4–8 words | „${ctx.primaryCta}" or „Bereit für ${biz}?"`,
  ];
}

function section6HeroGlobal(): string[] {
  return [
    sectionHeader(CONTENT_DNA_SECTION_TITLES[5]),
    "- Per-page hero copy (eyebrow, H1, subheadline, CTAs, trust microcopy, media caption) is generated for each sitemap page in the Page Content DNA block.",
    "- Homepage rules: clear offer, differentiator, and CTA; no vague slogans; no fake statistics; no unsupported superlatives.",
  ];
}

function section7SectionGlobal(): string[] {
  return [
    sectionHeader(CONTENT_DNA_SECTION_TITLES[6]),
    "- Per-page section copy DNA is generated from Page DNA section definitions for each page (goal, message, supporting points, length, format, CTA, proof).",
    "- Vary copy structure across sections — avoid repeating identical paragraph patterns on one page.",
  ];
}

function section16SeoGlobal(ctx: ContentDnaContext): string[] {
  return [
    sectionHeader(CONTENT_DNA_SECTION_TITLES[15]),
    "- Per-page SEO copy DNA (search intent, meta patterns, slugs, alt text) is generated for each sitemap page.",
    `- Global topic anchor: ${ctx.brief.business_name} — ${ctx.brief.industry}; avoid keyword stuffing sitewide.`,
  ];
}

function section17SocialGlobal(): string[] {
  return [
    sectionHeader(CONTENT_DNA_SECTION_TITLES[16]),
    "- Per-page Open Graph and social teaser direction is generated for each sitemap page.",
    "- Use platform-neutral OG copy v1; sharing-image text uses brand name + USP short form [PLACEHOLDER if needed].",
  ];
}

function section8CtaSystem(ctx: ContentDnaContext): string[] {
  return [
    sectionHeader(CONTENT_DNA_SECTION_TITLES[7]),
    `- Primary conversion: Label „${ctx.primaryCta}" | Placement: hero, header, final band, sticky mobile | Microcopy: optional „${ctx.brief.website_goal.slice(0, 50)}" | Avoid when: informational pages without conversion goal`,
    `- Secondary exploration: Label „${ctx.secondaryCta}" | Placement: hero ghost, mid-page | Microcopy: learn more | Avoid: competing with primary above fold`,
    `- Contact: „Kontakt aufnehmen" / „Anfrage senden" | Placement: contact page, footer | When brief features include form`,
    `- Order/reservation: „${hasOrderGoal(ctx) ? ctx.primaryCta : "[PLACEHOLDER: order CTA if applicable]"} | Menu page sticky mobile | No fake „only today" urgency`,
    "- Navigation: Page names from sitemap verbatim — no clever renames",
    '- Inline: Text link „Mehr erfahren" within body sections',
    `- Final: Repeat „${ctx.primaryCta}" before footer`,
    `- Mobile sticky: „${ctx.primaryCta}" on home/menu/contact — see Page DNA`,
  ];
}

function section9Benefits(ctx: ContentDnaContext): string[] {
  const lines = [sectionHeader(CONTENT_DNA_SECTION_TITLES[8])];
  if (ctx.services.length === 0) {
    lines.push(
      "- [PLACEHOLDER: map features from brief services when provided] | Feature vs benefit: name the item (feature) + outcome for visitor (benefit).",
    );
    return lines;
  }

  ctx.services.forEach((service) => {
    lines.push(
      `- Feature: ${service} | Benefit: Enjoy ${service} aligned with ${ctx.brief.target_audience} needs | Explanation: [PLACEHOLDER: 1–2 sentences from client] | Proof: [PLACEHOLDER: photo/review] | Placement: menu/home featured | CTA: ${ctx.primaryCta}`,
    );
  });

  ctx.requestedFeatures.forEach((feature) => {
    lines.push(
      `- Required feature: ${feature} | Benefit: Supports ${ctx.brief.website_goal} | Proof: [PLACEHOLDER] | CTA: related conversion path`,
    );
  });

  return lines;
}

function section10ProductCopy(ctx: ContentDnaContext): string[] {
  const lines = [sectionHeader(CONTENT_DNA_SECTION_TITLES[9])];
  if (ctx.profile !== "restaurant" && ctx.services.length === 0) {
    lines.push(
      "- Naming: Use brief service names verbatim | Short description: 1 sentence benefit + [PLACEHOLDER scope] | Price: [PLACEHOLDER: EUR] | No invented ingredients.",
    );
    return lines;
  }

  const items = ctx.services.length ? ctx.services : ["[PLACEHOLDER: menu item]"];
  items.forEach((item) => {
    lines.push(
      `- Item: ${item} | Name rules: Exact brief spelling | Short desc: 12–20 words + [PLACEHOLDER ingredients] | Price: [PLACEHOLDER: EUR] | Dietary: ${hasDietaryNotes(ctx.brief) ? "note from brief USP only" : "[PLACEHOLDER if relevant]"} | Badge: only if confirmed in brief | Availability: [PLACEHOLDER] | Order CTA: ${ctx.primaryCta}`,
    );
  });

  return lines;
}

function section11Trust(ctx: ContentDnaContext): string[] {
  return [
    sectionHeader(CONTENT_DNA_SECTION_TITLES[10]),
    "- Testimonials: [PLACEHOLDER: quote, name, context] — never fabricate",
    "- Reviews: [PLACEHOLDER: rating source] — no invented star counts",
    `- Quality claims: Only „${ctx.usp}" from brief`,
    "- Certifications: [PLACEHOLDER: cert name + proof document]",
    "- Awards: [PLACEHOLDER: award + year + issuer]",
    "- Customer numbers: [PLACEHOLDER: only with verified stat source]",
    "- Partner logos: [PLACEHOLDER: client permission required]",
    "- Trust badges: USP-derived text badges only; mark proof source for each",
  ];
}

function section12About(ctx: ContentDnaContext): string[] {
  return [
    sectionHeader(CONTENT_DNA_SECTION_TITLES[11]),
    "- Brand story structure: (1) Who we are (2) What we stand for from USP (3) Why visitors should care (goal) (4) CTA",
    "- Founding story: [PLACEHOLDER: client narrative — do not invent dates/names]",
    `- Mission direction: Support ${ctx.brief.website_goal}`,
    `- Values: Derive 3 values from USP „${ctx.usp.slice(0, 80)}" only`,
    `- Quality promise: Restate USP — ${ctx.usp}`,
    "- Team/founder: [PLACEHOLDER: name, role, photo, bio]",
    `- Local connection: ${ctx.brief.location ?? "[PLACEHOLDER: city/region]"} — factual only`,
    `- Final CTA: ${ctx.secondaryCta} or ${ctx.primaryCta}`,
  ];
}

function section13Faq(ctx: ContentDnaContext): string[] {
  const categories = [
    `Ordering/goal: „Kann ich online bestellen?" → Answer from brief goal only; CTA ${ctx.primaryCta}; schema FAQPage if Q&A confirmed`,
    `Offerings: „Was bietet ${ctx.brief.business_name}?" → ${ctx.services.join(", ") || "[PLACEHOLDER: services]"}`,
    `Audience fit: „Für wen geeignet?" → ${ctx.brief.target_audience}`,
    `Contact: „Wie erreiche ich Sie?" → Contact page; [PLACEHOLDER: hours/phone]`,
  ];

  if (hasDietaryNotes(ctx.brief)) {
    categories.push(
      'Dietary: „Welche dietary options?" → [PLACEHOLDER: confirm from brief USP/services]',
    );
  }

  return [
    sectionHeader(CONTENT_DNA_SECTION_TITLES[12]),
    ...categories.map(
      (c) =>
        `- ${c} | Answer structure: 2–4 sentences; mark missing facts [PLACEHOLDER] | No invented business facts`,
    ),
  ];
}

function section14Forms(): string[] {
  return [
    sectionHeader(CONTENT_DNA_SECTION_TITLES[13]),
    "- Labels: Name, E-Mail, Nachricht (German)",
    '- Placeholders: Example format only — „Max Mustermann", „ihre@email.de", „Wie können wir helfen?"',
    '- Helper text: Optional under email — „Wir antworten [PLACEHOLDER: timeframe]"',
    '- Privacy: „Mit Absenden stimmen Sie der Verarbeitung zu. [PLACEHOLDER: Datenschutz-Link]"',
    '- Validation: „Bitte füllen Sie dieses Feld aus." / „Bitte gültige E-Mail eingeben."',
    '- Error: „Senden fehlgeschlagen. Bitte erneut versuchen."',
    '- Success: „Vielen Dank — wir melden uns [PLACEHOLDER: timeframe]."',
    '- Loading: „Wird gesendet …"',
    '- Disabled: „Bitte alle Pflichtfelder ausfüllen."',
  ];
}

function section15NavUtility(ctx: ContentDnaContext): string[] {
  return [
    sectionHeader(CONTENT_DNA_SECTION_TITLES[14]),
    `- Navigation labels: ${ctx.sitemap.join(", ")} — match sitemap exactly`,
    '- Mobile menu: „Menü" / „Schließen" | Breadcrumb: Home › [Page] | Back: „Zurück"',
    '- Search placeholder: „Suchen …" [PLACEHOLDER if search not in brief features]',
    '- Empty state: „Keine Ergebnisse — Filter zurücksetzen oder Kontakt."',
    '- 404: „Seite nicht gefunden" + link home + contact',
    '- Loading: „Lädt …"',
    "- Cookie/privacy: [PLACEHOLDER: legal copy from client]",
  ];
}

function section18Localization(ctx: ContentDnaContext): string[] {
  return [
    sectionHeader(CONTENT_DNA_SECTION_TITLES[17]),
    "- Primary language: German (de-DE) — from project conventions",
    "- Consistency: German UI copy sitewide unless brief terms are proper nouns",
    `- Address: Sie (formal) default for ${ctx.profile} profile`,
    "- English brand terms: Keep ${ctx.brief.business_name} as in brief",
    "- Numbers: 1.234,56 | Dates: DD.MM.YYYY | Time: 24h | Currency: [PLACEHOLDER: EUR prices]",
    `- Address format: ${ctx.brief.location ?? "[PLACEHOLDER: street, PLZ city]"} German format`,
    "- Additional languages: [PLACEHOLDER: not in brief — single language v1]",
  ];
}

function section19Length(): string[] {
  return [
    sectionHeader(CONTENT_DNA_SECTION_TITLES[18]),
    "- Hero headline: 6–10 words (max ~60 chars)",
    "- Hero subheadline: 15–25 words",
    "- Section intro: 30–60 words",
    "- Card title: 3–6 words",
    "- Card description: 15–30 words",
    "- Product description: 12–25 words + [PLACEHOLDER details]",
    "- FAQ answer: 40–80 words",
    "- Meta title: 50–60 chars",
    "- Meta description: 150–160 chars",
    "- Button label: 2–4 words",
    "- Form helper: 8–15 words",
    "- Do not pad copy to hit limits — prefer concise.",
  ];
}

function section20Governance(): string[] {
  return [
    sectionHeader(CONTENT_DNA_SECTION_TITLES[19]),
    "- Single source: Typed content modules per page (see Page DNA routes)",
    "- Editable structure: JSON/TS fields per section; no copy hardcoded in components",
    "- Placeholder tracking: Maintain PLACEHOLDER.md listing all [PLACEHOLDER] keys",
    "- Proof checklist: USP, testimonials, prices, hours, address each need client sign-off",
    "- Approval workflow: Client reviews content module before replace placeholders",
    "- Content owner: [PLACEHOLDER: client contact]",
    "- Update frequency: Menu/prices [PLACEHOLDER: as needed]; static pages annually",
    "- Duplication: Shared USP string imported once; reference don't repeat verbatim 5× on one page",
  ];
}

function section22Qa(ctx: ContentDnaContext): string[] {
  return [
    sectionHeader(CONTENT_DNA_SECTION_TITLES[21]),
    "- Confirmed facts only from brief",
    "- No fabricated social proof, ratings, stats",
    "- Value proposition clear above fold on home",
    "- Tone matches Content DNA section 2",
    `- CTA labels consistent: ${ctx.primaryCta}`,
    "- Readability: short sentences; mobile scannable",
    "- Grammar: German spell-check before publish",
    "- Accessibility: plain language; no essential info in images alone",
    "- SEO: unique meta per page; no keyword stuffing",
    "- Placeholders visible in staging — not hidden",
    "- Legal: Impressum/Datenschutz [PLACEHOLDER]",
    "- Duplicate copy review across pages",
  ];
}

function buildGlobalSections(ctx: ContentDnaContext): string[][] {
  return [
    section1Messaging(ctx),
    section2Tone(ctx),
    section3Audience(ctx),
    section4Hierarchy(ctx),
    section5Headlines(ctx),
    section6HeroGlobal(),
    section7SectionGlobal(),
    section8CtaSystem(ctx),
    section9Benefits(ctx),
    section10ProductCopy(ctx),
    section11Trust(ctx),
    section12About(ctx),
    section13Faq(ctx),
    section14Forms(),
    section15NavUtility(ctx),
    section16SeoGlobal(ctx),
    section17SocialGlobal(),
    section18Localization(ctx),
    section19Length(),
    section20Governance(),
    section22Qa(ctx),
  ];
}

export function buildGlobalContentDnaItems(ctx: ContentDnaContext): string[] {
  return buildGlobalSections(ctx).flat();
}

export function buildGlobalContentDnaMarkdown(ctx: ContentDnaContext): string {
  return [
    "# Content DNA",
    "",
    "Copy and messaging specification derived from Website Brief only. Reference Page DNA for structure and Component DNA for UI — do not duplicate technical specs.",
    "",
    ...buildGlobalSections(ctx).flatMap((section) => [...section, ""]),
  ].join("\n");
}

function heroCopyForPage(ctx: PageDnaContext): string[] {
  const h1 = pageH1Direction(ctx.role, ctx.brief, ctx.page);
  return [
    sectionHeader("6. Hero Copy DNA"),
    `Page: ${ctx.page} (${ctx.role})`,
    `- Eyebrow: ${ctx.usp.slice(0, 50)} or industry tag — factual only`,
    `- H1 direction: ${h1}`,
    `- Subheadline: Paraphrase goal „${ctx.brief.website_goal.slice(0, 90)}"`,
    `- Primary CTA label: ${ctx.primaryCta}`,
    `- Secondary CTA label: ${ctx.secondaryCta}`,
    "- Trust microcopy: Brief USP snippet or [PLACEHOLDER: proof]",
    "- Media caption: [PLACEHOLDER: describe image from client asset — no invented scene]",
    ...(ctx.role === "home"
      ? [
          "- Homepage rules: Clear offer + differentiator + CTA; no vague slogans; no fake stats; no unsupported superlatives",
        ]
      : []),
  ];
}

function sectionCopyForPage(ctx: PageDnaContext): string[] {
  const sections = getPageSections(ctx);
  const lines = [sectionHeader("7. Section Copy DNA")];

  sections.forEach((section, index) => {
    const formats = ["bullet list", "short paragraph", "card grid", "accordion", "split text+image"];
    const format = formats[index % formats.length];
    lines.push(
      `- ${section.name} | Goal: ${section.purpose.slice(0, 80)} | Main message: ${section.copyDirection.slice(0, 60)} | Supporting: ${section.contentRequirements.slice(0, 80)} | Length: 40–120 words section intro | Format: ${format} | CTA: ${section.ctaBehavior.slice(0, 50)} | Proof: ${section.contentRequirements.includes("PLACEHOLDER") ? "PLACEHOLDER required" : "brief facts only"}`,
    );
  });

  return lines;
}

function pageLevelSpec(ctx: PageDnaContext): string[] {
  return [
    sectionHeader(CONTENT_DNA_SECTION_TITLES[20]),
    `- Page: ${ctx.page} | Messaging objective: ${pageBusinessGoal(ctx.role, ctx.brief, ctx.profile)}`,
    `- Primary audience: ${ctx.brief.target_audience}`,
    `- Primary message: ${pageUserIntent(ctx.role, ctx.brief).slice(0, 100)}`,
    `- Supporting messages: USP; ${ctx.services.slice(0, 2).join(", ") || "offerings [PLACEHOLDER]"}`,
    `- Copy sequence: Hero → sections per Page DNA §3 → Final CTA (see Page DNA)`,
    "- Required blocks: per Page DNA section order — do not skip",
    `- CTA copy: ${ctx.primaryCta} primary; ${ctx.secondaryCta} secondary`,
    "- Trust content: USP + testimonials [PLACEHOLDER]",
    `- SEO copy: intent ${pageSearchIntent(ctx.role, ctx.brief).slice(0, 80)}`,
    "- Missing placeholders: prices, hours, address, testimonials, team — mark [PLACEHOLDER] in content module",
  ];
}

function seoCopyForPage(ctx: PageDnaContext): string[] {
  const sections = getPageSections(ctx);
  return [
    sectionHeader(CONTENT_DNA_SECTION_TITLES[15]),
    `Page: ${ctx.page}`,
    `- Search intent: ${pageSearchIntent(ctx.role, ctx.brief)}`,
    `- Primary topic: ${ctx.brief.business_name} — ${ctx.page}`,
    `- Supporting topics: ${ctx.services.join(", ") || ctx.brief.industry}`,
    `- H1 direction: ${pageH1Direction(ctx.role, ctx.brief, ctx.page)}`,
    `- H2 direction: ${sections.map((s) => s.name).slice(0, 5).join(", ")}`,
    `- Meta title pattern: ${ctx.page} | ${ctx.brief.business_name} (≤60 chars)`,
    `- Meta description: Audience ${ctx.brief.target_audience.slice(0, 40)} + goal — unique, no stuffing`,
    `- URL slug: ${ctx.slug}`,
    "- Internal anchors: contextual links to other sitemap pages",
    "- Image alt: describe subject; item names from brief; decorative alt=\"\"",
    ctx.brief.location
      ? `- Local SEO: include ${ctx.brief.location} naturally in meta/body`
      : "- Local SEO: [PLACEHOLDER until location confirmed]",
  ];
}

function socialCopyForPage(ctx: PageDnaContext): string[] {
  return [
    sectionHeader(CONTENT_DNA_SECTION_TITLES[16]),
    `Page: ${ctx.page}`,
    `- OG title: ${ctx.brief.business_name} — ${ctx.page}`,
    `- OG description: ${ctx.brief.website_goal.slice(0, 120)}`,
    "- Social caption: Neutral teaser + link — no hashtag spam",
    "- Sharing image text: Brand name + [PLACEHOLDER: tagline from USP short form]",
    "- Platform-neutral: Same OG for all networks v1",
  ];
}

export function buildPageContentDna(ctx: PageDnaContext): string[] {
  return [
    "",
    "# Content DNA (Page)",
    ...heroCopyForPage(ctx),
    "",
    ...sectionCopyForPage(ctx),
    "",
    ...pageLevelSpec(ctx),
    "",
    ...seoCopyForPage(ctx),
    "",
    ...socialCopyForPage(ctx),
  ];
}

export function extractContentDnaWordCount(
  features: string[],
  pageSpecs: Record<string, string[]>,
  masterPrompt?: string,
): number {
  const countWords = (text: string) =>
    text.split(/\s+/).filter(Boolean).length;

  let globalText = features
    .filter((item) => item.includes("Content DNA"))
    .join(" ");

  if (masterPrompt) {
    const contentStart = masterPrompt.indexOf("# Content DNA");
    const motionStart = masterPrompt.indexOf("# Motion DNA", contentStart);
    if (contentStart >= 0) {
      globalText = masterPrompt.slice(
        contentStart,
        motionStart > contentStart ? motionStart : undefined,
      );
    }
  }

  let pageText = "";
  for (const sections of Object.values(pageSpecs)) {
    const idx = sections.findIndex((line) => line === "# Content DNA (Page)");
    if (idx >= 0) {
      pageText += `${sections.slice(idx).join(" ")} `;
    }
  }

  return countWords(`${globalText} ${pageText}`);
}

export function allContentDnaSectionsPresent(
  features: string[],
  pageSpecs: Record<string, string[]>,
): boolean {
  const blob = [
    features.join("\n"),
    ...Object.values(pageSpecs).flat(),
  ].join("\n");
  return CONTENT_DNA_SECTION_TITLES.every((title) => blob.includes(title));
}

export function pageContentSectionsPresent(pageSpecs: string[]): boolean {
  const blob = pageSpecs.join("\n");
  return (
    blob.includes("6. Hero Copy DNA") &&
    blob.includes("7. Section Copy DNA") &&
    blob.includes("16. SEO Copy DNA") &&
    blob.includes("17. Social and Open Graph Copy") &&
    blob.includes("21. Page-Level Content Specification")
  );
}
