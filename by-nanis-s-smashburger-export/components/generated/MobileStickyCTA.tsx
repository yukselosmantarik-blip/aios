/**
 * GENERATED COMPONENT — MobileStickyCTA
 * Sprint 8.3 — premium visual component library
 */

import { cn, variants } from '@/styles/tailwind-mapping';
import { ButtonLink } from './ButtonLink';
import { Container } from './Container';

export function MobileStickyCTA() {
  return (
    <aside className={cn(variants.mobileSticky, variants.motionSafe)} aria-label="Schnellaktion">
      <Container>
        <ButtonLink
          cta={{
            label: "Jetzt bestellen",
            href: "tel:+491622083583",
            variant: 'primary',
          }}
          className="w-full justify-center"
        />
      </Container>
    </aside>
  );
}
