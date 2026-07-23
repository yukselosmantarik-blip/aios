import type { WebsiteBrief } from "@/lib/website-briefs.types";
import type {
  BusinessProfile,
  PageDnaContext,
  PageRole,
} from "@/lib/website-blueprint-page-dna";
import { getPageSections } from "@/lib/website-blueprint-page-dna";

export type PatternId =
  | "hero"
  | "feature-grid"
  | "usp-block"
  | "statistics"
  | "gallery"
  | "testimonials"
  | "faq"
  | "cta-banner"
  | "pricing"
  | "timeline"
  | "team"
  | "location"
  | "footer"
  | "navbar"
  | "menu-grid"
  | "reservation-block";

export type StyleTier = "premium" | "modern" | "default";

export type PatternLibraryContext = {
  brief: WebsiteBrief;
  profile: BusinessProfile;
  tier: StyleTier;
  prefersMotion: boolean;
  primaryCta: string;
  secondaryCta: string;
};

export type PatternSpec = {
  layoutType: string;
  visualHierarchy: string;
  spacing: string;
  responsiveBehaviour: string;
  animationBehaviour: string;
  accessibilityNotes: string;
  componentOrder: string;
  desktopLayout: string;
  tabletLayout: string;
  mobileLayout: string;
  imagePlacement: string;
  ctaPlacement: string;
  optionalVariants: string;
  premiumRecommendations: string;
};

const PATTERN_TITLES: Record<PatternId, string> = {
  hero: "Hero Pattern",
  "feature-grid": "Feature Grid Pattern",
  "usp-block": "USP Block Pattern",
  statistics: "Statistics Pattern",
  gallery: "Gallery Pattern",
  testimonials: "Testimonials Pattern",
  faq: "FAQ Pattern",
  "cta-banner": "CTA Banner Pattern",
  pricing: "Pricing Pattern",
  timeline: "Timeline Pattern",
  team: "Team Pattern",
  location: "Location Pattern",
  footer: "Footer Pattern",
  navbar: "Navbar Pattern",
  "menu-grid": "Menu Grid Pattern",
  "reservation-block": "Reservation Block Pattern",
};

function spacingScale(tier: StyleTier): string {
  if (tier === "premium") {
    return "section py-20–py-28; inner max-w-7xl px-6 lg:px-8; gap-8–12";
  }
  if (tier === "modern") {
    return "section py-16–py-24; inner max-w-6xl px-4 md:px-6; gap-6–10";
  }
  return "section py-12–py-20; inner max-w-6xl px-4; gap-6–8";
}

function motionLine(ctx: PatternLibraryContext, detail: string): string {
  const base = ctx.prefersMotion || ctx.tier === "premium"
    ? detail
    : "Minimal motion — opacity/transform only; honor prefers-reduced-motion.";
  return `${base} Use Motion DNA tokens; no layout-shifting animation.`;
}

function premiumLine(ctx: PatternLibraryContext, line: string): string {
  return ctx.tier === "premium"
    ? line
    : `${line} Upgrade path: increase whitespace and motion restraint for premium tier.`;
}

function buildPattern(
  ctx: PatternLibraryContext,
  spec: PatternSpec,
): PatternSpec {
  return spec;
}

