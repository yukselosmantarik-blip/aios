import type { BusinessIndustryProfile } from "@/lib/industries/business/types";
import type { RestaurantBusinessProfile } from "@/lib/industries/restaurant/types";
import {
  formatPhoneTelHref,
  splitAddressLines,
} from "@/lib/industries/restaurant/business-profile";

export function businessProfileToFooterProfile(
  profile: BusinessIndustryProfile,
): RestaurantBusinessProfile {
  const addressLines = splitAddressLines(profile.address);

  return {
    address: profile.address,
    addressLines,
    phone: profile.phone,
    phoneTelHref: formatPhoneTelHref(profile.phone),
    email: profile.email,
    emailMailtoHref: profile.email ? `mailto:${profile.email}` : null,
    openingHours: profile.openingHours,
    socialLinks: profile.socialLinks,
    legalLinks: profile.legalLinks,
    landing: {
      brandName: profile.companyName,
      heroHeading: profile.companyName,
      heroTagline: profile.tagline,
      heroDescription: profile.description.slice(0, 160),
      menuDescription: "",
      menuImageAlt: "",
      contactHeading: "Kontakt",
      contactLead: "Wir melden uns zeitnah mit einem passenden Angebot.",
      homeMetaDescription: profile.description.slice(0, 160),
      orderCtaLabel: profile.primaryCta,
    },
  };
}
