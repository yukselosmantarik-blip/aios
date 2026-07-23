import type { WebsiteBrief } from "@/lib/website-briefs.types";
import type { WebsiteBlueprintContent } from "@/lib/website-blueprints.types";

type BusinessProfile = "restaurant" | "dentist" | "agency" | "default";

const SITEMAP_BY_PROFILE: Record<BusinessProfile, string[]> = {
  restaurant: ["Home", "Menu", "About", "Gallery", "Contact"],
  dentist: ["Home", "Treatments", "Team", "Reviews", "Contact"],
  agency: ["Home", "Services", "Portfolio", "About", "Contact"],
  default: ["Home", "About", "Services", "Contact"],
};

const PAGE_SECTIONS: Record<string, string[]> = {
  home: ["Hero section", "Value proposition", "Key highlights", "Primary CTA"],
  menu: ["Menu categories", "Featured dishes", "Pricing overview", "Dietary notes"],
  about: ["Brand story", "Mission and values", "Team introduction", "Trust signals"],
  gallery: ["Photo grid", "Ambience highlights", "Social proof captions"],
  contact: ["Contact details", "Location map", "Opening hours", "Contact form"],
  treatments: ["Treatment overview", "Benefits per service", "Process steps", "FAQ"],
  team: ["Team profiles", "Qualifications", "Personal introductions"],
  reviews: ["Testimonials", "Ratings summary", "Case highlights"],
  services: ["Service list", "Benefits per service", "Process overview", "CTA"],
  portfolio: ["Project grid", "Case summaries", "Results and outcomes", "Client logos"],
  leistungen: ["Service list", "Benefits per service", "Process overview", "CTA"],
  "über uns": ["Brand story", "Mission and values", "Team introduction", "Trust signals"],
  kontakt: ["Contact details", "Location map", "Opening hours", "Contact form"],
};

const BASE_FEATURES = [
  "Responsive layout for mobile, tablet and desktop",
  "Clear navigation aligned with the sitemap",
  "Accessible typography and contrast",
  "Contact conversion path on every page",
];

const BASE_CHECKLIST = [
  "Confirm sitemap and page sections with the client",
  "Prepare copy for all required pages",
  "Define primary and secondary color tokens",
  "Build page layouts in Next.js with reusable sections",
  "Add SEO metadata per page",
  "Test forms, navigation and mobile breakpoints",
  "Review content against the brief before launch",
];

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

