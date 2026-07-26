/**
 * GENERATED COMPONENT — Divider
 * Sprint 8.3 — premium visual component library
 */

import { cn, variants } from '@/styles/tailwind-mapping';

type DividerProps = {
  className?: string;
};

export function Divider({ className }: DividerProps) {
  return <hr className={cn('border-0 border-t border-[var(--color-border)]', className)} />;
}
