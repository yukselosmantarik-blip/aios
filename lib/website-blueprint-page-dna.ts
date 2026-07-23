import type { WebsiteBrief } from "@/lib/website-briefs.types";

export type BusinessProfile = "restaurant" | "dentist" | "agency" | "default";

export type PageRole =
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

export type PageSectionSpec = {
  name: string;
  purpose: string;
  contentRequirements: string;
  copyDirection: string;
  components: string;
  images: string;
  ctaBehavior: string;
  internalLinks: string;
  accessibility: string;
  responsive: string;
  motion: string;
};

export type PageDnaContext = {
  page: string;
  role: PageRole;
  brief: WebsiteBrief;
  profile: BusinessProfile;
  sitemap: string[];
  services: string[];
  primaryCta: string;
  secondaryCta: string;
  slug: string;
  usp: string;
  style: string;
  requestedFeatures: string[];
  tier: "premium" | "modern" | "default";
  prefersMotion: boolean;
  pageLink: (role: PageRole) => string;
  otherLinks: string;
};

export function formatPageSectionSpec(index: number, section: PageSectionSpec): string {
  return [
    `Section ${String(index).padStart(2, "0")} ${section.name}`,
    `Purpose: ${section.purpose}`,
    `Content: ${section.contentRequirements}`,
    `Copy: ${section.copyDirection}`,
    `Components: ${section.components}`,
    `Images: ${section.images}`,
    `CTA: ${section.ctaBehavior}`,
    `Links: ${section.internalLinks}`,
    `A11y: ${section.accessibility}`,
    `Responsive: ${section.responsive}`,
    `Motion: ${section.motion}`,
  ].join(" | ");
}

function hasDietaryNotes(brief: WebsiteBrief): boolean {
  const haystack = `${brief.unique_selling_points ?? ""} ${brief.services ?? ""}`.toLowerCase();
  return /halal|vegan|vegetar|allerg|gluten|lactose/.test(haystack);
}

function hasInstagramReference(brief: WebsiteBrief): boolean {
  return /instagram|insta|social/i.test(
    `${brief.reference_websites ?? ""} ${brief.required_features ?? ""} ${brief.additional_notes ?? ""}`,
  );
}

function hasOrderFeature(ctx: PageDnaContext): boolean {
  return (
    /bestell|order|shop/i.test(ctx.brief.website_goal) ||
    ctx.requestedFeatures.some((feature) => /bestell|order|shop/i.test(feature))
  );
}

function homeSections(ctx: PageDnaContext): PageSectionSpec[] {
  const menuPage = ctx.pageLink("menu");
  const galleryPage = ctx.pageLink("gallery");
  const contactPage = ctx.pageLink("contact");
  const locationPage = ctx.pageLink("location");
  const aboutPage = ctx.pageLink("about");

  return [
    {
      name: "TrustBar",
      purpose: "Establish immediate credibility before scroll.",
      contentRequirements: `3–4 badges derived from brief USP: ${ctx.usp}`,
      copyDirection: "Max 6 words per badge; factual; from brief only.",
      components: "TrustBar, IconBadge",
      images: "Optional small icons; no photography required.",
      ctaBehavior: "None; informational strip below hero.",
      internalLinks: `Optional link to ${aboutPage} for full story.`,
      accessibility: "ul/li list; icons decorative with adjacent text.",
      responsive: "Desktop: horizontal row; mobile: 2×2 grid or horizontal scroll.",
      motion: "Stagger fade-in 60ms per badge; respect reduced motion.",
    },
    {
      name: "FeaturedItems",
      purpose: "Highlight bestsellers or core services from brief.",
      contentRequirements: ctx.services.length
        ? `Feature top items: ${ctx.services.slice(0, 3).join(", ")} with [PLACEHOLDER: description] and [PLACEHOLDER: price].`
        : "[PLACEHOLDER: feature items from brief services].",
      copyDirection: "Use brief service names verbatim; no invented dishes.",
      components: "FeaturedItems, ItemCard, SectionHeading",
      images: "1 image per item, 4:3 ratio [PLACEHOLDER].",
      ctaBehavior: `Card click or button to ${menuPage} / ${ctx.primaryCta}.`,
      internalLinks: menuPage,
      accessibility: "Each card is article or li; image alt describes item name.",
      responsive: "Mobile 1 col; tablet 2 col; desktop 3 col.",
      motion: "Card hover lift on desktop; fade-in on scroll.",
    },
    {
      name: "USPGrid",
      purpose: "Expand on unique selling proposition from brief.",
      contentRequirements: ctx.usp,
      copyDirection: "Split USP into 3–4 scannable benefit statements.",
      components: "USPGrid, FeatureCard, SectionHeading",
      images: "Optional icon per benefit; no stock people.",
      ctaBehavior: `Secondary link to ${aboutPage}.`,
      internalLinks: aboutPage,
      accessibility: "Heading hierarchy H2 section title; cards as list.",
      responsive: "Mobile stack; tablet 2 col; desktop 4 col.",
      motion: "Section reveal on scroll; stagger cards 80ms.",
    },
    {
      name: "TestimonialSection",
      purpose: "Social proof for target audience.",
      contentRequirements:
        "3 testimonial placeholders: [PLACEHOLDER: quote], [PLACEHOLDER: name], [PLACEHOLDER: context].",
      copyDirection: `Tone for ${ctx.brief.target_audience}; no invented names or ratings.`,
      components: "TestimonialCarousel or TestimonialGrid",
      images: "Optional avatar placeholders; alt=[PLACEHOLDER: customer name].",
      ctaBehavior: "None; trust-building only.",
      internalLinks: ctx.pageLink("reviews"),
      accessibility: "blockquote + cite; carousel has aria-live and controls.",
      responsive: "Mobile swipe carousel; desktop 3-column grid.",
      motion: "Carousel slide 300ms; pause on hover/focus.",
    },
    {
      name: "GalleryTeaser",
      purpose: "Visual proof of quality and atmosphere.",
      contentRequirements: "4–6 teaser images [PLACEHOLDER: client gallery assets].",
      copyDirection: "Short intro inviting exploration; no invented event claims.",
      components: "GalleryTeaser, ImageGrid, SectionHeading",
      images: "4:3 or 1:1 thumbnails; lazy-loaded below fold.",
      ctaBehavior: `Button to full ${galleryPage}.`,
      internalLinks: galleryPage,
      accessibility: "Each image descriptive alt [PLACEHOLDER]; decorative extras alt=\"\".",
      responsive: "Mobile 2 col; tablet 3 col; desktop 4 col.",
      motion: "Thumbnail hover zoom 1.03; lightbox optional on teaser.",
    },
    {
      name: "LocationContactTeaser",
      purpose: "Reduce friction for visit or inquiry.",
      contentRequirements: ctx.brief.location
        ? `Location: ${ctx.brief.location}; hours [PLACEHOLDER: Mo–So]; contact [PLACEHOLDER: phone/email].`
        : "[PLACEHOLDER: address], [PLACEHOLDER: hours], [PLACEHOLDER: contact].",
      copyDirection: "Practical visit-planning copy; mark all missing data as PLACEHOLDER.",
      components: "LocationTeaser, ContactSnippet, MapPin icon",
      images: "Optional map static thumbnail [PLACEHOLDER].",
      ctaBehavior: `Primary to ${contactPage}; secondary to ${locationPage}.`,
      internalLinks: `${contactPage}, ${locationPage}`,
      accessibility: "tel: and mailto: links labeled clearly; hours in table.",
      responsive: "Mobile stacked; desktop split text + mini-map.",
      motion: "Fade-in; map thumbnail subtle scale on hover.",
    },
    {
      name: "FAQSection",
      purpose: "Handle common objections before conversion.",
      contentRequirements: buildHomeFaqContent(ctx),
      copyDirection: "Question-answer pairs; answers reference brief facts or PLACEHOLDER.",
      components: "FAQAccordion, SectionHeading",
      images: "None.",
      ctaBehavior: "None; accordion expand only.",
      internalLinks: contactPage,
      accessibility: "button aria-expanded; panel aria-controls; keyboard toggle.",
      responsive: "Full-width accordion all breakpoints.",
      motion: "Accordion height transition 200ms ease-out.",
    },
    {
      name: "FinalCTA",
      purpose: "Final conversion push before footer.",
      contentRequirements: `Restate goal: ${ctx.brief.website_goal}.`,
      copyDirection: "One sentence motivation + primary CTA label from brief goal.",
      components: "FinalCTA, CTAButton primary + secondary",
      images: "Optional subtle background texture; no new photography.",
      ctaBehavior: `${ctx.primaryCta} primary; ${ctx.secondaryCta} secondary.`,
      internalLinks: ctx.otherLinks,
      accessibility: "CTA buttons min 44px; high contrast on accent color.",
      responsive: "Mobile full-width buttons stacked; desktop inline row.",
      motion: "CTA pulse subtle on first view optional; disable with reduced motion.",
    },
  ];
}

