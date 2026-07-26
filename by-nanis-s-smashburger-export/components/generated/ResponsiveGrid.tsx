/**
 * GENERATED COMPONENT — ResponsiveGrid
 * Sprint 8.3 — premium visual component library
 */

import { cn, variants } from '@/styles/tailwind-mapping';
import type { ReactNode } from 'react';

type ResponsiveGridProps = {
  columns?: 2 | 3 | 4;
  className?: string;
  children: ReactNode;
};

const columnMap = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
} as const;

export function ResponsiveGrid({ columns = 3, className, children }: ResponsiveGridProps) {
  return (
    <ul className={cn('grid gap-[var(--spacing-md)]', columnMap[columns], className)}>
      {children}
    </ul>
  );
}