function heroPattern(ctx: PatternLibraryContext, role: PageRole): PatternSpec {
  const roleLayout: Record<PageRole, string> = {
    home: "Full-bleed hero; optional 50/50 text+media split on desktop.",
    menu: "Compact hero with category anchor strip below headline.",
    about: "Split hero — headline left, brand image right.",
    gallery: "Minimal hero; optional featured image with scrim overlay.",
    contact: "Short hero; form visible on mobile without deep scroll.",
    location: "Map-forward hero with address overlay card.",
    services: "Benefit-led split hero with service teaser cards.",
    portfolio: "Showcase hero with project thumbnail strip.",
    reviews: "Rating-forward hero with summary [PLACEHOLDER].",
    team: "People-forward hero with team preview mosaic.",
    treatments: "Calm clinical hero; reassuring headline hierarchy.",
    generic: "Centered or split hero per Visual DNA tier.",
  };

  return buildPattern(ctx, {
    layoutType: roleLayout[role] ?? roleLayout.generic,
    visualHierarchy: "Eyebrow → H1 (single per page) → subheadline → primary CTA → secondary CTA → trust microcopy.",
    spacing: spacingScale(ctx.tier),
    responsiveBehaviour:
      "Desktop: split or centered max-w-4xl text; Tablet: stack with 60/40 text priority; Mobile: single column, CTAs full-width stacked.",
    animationBehaviour: motionLine(
      ctx,
      "Hero media fade-in 400ms; headline stagger 80ms; CTA hover scale 1.02.",
    ),
    accessibilityNotes:
      "One H1 only; CTAs min 44px; contrast AA on scrim; decorative hero media alt=\"\" if redundant with text.",
    componentOrder:
      "SectionContainer → Eyebrow → Heading → Subhead → CTAGroup(primary, secondary) → TrustMicrocopy → MediaSlot",
    desktopLayout: roleLayout[role] ?? roleLayout.generic,
    tabletLayout: "Stack media below copy unless menu/contact short-hero variant.",
    mobileLayout: "Centered copy; media 16:9 below fold; sticky CTA optional per Page DNA.",
    imagePlacement:
      "Right column or background cover; 16:9 or 3:2; [PLACEHOLDER] client asset; object-cover with focal point center.",
    ctaPlacement:
      `Primary ${ctx.primaryCta} inline after subhead; secondary ${ctx.secondaryCta} ghost adjacent; header CTA mirrors primary.`,
    optionalVariants:
      "Centered minimal | Split 50/50 | Video background [PLACEHOLDER] | Gradient scrim over photo",
    premiumRecommendations: premiumLine(
      ctx,
      "Generous vertical rhythm, subtle parallax on media (reduced-motion off), refined button pair with micro-interaction.",
    ),
  });
}

function featureGridPattern(ctx: PatternLibraryContext): PatternSpec {
  return buildPattern(ctx, {
    layoutType: "Responsive card grid with section heading and optional intro.",
    visualHierarchy: "H2 section title → intro paragraph → grid of FeatureCards (icon/title/body/link).",
    spacing: spacingScale(ctx.tier),
    responsiveBehaviour: "Mobile 1 col; tablet 2 col; desktop 3–4 col; equal card heights within row.",
    animationBehaviour: motionLine(
      ctx,
      "Section reveal on scroll; card stagger 60–80ms; hover lift shadow-md desktop.",
    ),
    accessibilityNotes: "Cards as list or article; headings in sequence; icon decorative with text label.",
    componentOrder:
      "SectionHeading → IntroText → Grid → FeatureCard(icon, title, body, link?) × n",
    desktopLayout: "3–4 column grid; optional asymmetric featured card spanning 2 cols.",
    tabletLayout: "2 column grid; intro full width above.",
    mobileLayout: "Single column stack; 16px gap; tap targets full card width.",
    imagePlacement: "Optional 4:3 thumbnail top of card or icon slot 48–64px.",
    ctaPlacement: "Per-card text link or section-level button below grid.",
    optionalVariants: "Icon grid | Image cards | Bento asymmetric grid | Horizontal scroll row mobile",
    premiumRecommendations: premiumLine(
      ctx,
      "Bento layout with one hero card; subtle border-gradient cards; scroll-triggered stagger.",
    ),
  });
}

function uspBlockPattern(ctx: PatternLibraryContext): PatternSpec {
  return buildPattern(ctx, {
    layoutType: "Benefit band — grid or stacked proof statements from brief USP.",
    visualHierarchy: "H2 → 3–4 benefit columns → optional supporting line from USP.",
    spacing: spacingScale(ctx.tier),
    responsiveBehaviour: "Mobile stack; tablet 2×2; desktop 4-col or 3-col centered band.",
    animationBehaviour: motionLine(ctx, "Column fade-up stagger 80ms; no auto-carousel."),
    accessibilityNotes: "Benefits as ul/li or headings + text; no color-only meaning.",
    componentOrder: "SectionHeading → USPGrid → BenefitColumn(icon, title, text) × n",
    desktopLayout: "Even columns with vertical dividers optional (premium).",
    tabletLayout: "2×2 grid centered.",
    mobileLayout: "Stacked columns with 24px separation.",
    imagePlacement: "Small icons per column; no large photography unless split variant.",
    ctaPlacement: `Optional secondary link to About; no primary CTA unless paired with CTA Banner below.`,
    optionalVariants: "Icon columns | Split text+image | Blockquote USP | Badge strip",
    premiumRecommendations: premiumLine(
      ctx,
      "Large typographic USP pull-quote with restrained iconography; wide gutters.",
    ),
  });
}

