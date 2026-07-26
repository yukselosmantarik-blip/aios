/**
 * GENERATED COMPONENT — ButtonLink
 * Sprint 8.3 — premium visual component library
 */

import { cn, variants } from '@/styles/tailwind-mapping';
import Link from 'next/link';
import type { CTA } from './types';

type ButtonLinkProps = {
  cta: CTA;
  className?: string;
};

const variantMap = {
  primary: variants.buttonPrimary,
  secondary: variants.buttonSecondary,
  outline: variants.buttonOutline,
  ghost: variants.buttonGhost,
  text: variants.buttonText,
  destructive: variants.buttonDestructive,
} as const;

export function ButtonLink({ cta, className }: ButtonLinkProps) {
  const classes = cn(
    variantMap[cta.variant ?? 'primary'],
    variants.motionSafe,
    'min-h-11 min-w-11',
    cta.loading && 'opacity-70',
    className,
  );

  if (cta.disabled || cta.loading) {
    return (
      <span className={classes} aria-disabled="true" aria-busy={cta.loading ? 'true' : undefined}>
        {cta.label}
      </span>
    );
  }

  if (cta.external) {
    return (
      <a href={cta.href} className={classes} target="_blank" rel="noopener noreferrer">
        {cta.label}
      </a>
    );
  }

  return (
    <Link href={cta.href} className={classes}>
      {cta.label}
    </Link>
  );
}
