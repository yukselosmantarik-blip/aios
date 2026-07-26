import { ALL_GENERATED_COMPONENTS } from "@/lib/project-generator/react-component-utils";
import {
  getSectionRegistrySnapshot,
  listSectionRegistrationsByKind,
} from "@/lib/core/registries/section-registry";

export type SectionRegistryVerificationCheck = {
  name: string;
  passed: boolean;
  detail: string;
};

export type SectionRegistryVerificationResult = {
  passed: boolean;
  checks: SectionRegistryVerificationCheck[];
};

const EXPECTED_BUILTIN_SECTION_IDS = [
  "hero",
  "about",
  "services",
  "menu",
  "gallery",
  "testimonials",
  "faq",
  "contact",
  "map",
  "footer",
  "cta",
] as const;

export function verifySectionRegistry(): SectionRegistryVerificationResult {
  const checks: SectionRegistryVerificationCheck[] = [];
  const snapshot = getSectionRegistrySnapshot();
  const generatedNames = new Set<string>(ALL_GENERATED_COMPONENTS);

  checks.push({
    name: "Built-in composable sections registered",
    passed: snapshot.count === EXPECTED_BUILTIN_SECTION_IDS.length,
    detail: `count=${snapshot.count}`,
  });

  checks.push({
    name: "Expected section ids present",
    passed: EXPECTED_BUILTIN_SECTION_IDS.every((id) =>
      snapshot.sections.some((entry) => entry.id === id),
    ),
    detail: snapshot.sections.map((entry) => entry.id).join(", "),
  });

  const pageSections = listSectionRegistrationsByKind("page-section");
  checks.push({
    name: "Page sections include hero and contact",
    passed:
      pageSections.some((entry) => entry.id === "hero") &&
      pageSections.some((entry) => entry.id === "contact"),
    detail: `${pageSections.length} page-section entries`,
  });

  const bindings = snapshot.sections
    .map((entry) => entry.componentBinding?.primary)
    .filter(Boolean) as string[];

  checks.push({
    name: "Primary component bindings reference known generated components",
    passed: bindings.every((name) => generatedNames.has(name)),
    detail: bindings.join(", "),
  });

  const hero = snapshot.sections.find((entry) => entry.id === "hero");
  checks.push({
    name: "Hero section maps to HeroSection component (planned binding)",
    passed: hero?.componentBinding?.primary === "HeroSection",
    detail: hero?.componentBinding?.primary ?? "missing",
  });

  return {
    passed: checks.every((check) => check.passed),
    checks,
  };
}
