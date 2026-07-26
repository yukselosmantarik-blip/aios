import type { IndustryCompileAttachments } from "@/lib/core/registries/industry-module-types";
import { resolveRestaurantAssets } from "@/lib/industries/restaurant/assets";
import { resolveRestaurantBusinessProfile } from "@/lib/industries/restaurant/business-profile";
import type { WebsiteCompilerInput } from "@/lib/website-compiler/types";

export function resolveRestaurantCompileAttachments(
  input: WebsiteCompilerInput,
): IndustryCompileAttachments {
  const restaurantAssets = resolveRestaurantAssets(input);
  const restaurantBusinessProfile = resolveRestaurantBusinessProfile(input);

  return {
    ...(restaurantAssets ? { restaurantAssets } : {}),
    ...(restaurantBusinessProfile ? { restaurantBusinessProfile } : {}),
  };
}
