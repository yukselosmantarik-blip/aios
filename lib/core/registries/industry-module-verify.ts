import { ensureIndustryModulesRegistered } from "@/lib/industries/bootstrap";
import { createSmashburgerCompilerInput } from "@/lib/website-compiler/verify";
import {
  getIndustryModuleRegistrySnapshot,
  isIndustryModuleRegistered,
  resolveIndustryCompileAttachments,
} from "@/lib/core/registries/industry-module-registry";
import { resolveIndustryIdFromBrief } from "@/lib/core/registries/industry-registry";
import { detectBusinessProfile } from "@/lib/website-compiler/normalize";

export type IndustryModuleRegistryVerificationCheck = {
  name: string;
  passed: boolean;
  detail: string;
};

export type IndustryModuleRegistryVerificationResult = {
  passed: boolean;
  checks: IndustryModuleRegistryVerificationCheck[];
};

export function verifyIndustryModuleRegistry(): IndustryModuleRegistryVerificationResult {
  ensureIndustryModulesRegistered();
  const checks: IndustryModuleRegistryVerificationCheck[] = [];
  const snapshot = getIndustryModuleRegistrySnapshot();

  checks.push({
    name: "Restaurant industry module registered",
    passed: isIndustryModuleRegistered("restaurant"),
    detail: `moduleCount=${snapshot.count}`,
  });

  const input = createSmashburgerCompilerInput();
  const industryId = resolveIndustryIdFromBrief(input.brief);
  const legacyId = detectBusinessProfile(input.brief.industry, input.brief.business_name);
  const attachments = resolveIndustryCompileAttachments(input, industryId);

  checks.push({
    name: "Smashburger compile attachments resolve via restaurant module",
    passed:
      industryId === "restaurant" &&
      legacyId === "restaurant" &&
      Boolean(attachments.restaurantAssets) &&
      Boolean(attachments.restaurantBusinessProfile),
    detail: `industryId=${industryId}`,
  });

  return {
    passed: checks.every((check) => check.passed),
    checks,
  };
}
