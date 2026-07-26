import type { RestaurantAssets } from "@/lib/industries/restaurant/types";
import {
  BY_NANIS_BRIEF_ID,
  BY_NANIS_RESTAURANT_ASSETS,
} from "@/lib/industries/restaurant/fixtures/by-nanis-assets";

const RESTAURANT_ASSETS_BY_BRIEF_ID: Readonly<Record<string, RestaurantAssets>> = {
  [BY_NANIS_BRIEF_ID]: BY_NANIS_RESTAURANT_ASSETS,
};

export function restaurantAssetsForBriefId(briefId: string): RestaurantAssets | undefined {
  return RESTAURANT_ASSETS_BY_BRIEF_ID[briefId];
}

export function resolveRestaurantAssets(input: {
  brief: { id: string };
  restaurantAssets?: RestaurantAssets;
}): RestaurantAssets | undefined {
  return input.restaurantAssets ?? restaurantAssetsForBriefId(input.brief.id);
}

export {
  BY_NANIS_BRIEF_ID,
  BY_NANIS_RESTAURANT_ASSETS,
} from "@/lib/industries/restaurant/fixtures/by-nanis-assets";

export {
  collectRestaurantAssetPaths,
  verifyRestaurantAssetsOnDisk,
} from "@/lib/industries/restaurant/assets-verify";
