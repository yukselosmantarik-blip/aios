export type {
  BusinessProfileLink,
  OpeningHoursLine,
  RestaurantBusinessProfile,
  RestaurantLandingContent,
} from "@/lib/business-profiles/types";
export { BY_NANIS_BUSINESS_PROFILE } from "@/lib/business-profiles/by-nanis";

import type { RestaurantAssets } from "@/lib/assets/types";
import { BY_NANIS_BRIEF_ID } from "@/lib/assets/by-nanis";
import { BY_NANIS_BUSINESS_PROFILE } from "@/lib/business-profiles/by-nanis";
import type { RestaurantBusinessProfile } from "@/lib/business-profiles/types";
import { resolveRestaurantAssets } from "@/lib/assets";

const PROFILES_BY_BRIEF_ID: Readonly<Record<string, RestaurantBusinessProfile>> = {
  [BY_NANIS_BRIEF_ID]: BY_NANIS_BUSINESS_PROFILE,
};

export function restaurantBusinessProfileForBriefId(
  briefId: string,
): RestaurantBusinessProfile | undefined {
  return PROFILES_BY_BRIEF_ID[briefId];
}

export function resolveRestaurantBusinessProfile(input: {
  brief: { id: string };
  restaurantBusinessProfile?: RestaurantBusinessProfile;
  restaurantAssets?: RestaurantAssets;
}): RestaurantBusinessProfile | undefined {
  if (input.restaurantBusinessProfile) {
    return input.restaurantBusinessProfile;
  }
  if (!resolveRestaurantAssets(input)) {
    return undefined;
  }
  return restaurantBusinessProfileForBriefId(input.brief.id);
}