function buildHomeFaqContent(ctx: PageDnaContext): string {
  const items = [
    `FAQ: Suitable for ${ctx.brief.target_audience}? → Yes, per brief positioning.`,
    `FAQ: How to contact ${ctx.brief.business_name}? → ${ctx.pageLink("contact")}.`,
  ];

  if (hasOrderFeature(ctx)) {
    items.push(
      `FAQ: Can I order online? → Align with brief goal: ${ctx.brief.website_goal}.`,
    );
  }

  if (hasDietaryNotes(ctx.brief)) {
    items.push("FAQ: Dietary options? → [PLACEHOLDER: confirm from brief USP/services].");
  }

  items.push("FAQ: Opening hours? → [PLACEHOLDER: hours on contact/location page].");
  return items.join(" | ");
}

function menuSections(ctx: PageDnaContext): PageSectionSpec[] {
  const sections: PageSectionSpec[] = [
    {
      name: "MenuIntro",
      purpose: "Set context for menu browsing.",
      contentRequirements: `${ctx.brief.business_name} offerings overview; quality note from USP: ${ctx.usp.slice(0, 80)}.`,
      copyDirection: "Short intro paragraph; no invented chef stories.",
      components: "SectionHeading, RichText",
      images: "Optional hero secondary image [PLACEHOLDER].",
      ctaBehavior: "Anchor links jump to categories below.",
      internalLinks: ctx.otherLinks,
      accessibility: "Skip link to first category.",
      responsive: "Single column intro all breakpoints.",
      motion: "Fade-in on load.",
    },
  ];

  const categories =
    ctx.services.length > 0
      ? ctx.services
      : ["[PLACEHOLDER: category from brief]"];

  categories.forEach((category) => {
    sections.push({
      name: `MenuCategory_${category.replace(/\s+/g, "")}`,
      purpose: `Present all items in category: ${category}.`,
      contentRequirements: `Items: name from brief category, description [PLACEHOLDER], price [PLACEHOLDER: EUR].`,
      copyDirection: "Item names may match brief; descriptions neutral until client copy supplied.",
      components: "MenuCategorySection, MenuItemCard, SectionHeading",
      images: "Square thumbnail per item 1:1 [PLACEHOLDER: food photo].",
      ctaBehavior: hasOrderFeature(ctx)
        ? `Item card links to order flow / ${ctx.primaryCta}.`
        : "Item card expands details inline.",
      internalLinks: ctx.pageLink("contact"),
      accessibility: "Price announced to screen readers; dietary badges have text not color-only.",
      responsive: "Mobile 1 col cards; tablet 2 col; desktop 2–3 col.",
      motion: "Cards fade-in stagger; hover elevation desktop.",
    });
  });

  if (hasDietaryNotes(ctx.brief)) {
    sections.push({
      name: "DietaryAllergenNotes",
      purpose: "Clarify dietary compliance from brief.",
      contentRequirements: `Notes from brief USP/services only: ${ctx.brief.unique_selling_points ?? "[PLACEHOLDER]"}.`,
      copyDirection: "Factual compliance copy; no medical claims.",
      components: "InfoCallout, DietaryBadge",
      images: "None.",
      ctaBehavior: "None.",
      internalLinks: ctx.pageLink("contact"),
      accessibility: "Info icon with aria-label; text not color-only.",
      responsive: "Full-width callout box.",
      motion: "Static.",
    });
  }

  sections.push(
    {
      name: "MenuFilters",
      purpose: "Optional category filtering when 3+ categories exist.",
      contentRequirements:
        categories.length >= 3
          ? `Filter pills: ${categories.join(", ")}.`
          : "Skip filters — fewer than 3 categories.",
      copyDirection: "Filter labels match category names exactly.",
      components: "FilterBar, FilterPill",
      images: "None.",
      ctaBehavior: "Filter toggles visible categories; URL hash optional.",
      internalLinks: "In-page anchors.",
      accessibility: "Filter buttons aria-pressed state.",
      responsive: "Mobile horizontal scroll pills; desktop inline row.",
      motion: "Filter transition crossfade 200ms.",
    },
    {
      name: "MenuOrderCTA",
      purpose: "Drive ordering conversion after browsing.",
      contentRequirements: `Goal alignment: ${ctx.brief.website_goal}.`,
      copyDirection: "Direct CTA copy matching primary button label.",
      components: "OrderCTA band, CTAButton",
      images: "None.",
      ctaBehavior: `${ctx.primaryCta} sticky on mobile; repeated inline on desktop.`,
      internalLinks: ctx.pageLink("contact"),
      accessibility: "Sticky bar does not cover focusable elements; z-index managed.",
      responsive: "Mobile sticky bottom bar; desktop inline section.",
      motion: "Sticky bar slide-up on scroll past hero.",
    },
    {
      name: "MenuEmptyState",
      purpose: "Handle empty filter or unavailable items.",
      contentRequirements: "Message when filter yields zero items.",
      copyDirection: "Helpful reset-filters copy; link to contact.",
      components: "EmptyState, CTAButton ghost",
      images: "Optional empty illustration.",
      ctaBehavior: "Reset filters + link to contact.",
      internalLinks: ctx.pageLink("contact"),
      accessibility: "aria-live polite on filter result change.",
      responsive: "Centered empty state all breakpoints.",
      motion: "Fade-in empty message.",
    },
  );

  return sections;
}

