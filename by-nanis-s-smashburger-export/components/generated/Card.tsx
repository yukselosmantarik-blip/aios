/**
 * GENERATED COMPONENT — Card
 * Sprint 8.3 — premium visual component library
 */

import { cn, variants } from '@/styles/tailwind-mapping';
import type { CardVariant } from './types';
import type { ReactNode } from 'react';

type CardProps = {
  variant?: CardVariant;
  className?: string;
  children: ReactNode;
  as?: 'article' | 'div' | 'li';
};

const cardVariantMap: Record<CardVariant, string> = {
  standard: variants.card,
  elevated: variants.cardElevated,
  bordered: cn(variants.card, 'border-2'),
  feature: variants.cardInteractive,
  product: variants.cardInteractive,
  testimonial: variants.cardElevated,
  media: cn(variants.card, 'overflow-hidden p-0'),
  placeholder: variants.placeholder,
  interactive: variants.cardInteractive,
};

export function Card({ variant = 'standard', className, children, as: Component = 'div' }: CardProps) {
  return <Component className={cn(cardVariantMap[variant], className)}>{children}</Component>;
}
