/**
 * GENERATED LEGAL PAGE — Datenschutz
 * Route: /datenschutz
 */

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Datenschutz | by Nani's",
  description: "Datenschutzhinweise der Website von by Nani's.",
  robots: 'index,follow',
  alternates: {
    canonical: "/datenschutz",
  },
};

export default function DatenschutzPage() {
  return (
    <article className="pg-page">
      <section className="pg-legal-page" aria-labelledby="legal-page-heading">
        <h1 id="legal-page-heading">Datenschutz</h1>
        <p>Diese Datenschutzhinweise gelten für die Website von by Nani's.</p>
        <p>Beim Besuch dieser Website werden technisch notwendige Daten (z. B. IP-Adresse, Zeitpunkt des Zugriffs) durch den Hosting-Anbieter verarbeitet, um die Website auszuliefern und die Stabilität zu gewährleisten.</p>
        <p>Wenn Sie uns telefonisch kontaktieren, verarbeiten wir die von Ihnen mitgeteilten Informationen ausschließlich zur Bearbeitung Ihrer Anfrage.</p>
        <p>Es werden keine Marketing-Cookies gesetzt. Externe Kartenlinks (z. B. Google Maps) unterliegen den Datenschutzbestimmungen des jeweiligen Anbieters.</p>
        <p>Sie haben das Recht auf Auskunft, Berichtigung und Löschung Ihrer personenbezogenen Daten im Rahmen der gesetzlichen Vorgaben.</p>
        <p className="pg-legal-page__actions">
          <Link href="/" className="landing-link-button">
            Zur Startseite
          </Link>
        </p>
      </section>
    </article>
  );
}