function aboutSections(ctx: PageDnaContext): PageSectionSpec[] {
  return [
    {
      name: "BrandStory",
      purpose: "Tell the origin and context of the business.",
      contentRequirements: `${ctx.brief.business_name} in ${ctx.brief.industry}; story [PLACEHOLDER: client narrative].`,
      copyDirection: "Use brief facts only; expand with PLACEHOLDER blocks for missing story.",
      components: "StorySection, SectionHeading, RichText",
      images: "Split layout image [PLACEHOLDER: authentic venue/product].",
      ctaBehavior: "None in story block.",
      internalLinks: ctx.pageLink("home"),
      accessibility: "Two-column reading order preserved on mobile (image after text or before consistently).",
      responsive: "Mobile stack; desktop 50/50 split.",
      motion: "Image parallax optional if brief prefers motion; off by default.",
    },
    {
      name: "MissionValues",
      purpose: "Communicate mission aligned with website goal.",
      contentRequirements: `Mission tied to: ${ctx.brief.website_goal}; values from USP.`,
      copyDirection: "3 value pillars derived from USP wording.",
      components: "ValuesGrid, ValueCard",
      images: "Icon per value.",
      ctaBehavior: "None.",
      internalLinks: ctx.pageLink("services"),
      accessibility: "Values as ordered list with headings.",
      responsive: "Mobile 1 col; desktop 3 col.",
      motion: "Stagger reveal on scroll.",
    },
    {
      name: "QualityPromise",
      purpose: "Reinforce quality claims from brief USP.",
      contentRequirements: ctx.usp,
      copyDirection: "Promise statement quoting or paraphrasing brief USP only.",
      components: "QualityPromise, Blockquote",
      images: "Optional background texture.",
      ctaBehavior: "Link to menu/services if applicable.",
      internalLinks: `${ctx.pageLink("menu")}, ${ctx.pageLink("services")}`,
      accessibility: "blockquote with cite to business name.",
      responsive: "Centered narrow column max-w-prose.",
      motion: "Fade-in.",
    },
    {
      name: "TeamFounder",
      purpose: "Humanize the brand with team or founder placeholder.",
      contentRequirements:
        "[PLACEHOLDER: founder name], [PLACEHOLDER: role], [PLACEHOLDER: bio], [PLACEHOLDER: photo].",
      copyDirection: "No invented names; clearly marked placeholders.",
      components: "TeamPreview, TeamMemberCard",
      images: "Portrait 1:1 [PLACEHOLDER].",
      ctaBehavior: `Link to ${ctx.pageLink("team")} if exists.`,
      internalLinks: ctx.pageLink("team"),
      accessibility: "Photo alt includes name when provided.",
      responsive: "Mobile single card; desktop 2–3 cards.",
      motion: "Card hover subtle scale.",
    },
    {
      name: "TrustElements",
      purpose: "Credibility signals from brief only.",
      contentRequirements: `USP badges, ${ctx.brief.industry} trust markers [PLACEHOLDER: certifications if any].`,
      copyDirection: "No fake awards or press logos.",
      components: "TrustGrid, Badge",
      images: "Certification logos [PLACEHOLDER] only if client supplies.",
      ctaBehavior: "None.",
      internalLinks: ctx.pageLink("reviews"),
      accessibility: "Badges have text labels.",
      responsive: "Horizontal scroll mobile; grid desktop.",
      motion: "Static badges.",
    },
    {
      name: "FinalCTA",
      purpose: "Convert informed visitors.",
      contentRequirements: ctx.brief.website_goal,
      copyDirection: "Action-oriented closing line for target audience.",
      components: "FinalCTA, CTAButton",
      images: "None.",
      ctaBehavior: `${ctx.primaryCta} primary; ${ctx.secondaryCta} secondary.`,
      internalLinks: ctx.pageLink("contact"),
      accessibility: "Focus visible on CTAs.",
      responsive: "Full-width mobile buttons.",
      motion: "Standard button hover/active states.",
    },
  ];
}

function gallerySections(ctx: PageDnaContext): PageSectionSpec[] {
  const sections: PageSectionSpec[] = [
    {
      name: "GalleryFilterBar",
      purpose: "Optional category filtering for gallery images.",
      contentRequirements: "[PLACEHOLDER: categories — e.g. Food, Interior, Events].",
      copyDirection: "Category names from client; do not invent event names.",
      components: "GalleryFilterBar, FilterPill",
      images: "None.",
      ctaBehavior: "Filter toggles grid items.",
      internalLinks: "In-page.",
      accessibility: "aria-pressed on filter buttons.",
      responsive: "Horizontal scroll filters on mobile.",
      motion: "Crossfade grid on filter 250ms.",
    },
    {
      name: "GalleryGrid",
      purpose: "Display visual portfolio of the business.",
      contentRequirements: "6–12 images [PLACEHOLDER: client gallery assets].",
      copyDirection: "Optional captions [PLACEHOLDER] per image.",
      components: "GalleryGrid, GalleryItem",
      images: "Uniform 4:3 or 1:1 ratio; responsive srcset.",
      ctaBehavior: "Click opens lightbox.",
      internalLinks: ctx.pageLink("contact"),
      accessibility: "Alt text required per image; grid navigable by keyboard.",
      responsive: "Mobile 2 col; tablet 3 col; desktop 3–4 col.",
      motion: "Lazy load blur-up; item hover overlay.",
    },
    {
      name: "LightboxViewer",
      purpose: "Fullscreen image inspection.",
      contentRequirements: "Full-resolution image [PLACEHOLDER]; caption [PLACEHOLDER].",
      copyDirection: "Caption factual; no invented locations/people.",
      components: "LightboxDialog, CloseButton, NavArrow",
      images: "Full-size from grid source.",
      ctaBehavior: "Close returns to grid focus.",
      internalLinks: "None.",
      accessibility: "Focus trap; Esc closes; aria-modal; prev/next buttons labeled.",
      responsive: "Fullscreen mobile; centered desktop max 90vw.",
      motion: "Fade backdrop 200ms; swipe on mobile.",
    },
    {
      name: "GalleryLoadingSkeleton",
      purpose: "Perceived performance while images load.",
      contentRequirements: "Skeleton placeholders matching grid cell count.",
      copyDirection: "None.",
      components: "SkeletonGrid",
      images: "Pulse animation on gray blocks.",
      ctaBehavior: "None.",
      internalLinks: "None.",
      accessibility: "aria-busy on grid until loaded.",
      responsive: "Same grid columns as GalleryGrid.",
      motion: "Pulse skeleton 1.5s loop.",
    },
  ];

  if (hasInstagramReference(ctx.brief)) {
    sections.push({
      name: "InstagramTeaser",
      purpose: "Social gallery integration behavior.",
      contentRequirements:
        "[PLACEHOLDER: Instagram handle from client] — embed or link-out only; no invented feed content.",
      copyDirection: "Follow CTA; handle from client confirmation.",
      components: "InstagramEmbed or ExternalLinkCard",
      images: "Embed thumbnails from API or static PLACEHOLDER tiles.",
      ctaBehavior: "External link to Instagram profile [PLACEHOLDER: URL].",
      internalLinks: "External.",
      accessibility: "Mark external link; embed title attribute.",
      responsive: "Mobile 2 col embed grid.",
      motion: "Static embed.",
    });
  } else {
    sections.push({
      name: "InstagramTeaser",
      purpose: "Reserved for optional social integration.",
      contentRequirements:
        "Not in brief — render PLACEHOLDER note or omit section until client provides handle.",
      copyDirection: "Do not invent social accounts.",
      components: "Optional SocialLinkBlock",
      images: "None.",
      ctaBehavior: "None until client confirms.",
      internalLinks: "None.",
      accessibility: "N/A if omitted.",
      responsive: "N/A if omitted.",
      motion: "N/A if omitted.",
    });
  }

  sections.push({
    name: "GalleryFinalCTA",
    purpose: "Convert visual interest into visit or order.",
    contentRequirements: ctx.brief.website_goal,
    copyDirection: "Invite to visit or order after viewing gallery.",
    components: "FinalCTA",
    images: "None.",
    ctaBehavior: ctx.primaryCta,
    internalLinks: `${ctx.pageLink("contact")}, ${ctx.pageLink("menu")}`,
    accessibility: "Standard CTA contrast.",
    responsive: "Centered band.",
    motion: "Fade-in.",
  });

  return sections;
}

