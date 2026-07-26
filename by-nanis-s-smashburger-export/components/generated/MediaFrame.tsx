/**
 * GENERATED COMPONENT — MediaFrame
 * Sprint 8.3 — premium visual component library
 */

import { cn, variants } from '@/styles/tailwind-mapping';
import type { ReactNode } from 'react';

type MediaFrameProps = {
  ratio?: '16/9' | '4/3' | '1/1' | '3/4';
  className?: string;
  children: ReactNode;
};

const ratioMap = {
  '16/9': 'aspect-[16/9]',
  '4/3': 'aspect-[4/3]',
  '1/1': 'aspect-square',
  '3/4': 'aspect-[3/4]',
} as const;

export function MediaFrame({ ratio = '16/9', className, children }: MediaFrameProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]',
        ratioMap[ratio],
        className,
      )}
    >
      {children}
    </div>
  );
}