function statisticsPattern(ctx: PatternLibraryContext): PatternSpec {
  return buildPattern(ctx, {
    layoutType: "Horizontal metric/trust strip — badges or stat cells.",
    visualHierarchy: "Small label → metric/value → optional caption (brief facts only).",
    spacing: "py-6–10; compact horizontal band; gap-4–8 between cells.",
    responsiveBehaviour: "Desktop inline row; mobile 2×2 grid or horizontal scroll snap.",
    animationBehaviour: motionLine(ctx, "Count-up only if number confirmed in brief; else static fade-in."),
    accessibilityNotes: "Never fabricate stats; [PLACEHOLDER] until verified; list semantics for badges.",
    componentOrder: "TrustBar → StatCell(icon?, value, label) × n",
    desktopLayout: "4-column equal strip below hero.",
    tabletLayout: "2×2 grid.",
    mobileLayout: "2×2 or scroll-snap row; min tap 44px.",
    imagePlacement: "Optional small icons left of labels; no chart graphics without data.",
    ctaPlacement: "None — informational strip only.",
    optionalVariants: "Badge strip | Stat counters | Logo cloud [PLACEHOLDER proofs]",
    premiumRecommendations: premiumLine(
      ctx,
      "Thin divider lines; monospace numerals only for confirmed metrics.",
    ),
  });
}

function galleryPattern(ctx: PatternLibraryContext): PatternSpec {
  return buildPattern(ctx, {
    layoutType: "Masonry or uniform grid with optional filter bar and lightbox.",
    visualHierarchy: "H2 → filters optional → image grid → lightbox/detail overlay.",
    spacing: spacingScale(ctx.tier),
    responsiveBehaviour: "Mobile 2 col; tablet 3 col; desktop 3–4 col; lazy-load below fold.",
    animationBehaviour: motionLine(
      ctx,
      "Thumbnail hover zoom 1.03; lightbox fade 250ms; filter crossfade 200ms.",
    ),
    accessibilityNotes: "Descriptive alt per image [PLACEHOLDER]; lightbox focus trap; keyboard ESC close.",
    componentOrder:
      "SectionHeading → FilterBar? → ImageGrid → Lightbox(viewer, controls, caption)",
    desktopLayout: "Uniform 4-col or masonry 3-col with gap-4.",
    tabletLayout: "3-col grid.",
    mobileLayout: "2-col grid; lightbox full viewport.",
    imagePlacement: "Grid cells 1:1 or 4:3; object-cover; no invented scene descriptions.",
    ctaPlacement: "Optional 'View gallery' below grid linking to full gallery page.",
    optionalVariants: "Masonry | Uniform grid | Carousel teaser | Featured + thumbs",
    premiumRecommendations: premiumLine(
      ctx,
      "Masonry with subtle hover overlay captions; smooth lightbox with swipe mobile.",
    ),
  });
}

function testimonialsPattern(ctx: PatternLibraryContext): PatternSpec {
  return buildPattern(ctx, {
    layoutType: "Quote grid or carousel with cite block.",
    visualHierarchy: "H2 → testimonial cards (quote, name, context) → optional aggregate rating [PLACEHOLDER].",
    spacing: spacingScale(ctx.tier),
    responsiveBehaviour: "Mobile swipe carousel; tablet 2 col; desktop 3 col static grid.",
    animationBehaviour: motionLine(ctx, "Carousel slide 300ms; pause on hover/focus; no auto-play by default."),
    accessibilityNotes: "blockquote + cite; carousel aria-live polite; manual controls required.",
    componentOrder:
      "SectionHeading → TestimonialGrid|Carousel → TestimonialCard(quote, avatar?, name, role)",
    desktopLayout: "3-column quote grid preferred over carousel when ≥3 quotes available.",
    tabletLayout: "2-column grid.",
    mobileLayout: "Single-column carousel with dots.",
    imagePlacement: "Optional avatar 1:1 [PLACEHOLDER]; decorative if name absent.",
    ctaPlacement: "Link to reviews page if in sitemap; no fake star ratings in heading.",
    optionalVariants: "Grid | Carousel | Single featured quote | Video testimonial [PLACEHOLDER]",
    premiumRecommendations: premiumLine(
      ctx,
      "Oversized pull quote typography; subtle quote mark graphic; avatar ring accent.",
    ),
  });
}

