/**
 * GENERATED COMPONENT — GallerySection
 * Sprint 8.3 — premium visual component library
 */


import type { SectionComponentProps } from './types';
import { SectionHeading } from './SectionHeading';
import { SectionShell } from './SectionShell';
import { Container } from './Container';
import { Stack } from './Stack';
import { cn, variants } from '@/styles/tailwind-mapping';
import { MediaPlaceholder } from './MediaPlaceholder';
import { ResponsiveGrid } from './ResponsiveGrid';

export function GallerySection({ section }: SectionComponentProps) {
  return (
    <SectionShell id={section.id} headingId={`${section.id}-heading`} className={section.className}>
      <Container>
        <Stack gap="lg">
          <SectionHeading section={section} />
          {(() => {
            const mediaItems = section.media.length > 0 ? section.media : ["[PLACEHOLDER: Produktbild]"];
            const useMasonry = true;
            return useMasonry ? (
              <div className="columns-2 gap-[var(--spacing-md)] md:columns-3">
                {mediaItems.map((item, index) => (
                  <div key={`${section.id}-media-${index}`} className="mb-[var(--spacing-md)] break-inside-avoid">
                    <MediaPlaceholder media={{ id: `${section.id}-media-${index}`, label: item, altText: item, aspectRatio: index % 2 === 0 ? '4/3' : '3/4', assetId: 'gallery' }} />
                  </div>
                ))}
              </div>
            ) : (
              <ResponsiveGrid columns={3}>
                {mediaItems.map((item, index) => (
                  <li key={`${section.id}-media-${index}`}>
                    <MediaPlaceholder media={{ id: `${section.id}-media-${index}`, label: item, altText: item, assetId: 'gallery' }} />
                  </li>
                ))}
              </ResponsiveGrid>
            );
          })()}
        </Stack>
      </Container>
    </SectionShell>
  );
}
