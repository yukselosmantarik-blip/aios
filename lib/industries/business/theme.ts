import type { WebsiteCompilerInput } from "@/lib/website-compiler/types";
import { SAMPLE_MUELLER_WEBSITE_THEME } from "@/lib/industries/business/fixtures/sample-mueller-theme";
import { SAMPLE_BUSINESS_BRIEF_ID } from "@/lib/industries/business/types";

const THEMES_BY_BRIEF_ID: Readonly<Record<string, typeof SAMPLE_MUELLER_WEBSITE_THEME>> = {
  [SAMPLE_BUSINESS_BRIEF_ID]: SAMPLE_MUELLER_WEBSITE_THEME,
};

export function resolveBusinessWebsiteTheme(
  input: Pick<WebsiteCompilerInput, "brief" | "websiteTheme">,
): WebsiteCompilerInput["websiteTheme"] {
  if (input.websiteTheme) {
    return input.websiteTheme;
  }
  return THEMES_BY_BRIEF_ID[input.brief.id];
}

export { SAMPLE_MUELLER_WEBSITE_THEME };
