import type { BusinessIndustryProfile } from "@/lib/industries/business/types";
import {
  PROFILES_BY_BRIEF_ID,
  SAMPLE_MUELLER_BUSINESS_PROFILE,
} from "@/lib/industries/business/fixtures/sample-mueller-profile";

export function businessProfileForBriefId(briefId: string): BusinessIndustryProfile | undefined {
  return PROFILES_BY_BRIEF_ID[briefId];
}

export function resolveBusinessIndustryProfile(input: {
  brief: { id: string };
  businessProfile?: BusinessIndustryProfile;
}): BusinessIndustryProfile | undefined {
  if (input.businessProfile) {
    return input.businessProfile;
  }
  return businessProfileForBriefId(input.brief.id);
}

export { SAMPLE_MUELLER_BUSINESS_PROFILE };
