/**
 * GENERATED COMPONENT — LocationSection
 * Sprint 8.3 — premium visual component library
 */


import type { SectionComponentProps } from './types';
import { SectionHeading } from './SectionHeading';
import { SectionShell } from './SectionShell';
import { Container } from './Container';
import { Stack } from './Stack';
import { cn, variants } from '@/styles/tailwind-mapping';
import { MapSection } from './MapSection';
import { OpeningHours } from './OpeningHours';
import { Placeholder } from './Placeholder';

export function LocationSection({ section }: SectionComponentProps) {
  return (
    <SectionShell id={section.id} headingId={`${section.id}-heading`} className={section.className}>
      <Container>
        <Stack gap="lg">
          <SectionHeading section={section} />
          <div className="grid gap-[var(--spacing-lg)] md:grid-cols-2">
            <Stack gap="md">
              <MapSection section={section} />
              <OpeningHours section={section} />
            </Stack>
            <Placeholder label="[PLACEHOLDER: Parking or transit info]" category="other" />
          </div>
        </Stack>
      </Container>
    </SectionShell>
  );
}
