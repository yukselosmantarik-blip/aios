export type BusinessProfileLink = {
  label: string;
  href: string;
};

export type OpeningHoursLine = {
  days: string;
  hours: string;
};

export type RestaurantLandingContent = {
  brandName: string;
  heroHeading: string;
  heroTagline: string;
  heroDescription: string;
  menuDescription: string;
  menuImageAlt: string;
  contactHeading: string;
  contactLead: string;
  homeMetaDescription: string;
  orderCtaLabel: string;
};

export type RestaurantBusinessProfile = {
  address: string;
  addressLines: [string, string];
  phone: string;
  phoneTelHref: string;
  email?: string | null;
  emailMailtoHref?: string | null;
  openingHours: OpeningHoursLine[];
  socialLinks: BusinessProfileLink[];
  legalLinks: BusinessProfileLink[];
  landing: RestaurantLandingContent;
};

/**
 * Typed public paths for restaurant website media (Next.js `/public` root).
 */
export type RestaurantAssets = {
  logo: string;
  hero: string;
  gallery: string[];
  menu?: string;
  business?: string;
};

export type RestaurantProjectKey = "by-nanis";

/** Website brief id for the by Nani's Smashburger sample. */
export const RESTAURANT_BY_NANIS_BRIEF_ID = "adcc1216-b477-41d3-be47-5b5ec2ea05ec" as const;

export type RestaurantFixtureBriefId = typeof RESTAURANT_BY_NANIS_BRIEF_ID;