function contactSections(ctx: PageDnaContext): PageSectionSpec[] {
  const hasForm = ctx.requestedFeatures.some((f) =>
    /form|kontakt|contact|anfrage/i.test(f),
  );

  return [
    {
      name: "ContactDetails",
      purpose: "Provide direct contact channels.",
      contentRequirements:
        "[PLACEHOLDER: phone], [PLACEHOLDER: email], " +
        (ctx.brief.location
          ? `address: ${ctx.brief.location} [PLACEHOLDER: street/PLZ]`
          : "[PLACEHOLDER: address]"),
      copyDirection: "Display only confirmed brief data; mark gaps PLACEHOLDER.",
      components: "ContactInfoList, ClickToCall, MailtoLink",
      images: "None.",
      ctaBehavior: "tel: and mailto: click-to-call/email on mobile.",
      internalLinks: ctx.pageLink("location"),
      accessibility: "Phone/email links have accessible names.",
      responsive: "Stacked list mobile; 2-col desktop.",
      motion: "Static.",
    },
    {
      name: "ContactForm",
      purpose: "Capture inquiries aligned with website goal.",
      contentRequirements: hasForm
        ? "Fields: Name (required), Email (required, email type), Message (required textarea)."
        : "Form optional — brief does not require contact form feature.",
      copyDirection: "Labels in German; placeholder examples generic.",
      components: "ContactForm, FormField, SubmitButton, PrivacyNote",
      images: "None.",
      ctaBehavior: "Submit triggers validation then success/error states.",
      internalLinks: "[PLACEHOLDER: privacy policy URL]",
      accessibility: "Labels linked for/id; errors aria-describedby; aria-live on submit.",
      responsive: "Full-width fields mobile; max-w-lg centered desktop.",
      motion: "Submit loading spinner; success toast fade-in.",
    },
    {
      name: "ContactFormValidation",
      purpose: "Define validation and error behavior.",
      contentRequirements:
        "Required field empty → inline error; invalid email → format error; server error → retry message.",
      copyDirection: "Error messages factual and concise in German.",
      components: "FormError, FieldError",
      images: "None.",
      ctaBehavior: "Block submit until valid.",
      internalLinks: "None.",
      accessibility: "aria-invalid on fields; focus first error on submit.",
      responsive: "Inline errors below fields.",
      motion: "Error shake optional 100ms; off with reduced motion.",
    },
    {
      name: "ContactFormSuccess",
      purpose: "Confirm successful submission.",
      contentRequirements: "Success message + expectation [PLACEHOLDER: response time].",
      copyDirection: "Thank-you copy; no guaranteed response times unless in brief.",
      components: "SuccessAlert, CTAButton ghost",
      images: "None.",
      ctaBehavior: "Optional link back to home.",
      internalLinks: ctx.pageLink("home"),
      accessibility: "role=status aria-live polite.",
      responsive: "Centered alert.",
      motion: "Success checkmark draw 400ms.",
    },
    {
      name: "OpeningHours",
      purpose: "Display visit availability.",
      contentRequirements: "[PLACEHOLDER: Mo–So hours per day].",
      copyDirection: "Table format; mark unconfirmed as PLACEHOLDER.",
      components: "HoursTable",
      images: "None.",
      ctaBehavior: "None.",
      internalLinks: ctx.pageLink("location"),
      accessibility: "table with th scope=row/col.",
      responsive: "Full-width table mobile.",
      motion: "Static.",
    },
    {
      name: "MapEmbed",
      purpose: "Show geographic location.",
      contentRequirements: ctx.brief.location
        ? `Map centered on ${ctx.brief.location} [PLACEHOLDER: exact coordinates].`
        : "[PLACEHOLDER: map — location not in brief].",
      copyDirection: "No invented addresses.",
      components: "MapEmbed, StaticMapFallback",
      images: "Map tiles or static screenshot.",
      ctaBehavior: "External maps link for directions.",
      internalLinks: ctx.pageLink("location"),
      accessibility: "iframe title describes map purpose; fallback text address.",
      responsive: "16:9 embed mobile; taller desktop optional.",
      motion: "Lazy load map on scroll into view.",
    },
    {
      name: "DirectionsCTA",
      purpose: "Help users navigate to the business.",
      contentRequirements: "[PLACEHOLDER: Google Maps URL from client].",
      copyDirection: "Route planen / Get directions label.",
      components: "DirectionsCTA, ExternalLinkButton",
      images: "None.",
      ctaBehavior: "Opens maps app external link.",
      internalLinks: "External maps.",
      accessibility: "Indicates opens in new window.",
      responsive: "Full-width button mobile.",
      motion: "Standard hover.",
    },
  ];
}

