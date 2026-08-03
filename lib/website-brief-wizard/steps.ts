import type { WebsiteBriefWizardStepId } from "@/lib/website-brief-wizard/types";

export type WebsiteBriefWizardStepDefinition = {
  id: WebsiteBriefWizardStepId;
  title: string;
  description: string;
};

export const WEBSITE_BRIEF_WIZARD_STEPS: WebsiteBriefWizardStepDefinition[] = [
  {
    id: "business",
    title: "Unternehmen",
    description: "Wie heißt das Unternehmen?",
  },
  {
    id: "industry",
    title: "Branche",
    description: "In welcher Branche ist das Unternehmen tätig?",
  },
  {
    id: "brand",
    title: "Markenfarben",
    description: "Primär- und Sekundärfarbe für die Website.",
  },
  {
    id: "audience",
    title: "Zielgruppe",
    description: "Wen möchten Sie mit der Website erreichen?",
  },
  {
    id: "services",
    title: "Leistungen",
    description: "Welche Leistungen oder Produkte sollen hervorgehoben werden?",
  },
  {
    id: "contact",
    title: "Kontakt",
    description: "Telefon, E-Mail und Adresse für Besucher.",
  },
  {
    id: "social",
    title: "Social Media",
    description: "Profile, die verlinkt werden sollen.",
  },
  {
    id: "logo",
    title: "Logo",
    description: "Logo-Datei für Header und Branding (optional).",
  },
  {
    id: "style",
    title: "Design-Stil",
    description: "Wie soll die Website wirken?",
  },
  {
    id: "review",
    title: "Überprüfen",
    description: "Angaben prüfen und Brief speichern.",
  },
];
