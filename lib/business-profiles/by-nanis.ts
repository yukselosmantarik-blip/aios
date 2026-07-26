import type { RestaurantBusinessProfile } from "@/lib/business-profiles/types";

export const BY_NANIS_BUSINESS_PROFILE: RestaurantBusinessProfile = {
  address: "Klosterstraße 21, 89143 Blaubeuren",
  addressLines: ["Klosterstraße 21", "89143 Blaubeuren"],
  phone: "0162 2083583",
  phoneTelHref: "tel:+491622083583",
  openingHours: [
    { days: "Dienstag–Donnerstag", hours: "11:00–21:00" },
    { days: "Freitag–Sonntag", hours: "11:00–22:00" },
    { days: "Montag", hours: "Ruhetag" },
  ],
  socialLinks: [],
  legalLinks: [
    { label: "Impressum", href: "/impressum" },
    { label: "Datenschutz", href: "/datenschutz" },
  ],
  landing: {
    brandName: "by Nani's",
    heroHeading: "by Nani's Smashburger",
    heroTagline: "Smashed to Perfection",
    heroDescription:
      "100 % halal, frisch zubereitet und smashed to perfection – mitten in Blaubeuren.",
    menuDescription:
      "Burger, Hotdogs, Beilagen, Getränke und mehr – entdecke unser aktuelles Angebot.",
    menuImageAlt: "Speisekarte von by Nani's",
    contactHeading: "Standort & Öffnungszeiten",
    contactLead: "Besuchen Sie uns in Blaubeuren oder rufen Sie uns an.",
    homeMetaDescription:
      "100 % halal, frisch zubereitet und smashed to perfection – Smashburger, Hotdogs und mehr in Blaubeuren.",
    orderCtaLabel: "Jetzt bestellen",
  },
};
