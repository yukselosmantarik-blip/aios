/**
 * GENERATED COMPONENT — Container
 * Sprint 8.3 — premium visual component library
 */

import { cn, variants } from '@/styles/tailwind-mapping';
import type { ElementType, ReactNode } from 'react';

type ContainerProps = {
  as?: ElementType;
  className?: string;
  children: ReactNode;
};

export function Container({ as: Component = 'div', className, children }: ContainerProps) {
  return <Component className={cn(variants.sectionContainer, className)}>{children}</Component>;
}
