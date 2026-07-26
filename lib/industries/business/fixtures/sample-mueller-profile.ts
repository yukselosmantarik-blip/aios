import type { BusinessIndustryProfile } from "@/lib/industries/business/types";
import { SAMPLE_BUSINESS_BRIEF_ID } from "@/lib/industries/business/types";

export const SAMPLE_MUELLER_BUSINESS_PROFILE: BusinessIndustryProfile = {
  companyName: "Müller Gebäudeservice",
  tagline: "Sauberkeit und Werterhalt für Wohn- und Gewerbeimmobilien in Ulm",
  description:
    "Müller Gebäudeservice unterstützt Eigentümer, Verwaltungen und Gewerbetreibende mit zuverlässiger Unterhaltsreinigung, Treppenhauspflege und Sonderreinigungen. Unser Team arbeitet termintreu, dokumentiert Leistungen transparent und ist bei Bedarf kurzfristig erreichbar.",
  address: "Fischergasse 12, 89073 Ulm",
  phone: "0731 555 42 18",
  email: "kontakt@mueller-gebaeudeservice.de",
  openingHours: [
    { days: "Montag – Freitag", hours: "07:00 – 18:00 Uhr" },
    { days: "Samstag", hours: "08:00 – 12:00 Uhr ( nach Vereinbarung )" },
    { days: "Sonntag", hours: "Geschlossen" },
  ],
  services: [
    {
      id: "service-unterhaltsreinigung",
      title: "Unterhaltsreinigung",
      description: "Regelmäßige Reinigung von Büros, Praxen und Gemeinschaftsflächen nach abgestimmtem Plan.",
    },
    {
      id: "service-treppenhaus",
      title: "Treppenhausreinigung",
      description: "Pflege von Treppenhäusern, Eingangsbereichen und Glasflächen in Mehrfamilienhäusern.",
    },
    {
      id: "service-glas",
      title: "Glas- und Fensterreinigung",
      description: "Streifenfreie Fenster- und Glasfassadenreinigung für Innen- und Außenbereiche.",
    },
    {
      id: "service-sonder",
      title: "Sonder- und Grundreinigung",
      description: "Grundreinigungen nach Renovierungen, Umzügen oder vor Objektübergaben.",
    },
  ],
  benefits: [
    {
      id: "benefit-festes-team",
      title: "Feste Ansprechpartner",
      description: "Sie kennen unser Team vor Ort und erreichen uns direkt ohne Callcenter.",
    },
    {
      id: "benefit-flexibel",
      title: "Flexible Einsatzzeiten",
      description: "Reinigung außerhalb Ihrer Geschäftszeiten oder in abgestimmten Zeitfenstern.",
    },
    {
      id: "benefit-dokumentation",
      title: "Nachvollziehbare Leistungen",
      description: "Leistungsnachweise und transparente Abrechnung für Hausverwaltungen und Eigentümer.",
    },
  ],
  testimonials: [
    {
      id: "testimonial-1",
      quote:
        "Seit dem Wechsel zu Müller Gebäudeservice ist unser Treppenhaus dauerhaft gepflegt. Termine werden eingehalten und Rückmeldungen sind schnell da.",
      author: "Sabine Keller",
      role: "Hausverwaltung Keller & Partner, Ulm",
    },
    {
      id: "testimonial-2",
      quote:
        "Für unsere Praxisräume war uns eine verlässliche Abendreinigung wichtig. Das Team arbeitet diskret und gründlich.",
      author: "Dr. Jonas Hartmann",
      role: "Praxis Hartmann, Blaubeuren",
    },
  ],
  faq: [
    {
      id: "faq-1",
      question: "Erstellen Sie individuelle Reinigungspläne?",
      answer:
        "Ja. Nach einer Besichtigung definieren wir Leistungen, Intervalle und Prioritäten gemeinsam mit Ihnen.",
    },
    {
      id: "faq-2",
      question: "Arbeiten Sie auch kurzfristig?",
      answer:
        "Für Bestandskunden halten wir Kapazitäten für Sonderreinigungen vor. Sprechen Sie uns frühzeitig an.",
    },
    {
      id: "faq-3",
      question: "In welchem Gebiet sind Sie tätig?",
      answer: "Unser Schwerpunkt liegt in Ulm, Neu-Ulm und im Alb-Donau-Kreis.",
    },
  ],
  socialLinks: [
    { label: "Instagram", href: "https://instagram.com/" },
    { label: "LinkedIn", href: "https://linkedin.com/" },
  ],
  primaryCta: "Beratung anfragen",
  legalLinks: [
    { label: "Impressum", href: "/impressum" },
    { label: "Datenschutz", href: "/datenschutz" },
  ],
};

export { SAMPLE_BUSINESS_BRIEF_ID };

export const PROFILES_BY_BRIEF_ID: Readonly<Record<string, BusinessIndustryProfile>> = {
  [SAMPLE_BUSINESS_BRIEF_ID]: SAMPLE_MUELLER_BUSINESS_PROFILE,
};
