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
  /** Single-line address for maps search queries. */
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
