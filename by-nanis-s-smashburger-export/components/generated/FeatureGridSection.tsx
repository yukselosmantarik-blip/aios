/**
 * GENERATED COMPONENT — FeatureGridSection
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

export function FeatureGridSection({ section }: SectionComponentProps) {
  return (
    <SectionShell id={section.id} headingId={`${section.id}-heading`} className={section.className}>
      <Container>
        <Stack gap="lg">
          <SectionHeading section={section} />
          {(() => {
            const items = section.contentBlocks.length > 0 ? section.contentBlocks : [section.title];
            if (items.length === 0) {
              return (
                <Placeholder label="[PLACEHOLDER: Feature]" category="other" />
              );
            }
            return (
              <ResponsiveGrid columns={3}>
                {items.map((item) => (
                  <li key={item}>
                    <Card variant="interactive" as="article">
                      <Stack gap="sm">
                        <Placeholder label="[PLACEHOLDER: Icon]" category="other" className="w-fit" />
                        <h3 className="text-base font-[var(--font-weight-medium)]">{item}</h3>
                        <p className="text-[length:var(--font-size-sm)] text-[var(--color-text-muted)]">{item}</p>
                      </Stack>
                    </Card>
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