function faqPattern(ctx: PatternLibraryContext): PatternSpec {
  return buildPattern(ctx, {
    layoutType: "Accordion list — single column Q&A.",
    visualHierarchy: "H2 → accordion items (question button → answer panel).",
    spacing: "max-w-3xl centered; py-12–20; item py-4 border-b.",
    responsiveBehaviour: "Full-width accordion all breakpoints; touch-friendly expand targets.",
    animationBehaviour: motionLine(ctx, "Height transition 200ms ease-out; rotate chevron 180deg."),
    accessibilityNotes: "button aria-expanded; panel id linked; keyboard Enter/Space toggle.",
    componentOrder: "SectionHeading → FAQAccordion → FAQItem(question, answer) × n",
    desktopLayout: "Centered narrow column with optional sidebar CTA.",
    tabletLayout: "Same as desktop; slightly reduced padding.",
    mobileLayout: "Full-bleed accordion; 16px horizontal padding.",
    imagePlacement: "None standard; optional icon per question.",
    ctaPlacement: "Inline link to contact at section footer.",
    optionalVariants: "Single column accordion | Two-column grouped FAQ | Search filter [if many items]",
    premiumRecommendations: premiumLine(
      ctx,
      "Split layout FAQ left + contact card right on desktop.",
    ),
  });
}

function ctaBannerPattern(ctx: PatternLibraryContext): PatternSpec {
  return buildPattern(ctx, {
    layoutType: "Full-width conversion band with headline + dual CTAs.",
    visualHierarchy: "H2 motivational line → subcopy → primary + secondary buttons.",
    spacing: "py-16–24; inner max-w-4xl centered text-center or split.",
    responsiveBehaviour: "Mobile stacked full-width buttons; desktop inline button row.",
    animationBehaviour: motionLine(ctx, "Optional subtle background gradient shift; button hover standard."),
    accessibilityNotes: "CTA contrast AA; focus rings; no misleading urgency copy.",
    componentOrder: "CTABand → Heading → Subcopy → CTAGroup(primary, secondary)",
    desktopLayout: "Centered band or split text-left / CTA-right.",
    tabletLayout: "Centered stack.",
    mobileLayout: "Full-width primary; secondary below; optional sticky duplicate per Page DNA.",
    imagePlacement: "Optional background texture or photo with scrim; content remains readable.",
    ctaPlacement: `Primary ${ctx.primaryCta} dominant; secondary ${ctx.secondaryCta} ghost.`,
    optionalVariants: "Centered | Split | Image background | Newsletter inline [if feature requested]",
    premiumRecommendations: premiumLine(
      ctx,
      "Layered scrim + subtle grain; oversized CTA with icon arrow micro-motion.",
    ),
  });
}

function pricingPattern(ctx: PatternLibraryContext): PatternSpec {
  return buildPattern(ctx, {
    layoutType: "Tier cards or item price rows — prices [PLACEHOLDER] until confirmed.",
    visualHierarchy: "H2 → pricing cards (name, price placeholder, features) → footnote.",
    spacing: spacingScale(ctx.tier),
    responsiveBehaviour: "Mobile stack; tablet 2 col; desktop 3 col tier cards or table rows.",
    animationBehaviour: motionLine(ctx, "Card hover border accent; no price animation."),
    accessibilityNotes: "Price announced to screen readers; do not invent amounts.",
    componentOrder: "SectionHeading → PricingGrid → PriceCard × n → Disclaimer",
    desktopLayout: "3-tier comparison or menu-style price list table.",
    tabletLayout: "2-column cards.",
    mobileLayout: "Stacked cards; horizontal scroll comparison optional.",
    imagePlacement: "Optional icon per tier; menu items use 1:1 food thumb [PLACEHOLDER].",
    ctaPlacement: "Per-tier CTA or single primary below grid.",
    optionalVariants: "Tier cards | Simple price list | Menu item rows | Toggle monthly/once [PLACEHOLDER]",
    premiumRecommendations: premiumLine(
      ctx,
      "Highlight recommended tier with elevated card and subtle glow border.",
    ),
  });
}

