/**
 * GENERATED PAGE — Startseite
 * Route: /
 * Sprint 8.2B/8.2C — page-level React
 */

import type { Metadata } from 'next';
import { page_startseiteConfig } from '@/content/pages/page-startseite';
import {
  BusinessInfoSection,
  HeroSection,
  MenuImageSection,
} from '@/components/generated';

export const metadata: Metadata = {
  title: "Startseite | by Nani's",
  description: "100 % halal, frisch zubereitet und smashed to perfection – Smashburger, Hotdogs und mehr in Blaubeuren.",
  robots: "index,follow",
  openGraph: {
    title: "by Nani's Smashburger — Startseite",
    description: "100 % halal, frisch zubereitet und smashed to perfection – Smashburger, Hotdogs und mehr in Blaubeuren.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "by Nani's Smashburger — Startseite",
    description: "100 % halal, frisch zubereitet und smashed to perfection – Smashburger, Hotdogs und mehr in Blaubeuren.",
  },
  alternates: {
    canonical: "/",
  },
};

// warning: high: Too many high-emphasis sections marked dominant.
// selected patterns: hero, navbar, footer, statistics, menu-grid, usp-block, testimonials, gallery, location, faq, cta-banner

export default function HomePage() {
  return (
    <article className="pg-page">
      {/* H1 direction: by Nani's Smashburger */}

      <HeroSection
        section={page_startseiteConfig.sections[0]}
      />
      <MenuImageSection
        section={page_startseiteConfig.sections[1]}
      />
      <BusinessInfoSection
        section={page_startseiteConfig.sections[2]}
      />
    </article>
  );
}
