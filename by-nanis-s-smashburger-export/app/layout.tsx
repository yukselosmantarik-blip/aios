/**
 * GENERATED ROOT LAYOUT — Sprint 8.2C
 */

import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@/styles/globals.css';
import { SiteFooter, SiteHeader } from '@/components/generated';
import { MobileStickyCTA } from '@/components/generated';
import { variants } from '@/styles/tailwind-mapping';

export const metadata: Metadata = {
  title: { default: "by Nani's", template: "{page} | {businessName}" },
  description: "100 % halal, frisch zubereitet und smashed to perfection – Smashburger, Hotdogs und mehr in Blaubeuren.",
  metadataBase: undefined,
  robots: "index,follow",
  openGraph: {
    title: "by Nani's",
    description: "100 % halal, frisch zubereitet und smashed to perfection – Smashburger, Hotdogs und mehr in Blaubeuren.",
    type: 'website',
  },
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="de">
      <body className={variants.bodyRoot}>

        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
        <MobileStickyCTA />
      </body>
    </html>
  );
}
