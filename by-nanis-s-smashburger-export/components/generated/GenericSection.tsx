/**
 * GENERATED COMPONENT — GenericSection
 * Sprint 8.3 — premium visual component library
 */


import type { SectionComponentProps } from './types';
import { SectionHeading } from './SectionHeading';
import { SectionShell } from './SectionShell';
import { Container } from './Container';
import { Stack } from './Stack';
import { cn, variants } from '@/styles/tailwind-mapping';
import { Placeholder } from './Placeholder';

export function GenericSection({ section }: SectionComponentProps) {
  return (
    <SectionShell id={section.id} headingId={`${section.id}-heading`} className={section.className}>
      <Container>
        <Stack gap="lg">
          <SectionHeading section={section} />
          {section.contentBlocks.length > 0 ? (
            <Stack gap="sm">
              {section.contentBlocks.map((block) => (
                <p key={block} className="text-[length:var(--font-size-sm)]">{block}</p>
              ))}
            </Stack>
          ) : (
            <Placeholder label={`Unmapped section type: ${section.type}`} category="other" />
          )}
          {section.missingData.map((item) => (
            <Placeholder key={item} label={item} category="other" />
          ))}
        </Stack>
      </Container>
    </SectionShell>
  );
}
