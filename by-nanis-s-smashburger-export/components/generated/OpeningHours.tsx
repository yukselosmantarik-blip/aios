/**
 * GENERATED COMPONENT — OpeningHours
 * Sprint 8.3 — premium visual component library
 */

import type { SectionComponentProps } from './types';
import { SectionHeading } from './SectionHeading';
import { SectionShell } from './SectionShell';
import { Container } from './Container';
import { Stack } from './Stack';
import { cn, variants } from '@/styles/tailwind-mapping';
import { Placeholder } from './Placeholder';

export function OpeningHours({ section }: SectionComponentProps) {
  return (
    <Stack gap="sm">
      <h3 className="text-base font-[var(--font-weight-medium)]">Öffnungszeiten</h3>
      <Placeholder label="[PLACEHOLDER: Öffnungszeiten]" category="opening-hours" />
    </Stack>
  );
}