function timelinePattern(ctx: PatternLibraryContext): PatternSpec {
  return buildPattern(ctx, {
    layoutType: "Vertical or horizontal timeline for story/milestones [PLACEHOLDER dates].",
    visualHierarchy: "H2 → timeline nodes (date label, title, body) chronological.",
    spacing: "max-w-3xl; node gap-8–12; connector line 2px muted.",
    responsiveBehaviour: "Desktop vertical left-aligned line; mobile stack nodes full width.",
    animationBehaviour: motionLine(ctx, "Node fade-in on scroll stagger 100ms."),
    accessibilityNotes: "Ordered list ol; dates as text not only visual position; no invented history.",
    componentOrder: "SectionHeading → Timeline → TimelineNode(date, title, body) × n",
    desktopLayout: "Vertical timeline with alternating copy/image optional.",
    tabletLayout: "Single column vertical.",
    mobileLayout: "Stacked nodes; line left border.",
    imagePlacement: "Optional node thumbnail 4:3 [PLACEHOLDER] beside milestone.",
    ctaPlacement: "None mid-timeline; optional About CTA after final node.",
    optionalVariants: "Vertical | Horizontal scroll | Story chapter sections",
    premiumRecommendations: premiumLine(
      ctx,
      "Alternating split nodes with photography; animated line draw on scroll (reduced-motion safe).",
    ),
  });
}

function teamPattern(ctx: PatternLibraryContext): PatternSpec {
  return buildPattern(ctx, {
    layoutType: "Team member card grid with portrait and role.",
    visualHierarchy: "H2 → grid of portraits → name → role → optional bio excerpt.",
    spacing: spacingScale(ctx.tier),
    responsiveBehaviour: "Mobile 1–2 col; tablet 2–3 col; desktop 3–4 col.",
    animationBehaviour: motionLine(ctx, "Card hover subtle scale 1.02; bio expand optional."),
    accessibilityNotes: "Photo alt includes name when provided; [PLACEHOLDER] until client data.",
    componentOrder: "SectionHeading → TeamGrid → TeamCard(image, name, role, bio?)",
    desktopLayout: "3–4 column portrait grid equal heights.",
    tabletLayout: "2–3 columns.",
    mobileLayout: "2-column compact or single column for long bios.",
    imagePlacement: "Portrait 1:1 or 3:4 top of card; object-cover faces centered.",
    ctaPlacement: "Link to full team page if in sitemap.",
    optionalVariants: "Grid | Featured founder + grid | Modal bio detail",
    premiumRecommendations: premiumLine(
      ctx,
      "Desaturated portrait treatment; hover reveal social links [PLACEHOLDER URLs].",
    ),
  });
}

function locationPattern(ctx: PatternLibraryContext): PatternSpec {
  return buildPattern(ctx, {
    layoutType: "Address + map + hours split panel.",
    visualHierarchy: "H2 → address block → hours table → map embed → directions CTA.",
    spacing: spacingScale(ctx.tier),
    responsiveBehaviour: "Mobile stack address then map; desktop 50/50 text/map.",
    animationBehaviour: motionLine(ctx, "Map static embed; fade-in section on scroll."),
    accessibilityNotes: "tel:/mailto: labeled; hours in table thead/tbody; map iframe title set.",
    componentOrder:
      "SectionHeading → AddressBlock → HoursTable → MapEmbed → DirectionsCTA",
    desktopLayout: "Split text left 45% / map right 55% or map-forward hero variant.",
    tabletLayout: "Stack with map 16:9.",
    mobileLayout: "Full-width map; address above; sticky directions button optional.",
    imagePlacement: "Map embed or static map thumbnail [PLACEHOLDER until URL supplied].",
    ctaPlacement: "Directions / Open in Maps external link; secondary contact link.",
    optionalVariants: "Map-forward | Card overlay on map | Multi-location list [PLACEHOLDER]",
    premiumRecommendations: premiumLine(
      ctx,
      "Custom map pin styling; glass address card overlay on map.",
    ),
  });
}

function footerPattern(ctx: PatternLibraryContext): PatternSpec {
  return buildPattern(ctx, {
    layoutType: "Site-wide footer — multi-column links, contact snippet, legal.",
    visualHierarchy: "Logo/name → link columns → contact → social [PLACEHOLDER] → legal bar.",
    spacing: "py-12–16; column gap-8; legal bar py-4 border-t.",
    responsiveBehaviour: "Mobile accordion columns or stacked; desktop 4-column grid.",
    animationBehaviour: "Static; no motion required.",
    accessibilityNotes: "nav landmark footer; link lists ul; legal links not color-only.",
    componentOrder:
      "SiteFooter → Brand → LinkColumns → ContactSnippet → SocialLinks? → LegalBar",
    desktopLayout: "4-column link grid + brand column.",
    tabletLayout: "2×2 column grid.",
    mobileLayout: "Stacked sections; legal links inline wrap.",
    imagePlacement: "Logo small in brand column [PLACEHOLDER].",
    ctaPlacement: "Optional newsletter or contact button in footer — secondary priority.",
    optionalVariants: "Minimal single row | Mega footer | Sticky legal bar",
    premiumRecommendations: premiumLine(
      ctx,
      "Refined typography scale down one step; subtle top border gradient separator.",
    ),
  });
}

