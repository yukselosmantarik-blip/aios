export type {
  WebsiteTheme,
  WebsiteThemeColors,
  WebsiteThemeLayout,
  WebsiteThemeMotion,
  WebsiteThemeProjectKey,
  WebsiteThemeRadius,
  WebsiteThemeShadows,
  WebsiteThemeTypography,
} from "@/lib/themes/types";
export { BY_NANIS_WEBSITE_THEME } from "@/lib/themes/by-nanis";
export { verifyWebsiteThemeSerializable } from "@/lib/themes/verify";

import { BY_NANIS_BRIEF_ID } from "@/lib/assets/by-nanis";
import { BY_NANIS_WEBSITE_THEME } from "@/lib/themes/by-nanis";
import type { WebsiteTheme } from "@/lib/themes/types";

const WEBSITE_THEMES_BY_BRIEF_ID: Readonly<Record<string, WebsiteTheme>> = {
  [BY_NANIS_BRIEF_ID]: BY_NANIS_WEBSITE_THEME,
};

/** Resolve known website themes from a website brief id (AIOS-side only). */
export function websiteThemeForBriefId(briefId: string): WebsiteTheme | undefined {
  return WEBSITE_THEMES_BY_BRIEF_ID[briefId];
}

/** Prefer explicit compiler input; fall back to brief id registry. */
export function resolveWebsiteTheme(input: {
  brief: { id: string };
  websiteTheme?: WebsiteTheme;
}): WebsiteTheme | undefined {
  return input.websiteTheme ?? websiteThemeForBriefId(input.brief.id);
}
