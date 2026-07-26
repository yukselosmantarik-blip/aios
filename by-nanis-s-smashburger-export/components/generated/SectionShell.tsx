/**
 * GENERATED COMPONENT — SectionShell
 * Sprint 8.3 — premium visual component library
 */

import { cn, variants } from '@/styles/tailwind-mapping';
import type { ReactNode } from 'react';

type SectionShellProps = {
  id: string;
  headingId?: string;
  className?: string;
  children: ReactNode;
};

export function SectionShell({ id, headingId, className, children }: SectionShellProps) {
  return (
    <section
      id={id}
      className={cn(variants.section, variants.reveal, className)}
      aria-labelledby={headingId}
    >
      {children}
    </section>
  );
}
