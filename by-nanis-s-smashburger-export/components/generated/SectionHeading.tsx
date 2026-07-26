/**
 * GENERATED COMPONENT — SectionHeading
 * Sprint 8.3 — premium visual component library
 */

import { cn, variants } from '@/styles/tailwind-mapping';
import { Badge } from './Badge';
import type { SectionBaseProps } from './types';

type SectionHeadingProps = {
  section: SectionBaseProps;
};

export function SectionHeading({ section }: SectionHeadingProps) {
  const HeadingTag = section.headingLevel === 1 ? 'h1' : section.headingLevel === 3 ? 'h3' : 'h2';
  return (
    <div className="max-w-3xl space-y-3">
      {section.eyebrow ? <Badge>{section.eyebrow}</Badge> : null}
      <HeadingTag
        id={`${section.id}-heading`}
        className="text-[length:var(--font-size-2xl)] font-[var(--font-weight-semibold)] leading-tight md:text-[length:var(--font-size-display)]"
      >
        {section.title}
      </HeadingTag>
      {section.description ? (
        <p className="max-w-2xl text-[length:var(--font-size-md)] leading-relaxed text-[var(--color-text-muted)]">
          {section.description}
        </p>
      ) : null}
    </div>
  );
}
