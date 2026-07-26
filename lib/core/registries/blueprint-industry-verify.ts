import type { IndustryId } from "@/lib/core/registries/types";
import {
  getIndustryRegistration,
  listIndustryRegistrations,
} from "@/lib/core/registries/industry-registry";
import type { WebsiteBrief } from "@/lib/website-briefs.types";
import { generateWebsiteBlueprintContent } from "@/lib/website-blueprint-generator";
import { createSmashburgerCompilerInput } from "@/lib/website-compiler/verify";

export type BlueprintIndustryVerificationCheck = {
  name: string;
  passed: boolean;
  detail: string;
};

export type BlueprintIndustryVerificationResult = {
  passed: boolean;
  checks: BlueprintIndustryVerificationCheck[];
};

function createBriefForIndustryProbe(
  industry: string,
  businessName: string,
): WebsiteBrief {
  const base = createSmashburgerCompilerInput().brief;
  return {
    ...base,
    industry,
    business_name: businessName,
    required_pages: "",
  };
}

const INDUSTRY_PROBE_FIXTURES: { id: IndustryId; industry: string; businessName: string }[] = [
  { id: "restaurant", industry: "Restaurant", businessName: "Probe Kitchen" },
  { id: "dentist", industry: "Dental Practice", businessName: "Probe Dental" },
  { id: "agency", industry: "Creative Agency", businessName: "Probe Studio" },
  { id: "business", industry: "Lokaler Gebäudeservice", businessName: "Probe Facility GmbH" },
  { id: "default", industry: "General Services", businessName: "Probe Business" },
];

export function verifyBlueprintIndustrySitemapIntegration(): BlueprintIndustryVerificationResult {
  const checks: BlueprintIndustryVerificationCheck[] = [];

  checks.push({
    name: "Industry registry exposes default sitemap for each built-in industry",
    passed: listIndustryRegistrations().every(
      (entry) => entry.defaultSitemap.length > 0,
    ),
    detail: listIndustryRegistrations()
      .map((entry) => `${entry.id}:${entry.defaultSitemap.length}`)
      .join(", "),
  });

  for (const fixture of INDUSTRY_PROBE_FIXTURES) {
    const brief = createBriefForIndustryProbe(fixture.industry, fixture.businessName);
    const blueprint = generateWebsiteBlueprintContent(brief);
    const expected = getIndustryRegistration(fixture.id)?.defaultSitemap ?? [];

    checks.push({
      name: `Blueprint default sitemap uses registry for ${fixture.id}`,
      passed:
        expected.length > 0 &&
        blueprint.recommendedSitemap.length === expected.length &&
        blueprint.recommendedSitemap.every(
          (page, index) => page === expected[index],
        ),
      detail: blueprint.recommendedSitemap.join(" → "),
    });
  }

  const smashburger = createSmashburgerCompilerInput().brief;
  const smashburgerBlueprint = generateWebsiteBlueprintContent(smashburger);
  checks.push({
    name: "Smashburger brief still uses explicit required_pages when provided",
    passed:
      smashburgerBlueprint.recommendedSitemap.length >= 5 &&
      smashburgerBlueprint.recommendedSitemap.some((page) =>
        /speisekarte|menu/i.test(page),
      ),
    detail: smashburgerBlueprint.recommendedSitemap.join(" → "),
  });

  return {
    passed: checks.every((check) => check.passed),
    checks,
  };
}
