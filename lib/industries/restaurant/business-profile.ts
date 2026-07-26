import type { RestaurantAssets } from "@/lib/industries/restaurant/types";
import type { RestaurantBusinessProfile } from "@/lib/industries/restaurant/types";
import { BY_NANIS_BRIEF_ID } from "@/lib/industries/restaurant/fixtures/by-nanis-assets";
import { BY_NANIS_BUSINESS_PROFILE } from "@/lib/industries/restaurant/fixtures/by-nanis-profile";
import { resolveRestaurantAssets } from "@/lib/industries/restaurant/assets";
import type { CompiledWebsiteProject } from "@/lib/website-compiler/types";

const PROFILES_BY_BRIEF_ID: Readonly<Record<string, RestaurantBusinessProfile>> = {
  [BY_NANIS_BRIEF_ID]: BY_NANIS_BUSINESS_PROFILE,
};

export function restaurantBusinessProfileForBriefId(
  briefId: string,
): RestaurantBusinessProfile | undefined {
  return PROFILES_BY_BRIEF_ID[briefId];
}

export function resolveRestaurantBusinessProfile(input: {
  brief: { id: string };
  restaurantBusinessProfile?: RestaurantBusinessProfile;
  restaurantAssets?: RestaurantAssets;
}): RestaurantBusinessProfile | undefined {
  if (input.restaurantBusinessProfile) {
    return input.restaurantBusinessProfile;
  }
  if (!resolveRestaurantAssets(input)) {
    return undefined;
  }
  return restaurantBusinessProfileForBriefId(input.brief.id);
}

function splitAddressLines(location: string): [string, string] {
  const parts = location
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length >= 2) {
    return [parts[0]!, parts.slice(1).join(", ")];
  }
  return [location.trim(), ""];
}

function formatPhoneTelHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) {
    return "";
  }
  return digits.startsWith("0") ? `tel:+49${digits.slice(1)}` : `tel:+${digits}`;
}

export function synthesizeRestaurantBusinessProfile(
  project: CompiledWebsiteProject,
): RestaurantBusinessProfile {
  const brandName = project.business.businessName;
  const location = project.business.location?.trim() ?? "";
  const address = location || brandName;
  const addressLines = location ? splitAddressLines(location) : ([brandName, ""] as [string, string]);

  return {
    address,
    addressLines,
    phone: "",
    phoneTelHref: "",
    email: null,
    emailMailtoHref: null,
    openingHours: [],
    socialLinks: [],
    legalLinks: [
      { label: "Impressum", href: "/impressum" },
      { label: "Datenschutz", href: "/datenschutz" },
    ],
    landing: {
      brandName,
      heroHeading: brandName,
      heroTagline: "",
      heroDescription: project.business.websiteGoal.slice(0, 160),
      menuDescription: "",
      menuImageAlt: "",
      contactHeading: "Kontakt",
      contactLead: "",
      homeMetaDescription: project.business.websiteGoal.slice(0, 160),
      orderCtaLabel: project.site.primaryCta,
    },
  };
}

export function resolveFooterBusinessProfile(
  project: CompiledWebsiteProject,
): RestaurantBusinessProfile {
  return project.restaurantBusinessProfile ?? synthesizeRestaurantBusinessProfile(project);
}

export { formatPhoneTelHref, splitAddressLines };

export { BY_NANIS_BUSINESS_PROFILE } from "@/lib/industries/restaurant/fixtures/by-nanis-profile";
