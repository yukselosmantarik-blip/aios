import type { IndustryId } from "@/lib/core/registries/types";
import type { BusinessIndustryProfile } from "@/lib/industries/business/types";
import type { WebsiteCompilerInput } from "@/lib/website-compiler/types";
import type { WebsiteTheme } from "@/lib/themes/types";

/**
 * Optional compile-time attachments an industry module may supply.
 * Field names match `CompiledWebsiteProject` until a generic rename milestone.
 */
export type IndustryCompileAttachments = {
  restaurantAssets?: WebsiteCompilerInput["restaurantAssets"];
  restaurantBusinessProfile?: WebsiteCompilerInput["restaurantBusinessProfile"];
  businessProfile?: BusinessIndustryProfile;
  websiteTheme?: WebsiteTheme;
};

export type IndustryCompileResolver = {
  resolveCompileAttachments?: (
    input: WebsiteCompilerInput,
  ) => IndustryCompileAttachments | undefined;
};

export type IndustryModuleRegistration = {
  id: IndustryId;
  compile: IndustryCompileResolver;
};

export type IndustryModuleRegistrySnapshot = {
  modules: IndustryModuleRegistration[];
  count: number;
};