function locationSections(ctx: PageDnaContext): PageSectionSpec[] {
  return [
    {
      name: "AddressBlock",
      purpose: "Display complete visit address.",
      contentRequirements: ctx.brief.location
        ? `${ctx.brief.location} — [PLACEHOLDER: street, postal code, country].`
        : "[PLACEHOLDER: full address not in brief].",
      copyDirection: "Structured address lines; PLACEHOLDER for missing parts.",
      components: "AddressBlock, CopyAddressButton",
      images: "None.",
      ctaBehavior: "Copy address optional.",
      internalLinks: ctx.pageLink("contact"),
      accessibility: "address element semantic markup.",
      responsive: "Single column.",
      motion: "Static.",
    },
    {
      name: "MapSection",
      purpose: "Interactive or static map of the location.",
      contentRequirements: ctx.brief.location
        ? `Interactive map for ${ctx.brief.location} [PLACEHOLDER: lat/lng].`
        : "[PLACEHOLDER: map awaiting address confirmation].",
      copyDirection: "N/A.",
      components: "MapSection, MapEmbed",
      images: "Map tiles.",
      ctaBehavior: "Pin click opens directions.",
      internalLinks: "External maps.",
      accessibility: "Text fallback with full address below map.",
      responsive: "Full-width map; min-height 300px mobile, 450px desktop.",
      motion: "Lazy load on intersection.",
    },
    {
      name: "DirectionsGuide",
      purpose: "Text directions for car and transit.",
      contentRequirements:
        "[PLACEHOLDER: driving directions], [PLACEHOLDER: public transport stops].",
      copyDirection: "No invented landmarks; PLACEHOLDER until client confirms.",
      components: "DirectionsAccordion, DirectionsList",
      images: "Optional route screenshot [PLACEHOLDER].",
      ctaBehavior: "Expand accordion sections.",
      internalLinks: "External maps CTA.",
      accessibility: "Accordion keyboard accessible.",
      responsive: "Accordion stacked mobile.",
      motion: "Accordion expand 200ms.",
    },
    {
      name: "ParkingTransit",
      purpose: "Parking and public transport guidance.",
      contentRequirements:
        "[PLACEHOLDER: parking options], [PLACEHOLDER: nearest transit stops].",
      copyDirection: "Factual only from client; PLACEHOLDER otherwise.",
      components: "InfoGrid, IconRow",
      images: "Icons for car/train.",
      ctaBehavior: "None.",
      internalLinks: "None.",
      accessibility: "Icons with text labels.",
      responsive: "2 col tablet+.",
      motion: "Static.",
    },
    {
      name: "OpeningHours",
      purpose: "When the location is open.",
      contentRequirements: "[PLACEHOLDER: daily opening hours].",
      copyDirection: "Table format.",
      components: "HoursTable",
      images: "None.",
      ctaBehavior: "None.",
      internalLinks: ctx.pageLink("contact"),
      accessibility: "Semantic table.",
      responsive: "Full width.",
      motion: "Static.",
    },
    {
      name: "LocalSEOBlock",
      purpose: "Support local search with NAP consistency.",
      contentRequirements: ctx.brief.location
        ? `NAP: ${ctx.brief.business_name}, ${ctx.brief.location}, [PLACEHOLDER: phone].`
        : "[PLACEHOLDER: NAP incomplete — location missing from brief].",
      copyDirection: "Match footer NAP exactly sitewide.",
      components: "LocalBusinessSnippet",
      images: "None.",
      ctaBehavior: "None.",
      internalLinks: ctx.pageLink("home"),
      accessibility: "Structured data mirrored in visible text.",
      responsive: "Footer-adjacent block.",
      motion: "Static.",
    },
    {
      name: "NearbyLandmarks",
      purpose: "Orientation without inventing places.",
      contentRequirements: "[PLACEHOLDER: nearby landmarks from client confirmation].",
      copyDirection: "Do not invent landmark names.",
      components: "LandmarkList",
      images: "None.",
      ctaBehavior: "None.",
      internalLinks: "None.",
      accessibility: "List semantic.",
      responsive: "Single column.",
      motion: "Static.",
    },
    {
      name: "NavigateCTA",
      purpose: "Mobile-first navigation action.",
      contentRequirements: "[PLACEHOLDER: maps deep link URL].",
      copyDirection: "Jetzt navigieren / Open in Maps.",
      components: "NavigateCTA sticky mobile",
      images: "None.",
      ctaBehavior: "Sticky bottom on mobile opens maps app.",
      internalLinks: "External.",
      accessibility: "44px min height; clear external indication.",
      responsive: "Sticky mobile only; inline button desktop in hero.",
      motion: "Slide-up sticky bar after map section.",
    },
  ];
}

function defaultSections(ctx: PageDnaContext): PageSectionSpec[] {
  return [
    {
      name: "PageIntro",
      purpose: `Support page goal aligned with: ${ctx.brief.website_goal}.`,
      contentRequirements: "[PLACEHOLDER: page-specific content from brief].",
      copyDirection: "Neutral until brief expanded.",
      components: "SectionHeading, RichText",
      images: "[PLACEHOLDER: supporting image].",
      ctaBehavior: ctx.primaryCta,
      internalLinks: ctx.otherLinks,
      accessibility: "Single H1 per page in hero; H2 here.",
      responsive: "Single column.",
      motion: "Fade-in.",
    },
    {
      name: "MainContent",
      purpose: "Deliver page-specific value.",
      contentRequirements: `Content supporting ${ctx.brief.industry} and ${ctx.brief.target_audience}.`,
      copyDirection: "Brief facts only.",
      components: "ContentBlocks",
      images: "[PLACEHOLDER].",
      ctaBehavior: "Inline CTA mid-content.",
      internalLinks: ctx.otherLinks,
      accessibility: "Logical heading order.",
      responsive: "Responsive grid as needed.",
      motion: "Scroll reveal.",
    },
    {
      name: "FinalCTA",
      purpose: "Page conversion close.",
      contentRequirements: ctx.brief.website_goal,
      copyDirection: "Action-oriented.",
      components: "FinalCTA",
      images: "None.",
      ctaBehavior: ctx.primaryCta,
      internalLinks: ctx.pageLink("contact"),
      accessibility: "CTA contrast AA.",
      responsive: "Full-width mobile.",
      motion: "Standard.",
    },
  ];
}

