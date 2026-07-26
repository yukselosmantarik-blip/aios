/**
 * GENERATED PAGE — Über uns
 * Route: /about
 * Sprint 8.2B/8.2C — page-level React
 */

import type { Metadata } from 'next';
import { page_uber_unsConfig } from '@/content/pages/page-uber-uns';
import {
  CTASection,
  ContentSection,
  FeatureGridSection,
  GenericSection,
  HeroSection,
  TrustSection,
} from '@/components/generated';

export const metadata: Metadata = {
  title: "Über uns | by Nani's",
  description: "Gäste informieren und zur Speisekarte sowie zum Besuch vor Ort einladen — Burger liebhaber, familien, studenten",
  robots: "index,follow",
  openGraph: {
    title: "by Nani's — Über uns",
    description: "Gäste informieren und zur Speisekarte sowie zum Besuch vor Ort einladen",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "by Nani's — Über uns",
    description: "Gäste informieren und zur Speisekarte sowie zum Besuch vor Ort einladen",
  },
  alternates: {
    canonical: "/about",
  },
};

// selected patterns: hero, navbar, footer, timeline, feature-grid, usp-block, team, statistics, cta-banner

export default function BerUnsPage() {
  return (
    <article className="pg-page">
      {/* page objective rendered via sections for Über uns */}

      <HeroSection
        section={page_uber_unsConfig.sections[0]}
      />
      <ContentSection
        section={page_uber_unsConfig.sections[1]}
      />
      <FeatureGridSection
        section={page_uber_unsConfig.sections[2]}
      />
      <TrustSection
        section={page_uber_unsConfig.sections[3]}
      />
      <GenericSection
        section={page_uber_unsConfig.sections[4]}
      />
      <TrustSection
        section={page_uber_unsConfig.sections[5]}
      />
      <CTASection
        section={page_uber_unsConfig.sections[6]}
      />
    </article>
  );
}
