/**
 * GENERATED COMPONENT — SiteHeader
 * Sprint 8.3 — premium visual component library
 */

'use client';


import { cn, variants } from '@/styles/tailwind-mapping';
import { resolveAsset } from '@/lib/assets/resolve-asset';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ButtonLink } from './ButtonLink';
import { Container } from './Container';

const headerVariant = "sticky" as const;

const navigationItems = [
  { label: "Startseite", href: "/" },
  { label: "Speisekarte", href: "/#menu" },
  { label: "Kontakt", href: "/#contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const logoAsset = resolveAsset('logo');

  return (
    <>
      <a href="#main-content" className={variants.skipLink}>
        Zum Inhalt springen
      </a>
      <header className={cn(variants.header, variants.motionSafe)} data-header-variant={headerVariant}>
        <Container>
          <div className="flex items-center justify-between gap-[var(--spacing-md)] py-[var(--spacing-sm)] md:py-[var(--spacing-md)]">
            <Link href="/" className="flex items-center gap-[var(--spacing-sm)] focus-visible:outline-none">
              <img
                src={logoAsset.path}
                alt={logoAsset.altText}
                className="h-10 w-auto max-w-[9rem]"
                data-asset-type={logoAsset.assetType}
                data-placeholder={String(logoAsset.placeholder)}
                data-replace-before-production={String(logoAsset.replaceBeforeProduction)}
              />
              <span className="sr-only">
                {"by Nani's"}
              </span>
            </Link>
            <button
              type="button"
              className={cn(variants.buttonOutline, variants.motionSafe, "md:hidden min-h-11 min-w-11")}
              aria-expanded={open}
              aria-controls="site-mobile-nav"
              onClick={() => setOpen((value) => !value)}
            >
              Menü
            </button>
            <nav aria-label="Hauptnavigation" className="hidden md:block">
              <ul className="flex flex-wrap items-center gap-[var(--spacing-md)]">
                {navigationItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn("text-sm hover:underline focus-visible:outline-none", variants.motionSafe)}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="hidden md:block">
              <ButtonLink cta={{ label: "Jetzt bestellen", href: "tel:+491622083583", variant: 'primary' }} />
            </div>
          </div>
        </Container>
        <nav
          id="site-mobile-nav"
          className={open ? cn('border-t md:hidden', variants.borderDefault, variants.motionSafe) : 'hidden'}
          aria-label="Mobile Navigation"
        >
          <Container>
            <ul className="flex flex-col gap-[var(--spacing-sm)] py-[var(--spacing-md)]">
              {navigationItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block min-h-11 py-2"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </nav>
      </header>
    </>
  );
}
