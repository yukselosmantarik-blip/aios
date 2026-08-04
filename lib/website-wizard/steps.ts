import type { StandaloneWebsiteWizardStepId } from "@/lib/website-wizard/types";

export type StandaloneWebsiteWizardStepDefinition = {
  id: StandaloneWebsiteWizardStepId;
  title: string;
  description: string;
};

export const STANDALONE_WEBSITE_WIZARD_STEPS: StandaloneWebsiteWizardStepDefinition[] =
  [
    {
      id: "customer",
      title: "Kunde und Unternehmen",
      description: "Kunde wählen und Unternehmensdaten erfassen.",
    },
    {
      id: "goals",
      title: "Ziele und Zielgruppe",
      description: "Ziele, Zielgruppe und Angebot definieren.",
    },
    {
      id: "content",
      title: "Inhalte",
      description: "Texte, Kontakt und Öffnungszeiten.",
    },
    {
      id: "design",
      title: "Design",
      description: "Stil, Farben, Referenzen und Logo.",
    },
    {
      id: "pages",
      title: "Seiten und Funktionen",
      description: "Gewünschte Seiten und Website-Funktionen.",
    },
    {
      id: "summary",
      title: "Zusammenfassung",
      description: "Angaben prüfen und Website Brief speichern.",
    },
  ];

export const WIZARD_PAGE_OPTIONS = [
  "Home",
  "About",
  "Services",
  "Gallery",
  "Testimonials",
  "FAQ",
  "Contact",
  "Legal pages",
] as const;

export const WIZARD_FEATURE_OPTIONS = [
  "Contact form",
  "WhatsApp button",
  "Appointment request",
  "Map",
  "Social links",
  "Image gallery",
] as const;
