/**
 * GENERATED COMPONENT — TrustSection
 * Sprint 8.3 — premium visual component library
 */


import type { SectionComponentProps } from './types';
import { SectionHeading } from './SectionHeading';
import { SectionShell } from './SectionShell';
import { Container } from './Container';
import { Stack } from './Stack';
import { cn, variants } from '@/styles/tailwind-mapping';
import { Card } from './Card';
import { Placeholder } from './Placeholder';
import { ResponsiveGrid } from './ResponsiveGrid';

export function TrustSection({ section }: SectionComponentProps) {
  return (
    <SectionShell id={section.id} headingId={`${section.id}-heading`} className={section.className}>
      <Container>
        <Stack gap="lg">
          <SectionHeading section={section} />
          <ResponsiveGrid columns={3}>
            {section.missingData.length > 0 ? (
              section.missingData.map((item) => (
                <li key={item}>
                  <Card variant="placeholder">
                    <Placeholder label={item} category="trust" />
                  </Card>
                </li>
              ))
            ) : (
              <li>
                <Card variant="elevated">
                  <Placeholder label="[PLACEHOLDER: Trust proof]" category="trust" />
                </Card>
              </li>
            )}
          </ResponsiveGrid>
        </Stack>
      </Container>
    </SectionShell>
  );
}
