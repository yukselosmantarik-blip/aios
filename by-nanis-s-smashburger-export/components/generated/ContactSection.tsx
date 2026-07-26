/**
 * GENERATED COMPONENT — ContactSection
 * Sprint 8.3 — premium visual component library
 */


import type { SectionComponentProps } from './types';
import { SectionHeading } from './SectionHeading';
import { SectionShell } from './SectionShell';
import { Container } from './Container';
import { Stack } from './Stack';
import { cn, variants } from '@/styles/tailwind-mapping';
import { ContactForm } from './ContactForm';
import { Placeholder } from './Placeholder';

export function ContactSection({ section }: SectionComponentProps) {
  return (
    <SectionShell id={section.id} headingId={`${section.id}-heading`} className={section.className}>
      <Container>
        <Stack gap="lg">
          <SectionHeading section={section} />
          <div className="grid gap-[var(--spacing-lg)] md:grid-cols-2">
            <Stack gap="md">
              <ul className="space-y-[var(--spacing-sm)]">
                <li><Placeholder label="[PLACEHOLDER: Adresse]" category="address" /></li>
                <li><Placeholder label="[PLACEHOLDER: Telefon]" category="phone" /></li>
                <li><Placeholder label="[PLACEHOLDER: E-Mail]" category="email" /></li>
              </ul>
            </Stack>
            <ContactForm />
          </div>
        </Stack>
      </Container>
    </SectionShell>
  );
}
