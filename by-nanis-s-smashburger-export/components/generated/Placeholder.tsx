/**
 * GENERATED COMPONENT — Placeholder
 * Sprint 8.3 — premium visual component library
 */

import { cn, variants } from '@/styles/tailwind-mapping';
import type { PlaceholderCategory } from './types';

type PlaceholderProps = {
  label: string;
  category?: PlaceholderCategory;
  className?: string;
  launchBlocking?: boolean;
};

export function Placeholder({ label, category = 'other', className, launchBlocking = false }: PlaceholderProps) {
  return (
    <span
      className={cn(
        variants.placeholder,
        'max-w-full break-words',
        launchBlocking && 'border-[var(--color-error)]',
        className,
      )}
      data-placeholder-category={category}
      role="note"
    >
      {label}
    </span>
  );
}
