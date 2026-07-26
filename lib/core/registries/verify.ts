import {
  getIndustryRegistrySnapshot,
  resolveIndustryIdFromBrief,
  resolveIndustryRegistrationFromBrief,
} from "@/lib/core/registries/industry-registry";
import { createSmashburgerCompilerInput } from "@/lib/website-compiler/verify";
import { detectBusinessProfile } from "@/lib/website-compiler/normalize";

export type IndustryRegistryVerificationCheck = {
  name: string;
  passed: boolean;
  detail: string;
};

export type IndustryRegistryVerificationResult = {
  passed: boolean;
  checks: IndustryRegistryVerificationCheck[];
};

export function verifyIndustryRegistry(): IndustryRegistryVerificationResult {
  const checks: IndustryRegistryVerificationCheck[] = [];
  const snapshot = getIndustryRegistrySnapshot();

  checks.push({
    name: "Built-in industries registered",
    passed: snapshot.count === 5,
    detail: `count=${snapshot.count}`,
  });

  checks.push({
    name: "Registry ids are unique",
    passed:
      new Set(snapshot.industries.map((entry) => entry.id)).size === snapshot.count,
    detail: snapshot.industries.map((entry) => entry.id).join(", "),
  });

  const smashburgerBrief = createSmashburgerCompilerInput().brief;
  const resolvedId = resolveIndustryIdFromBrief(smashburgerBrief);
  const legacyId = detectBusinessProfile(
    smashburgerBrief.industry,
    smashburgerBrief.business_name,
  );

  checks.push({
    name: "resolveIndustryIdFromBrief matches compiler detectBusinessProfile",
    passed: resolvedId === legacyId && resolvedId === "restaurant",
    detail: `resolved=${resolvedId} legacy=${legacyId}`,
  });

  const registration = resolveIndustryRegistrationFromBrief(smashburgerBrief);
  checks.push({
    name: "Smashburger brief resolves to restaurant default sitemap metadata",
    passed:
      registration.id === "restaurant" &&
      registration.defaultSitemap.includes("Menu") &&
      registration.defaultSitemap.includes("Contact"),
    detail: registration.defaultSitemap.join(" → "),
  });

  return {
    passed: checks.every((check) => check.passed),
    checks,
  };
}
