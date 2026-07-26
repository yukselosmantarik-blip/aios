/**
 * GENERATED COMPONENT — Stack
 * Sprint 8.3 — premium visual component library
 */

import { cn, variants } from '@/styles/tailwind-mapping';
import type { ReactNode } from 'react';

type StackProps = {
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
  children: ReactNode;
};

const gapMap = {
  sm: 'gap-[var(--spacing-sm)]',
  md: 'gap-[var(--spacing-md)]',
  lg: 'gap-[var(--spacing-lg)]',
} as const;

export function Stack({ gap = 'md', className, children }: StackProps) {
  return <div className={cn('flex flex-col', gapMap[gap], className)}>{children}</div>;
}
