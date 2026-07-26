/**
 * GENERATED COMPONENT — MediaPlaceholder
 * Sprint 8.3 — premium visual component library
 */

import { cn, variants } from '@/styles/tailwind-mapping';
import { resolveAsset } from '@/lib/assets/resolve-asset';
import type { AssetId } from '@/lib/assets/registry';
import { MediaFrame } from './MediaFrame';
import { Placeholder } from './Placeholder';
import type { MediaPlaceholderModel } from './types';

type MediaPlaceholderProps = {
  media: MediaPlaceholderModel;
};

export function MediaPlaceholder({ media }: MediaPlaceholderProps) {
  const ratio = (media.aspectRatio as '16/9' | '4/3' | '1/1' | '3/4' | undefined) ?? '16/9';
  const asset = resolveAsset((media.assetId ?? 'hero') as AssetId);
  return (
    <figure className="w-full">
      <MediaFrame ratio={ratio}>
        <img
          src={asset.path}
          alt={media.altText ?? asset.altText}
          className="h-full w-full object-cover"
          loading="lazy"
          data-asset-type={asset.assetType}
          data-placeholder={String(asset.placeholder)}
          data-replace-before-production={String(asset.replaceBeforeProduction)}
        />
      </MediaFrame>
      {asset.placeholder ? (
        <figcaption className="mt-2 space-y-1">
          <Placeholder label={media.label} category="image" />
          <span className="block text-[length:var(--font-size-sm)] text-[var(--color-text-muted)]">
            {media.altText ?? asset.altText}
          </span>
        </figcaption>
      ) : null}
    </figure>
  );
}
