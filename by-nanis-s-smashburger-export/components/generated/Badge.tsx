/**
 * GENERATED COMPONENT — Badge
 * Sprint 8.3 — premium visual component library
 */

import { cn, variants } from '@/styles/tailwind-mapping';
import type { ReactNode } from 'react';

type BadgeProps = {
  className?: string;
  children: ReactNode;
};

export function Badge({ className, children }: BadgeProps) {
  return <span className={cn(variants.badge, className)}>{children}</span>;
}
