/**
 * GENERATED LEGAL PAGE — Impressum
 * Route: /impressum
 */

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Impressum | by Nani's",
  description: "Impressum und Anbieterkennzeichnung von by Nani's.",
  robots: 'index,follow',
  alternates: {
    canonical: "/impressum",
  },
};

export default function ImpressumPage() {
  return (
    <article className="pg-page">
      <section className="pg-legal-page" aria-labelledby="legal-page-heading">
        <h1 id="legal-page-heading">Impressum</h1>
        <p>Angaben gemäß § 5 TMG</p>
        <p>by Nani's</p>
        <p>Klosterstraße 21</p>
        <p>89143 Blaubeuren</p>
        <p>Telefon: 0162 2083583</p>
        <p>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV: by Nani's</p>
        <p className="pg-legal-page__actions">
          <Link href="/" className="landing-link-button">
            Zur Startseite
          </Link>
        </p>
      </section>
    </article>
  );
}
