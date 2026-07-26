/**
 * GENERATED COMPONENT — Cluster
 * Sprint 8.3 — premium visual component library
 */

import { cn, variants } from '@/styles/tailwind-mapping';
import type { ReactNode } from 'react';

type ClusterProps = {
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
  children: ReactNode;
};

const gapMap = {
  sm: 'gap-[var(--spacing-sm)]',
  md: 'gap-[var(--spacing-md)]',
  lg: 'gap-[var(--spacing-lg)]',
} as const;

export function Cluster({ gap = 'md', className, children }: ClusterProps) {
  return <div className={cn('flex flex-wrap items-center', gapMap[gap], className)}>{children}</div>;
}
