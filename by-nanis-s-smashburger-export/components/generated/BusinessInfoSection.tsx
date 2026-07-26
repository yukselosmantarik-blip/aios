/**
 * GENERATED COMPONENT — BusinessInfoSection
 * Sprint 8.3 — premium visual component library
 */

import type { SectionComponentProps } from './types';
import { SectionHeading } from './SectionHeading';
import { SectionShell } from './SectionShell';
import { Container } from './Container';
import { Stack } from './Stack';
import { cn, variants } from '@/styles/tailwind-mapping';

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

export function BusinessInfoSection({ section }: SectionComponentProps) {
  const telHref = businessProfile.phoneTelHref;
  const mapsQuery = encodeURIComponent(businessProfile.address);

  return (
    <SectionShell id={section.id} headingId={`${section.id}-heading`} className="landing-business-section">
      <Container>
        <div className="landing-business-grid">
          <div className="landing-business-copy">
            <SectionHeading section={section} />
            {section.description ? (
              <p className="landing-section-lead">{section.description}</p>
            ) : null}
          </div>
          <dl className="landing-business-details">
            <div className="landing-business-row">
              <dt>Adresse</dt>
              <dd>
                <a
                  className="landing-business-link"
                  href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {businessProfile.addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </a>
              </dd>
            </div>
            <div className="landing-business-row">
              <dt>Telefon</dt>
              <dd>
                <a className="landing-business-link" href={telHref}>
                  {businessProfile.phone}
                </a>
              </dd>
            </div>
            {businessProfile.email && businessProfile.emailMailtoHref ? (
              <div className="landing-business-row">
                <dt>E-Mail</dt>
                <dd>
                  <a className="landing-business-link" href={businessProfile.emailMailtoHref}>
                    {businessProfile.email}
                  </a>
                </dd>
              </div>
            ) : null}
            <div className="landing-business-row">
              <dt>Öffnungszeiten</dt>
              <dd>
                <ul className="landing-hours-list">
                  {businessProfile.openingHours.map((entry) => (
                    <li key={`${entry.days}-${entry.hours}`}>
                      <span>{entry.days}</span>
                      <span>{entry.hours}</span>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>
        </div>
      </Container>
    </SectionShell>
  );
}