function detectBusinessProfile(brief: WebsiteBrief): BusinessProfile {
  const haystack = `${brief.industry} ${brief.business_name}`.toLowerCase();

  if (/burger|restaurant|imbiss|gastro|café|cafe|bistro|food/.test(haystack)) {
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

function resolveSitemap(brief: WebsiteBrief): string[] {
  const requestedPages = parseList(brief.required_pages);

  if (requestedPages.length > 0) {
    return requestedPages;
  }

  return SITEMAP_BY_PROFILE[detectBusinessProfile(brief)];
}

function resolvePageSections(sitemap: string[]): Record<string, string[]> {
  const sections: Record<string, string[]> = {};

  for (const page of sitemap) {
    const key = normalizePageKey(page);
    sections[page] = PAGE_SECTIONS[key] ?? [
      "Introduction",
      "Main content",
      "Supporting details",
      "Call to action",
    ];
  }

  return sections;
}

function resolveFeatures(brief: WebsiteBrief): string[] {
  const requestedFeatures = parseList(brief.required_features);
  const profile = detectBusinessProfile(brief);
  const profileFeatures: Record<BusinessProfile, string[]> = {
    restaurant: ["Menu browsing", "Opening hours block", "Reservation or order CTA"],
    dentist: ["Treatment overview", "Appointment request form", "Team trust section"],
    agency: ["Portfolio showcase", "Service packages", "Lead capture form"],
    default: ["Services overview", "About section", "Lead capture form"],
  };

  return [...new Set([...BASE_FEATURES, ...profileFeatures[profile], ...requestedFeatures])];
}

function buildProjectSummary(brief: WebsiteBrief, sitemap: string[]): string {
  const locationText = brief.location ? ` in ${brief.location}` : "";

  return [
    `${brief.business_name} is a ${brief.industry} business${locationText}.`,
    `Website goal: ${brief.website_goal}.`,
    `The recommended site structure includes ${sitemap.length} pages: ${sitemap.join(", ")}.`,
  ].join(" ");
}

function buildTargetAudienceSummary(brief: WebsiteBrief): string {
  return [
    `Primary audience: ${brief.target_audience}.`,
    brief.services
      ? `Core services to highlight: ${brief.services.replace(/\n/g, ", ")}.`
      : "Core services should be derived from the business offering and industry standards.",
  ].join(" ");
}

function buildBrandDirection(brief: WebsiteBrief): string {
  const style = brief.preferred_style ?? "modern, trustworthy and conversion-focused";
  const primary = brief.primary_color ?? "Define a primary brand color during design";
  const secondary =
    brief.secondary_color ?? "Define a secondary accent color during design";
  const usp = brief.unique_selling_points
    ? `Unique selling points: ${brief.unique_selling_points.replace(/\n/g, ", ")}.`
    : "Emphasize credibility, clarity and a strong primary call to action.";

  return [
    `Visual direction: ${style}.`,
    `Color direction: primary ${primary}, secondary ${secondary}.`,
    usp,
    brief.reference_websites
      ? `Reference inspiration: ${brief.reference_websites.replace(/\n/g, ", ")}.`
      : "Use clean spacing, strong headings and clear section hierarchy.",
  ].join(" ");
}

function buildContentRequirements(brief: WebsiteBrief, sitemap: string[]): string[] {
  const requirements = [
    `Business name: ${brief.business_name}`,
    `Industry: ${brief.industry}`,
    `Website goal: ${brief.website_goal}`,
    `Target audience: ${brief.target_audience}`,
    `Pages to produce: ${sitemap.join(", ")}`,
  ];

  if (brief.location) {
    requirements.push(`Location context: ${brief.location}`);
  }

  if (brief.services) {
    requirements.push(`Services copy: ${brief.services.replace(/\n/g, ", ")}`);
  }

  if (brief.unique_selling_points) {
    requirements.push(
      `USP copy: ${brief.unique_selling_points.replace(/\n/g, ", ")}`,
    );
  }

  if (brief.additional_notes) {
    requirements.push(`Additional notes: ${brief.additional_notes}`);
  }

  return requirements;
}

function buildSeoBasics(brief: WebsiteBrief, sitemap: string[]): string[] {
  const locationKeyword = brief.location ? ` in ${brief.location}` : "";
  const serviceKeywords = brief.services
    ? parseList(brief.services.replace(/\n/g, ",")).join(", ")
    : brief.industry;

  return [
    `Primary title pattern: ${brief.business_name} | ${brief.industry}${locationKeyword}`,
    `Meta description should mention ${brief.target_audience} and ${brief.website_goal.toLowerCase()}.`,
    `Target keywords: ${brief.business_name}, ${brief.industry}, ${serviceKeywords}${locationKeyword}.`,
    `Create indexable pages for: ${sitemap.join(", ")}.`,
    "Use one H1 per page, descriptive headings and localized copy where relevant.",
    "Add Open Graph title, description and social preview basics.",
  ];
}

function buildTechnicalRecommendation(brief: WebsiteBrief): string {
  return [
    "Recommended stack: Next.js, TypeScript and Tailwind CSS.",
    "Use App Router with server-rendered marketing pages and reusable section components.",
    "Store structured content in typed modules and keep forms accessible.",
    brief.required_features
      ? `Implement requested features: ${brief.required_features.replace(/\n/g, ", ")}.`
      : "Implement contact forms, responsive layout and SEO metadata as baseline scope.",
    "Deploy to a modern hosting platform with preview environments before production.",
  ].join(" ");
}

function buildMasterPrompt(
  brief: WebsiteBrief,
  content: Omit<WebsiteBlueprintContent, "masterPrompt">,
): string {
  const sectionLines = Object.entries(content.recommendedPageSections)
    .map(([page, sections]) => `- ${page}: ${sections.join(", ")}`)
    .join("\n");

  return [
    "# Website Project Master Prompt",
    "",
    "You are a senior web designer and front-end architect.",
    "Build a marketing website based on the following deterministic project blueprint.",
    "Do not invent missing business facts. Use placeholders only where data is absent.",
    "",
    "## Business Context",
    `- Business: ${brief.business_name}`,
    `- Industry: ${brief.industry}`,
    brief.location ? `- Location: ${brief.location}` : null,
    `- Website goal: ${brief.website_goal}`,
    `- Target audience: ${brief.target_audience}`,
    brief.services ? `- Services: ${brief.services}` : null,
    brief.unique_selling_points ? `- USP: ${brief.unique_selling_points}` : null,
    brief.preferred_style ? `- Preferred style: ${brief.preferred_style}` : null,
    brief.primary_color ? `- Primary color: ${brief.primary_color}` : null,
    brief.secondary_color ? `- Secondary color: ${brief.secondary_color}` : null,
    brief.reference_websites
      ? `- References: ${brief.reference_websites}`
      : null,
    brief.additional_notes ? `- Notes: ${brief.additional_notes}` : null,
    "",
    "## Project Summary",
    content.projectSummary,
    "",
    "## Brand Direction",
    content.brandDirection,
    "",
    "## Recommended Sitemap",
    content.recommendedSitemap.map((page) => `- ${page}`).join("\n"),
    "",
    "## Recommended Page Sections",
    sectionLines,
    "",
    "## Features",
    content.features.map((feature) => `- ${feature}`).join("\n"),
    "",
    "## Content Requirements",
    content.contentRequirements.map((item) => `- ${item}`).join("\n"),
    "",
    "## SEO Basics",
    content.seoBasics.map((item) => `- ${item}`).join("\n"),
    "",
    "## Technical Recommendation",
    content.technicalRecommendation,
    "",
    "## Implementation Checklist",
    content.implementationChecklist.map((item) => `- ${item}`).join("\n"),
    "",
    "## Delivery Instructions",
    "- Use Next.js, TypeScript and Tailwind CSS.",
    "- Create clean, professional, responsive layouts.",
    "- Keep components reusable and content easy to edit.",
    "- Do not connect external AI services or deploy automatically.",
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}

export function generateWebsiteBlueprintContent(
  brief: WebsiteBrief,
): WebsiteBlueprintContent {
  const recommendedSitemap = resolveSitemap(brief);
  const recommendedPageSections = resolvePageSections(recommendedSitemap);
  const features = resolveFeatures(brief);

  const projectSummary = buildProjectSummary(brief, recommendedSitemap);
  const targetAudienceSummary = buildTargetAudienceSummary(brief);
  const brandDirection = buildBrandDirection(brief);
  const contentRequirements = buildContentRequirements(brief, recommendedSitemap);
  const seoBasics = buildSeoBasics(brief, recommendedSitemap);
  const technicalRecommendation = buildTechnicalRecommendation(brief);
  const implementationChecklist = [...BASE_CHECKLIST];

  if (brief.reference_websites) {
    implementationChecklist.push(
      "Compare layout patterns with the provided reference websites",
    );
  }

  const partialContent = {
    projectSummary,
    targetAudienceSummary,
    brandDirection,
    recommendedSitemap,
    recommendedPageSections,
    features,
    contentRequirements,
    seoBasics,
    technicalRecommendation,
    implementationChecklist,
  };

  return {
    ...partialContent,
    masterPrompt: buildMasterPrompt(brief, partialContent),
  };
}
