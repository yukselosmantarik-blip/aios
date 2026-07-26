/**
 * GENERATED PAGE — Kontakt
 * Route: /contact
 * Sprint 8.2B/8.2C — page-level React
 */

import type { Metadata } from 'next';
import { page_kontaktConfig } from '@/content/pages/page-kontakt';
import {
  CTASection,
  ContactSection,
  FeatureGridSection,
  HeroSection,
  LocationSection,
} from '@/components/generated';

export const metadata: Metadata = {
  title: "Kontakt | by Nani's",
  description: "Gäste informieren und zur Speisekarte sowie zum Besuch vor Ort einladen — Burger liebhaber, familien, studenten",
  robots: "index,follow",
  openGraph: {
    title: "by Nani's — Kontakt",
    description: "Gäste informieren und zur Speisekarte sowie zum Besuch vor Ort einladen",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "by Nani's — Kontakt",
    description: "Gäste informieren und zur Speisekarte sowie zum Besuch vor Ort einladen",
  },
  alternates: {
    canonical: "/contact",
  },
};

// selected patterns: hero, navbar, footer, location, feature-grid, cta-banner

export default function KontaktPage() {
  return (
    <article className="pg-page">
      {/* page objective rendered via sections for Kontakt */}

      <HeroSection
        section={page_kontaktConfig.sections[0]}
      />
      <ContactSection
        section={page_kontaktConfig.sections[1]}
      />
      <FeatureGridSection
        section={page_kontaktConfig.sections[2]}
      />
      <FeatureGridSection
        section={page_kontaktConfig.sections[3]}
      />
      <ContactSection
        section={page_kontaktConfig.sections[4]}
      />
      <LocationSection
        section={page_kontaktConfig.sections[5]}
      />
      <LocationSection
        section={page_kontaktConfig.sections[6]}
      />
      <CTASection
        section={page_kontaktConfig.sections[7]}
      />
    </article>
  );
}
