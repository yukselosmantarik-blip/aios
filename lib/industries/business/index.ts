export type {
  BusinessIndustryProfile,
  BusinessServiceItem,
  BusinessBenefitItem,
  BusinessTestimonialItem,
  BusinessFaqItem,
  SampleBusinessBriefId,
} from "@/lib/industries/business/types";
export { SAMPLE_BUSINESS_BRIEF_ID } from "@/lib/industries/business/types";

export {
  businessProfileForBriefId,
  resolveBusinessIndustryProfile,
  SAMPLE_MUELLER_BUSINESS_PROFILE,
} from "@/lib/industries/business/business-profile";

export {
  isBusinessServiceLanding,
  businessLandingContent,
  businessHeaderNavItems,
  businessPrimaryCtaHref,
  BUSINESS_SECTION_ANCHORS,
} from "@/lib/industries/business/landing";

export { buildBusinessHomeSections } from "@/lib/industries/business/sections";
export { businessProfileToFooterProfile } from "@/lib/industries/business/footer-adapter";
export { registerBusinessIndustryModule } from "@/lib/industries/business/register";
