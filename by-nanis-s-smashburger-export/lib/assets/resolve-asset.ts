/**
 * GENERATED ASSET RESOLVER — Sprint 8.4
 */

import { assetRegistry, type AssetId, type ResolvedAsset } from './registry';

export function resolveAsset(id: AssetId): ResolvedAsset {
  const asset = assetRegistry[id];
  if (!asset) {
    throw new Error(`Unknown asset id: ${String(id)}`);
  }
  return asset;
}
