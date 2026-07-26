export type {
  BusinessProfileLink,
  OpeningHoursLine,
  RestaurantLandingContent,
  RestaurantBusinessProfile,
  RestaurantAssets,
  RestaurantProjectKey,
  RestaurantFixtureBriefId,
  RESTAURANT_BY_NANIS_BRIEF_ID,
} from "@/lib/industries/restaurant/types";

export {
  BY_NANIS_BRIEF_ID,
  BY_NANIS_RESTAURANT_ASSETS,
  restaurantAssetsForBriefId,
  resolveRestaurantAssets,
  collectRestaurantAssetPaths,
  verifyRestaurantAssetsOnDisk,
} from "@/lib/industries/restaurant/assets";

export {
  BY_NANIS_BUSINESS_PROFILE,
  restaurantBusinessProfileForBriefId,
  resolveRestaurantBusinessProfile,
  synthesizeRestaurantBusinessProfile,
  resolveFooterBusinessProfile,
  formatPhoneTelHref,
  splitAddressLines,
} from "@/lib/industries/restaurant/business-profile";

export {
  BY_NANIS_WEBSITE_THEME,
  websiteThemeForBriefId,
  resolveWebsiteTheme,
} from "@/lib/industries/restaurant/theme";

export {
  isPremiumRestaurantLanding,
  premiumLandingContent,
  businessProfileForComponentExport,
  resolvePremiumOrderCtaHref,
  premiumSectionAnchor,
} from "@/lib/industries/restaurant/landing";

export {
  buildCustomerAssetRegistryOverrides,
  buildCustomerAssetVirtualFiles,
  skippedPlaceholderAssetIds,
  exportPublicPathForRole,
  exportVirtualPathForRole,
} from "@/lib/industries/restaurant/customer-asset-export";

export type { CustomerAssetRole } from "@/lib/industries/restaurant/customer-asset-export";

export { registerRestaurantIndustryModule } from "@/lib/industries/restaurant/register";

export { resolveRestaurantCompileAttachments } from "@/lib/industries/restaurant/resolve-compile";
