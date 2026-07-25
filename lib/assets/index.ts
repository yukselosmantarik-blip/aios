export type { RestaurantAssets, RestaurantProjectKey } from "@/lib/assets/types";
export {
  BY_NANIS_BRIEF_ID,
  BY_NANIS_RESTAURANT_ASSETS,
} from "@/lib/assets/by-nanis";
export {
  collectRestaurantAssetPaths,
  verifyRestaurantAssetsOnDisk,
} from "@/lib/assets/verify";

import type { RestaurantAssets } from "@/lib/assets/types";
import {
  BY_NANIS_BRIEF_ID,
  BY_NANIS_RESTAURANT_ASSETS,
} from "@/lib/assets/by-nanis";

const RESTAURANT_ASSETS_BY_BRIEF_ID: Readonly<Record<string, RestaurantAssets>> = {
  [BY_NANIS_BRIEF_ID]: BY_NANIS_RESTAURANT_ASSETS,
};

/** Resolve known restaurant assets from a website brief id (AIOS-side only). */
export function restaurantAssetsForBriefId(briefId: string): RestaurantAssets | undefined {
  return RESTAURANT_ASSETS_BY_BRIEF_ID[briefId];
}

/** Prefer explicit compiler input; fall back to brief id registry. */
export function resolveRestaurantAssets(input: {
  brief: { id: string };
  restaurantAssets?: RestaurantAssets;
}): RestaurantAssets | undefined {
  return input.restaurantAssets ?? restaurantAssetsForBriefId(input.brief.id);
}
