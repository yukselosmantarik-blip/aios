import {
  EMPTY_WIZARD_STATE,
  type WebsiteBriefWizardState,
} from "@/lib/website-brief-wizard/types";

export function normalizeWebsiteBriefWizardState(
  input: Partial<WebsiteBriefWizardState> | WebsiteBriefWizardState,
): WebsiteBriefWizardState {
  return {
    business_name: input.business_name ?? "",
    industry: input.industry ?? "",
    primary_color: input.primary_color ?? EMPTY_WIZARD_STATE.primary_color,
    secondary_color: input.secondary_color ?? EMPTY_WIZARD_STATE.secondary_color,
    target_audience: input.target_audience ?? "",
    services: input.services ?? "",
    contact_phone: input.contact_phone ?? "",
    contact_email: input.contact_email ?? "",
    contact_address: input.contact_address ?? "",
    location: input.location ?? "",
    social_instagram: input.social_instagram ?? "",
    social_facebook: input.social_facebook ?? "",
    social_linkedin: input.social_linkedin ?? "",
    social_other: input.social_other ?? "",
    preferred_style: input.preferred_style ?? "",
    website_goal: input.website_goal ?? "",
  };
}
