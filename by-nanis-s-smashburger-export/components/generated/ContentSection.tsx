/**
 * GENERATED COMPONENT — ContentSection
 * Sprint 8.3 — premium visual component library
 */


import type { SectionComponentProps } from './types';
import { SectionHeading } from './SectionHeading';
import { SectionShell } from './SectionShell';
import { Container } from './Container';
import { Stack } from './Stack';
import { cn, variants } from '@/styles/tailwind-mapping';
import { ButtonLink } from './ButtonLink';
import { MediaPlaceholder } from './MediaPlaceholder';
import { Placeholder } from './Placeholder';

export function ContentSection({ section }: SectionComponentProps) {
  return (
    <SectionShell id={section.id} headingId={`${section.id}-heading`} className={section.className}>
      <Container>
        <Stack gap="lg">
          <SectionHeading section={section} />
          {section.contentBlocks.length > 0 ? (
            <Stack gap="md" className="max-w-3xl">
              {section.contentBlocks.map((block) => (
                <p key={block} className="text-[length:var(--font-size-md)] leading-relaxed">{block}</p>
              ))}
            </Stack>
          ) : (
            <Placeholder label="[PLACEHOLDER: Rich text content]" category="other" />
          )}
          {section.media.length > 0 ? (
            <MediaPlaceholder media={{ id: `${section.id}-media`, label: section.media[0], altText: section.media[0], assetId: 'hero' }} />
          ) : null}
          {section.primaryCTA ? (
            <ButtonLink cta={{ label: section.primaryCTA, href: '/', variant: 'primary' }} />
          ) : null}
        </Stack>
      </Container>
    </SectionShell>
  );
}
