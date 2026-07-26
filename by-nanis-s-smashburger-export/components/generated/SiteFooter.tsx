/**
 * GENERATED COMPONENT — SiteFooter
 * Sprint 8.3 — premium visual component library
 */

import { cn, variants } from '@/styles/tailwind-mapping';
import Link from 'next/link';
import { ButtonLink } from './ButtonLink';
import { Container } from './Container';
import { Stack } from './Stack';

const footerVariant = "local-business" as const;

const businessProfile = {
  "address": "Klosterstraße 21, 89143 Blaubeuren",
  "addressLines": [
    "Klosterstraße 21",
    "89143 Blaubeuren"
  ],
  "phone": "0162 2083583",
  "phoneTelHref": "tel:+491622083583",
  "openingHours": [
    {
      "days": "Dienstag–Donnerstag",
      "hours": "11:00–21:00"
    },
    {
      "days": "Freitag–Sonntag",
      "hours": "11:00–22:00"
    },
    {
      "days": "Montag",
      "hours": "Ruhetag"
    }
  ],
  "socialLinks": [],
  "legalLinks": [
    {
      "label": "Impressum",
      "href": "/impressum"
    },
    {
      "label": "Datenschutz",
      "href": "/datenschutz"
    }
  ],
  "email": null,
  "emailMailtoHref": null
};

const brandName = "by Nani's";

const footerNavItems = [
  { label: "Startseite", href: "/" },
  { label: "Speisekarte", href: "/#menu" },
  { label: "Kontakt", href: "/#contact" },
] as const;

export function SiteFooter() {
  const mapsQuery = encodeURIComponent(businessProfile.address);
  const year = new Date().getFullYear();

  return (
    <footer className={cn(variants.footer, "site-footer-business", variants.motionSafe)} data-footer-variant={footerVariant}>
      <Container>
        <Stack gap="lg" className="py-[var(--spacing-xl)]">
          <div className="site-footer-business__grid">
            <section className="site-footer-business__brand" aria-label="Unternehmen">
              <p className="site-footer-business__name">{brandName}</p>
              <p className="site-footer-business__tagline">{"Smashed to Perfection"}</p>
            </section>
            <section aria-label="Navigation">
              <h2 className="site-footer-business__heading">Navigation</h2>
              <ul className="site-footer-business__list">
                {footerNavItems.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="site-footer-business__link">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
            <section aria-label="Kontakt">
              <h2 className="site-footer-business__heading">Kontakt</h2>
              <ul className="site-footer-business__list">
                {businessProfile.address.trim() ? (
                  <li>
                    <a
                      className="site-footer-business__link"
                      href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {businessProfile.addressLines.filter(Boolean).map((line) => (
                        <span key={line} className="block">
                          {line}
                        </span>
                      ))}
                    </a>
                  </li>
                ) : null}
                {businessProfile.phone && businessProfile.phoneTelHref ? (
                  <li>
                    <a className="site-footer-business__link" href={businessProfile.phoneTelHref}>
                      {businessProfile.phone}
                    </a>
                  </li>
                ) : null}
                {businessProfile.email && businessProfile.emailMailtoHref ? (
                  <li>
                    <a className="site-footer-business__link" href={businessProfile.emailMailtoHref}>
                      {businessProfile.email}
                    </a>
                  </li>
                ) : null}
              </ul>
            </section>
            {businessProfile.openingHours.length > 0 ? (
            <section aria-label="Öffnungszeiten">
              <h2 className="site-footer-business__heading">Öffnungszeiten</h2>
              <ul className="site-footer-business__hours">
                {businessProfile.openingHours.map((entry) => (
                  <li key={`${entry.days}-${entry.hours}`}>
                    <span>{entry.days}</span>
                    <span>{entry.hours}</span>
                  </li>
                ))}
              </ul>
            </section>
            ) : null}
          </div>
          <div className={cn("site-footer-business__bottom", variants.borderDefault)}>
            <div className="site-footer-business__bottom-inner">
              <p className="site-footer-business__copyright">
                {`© ${year} ${brandName}`}
              </p>
              <nav aria-label="Rechtliches" className="site-footer-business__legal">
                {businessProfile.legalLinks.map((item) => (
                  <Link key={item.href} href={item.href} className="site-footer-business__link">
                    {item.label}
                  </Link>
                ))}
              </nav>

              <ButtonLink
                cta={{
                  label: "Jetzt bestellen",
                  href: "tel:+491622083583",
                  variant: 'primary',
                }}
              />
            </div>
          </div>
        </Stack>
      </Container>
    </footer>
  );
}