function navbarPattern(ctx: PatternLibraryContext): PatternSpec {
  return buildPattern(ctx, {
    layoutType: "Sticky top navigation with logo, links, primary CTA.",
    visualHierarchy: "Logo left → nav links center/right → CTA button → mobile menu toggle.",
    spacing: "h-16–20; px-4–8; gap-6 nav items.",
    responsiveBehaviour: "Desktop horizontal nav; tablet compress labels; mobile hamburger drawer.",
    animationBehaviour: motionLine(ctx, "Sticky shrink on scroll optional; drawer slide 250ms."),
    accessibilityNotes: "nav landmark; mobile menu focus trap; skip-to-content link first in DOM.",
    componentOrder:
      "SiteHeader → Logo → DesktopNav(links) → CTAButton → MobileMenuButton → MobileDrawer",
    desktopLayout: "Logo | links | CTA inline.",
    tabletLayout: "Reduced links or mega-menu grouped.",
    mobileLayout: "Logo + menu icon; full-screen or slide drawer; CTA duplicated in drawer.",
    imagePlacement: "Logo image [PLACEHOLDER] max-h-8–10.",
    ctaPlacement: `Primary ${ctx.primaryCta} as header button desktop; repeat in mobile drawer.`,
    optionalVariants: "Transparent over hero | Solid sticky | Centered logo | Split nav",
    premiumRecommendations: premiumLine(
      ctx,
      "Blur backdrop sticky header; underline hover animation on links.",
    ),
  });
}

function menuGridPattern(ctx: PatternLibraryContext): PatternSpec {
  return buildPattern(ctx, {
    layoutType: "Category-grouped menu item card grid.",
    visualHierarchy: "Category H2 → item cards (name, desc, price [PLACEHOLDER], badges).",
    spacing: spacingScale(ctx.tier),
    responsiveBehaviour: "Mobile 1 col cards; tablet 2 col; desktop 2–3 col within category.",
    animationBehaviour: motionLine(ctx, "Card stagger fade-in; hover elevation desktop."),
    accessibilityNotes: "Price in text not color-only; dietary badges with text labels.",
    componentOrder:
      "MenuCategorySection → SectionHeading → MenuItemCard × n → CategoryAnchor",
    desktopLayout: "2–3 col item grid per category; anchor nav sticky optional.",
    tabletLayout: "2 col grid.",
    mobileLayout: "Single column; sticky order CTA per Page DNA.",
    imagePlacement: "1:1 item thumbnail top [PLACEHOLDER food photo].",
    ctaPlacement: `Item → order/detail; category footer → ${ctx.primaryCta} if ordering enabled.`,
    optionalVariants: "List view | Card grid | Featured item hero row | Compact text-only",
    premiumRecommendations: premiumLine(
      ctx,
      "Large item photography; subtle category divider lines; quick-add button per card.",
    ),
  });
}

function reservationBlockPattern(ctx: PatternLibraryContext): PatternSpec {
  return buildPattern(ctx, {
    layoutType: "Booking/order/reservation call-out with time picker [PLACEHOLDER] or external link.",
    visualHierarchy: "H2 → short value line → date/time or order CTA → trust note.",
    spacing: "py-12–20; max-w-2xl centered or split with image.",
    responsiveBehaviour: "Mobile full-width form/CTA; desktop inline picker + button.",
    animationBehaviour: motionLine(ctx, "Sticky slide-up bar on menu page optional."),
    accessibilityNotes: "Form labels visible; date picker keyboard accessible; no fake availability.",
    componentOrder:
      "ReservationBlock → Heading → Picker|ExternalLink → PrimaryCTA → Microcopy",
    desktopLayout: "Horizontal picker + CTA or split image 40/60.",
    tabletLayout: "Stacked picker above CTA.",
    mobileLayout: "Sticky bottom order bar; full-width CTA.",
    imagePlacement: "Optional appetizing side image 4:5 [PLACEHOLDER].",
    ctaPlacement: `Dominant ${ctx.primaryCta}; links to order/booking flow [PLACEHOLDER endpoint].`,
    optionalVariants: "Inline form | External platform link | Phone CTA | Sticky mobile bar",
    premiumRecommendations: premiumLine(
      ctx,
      "Glass card reservation widget; animated availability dots only when data confirmed.",
    ),
  });
}