export function getPageSections(ctx: PageDnaContext): PageSectionSpec[] {
  switch (ctx.role) {
    case "home":
      return homeSections(ctx);
    case "menu":
      return menuSections(ctx);
    case "about":
      return aboutSections(ctx);
    case "gallery":
      return gallerySections(ctx);
    case "contact":
      return contactSections(ctx);
    case "location":
      return locationSections(ctx);
    case "services":
      return ctx.services.length
        ? ctx.services.map((service) => ({
            name: `Service_${service.replace(/\s+/g, "")}`,
            purpose: `Explain service: ${service}.`,
            contentRequirements: `[PLACEHOLDER: ${service} details, process, pricing].`,
            copyDirection: "Benefit-led; brief service name verbatim.",
            components: "ServiceCard, ProcessSteps, FAQAccordion",
            images: `[PLACEHOLDER: ${service} image].`,
            ctaBehavior: ctx.primaryCta,
            internalLinks: ctx.pageLink("contact"),
            accessibility: "H2 per service block.",
            responsive: "Alternating layout sections.",
            motion: "Reveal on scroll.",
          }))
        : defaultSections(ctx);
    case "portfolio":
      return [
        {
          name: "PortfolioGrid",
          purpose: "Showcase work for target audience.",
          contentRequirements: "[PLACEHOLDER: project cases].",
          copyDirection: "Outcome-focused captions; no invented clients.",
          components: "ProjectCard, FilterBar",
          images: "16:9 cover [PLACEHOLDER].",
          ctaBehavior: ctx.primaryCta,
          internalLinks: ctx.pageLink("contact"),
          accessibility: "Filter buttons accessible.",
          responsive: "Mobile 1 col; desktop 3 col.",
          motion: "Hover overlay.",
        },
        ...defaultSections(ctx).slice(-1),
      ];
    case "reviews":
      return [
        {
          name: "ReviewsSummary",
          purpose: "Aggregate social proof.",
          contentRequirements: "[PLACEHOLDER: average rating, review count].",
          copyDirection: "No invented star counts.",
          components: "RatingSummary, ReviewCard",
          images: "Optional avatars [PLACEHOLDER].",
          ctaBehavior: ctx.pageLink("contact"),
          internalLinks: ctx.pageLink("contact"),
          accessibility: "Rating text alternative to stars.",
          responsive: "Grid layout.",
          motion: "Carousel optional.",
        },
        ...defaultSections(ctx).slice(-1),
      ];
    case "team":
      return [
        {
          name: "TeamGrid",
          purpose: "Introduce team members.",
          contentRequirements: "[PLACEHOLDER: name, role, bio, photo per member].",
          copyDirection: "No invented people.",
          components: "TeamMemberCard",
          images: "1:1 portraits [PLACEHOLDER].",
          ctaBehavior: ctx.pageLink("contact"),
          internalLinks: ctx.pageLink("about"),
          accessibility: "Photo alt includes name when known.",
          responsive: "Mobile 1 col; desktop 3 col.",
          motion: "Card hover.",
        },
        ...defaultSections(ctx).slice(-1),
      ];
    case "treatments":
      return [
        {
          name: "TreatmentList",
          purpose: "Explain treatment categories.",
          contentRequirements: "[PLACEHOLDER: treatment names and summaries].",
          copyDirection: "Calm, factual; no medical guarantees.",
          components: "TreatmentCard, FAQAccordion",
          images: "[PLACEHOLDER: practice imagery].",
          ctaBehavior: ctx.primaryCta,
          internalLinks: ctx.pageLink("contact"),
          accessibility: "Clear headings per treatment.",
          responsive: "Stacked cards.",
          motion: "Reveal on scroll.",
        },
        ...defaultSections(ctx).slice(-1),
      ];
    default:
      return defaultSections(ctx);
  }
}

export function pageBusinessGoal(
  role: PageRole,
  brief: WebsiteBrief,
  profile: BusinessProfile,
): string {
  const profileFocus: Record<BusinessProfile, string> = {
    restaurant: "Prioritize menu visibility and order path.",
    dentist: "Prioritize reassurance and appointment path.",
    agency: "Prioritize portfolio proof and inquiry path.",
    default: "Prioritize clarity and contact path.",
  };

  const goals: Record<PageRole, string> = {
    home: `Drive ${brief.target_audience} toward ${brief.website_goal}. ${profileFocus[profile]}`,
    menu: "Enable menu discovery and ordering decision.",
    about: "Build brand trust and emotional connection.",
    gallery: "Provide visual proof of quality.",
    contact: "Capture inquiries and enable direct contact.",
    location: "Help users plan a physical visit.",
    services: "Explain offerings and generate leads.",
    portfolio: "Demonstrate capability through work examples.",
    reviews: "Validate quality via social proof.",
    team: "Humanize the brand through people.",
    treatments: "Explain treatments and drive appointments.",
    generic: brief.website_goal,
  };
  return goals[role];
}

export function pageUserIntent(role: PageRole, brief: WebsiteBrief): string {
  const intents: Record<PageRole, string> = {
    home: "Understand what this business offers and whether it fits their needs.",
    menu: "Find specific items, prices, and ordering path.",
    about: "Learn brand story, values, and credibility.",
    gallery: "See real photos of products, venue, or results.",
    contact: "Reach the business quickly with a question or request.",
    location: "Find address, hours, and directions.",
    services: "Compare services and choose the right fit.",
    portfolio: "Evaluate quality of past work.",
    reviews: "Read opinions from other customers.",
    team: "Meet the people behind the business.",
    treatments: "Understand treatment options and book.",
    generic: `Progress toward: ${brief.website_goal}.`,
  };
  return intents[role];
}

export function pageConversionGoal(
  role: PageRole,
  brief: WebsiteBrief,
  primaryCta: string,
): string {
  return `Convert visitor to: ${primaryCta} — supporting ${brief.website_goal}.`;
}

export function pageSearchIntent(role: PageRole, brief: WebsiteBrief): string {
  const location = brief.location ? ` near ${brief.location}` : "";
  const intents: Record<PageRole, string> = {
    home: `Navigational/commercial — "${brief.business_name}"${location}.`,
    menu: `Transactional — menu, prices, order ${brief.business_name}.`,
    about: `Informational — about ${brief.business_name}.`,
    gallery: `Informational/visual — photos ${brief.business_name}.`,
    contact: `Transactional — contact ${brief.business_name}.`,
    location: `Local — directions, address ${brief.business_name}${location}.`,
    services: `Commercial — services ${brief.industry}${location}.`,
    portfolio: `Commercial investigation — portfolio ${brief.business_name}.`,
    reviews: `Commercial — reviews ${brief.business_name}.`,
    team: `Informational — team ${brief.business_name}.`,
    treatments: `Commercial — treatments ${brief.industry}.`,
    generic: `Informational — ${brief.business_name}.`,
  };
  return intents[role];
}

export function pageH1Direction(
  role: PageRole,
  brief: WebsiteBrief,
  page: string,
): string {
  const directions: Record<PageRole, string> = {
    home: `${brief.business_name} + core benefit for ${brief.target_audience}.`,
    menu: `Speisekarte / Angebot — ${brief.business_name}.`,
    about: `Über ${brief.business_name}.`,
    gallery: `Galerie — ${brief.business_name}.`,
    contact: `Kontakt — ${brief.business_name}.`,
    location: `Standort${brief.location ? `: ${brief.location}` : ""}.`,
    services: `Leistungen — ${brief.business_name}.`,
    portfolio: `Portfolio — ${brief.business_name}.`,
    reviews: `Bewertungen — ${brief.business_name}.`,
    team: `Team — ${brief.business_name}.`,
    treatments: `Behandlungen — ${brief.business_name}.`,
    generic: `${page} — ${brief.business_name}.`,
  };
  return directions[role];
}

