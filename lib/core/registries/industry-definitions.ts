import type { IndustryRegistration } from "@/lib/core/registries/types";

/** Built-in industry metadata; default sitemaps feed blueprint generation. */
export const BUILTIN_INDUSTRY_DEFINITIONS: readonly IndustryRegistration[] = [
  {
    id: "restaurant",
    label: "Restaurant",
    defaultSitemap: ["Home", "Menu", "About", "Gallery", "Contact"],
    metadata: {
      description: "Food service, takeaway, and on-premise dining.",
    },
  },
  {
    id: "dentist",
    label: "Dentist",
    defaultSitemap: ["Home", "Treatments", "Team", "Reviews", "Contact"],
    metadata: {
      description: "Dental practice and treatment-focused sites.",
    },
  },
  {
    id: "agency",
    label: "Agency",
    defaultSitemap: ["Home", "Services", "Portfolio", "About", "Contact"],
    metadata: {
      description: "Creative, marketing, and consulting agencies.",
    },
  },
  {
    id: "default",
    label: "General business",
    defaultSitemap: ["Home", "About", "Services", "Contact"],
    metadata: {
      description: "Fallback profile when industry is not specialized.",
    },
  },
] as const;
