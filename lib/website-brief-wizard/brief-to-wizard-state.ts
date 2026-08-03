import type { WebsiteBrief } from "@/lib/website-briefs.types";
import {
  EMPTY_WIZARD_STATE,
  type WebsiteBriefWizardState,
} from "@/lib/website-brief-wizard/types";

function parseSocialLine(
  source: string | null,
  prefix: string,
): string {
  if (!source) {
    return "";
  }

  for (const line of source.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.toLowerCase().startsWith(prefix.toLowerCase())) {
      return trimmed.slice(prefix.length).trim().replace(/^:\s*/, "");
    }
  }

  return "";
}

export function websiteBriefToWizardState(
  brief: WebsiteBrief,
): WebsiteBriefWizardState {
  return {
    ...EMPTY_WIZARD_STATE,
    business_name: brief.business_name,
    industry: brief.industry,
    primary_color: brief.primary_color ?? EMPTY_WIZARD_STATE.primary_color,
    secondary_color: brief.secondary_color ?? EMPTY_WIZARD_STATE.secondary_color,
    target_audience: brief.target_audience,
    services: brief.services ?? "",
    contact_phone: brief.contact_phone ?? "",
    contact_email: brief.contact_email ?? "",
    contact_address: brief.contact_address ?? "",
    location: brief.location ?? "",
    social_instagram: parseSocialLine(brief.social_media, "Instagram"),
    social_facebook: parseSocialLine(brief.social_media, "Facebook"),
    social_linkedin: parseSocialLine(brief.social_media, "LinkedIn"),
    social_other: "",
    preferred_style: brief.preferred_style ?? "",
    website_goal: brief.website_goal,
  };
}
