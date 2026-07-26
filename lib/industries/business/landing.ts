import type { CompiledWebsiteProject } from "@/lib/website-compiler/types";
import type { BusinessIndustryProfile } from "@/lib/industries/business/types";

export function isBusinessServiceLanding(project: CompiledWebsiteProject): boolean {
  return Boolean(project.businessProfile && project.websiteTheme && !project.restaurantAssets);
}

export function businessLandingContent(
  project: CompiledWebsiteProject,
): BusinessIndustryProfile | undefined {
  return project.businessProfile;
}

export const BUSINESS_SECTION_ANCHORS = {
  about: "about",
  services: "services",
  benefits: "benefits",
  testimonials: "testimonials",
  faq: "faq",
  contact: "contact",
} as const;

export function businessHeaderNavItems(): readonly { label: string; href: string }[] {
  return [
    { label: "Startseite", href: "/" },
    { label: "Leistungen", href: "/#services" },
    { label: "Kontakt", href: "/#contact" },
  ] as const;
}

export function businessPrimaryCtaHref(project: CompiledWebsiteProject): string {
  return project.businessProfile?.email
    ? `mailto:${project.businessProfile.email}`
    : "/#contact";
}
