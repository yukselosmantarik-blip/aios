/**
 * GENERATED PAGE — Speisekarte
 * Route: /menu
 * Sprint 8.2B/8.2C — page-level React
 */

import type { Metadata } from 'next';
import { page_speisekarteConfig } from '@/content/pages/page-speisekarte';
import {
  FeatureGridSection,
  HeroSection,
  MenuSection,
  TrustSection,
} from '@/components/generated';

export const metadata: Metadata = {
  title: "Speisekarte | by Nani's",
  description: "Gäste informieren und zur Speisekarte sowie zum Besuch vor Ort einladen — Burger liebhaber, familien, studenten",
  robots: "index,follow",
  openGraph: {
    title: "by Nani's — Speisekarte",
    description: "Gäste informieren und zur Speisekarte sowie zum Besuch vor Ort einladen",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "by Nani's — Speisekarte",
    description: "Gäste informieren und zur Speisekarte sowie zum Besuch vor Ort einladen",
  },
  alternates: {
    canonical: "/menu",
  },
};

// selected patterns: hero, navbar, footer, menu-grid, usp-block, feature-grid, reservation-block, cta-banner

export default function SpeisekartePage() {
  return (
    <article className="pg-page">
      {/* page objective rendered via sections for Speisekarte */}

      <HeroSection
        section={page_speisekarteConfig.sections[0]}
      />
      <HeroSection
        section={page_speisekarteConfig.sections[1]}
      />
      <MenuSection
        section={page_speisekarteConfig.sections[2]}
      />
      <MenuSection
        section={page_speisekarteConfig.sections[3]}
      />
      <MenuSection
        section={page_speisekarteConfig.sections[4]}
      />
      <MenuSection
        section={page_speisekarteConfig.sections[5]}
      />
      <MenuSection
        section={page_speisekarteConfig.sections[6]}
      />
      <MenuSection
        section={page_speisekarteConfig.sections[7]}
      />
      <MenuSection
        section={page_speisekarteConfig.sections[8]}
      />
      <MenuSection
        section={page_speisekarteConfig.sections[9]}
      />
      <TrustSection
        section={page_speisekarteConfig.sections[10]}
      />
      <FeatureGridSection
        section={page_speisekarteConfig.sections[11]}
      />
      <MenuSection
        section={page_speisekarteConfig.sections[12]}
      />
      <MenuSection
        section={page_speisekarteConfig.sections[13]}
      />
    </article>
  );
}
