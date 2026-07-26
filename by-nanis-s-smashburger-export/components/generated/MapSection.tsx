/**
 * GENERATED COMPONENT — MapSection
 * Sprint 8.3 — premium visual component library
 */

import type { SectionComponentProps } from './types';
import { SectionHeading } from './SectionHeading';
import { SectionShell } from './SectionShell';
import { Container } from './Container';
import { Stack } from './Stack';
import { cn, variants } from '@/styles/tailwind-mapping';
import { resolveAsset } from '@/lib/assets/resolve-asset';
import { MediaFrame } from './MediaFrame';
import { Placeholder } from './Placeholder';

export function MapSection({ section }: SectionComponentProps) {
  const mapAsset = resolveAsset('map');
  return (
    <div className="space-y-2">
      <MediaFrame ratio="16/9">
        <img
          src={mapAsset.path}
          alt={mapAsset.altText}
          className="h-full w-full object-cover"
          loading="lazy"
          data-asset-type={mapAsset.assetType}
          data-placeholder={String(mapAsset.placeholder)}
          data-replace-before-production={String(mapAsset.replaceBeforeProduction)}
        />
      </MediaFrame>
      <Placeholder label="[PLACEHOLDER: Map]" category="map" />
    </div>
  );
}
