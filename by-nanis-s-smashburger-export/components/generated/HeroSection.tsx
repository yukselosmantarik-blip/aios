/**
 * GENERATED COMPONENT — HeroSection
 * Sprint 8.3 — premium visual component library
 */

import type { SectionComponentProps } from './types';
import { SectionHeading } from './SectionHeading';
import { SectionShell } from './SectionShell';
import { Container } from './Container';
import { Stack } from './Stack';
import { cn, variants } from '@/styles/tailwind-mapping';
import { Badge } from './Badge';
import { ButtonLink } from './ButtonLink';
import { Cluster } from './Cluster';
import { MediaPlaceholder } from './MediaPlaceholder';
import { Placeholder } from './Placeholder';
import { resolveAsset } from '@/lib/assets/resolve-asset';

const heroVariant = "split" as string;

function HeroSectionLegacy({ section }: SectionComponentProps) {
  const mediaLabel = section.media[0] ?? "[PLACEHOLDER: Hero media]";

  return (
    <SectionShell id={section.id} headingId={`${section.id}-heading`} className={section.className}>
      <Container>
        {heroVariant === 'centered' ? (
          <Stack gap="lg" className="items-center text-center">
            <SectionHeading section={section} />
            {section.isPlaceholder ? (
              <Placeholder label="[PLACEHOLDER: Trust cue]" category="trust" />
            ) : null}
            <Cluster gap="md" className="justify-center">
              {section.primaryCTA ? (
                <ButtonLink cta={{ label: section.primaryCTA, href: section.ctaReferences[0] ?? '/', variant: 'primary' }} />
              ) : null}
              {section.secondaryCTA ? (
                <ButtonLink cta={{ label: section.secondaryCTA, href: '/', variant: 'secondary' }} />
              ) : null}
            </Cluster>
            <MediaPlaceholder media={{ id: `${section.id}-media`, label: mediaLabel, altText: mediaLabel, assetId: 'hero' }} />
          </Stack>
        ) : heroVariant === 'split' ? (
          <div className="grid gap-[var(--spacing-lg)] md:grid-cols-2 md:items-center">
            <Stack gap="lg">
              <SectionHeading section={section} />
              {section.isPlaceholder ? (
                <Placeholder label="[PLACEHOLDER: Trust cue]" category="trust" />
              ) : null}
              <Cluster gap="md">
                {section.primaryCTA ? (
                  <ButtonLink cta={{ label: section.primaryCTA, href: section.ctaReferences[0] ?? '/', variant: 'primary' }} />
                ) : null}
                {section.secondaryCTA ? (
                  <ButtonLink cta={{ label: section.secondaryCTA, href: '/', variant: 'secondary' }} />
                ) : null}
              </Cluster>
            </Stack>
            <MediaPlaceholder media={{ id: `${section.id}-media`, label: mediaLabel, altText: mediaLabel, aspectRatio: '4/3', assetId: 'hero' }} />
          </div>
        ) : heroVariant === 'full-bleed' ? (
          <Stack gap="lg">
            <div className="relative overflow-hidden rounded-[var(--radius-lg)]">
              <MediaPlaceholder media={{ id: `${section.id}-media`, label: mediaLabel, altText: mediaLabel, aspectRatio: '16/9', assetId: 'hero' }} />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-[var(--color-background)]/90 to-transparent p-[var(--spacing-lg)]">
                <Stack gap="md" className="max-w-2xl">
                  <SectionHeading section={section} />
                  {section.primaryCTA ? (
                    <ButtonLink cta={{ label: section.primaryCTA, href: section.ctaReferences[0] ?? '/', variant: 'primary' }} />
                  ) : null}
                </Stack>
              </div>
            </div>
          </Stack>
        ) : heroVariant === 'product-focused' ? (
          <div className="grid gap-[var(--spacing-lg)] lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <MediaPlaceholder media={{ id: `${section.id}-media`, label: mediaLabel, altText: mediaLabel, aspectRatio: '1/1', assetId: 'hero' }} />
            <Stack gap="lg">
              <Badge>{section.eyebrow ?? 'Featured'}</Badge>
              <SectionHeading section={section} />
              {section.primaryCTA ? (
                <ButtonLink cta={{ label: section.primaryCTA, href: section.ctaReferences[0] ?? '/', variant: 'primary' }} />
              ) : null}
            </Stack>
          </div>
        ) : heroVariant === 'local-business' ? (
          <Stack gap="lg">
            <SectionHeading section={section} />
            <Cluster gap="sm">
              <Placeholder label="[PLACEHOLDER: Adresse]" category="address" />
              <Placeholder label="[PLACEHOLDER: Telefon]" category="phone" />
              <Placeholder label="[PLACEHOLDER: Öffnungszeiten]" category="opening-hours" />
            </Cluster>
            {section.primaryCTA ? (
              <ButtonLink cta={{ label: section.primaryCTA, href: section.ctaReferences[0] ?? '/', variant: 'primary' }} />
            ) : null}
          </Stack>
        ) : (
          <Stack gap="lg" className="max-w-3xl">
            <SectionHeading section={section} />
            {section.description ? (
              <p className="text-[length:var(--font-size-lg)] leading-relaxed text-[var(--color-text-muted)]">{section.description}</p>
            ) : null}
            {section.primaryCTA ? (
              <ButtonLink cta={{ label: section.primaryCTA, href: section.ctaReferences[0] ?? '/', variant: 'primary' }} />
            ) : null}
          </Stack>
        )}
      </Container>
    </SectionShell>
  );
}

export function HeroSection({ section }: SectionComponentProps) {
  if (section.heroLayout === 'premium-restaurant') {
    const heroAsset = resolveAsset('hero');
    const primaryHref = section.primaryCtaHref ?? section.ctaReferences[0] ?? '/';
    const secondaryHref = section.secondaryCtaHref ?? section.ctaReferences[1] ?? '/';

    return (
      <SectionShell
        id={section.id}
        headingId={`${section.id}-heading`}
        className={cn('hero-premium', section.className)}
      >
        <div className="hero-premium__inner">
          <div className="hero-premium__content">
            <div className="hero-premium__animate">
              {section.tagline ? (
                <p className="hero-premium__tagline">{section.tagline}</p>
              ) : null}
              <h1 id={`${section.id}-heading`} className="hero-premium__title">
                {section.title}
              </h1>
              {section.description ? (
                <p className="hero-premium__description">{section.description}</p>
              ) : null}
            </div>
            <div className="hero-premium__actions hero-premium__animate">
              {section.primaryCTA ? (
                <a className="hero-premium__cta-primary" href={primaryHref}>
                  {section.primaryCTA}
                </a>
              ) : null}
              {section.secondaryCTA ? (
                <a className="hero-premium__cta-secondary" href={secondaryHref}>
                  {section.secondaryCTA}
                </a>
              ) : null}
            </div>
          </div>
          <div className="hero-premium__media hero-premium__animate hero-premium__animate--delay">
            <img
              src={heroAsset.path}
              alt={heroAsset.altText}
              className="hero-premium__image"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              data-asset-type={heroAsset.assetType}
              data-placeholder={String(heroAsset.placeholder)}
            />
          </div>
        </div>
      </SectionShell>
    );
  }

  return <HeroSectionLegacy section={section} />;
}