function getPatternSpec(
  id: PatternId,
  ctx: PatternLibraryContext,
  role: PageRole = "generic",
): PatternSpec {
  switch (id) {
    case "hero":
      return heroPattern(ctx, role);
    case "feature-grid":
      return featureGridPattern(ctx);
    case "usp-block":
      return uspBlockPattern(ctx);
    case "statistics":
      return statisticsPattern(ctx);
    case "gallery":
      return galleryPattern(ctx);
    case "testimonials":
      return testimonialsPattern(ctx);
    case "faq":
      return faqPattern(ctx);
    case "cta-banner":
      return ctaBannerPattern(ctx);
    case "pricing":
      return pricingPattern(ctx);
    case "timeline":
      return timelinePattern(ctx);
    case "team":
      return teamPattern(ctx);
    case "location":
      return locationPattern(ctx);
    case "footer":
      return footerPattern(ctx);
    case "navbar":
      return navbarPattern(ctx);
    case "menu-grid":
      return menuGridPattern(ctx);
    case "reservation-block":
      return reservationBlockPattern(ctx);
    default:
      return featureGridPattern(ctx);
  }
}

function formatPatternSpecLines(
  patternTitle: string,
  spec: PatternSpec,
  contextLine?: string,
): string[] {
  return [
    `### ${patternTitle}`,
    contextLine ?? "",
    `Layout type: ${spec.layoutType}`,
    `Visual hierarchy: ${spec.visualHierarchy}`,
    `Spacing: ${spec.spacing}`,
    `Responsive behaviour: ${spec.responsiveBehaviour}`,
    `Animation behaviour: ${spec.animationBehaviour}`,
    `Accessibility notes: ${spec.accessibilityNotes}`,
    `Recommended component order: ${spec.componentOrder}`,
    `Desktop layout: ${spec.desktopLayout}`,
    `Tablet layout: ${spec.tabletLayout}`,
    `Mobile layout: ${spec.mobileLayout}`,
    `Image placement: ${spec.imagePlacement}`,
    `CTA placement: ${spec.ctaPlacement}`,
    `Optional variants: ${spec.optionalVariants}`,
    `Premium recommendations: ${spec.premiumRecommendations}`,
  ].filter((line) => line.length > 0);
}

function hasOrderFeature(ctx: PageDnaContext): boolean {
  return (
    /bestell|order|shop/i.test(ctx.brief.website_goal) ||
    ctx.requestedFeatures.some((feature) => /bestell|order|shop/i.test(feature))
  );
}

export function resolvePatternId(
  sectionName: string,
  ctx: PageDnaContext,
): PatternId {
  if (sectionName.startsWith("MenuCategory_")) {
    return "menu-grid";
  }

  const map: Record<string, PatternId> = {
    TrustBar: "statistics",
    FeaturedItems: ctx.profile === "restaurant" ? "menu-grid" : "feature-grid",
    USPGrid: "usp-block",
    TestimonialSection: "testimonials",
    GalleryTeaser: "gallery",
    LocationContactTeaser: "location",
    FAQSection: "faq",
    FinalCTA: "cta-banner",
    MenuIntro: "hero",
    DietaryAllergenNotes: "usp-block",
    MenuFilters: "feature-grid",
    MenuOrderCTA: hasOrderFeature(ctx) ? "reservation-block" : "cta-banner",
    MenuEmptyState: "cta-banner",
    BrandStory: "timeline",
    MissionValues: "feature-grid",
    QualityPromise: "usp-block",
    TeamFounder: "team",
    TrustElements: "statistics",
    GalleryFilterBar: "feature-grid",
    GalleryGrid: "gallery",
    LightboxViewer: "gallery",
    GalleryLoadingSkeleton: "gallery",
    InstagramTeaser: "gallery",
    GalleryFinalCTA: "cta-banner",
    ContactDetails: "location",
    ContactForm: "feature-grid",
    ContactFormValidation: "feature-grid",
    ContactFormSuccess: "cta-banner",
    OpeningHours: "location",
    MapEmbed: "location",
    DirectionsCTA: "cta-banner",
    AddressBlock: "location",
    MapSection: "location",
    DirectionsGuide: "timeline",
    ParkingTransit: "feature-grid",
    LocalSEOBlock: "usp-block",
    NearbyLandmarks: "feature-grid",
    NavigateCTA: "cta-banner",
    PageIntro: "hero",
    MainContent: "feature-grid",
    PortfolioGrid: "gallery",
    ReviewsSummary: "testimonials",
    TeamGrid: "team",
    TreatmentList: "pricing",
  };

  return map[sectionName] ?? "feature-grid";
}

