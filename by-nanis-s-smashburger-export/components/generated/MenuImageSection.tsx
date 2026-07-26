/**
 * GENERATED COMPONENT — MenuImageSection
 * Sprint 8.3 — premium visual component library
 */

import type { SectionComponentProps } from './types';
import { SectionHeading } from './SectionHeading';
import { SectionShell } from './SectionShell';
import { Container } from './Container';
import { Stack } from './Stack';
import { cn, variants } from '@/styles/tailwind-mapping';
import { resolveAsset } from '@/lib/assets/resolve-asset';

export function MenuImageSection({ section }: SectionComponentProps) {
  const menuAsset = resolveAsset('menu');

  return (
    <SectionShell id={section.id} headingId={`${section.id}-heading`} className="landing-menu-section">
      <Container>
        <Stack gap="md">
          <SectionHeading section={section} />
          {section.description ? (
            <p className="landing-section-lead">{section.description}</p>
          ) : null}
          <figure className="landing-menu-figure">
            <img
              src={menuAsset.path}
              alt={menuAsset.altText}
              className="landing-menu-image"
              loading="lazy"
              decoding="async"
              data-asset-id="menu"
              data-asset-type={menuAsset.assetType}
            />
          </figure>
          <p className="landing-menu-actions">
            <a
              className="landing-link-button"
              href={menuAsset.path}
              target="_blank"
              rel="noopener noreferrer"
            >
              Speisekarte öffnen
            </a>
          </p>
        </Stack>
      </Container>
    </SectionShell>
  );
}
