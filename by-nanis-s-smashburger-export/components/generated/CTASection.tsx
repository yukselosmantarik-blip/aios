/**
 * GENERATED COMPONENT — CTASection
 * Sprint 8.3 — premium visual component library
 */


import type { SectionComponentProps } from './types';
import { SectionHeading } from './SectionHeading';
import { SectionShell } from './SectionShell';
import { Container } from './Container';
import { Stack } from './Stack';
import { cn, variants } from '@/styles/tailwind-mapping';
import { ButtonLink } from './ButtonLink';
import { Card } from './Card';
import { Cluster } from './Cluster';

export function CTASection({ section }: SectionComponentProps) {
  return (
    <SectionShell id={section.id} headingId={`${section.id}-heading`} className={section.className}>
      <Container>
        <Stack gap="lg">
          <SectionHeading section={section} />
          <Card variant="elevated" className="flex flex-col gap-[var(--spacing-md)] md:flex-row md:items-center md:justify-between">
            <p className="max-w-2xl text-[length:var(--font-size-md)] text-[var(--color-text-muted)]">{section.description}</p>
            <Cluster gap="md">
              {section.primaryCTA ? (
                <ButtonLink cta={{ label: section.primaryCTA, href: '/', variant: 'primary' }} />
              ) : null}
              {section.secondaryCTA ? (
                <ButtonLink cta={{ label: section.secondaryCTA, href: '/', variant: 'secondary' }} />
              ) : null}
            </Cluster>
          </Card>
        </Stack>
      </Container>
    </SectionShell>
  );
}
