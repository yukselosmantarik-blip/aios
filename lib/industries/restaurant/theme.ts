import type { WebsiteTheme } from "@/lib/themes/types";
import { BY_NANIS_BRIEF_ID } from "@/lib/industries/restaurant/fixtures/by-nanis-assets";
import { BY_NANIS_WEBSITE_THEME } from "@/lib/industries/restaurant/fixtures/by-nanis-theme";

const WEBSITE_THEMES_BY_BRIEF_ID: Readonly<Record<string, WebsiteTheme>> = {
  [BY_NANIS_BRIEF_ID]: BY_NANIS_WEBSITE_THEME,
};

export function websiteThemeForBriefId(briefId: string): WebsiteTheme | undefined {
  return WEBSITE_THEMES_BY_BRIEF_ID[briefId];
}

export function resolveWebsiteTheme(input: {
  brief: { id: string };
  websiteTheme?: WebsiteTheme;
}): WebsiteTheme | undefined {
  return input.websiteTheme ?? websiteThemeForBriefId(input.brief.id);
}

export { BY_NANIS_WEBSITE_THEME } from "@/lib/industries/restaurant/fixtures/by-nanis-theme";