export function pageH2Hierarchy(role: PageRole, sections: PageSectionSpec[]): string {
  return sections.map((section) => section.name).join(" → ");
}

export function pageStructuredData(
  role: PageRole,
  brief: WebsiteBrief,
  profile: BusinessProfile,
): string {
  const base = "WebPage + BreadcrumbList sitewide.";
  const byRole: Partial<Record<PageRole, string>> = {
    home:
      profile === "restaurant"
        ? "Restaurant + LocalBusiness on Home."
        : "LocalBusiness or Organization on Home.",
    menu: "Menu / MenuItem schema with [PLACEHOLDER: prices].",
    contact: "ContactPage schema.",
    location: "LocalBusiness with geo [PLACEHOLDER: coordinates].",
    reviews: "Review aggregate [PLACEHOLDER: only with real data].",
  };
  return byRole[role] ?? base;
}

export function componentHierarchy(role: PageRole, ctx: PageDnaContext): string[] {
  const sections = getPageSections(ctx).map((s) => s.name);
  const trees: Record<PageRole, string[]> = {
    home: [
      "SiteHeader",
      "HeroSection",
      "TrustBar",
      "FeaturedItems",
      "USPGrid",
      "TestimonialSection",
      "GalleryTeaser",
      "LocationContactTeaser",
      "FAQSection",
      "FinalCTA",
      "SiteFooter",
    ],
    menu: [
      "SiteHeader",
      "MenuHero",
      "MenuCategoryNav",
      ...sections.filter((s) => s.startsWith("MenuCategory")),
      "DietaryAllergenNotes",
      "MenuFilters",
      "MenuOrderCTA",
      "MenuEmptyState",
      "SiteFooter",
    ],
    about: [
      "SiteHeader",
      "AboutHero",
      "BrandStory",
      "MissionValues",
      "QualityPromise",
      "TeamFounder",
      "TrustElements",
      "FinalCTA",
      "SiteFooter",
    ],
    gallery: [
      "SiteHeader",
      "GalleryHero",
      "GalleryFilterBar",
      "GalleryGrid",
      "LightboxViewer",
      "GalleryLoadingSkeleton",
      "InstagramTeaser",
      "GalleryFinalCTA",
      "SiteFooter",
    ],
    contact: [
      "SiteHeader",
      "ContactHero",
      "ContactDetails",
      "ContactForm",
      "ContactFormValidation",
      "ContactFormSuccess",
      "OpeningHours",
      "MapEmbed",
      "DirectionsCTA",
      "SiteFooter",
    ],
    location: [
      "SiteHeader",
      "LocationHero",
      "AddressBlock",
      "MapSection",
      "DirectionsGuide",
      "ParkingTransit",
      "OpeningHours",
      "LocalSEOBlock",
      "NearbyLandmarks",
      "NavigateCTA",
      "SiteFooter",
    ],
    services: ["SiteHeader", "ServicesHero", ...sections, "FinalCTA", "SiteFooter"],
    portfolio: ["SiteHeader", "PortfolioHero", "PortfolioGrid", "FinalCTA", "SiteFooter"],
    reviews: ["SiteHeader", "ReviewsHero", "ReviewsSummary", "FinalCTA", "SiteFooter"],
    team: ["SiteHeader", "TeamHero", "TeamGrid", "FinalCTA", "SiteFooter"],
    treatments: ["SiteHeader", "TreatmentsHero", "TreatmentList", "FinalCTA", "SiteFooter"],
    generic: ["SiteHeader", "PageHero", ...sections, "SiteFooter"],
  };

  const tree = trees[role] ?? trees.generic;
  return tree.map((node, index) =>
    index === 0 ? `Component tree: ${node}` : `Component tree: └─ ${node}`,
  );
}

export function buildHeroDnaLines(ctx: PageDnaContext): string[] {
  const motionMs = ctx.prefersMotion || ctx.tier === "premium" ? "400–600ms" : "200–300ms";
  const layoutByRole: Record<PageRole, string> = {
    home: "Full-bleed hero; desktop optional 50/50 text+media split; centered mobile.",
    menu: "Compact hero with category anchor links below headline.",
    about: "Split hero: headline left, brand image right (stack mobile).",
    gallery: "Minimal hero; featured image background with overlay.",
    contact: "Short hero; form visible on mobile without deep scroll.",
    location: "Map-forward hero with address overlay card.",
    services: "Benefit-led split hero with service teaser.",
    portfolio: "Portfolio showcase hero with project thumbnail grid.",
    reviews: "Rating-forward hero with star summary [PLACEHOLDER].",
    team: "Warm team photo background [PLACEHOLDER] with headline overlay.",
    treatments: "Calm clinical hero; reassuring headline.",
    generic: "Standard split or centered hero based on Visual DNA tier.",
  };

  return [
    `Hero layout: ${layoutByRole[ctx.role]}`,
    `Hero headline direction: ${pageH1Direction(ctx.role, ctx.brief, ctx.page)}`,
    `Hero subheadline direction: Paraphrase website goal — ${ctx.brief.website_goal.slice(0, 100)}.`,
    `Hero CTA placement: Primary „${ctx.primaryCta}" above fold; secondary „${ctx.secondaryCta}" as ghost/link beside or below.`,
    `Hero trust element: USP eyebrow „${ctx.usp.slice(0, 60)}" or TrustBar preview strip.`,
    `Hero image/video: High-quality ${ctx.brief.industry} imagery [PLACEHOLDER]; priority LCP; ${ctx.style.slice(0, 60)}.`,
    "Hero desktop: min-height 70vh; side-by-side layout; hover-enabled CTAs.",
    "Hero tablet: 60vh; stacked or partial split; persistent nav.",
    "Hero mobile: min-height 55vh; single column; CTAs full-width; no autoplay video.",
    `Hero animation timeline: 0ms container fade → 80ms headline → 160ms subhead → 240ms primary CTA (${motionMs} ease-out); respect reduced motion.`,
  ];
}

export function buildResponsiveDnaLines(ctx: PageDnaContext): string[] {
  const sticky =
    ctx.role === "home" || ctx.role === "menu" || ctx.role === "contact"
      ? `Sticky: header + mobile bottom CTA „${ctx.primaryCta}".`
      : "Sticky: header only.";

  return [
    "Responsive mobile: single column; px-4; sections stack in component tree order.",
    "Responsive tablet: md breakpoint 768px; 2-column grids where specified.",
    "Responsive desktop: lg 1024px+; max-w-7xl container; multi-column grids.",
    "Breakpoint behavior: sm 640 / md 768 / lg 1024 / xl 1280 — mobile-first Tailwind.",
    sticky,
    "Horizontal scroll: only MenuFilters and TrustBar on narrow mobile — never body.",
    `Content stacking order: ${componentHierarchy(ctx.role, ctx).slice(1).join(" → ")}`,
  ];
}

