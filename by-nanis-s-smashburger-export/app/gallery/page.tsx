/**
 * GENERATED PAGE — Galerie
 * Route: /gallery
 * Sprint 8.2B/8.2C — page-level React
 */

import type { Metadata } from 'next';
import { page_galerieConfig } from '@/content/pages/page-galerie';
import {
  FeatureGridSection,
  GallerySection,
  HeroSection,
} from '@/components/generated';

export const metadata: Metadata = {
  title: "Galerie | by Nani's",
  description: "Gäste informieren und zur Speisekarte sowie zum Besuch vor Ort einladen — Burger liebhaber, familien, studenten",
  robots: "index,follow",
  openGraph: {
    title: "by Nani's — Galerie",
    description: "Gäste informieren und zur Speisekarte sowie zum Besuch vor Ort einladen",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "by Nani's — Galerie",
    description: "Gäste informieren und zur Speisekarte sowie zum Besuch vor Ort einladen",
  },
  alternates: {
    canonical: "/gallery",
  },
};

// selected patterns: hero, navbar, footer, feature-grid, gallery, cta-banner

export default function GaleriePage() {
  return (
    <article className="pg-page">
      {/* page objective rendered via sections for Galerie */}

      <HeroSection
        section={page_galerieConfig.sections[0]}
      />
      <FeatureGridSection
        section={page_galerieConfig.sections[1]}
      />
      <GallerySection
        section={page_galerieConfig.sections[2]}
      />
      <GallerySection
        section={page_galerieConfig.sections[3]}
      />
      <GallerySection
        section={page_galerieConfig.sections[4]}
      />
      <GallerySection
        section={page_galerieConfig.sections[5]}
      />
      <GallerySection
        section={page_galerieConfig.sections[6]}
      />
    </article>
  );
}
