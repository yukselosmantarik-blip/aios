import type { IndustryCompileAttachments } from "@/lib/core/registries/industry-module-types";
import { resolveBusinessIndustryProfile } from "@/lib/industries/business/business-profile";
import { resolveBusinessWebsiteTheme } from "@/lib/industries/business/theme";
import type { WebsiteCompilerInput } from "@/lib/website-compiler/types";

export function resolveBusinessCompileAttachments(
  input: WebsiteCompilerInput,
): IndustryCompileAttachments {
  const businessProfile = resolveBusinessIndustryProfile(input);
  const websiteTheme = resolveBusinessWebsiteTheme(input);

  return {
    ...(businessProfile ? { businessProfile } : {}),
    ...(websiteTheme ? { websiteTheme } : {}),
  };
}