export function createPatternLibraryContext(input: {
  brief: WebsiteBrief;
  profile: BusinessProfile;
  tier: StyleTier;
  prefersMotion: boolean;
  primaryCta: string;
  secondaryCta: string;
}): PatternLibraryContext {
  return {
    brief: input.brief,
    profile: input.profile,
    tier: input.tier,
    prefersMotion: input.prefersMotion,
    primaryCta: input.primaryCta,
    secondaryCta: input.secondaryCta,
  };
}

export function buildPatternLibraryContext(
  ctx: PageDnaContext,
): PatternLibraryContext {
  return {
    brief: ctx.brief,
    profile: ctx.profile,
    tier: ctx.tier,
    prefersMotion: ctx.prefersMotion,
    primaryCta: ctx.primaryCta,
    secondaryCta: ctx.secondaryCta,
  };
}

export function buildGlobalPatternLibrary(ctx: PatternLibraryContext): string[] {
  const ids = Object.keys(PATTERN_TITLES) as PatternId[];

  return [
    "# Pattern Library",
    "Reusable layout patterns for website sections. Reference Page DNA section order and Component DNA for component specs — this library defines layout implementation only.",
    `Profile: ${ctx.profile} | Tier: ${ctx.tier} | Motion preference: ${ctx.prefersMotion ? "enhanced" : "restrained"}`,
    "",
    ...ids.flatMap((id) => {
      const spec = getPatternSpec(id, ctx, "generic");
      return [
        ...formatPatternSpecLines(PATTERN_TITLES[id], spec),
        "",
      ];
    }),
  ];
}

export function buildPagePatternLibrary(ctx: PageDnaContext): string[] {
  const patternCtx = buildPatternLibraryContext(ctx);
  const sections = getPageSections(ctx);
  const lines: string[] = [
    "",
    `# Pattern Library — ${ctx.page}`,
    `Page role: ${ctx.role} | Profile: ${ctx.profile} | Route: ${ctx.slug}`,
    "Maps Page DNA sections to concrete layout patterns below.",
    "",
    ...formatPatternSpecLines(
      PATTERN_TITLES.hero,
      getPatternSpec("hero", patternCtx, ctx.role),
      `Page section: Hero (Page DNA §2) | Pattern: Hero`,
    ),
    "",
  ];

  const layoutPatterns: PatternId[] = ["navbar", "footer"];
  for (const id of layoutPatterns) {
    lines.push(
      ...formatPatternSpecLines(
        PATTERN_TITLES[id],
        getPatternSpec(id, patternCtx, ctx.role),
        `Site layout: ${PATTERN_TITLES[id]} wraps this page`,
      ),
    );
    lines.push("");
  }

  sections.forEach((section) => {
    const patternId = resolvePatternId(section.name, ctx);
    lines.push(
      ...formatPatternSpecLines(
        PATTERN_TITLES[patternId],
        getPatternSpec(patternId, patternCtx, ctx.role),
        `Page DNA section: ${section.name} | Pattern: ${PATTERN_TITLES[patternId]}`,
      ),
    );
    lines.push("");
  });

  return lines;
}

export function buildGlobalPatternLibraryMarkdown(
  ctx: PatternLibraryContext,
): string {
  return buildGlobalPatternLibrary(ctx).join("\n");
}

export function allPatternLibraryPatternsPresent(text: string): boolean {
  return (Object.values(PATTERN_TITLES) as string[]).every((title) =>
    text.includes(title),
  );
}

export function extractPatternLibraryWordCount(masterPrompt: string): number {
  const start = masterPrompt.indexOf("# Pattern Library");
  const end = masterPrompt.indexOf("# Page DNA Specifications", start);
  if (start < 0) {
    return 0;
  }

  const block = masterPrompt.slice(start, end > start ? end : undefined);
  return block.split(/\s+/).filter(Boolean).length;
}