export function buildInteractionDnaLines(ctx: PageDnaContext): string[] {
  const hasForm = ctx.requestedFeatures.some((f) =>
    /form|kontakt|contact|anfrage/i.test(f),
  );

  return [
    "Hover: buttons scale 1.02; cards lift -2px + shadow; links underline animate.",
    "Focus: 2px offset ring accent color; visible on all interactive elements.",
    "Active: buttons scale 0.98; pressed state 100ms.",
    "Loading: skeleton grids; form submit spinner; map lazy-load placeholder.",
    `Empty: ${ctx.role === "menu" ? "MenuEmptyState when filter yields zero" : "helpful message + link to contact"}.`,
    hasForm || ctx.role === "contact"
      ? "Form success: status message + optional home link; form error: inline field errors + focus first error."
      : "Form states: N/A on this page unless ContactForm embedded.",
    "Mobile menu: hamburger toggle; slide-down panel 250ms; focus trap; Esc closes.",
    "Scroll: smooth anchors; sticky header after 64px; no scroll-jacking.",
  ];
}

export function buildPageSeoDnaLines(
  ctx: PageDnaContext,
  metaTitle: string,
  metaDescription: string,
): string[] {
  const sections = getPageSections(ctx);

  return [
    `SEO slug: ${ctx.slug}`,
    `SEO search intent: ${pageSearchIntent(ctx.role, ctx.brief)}`,
    `SEO H1 direction: ${pageH1Direction(ctx.role, ctx.brief, ctx.page)}`,
    `SEO H2 hierarchy: ${pageH2Hierarchy(ctx.role, sections)}`,
    `SEO meta title pattern: ${metaTitle}`,
    `SEO meta description direction: ${metaDescription}`,
    `SEO internal linking: ${ctx.otherLinks} via body copy, footer, and section CTAs.`,
    `SEO structured data: ${pageStructuredData(ctx.role, ctx.brief, ctx.profile)}`,
    "SEO canonical: self-referencing canonical per page URL; no duplicate paths.",
    "SEO Open Graph: og:title, og:description, og:image [PLACEHOLDER: 1200×630], og:type website, og:locale de_DE.",
  ];
}

export function buildPageConversionDnaLines(ctx: PageDnaContext): string[] {
  const ctaCount =
    ctx.role === "home" || ctx.role === "menu" || ctx.role === "contact"
      ? "Primary CTA ×4 (header, hero, mid-page, exit) + sticky mobile."
      : "Primary CTA ×3 (header, hero, exit).";

  return [
    `Conversion trust: USP „${ctx.usp.slice(0, 80)}" + testimonial placeholders + transparent contact info.`,
    `Conversion social proof: testimonials on ${ctx.role === "home" || ctx.role === "reviews" ? "this page" : "home/reviews pages linked"}.`,
    `Conversion CTA frequency: ${ctaCount}`,
    `Conversion flow: ${ctx.role === "contact" ? "Form submit → success → optional follow-up" : hasOrderFeature(ctx) ? "Browse → decide → order CTA → contact/order" : "Inform → trust → contact CTA"}.`,
    "Conversion friction reduction: min form fields; click-to-call on mobile; clear hours/location placeholders.",
    `Conversion objection handling: FAQ section or accordion; USP repetition; ${ctx.brief.target_audience} focused copy.`,
    `Conversion exit CTA: FinalCTA section before footer with „${ctx.primaryCta}".`,
  ];
}

export function buildPageDnaSpecification(input: {
  page: string;
  role: PageRole;
  brief: WebsiteBrief;
  profile: BusinessProfile;
  sitemap: string[];
  detectPageRole: (page: string) => PageRole;
  slugFromPage: (page: string) => string;
  pageMetaTitle: (page: string, brief: WebsiteBrief) => string;
  pageMetaDescription: (page: string, role: PageRole, brief: WebsiteBrief) => string;
  primaryCta: string;
  secondaryCta: string;
  usp: string;
  style: string;
  requestedFeatures: string[];
  tier: "premium" | "modern" | "default";
  prefersMotion: boolean;
}): string[] {
  const pageLink = (targetRole: PageRole): string =>
    input.sitemap.find((entry) => input.detectPageRole(entry) === targetRole) ??
    "[PLACEHOLDER: page]";

  const ctx: PageDnaContext = {
    page: input.page,
    role: input.role,
    brief: input.brief,
    profile: input.profile,
    sitemap: input.sitemap,
    services: input.brief.services
      ? input.brief.services
          .replace(/\r/g, "")
          .split(/[\n,;]+/)
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
    primaryCta: input.primaryCta,
    secondaryCta: input.secondaryCta,
    slug: input.slugFromPage(input.page),
    usp: input.usp,
    style: input.style,
    requestedFeatures: input.requestedFeatures,
    tier: input.tier,
    prefersMotion: input.prefersMotion,
    pageLink,
    otherLinks:
      input.sitemap.filter((entry) => entry !== input.page).join(", ") || "none",
  };

  const sections = getPageSections(ctx);
  const metaTitle = input.pageMetaTitle(input.page, input.brief);
  const metaDescription = input.pageMetaDescription(
    input.page,
    input.role,
    input.brief,
  );

  return [
    `# Page DNA — ${input.page}`,
    `Page role: ${input.role} | Route: ${ctx.slug}`,
    "",
    "## 1. Page objective",
    `Business goal: ${pageBusinessGoal(input.role, input.brief, input.profile)}`,
    `User intent: ${pageUserIntent(input.role, input.brief)}`,
    `Conversion goal: ${pageConversionGoal(input.role, input.brief, input.primaryCta)}`,
    `Primary CTA: ${input.primaryCta}`,
    `Secondary CTA: ${input.secondaryCta}`,
    "",
    "## 2. Hero specification",
    ...buildHeroDnaLines(ctx).map((line) => `Hero spec | ${line}`),
    "",
    "## 3. Exact section order",
    ...sections.map((section, index) => formatPageSectionSpec(index + 1, section)),
    "",
    "## 4. Component hierarchy",
    ...componentHierarchy(input.role, ctx),
    "",
    "## 5. Responsive specification",
    ...buildResponsiveDnaLines(ctx).map((line) => `Responsive | ${line}`),
    "",
    "## 6. Interaction specification",
    ...buildInteractionDnaLines(ctx).map((line) => `Interaction | ${line}`),
    "",
    "## 7. SEO specification",
    ...buildPageSeoDnaLines(ctx, metaTitle, metaDescription).map(
      (line) => `SEO | ${line}`,
    ),
    "",
    "## 8. Conversion specification",
    ...buildPageConversionDnaLines(ctx).map((line) => `Conversion | ${line}`),
  ];
}
