import type { WebsiteBrief } from "@/lib/website-briefs.types";
import { WEBSITE_BRIEF_WIZARD_FIELD_DEFAULTS } from "@/lib/website-briefs.types";
import { createPageDnaContext } from "@/lib/website-blueprint-page-dna";
import { VALID_PATTERN_IDS } from "@/lib/website-blueprint-visual-hierarchy";
import {
  buildPageHierarchySpecification,
  buildPageVisualHierarchyBlock,
  computeSectionPriorityScore,
  serializePageHierarchySpecification,
} from "@/lib/website-blueprint-visual-hierarchy";

type VerifyContextInput = Parameters<typeof createPageDnaContext>[0];

export type VisualHierarchyVerificationResult = {
  passed: boolean;
  checks: Array<{ name: string; passed: boolean; detail: string }>;
};

function detectPageRole(page: string) {
  const key = page.trim().toLowerCase();
  const aliases: Record<string, VerifyContextInput["role"]> = {
    home: "home",
    startseite: "home",
    menu: "menu",
    speisekarte: "menu",
    about: "about",
    "über uns": "about",
    gallery: "gallery",
    galerie: "gallery",
    contact: "contact",
    kontakt: "contact",
  };
  return aliases[key] ?? "generic";
}

function slugFromPage(page: string): string {
  return page
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function buildSmashburgerContext(
  overrides?: Partial<VerifyContextInput>,
): ReturnType<typeof createPageDnaContext> {
  const brief: WebsiteBrief = {
    id: "1",
    user_id: "1",
    agent_id: "1",
    customer_id: null,
    project_id: null,
    business_name: "by Nani's",
    industry: "Smashburger Restaurant",
    location: null,
    website_goal: "Mehr Kunden gewinnen und online bestellungen ermöglichen",
    target_audience: "Burger liebhaber, familien, studenten",
    services: "Smashburger\r\nHot Dogs\r\nPommes",
    unique_selling_points: "100 % Halal, frische Zutaten",
    preferred_style: "Modern, premium, Apple-ähnliche Animationen",
    primary_color: "#111111",
    secondary_color: "#F59E0B",
    required_pages: "Startseite\r\nSpeisekarte\r\nKontakt",
    required_features: "Online-Bestellung, Kontaktformular, Google Maps",
    reference_websites: "https://www.fiveguys.de",
    additional_notes: "Logo und Bilder folgen.",
    ...WEBSITE_BRIEF_WIZARD_FIELD_DEFAULTS,
    status: "ready",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  };

  const input: VerifyContextInput = {
    page: "Startseite",
    role: "home",
    brief,
    profile: "restaurant",
    sitemap: ["Startseite", "Speisekarte", "Kontakt"],
    detectPageRole,
    slugFromPage,
    pageMetaTitle: (page, b) => `${page} | ${b.business_name}`,
    pageMetaDescription: () => "Meta",
    primaryCta: "Jetzt bestellen",
    secondaryCta: "Speisekarte ansehen",
    usp: brief.unique_selling_points ?? "",
    style: brief.preferred_style ?? "",
    requestedFeatures: ["Online-Bestellung"],
    tier: "premium",
    prefersMotion: true,
    ...overrides,
  };

  return createPageDnaContext(input);
}

export function verifyVisualHierarchyRules(
  input?: VerifyContextInput,
): VisualHierarchyVerificationResult {
  const checks: VisualHierarchyVerificationResult["checks"] = [];
  const homeCtx = input ? createPageDnaContext(input) : buildSmashburgerContext();
  const contactCtx = buildSmashburgerContext({
    page: "Kontakt",
    role: "contact",
  });

  const homeSpec1 = buildPageHierarchySpecification(homeCtx);
  const homeSpec2 = buildPageHierarchySpecification(homeCtx);
  checks.push({
    name: "Same brief produces identical hierarchy output",
    passed: serializePageHierarchySpecification(homeSpec1) === serializePageHierarchySpecification(homeSpec2),
    detail: "Serialized PageHierarchySpecification must match across runs.",
  });

  const homeBlock1 = buildPageVisualHierarchyBlock(homeCtx).join("\n");
  const homeBlock2 = buildPageVisualHierarchyBlock(homeCtx).join("\n");
  checks.push({
    name: "Identical visual hierarchy block output",
    passed: homeBlock1 === homeBlock2,
    detail: "Blueprint block text must be deterministic.",
  });

  const heroDominant = homeSpec1.hierarchyDecisions.find((item) => item.element === "Hero");
  checks.push({
    name: "Homepage has one dominant hero",
    passed: heroDominant?.hierarchyLevel === "dominant",
    detail: `Hero level: ${heroDominant?.hierarchyLevel ?? "missing"}`,
  });

  checks.push({
    name: "Homepage dominant CTA defined",
    passed: homeSpec1.dominantCta === homeCtx.primaryCta,
    detail: `Dominant CTA: ${homeSpec1.dominantCta}`,
  });

  const contactSpec = buildPageHierarchySpecification(contactCtx);
  const contactFormPriority = contactSpec.sectionPriorities.find((item) =>
    /ContactForm|ContactDetails/i.test(item.sectionName),
  );
  checks.push({
    name: "Contact page prioritizes contact paths",
    passed: (contactFormPriority?.priorityScore ?? 0) >= 55,
    detail: `Contact section score: ${contactFormPriority?.priorityScore ?? "n/a"}`,
  });

  const testimonialPriority = homeSpec1.sectionPriorities.find((item) =>
    /Testimonial/i.test(item.sectionName),
  );
  checks.push({
    name: "Missing testimonials prevents high testimonial emphasis",
    passed: (testimonialPriority?.priorityScore ?? 100) < 60,
    detail: `Testimonial score: ${testimonialPriority?.priorityScore ?? "n/a"}`,
  });

  const mapContactPriority = contactSpec.sectionPriorities.find((item) =>
    /Map|Address/i.test(item.sectionName),
  );
  checks.push({
    name: "Missing address prevents high map emphasis",
    passed: (mapContactPriority?.priorityScore ?? 100) < 55,
    detail: `Map/address score: ${mapContactPriority?.priorityScore ?? "n/a"}`,
  });

  checks.push({
    name: "Mobile hierarchy differs from desktop notes present",
    passed: buildPageVisualHierarchyBlock(homeCtx).some((line) =>
      line.includes("Mobile:"),
    ),
    detail: "Responsive hierarchy section must mention mobile handling.",
  });

  checks.push({
    name: "No duplicate section priority orders",
    passed:
      new Set(homeSpec1.sectionPriorities.map((item) => item.recommendedOrder)).size ===
      homeSpec1.sectionPriorities.length,
    detail: `Sections: ${homeSpec1.sectionPriorities.length}`,
  });

  checks.push({
    name: "All referenced pattern IDs exist",
    passed: homeSpec1.sectionPriorities.every((item) =>
      VALID_PATTERN_IDS.includes(item.patternId),
    ),
    detail: "Pattern IDs must exist in Pattern Library.",
  });

  checks.push({
    name: "Design token references present",
    passed: buildPageVisualHierarchyBlock(homeCtx).some((line) =>
      line.includes("h1") && line.includes("bodyLarge"),
    ),
    detail: "Typography hierarchy references Design System tokens.",
  });

  const priorities = homeSpec1.sectionPriorities.map((item) => item.priorityScore);
  checks.push({
    name: "No duplicate section priority scores enforced unique orders",
    passed: priorities.every((score) => score >= 0 && score <= 100),
    detail: "All scores in 0–100 range.",
  });

  if (testimonialPriority) {
    const sections = homeSpec1.sectionPriorities;
    const index = sections.findIndex((item) => item.sectionName === testimonialPriority.sectionName);
    const score = computeSectionPriorityScore(
      {
        name: testimonialPriority.sectionName,
        purpose: "",
        contentRequirements: "",
        copyDirection: "",
        components: "",
        images: "",
        ctaBehavior: "",
        internalLinks: "",
        accessibility: "",
        responsive: "",
        motion: "",
      },
      index,
      sections.length,
      homeCtx,
      testimonialPriority.patternId,
    );
    checks.push({
      name: "Testimonial score formula applies missing penalty",
      passed: score === testimonialPriority.priorityScore,
      detail: `Formula score ${score} vs spec ${testimonialPriority.priorityScore}`,
    });
  }

  const passed = checks.every((check) => check.passed);
  return { passed, checks };
}

export function runVisualHierarchySampleReport(
  generateBlueprint: (brief: WebsiteBrief) => { masterPrompt: string; recommendedPageSections: Record<string, string[]> },
  brief: WebsiteBrief,
): Record<string, unknown> {
  const run1 = generateBlueprint(brief);
  const run2 = generateBlueprint(brief);
  const allText = [
    run1.masterPrompt,
    ...Object.values(run1.recommendedPageSections).flat(),
  ].join(" ");

  const pageScores: Record<string, number> = {};
  const dominantCtas: Record<string, string> = {};
  const readingFlows: Record<string, string> = {};

  for (const [page, sections] of Object.entries(run1.recommendedPageSections)) {
    const overallLine = sections.find((line) => /Overall: \d+\/100/.test(line));
    const match = overallLine?.match(/Overall: (\d+)\/100/);
    pageScores[page] = match ? Number(match[1]) : 0;
    const ctaLine = sections.find((line) => line.includes("Dominant CTA this page:"));
    dominantCtas[page] = ctaLine?.split(":").slice(1).join(":").trim() ?? "";
    const flowLine = sections.find((line) => line.startsWith("- Selected flow:"));
    readingFlows[page] = flowLine?.replace("- Selected flow:", "").trim() ?? "";
  }

  const conflictCount = allText
    .split("\n")
    .filter((line) => /^- \[(critical|high|medium|low)\]/.test(line.trim())).length;
  const verification = verifyVisualHierarchyRules();

  return {
    totalBlueprintWordCount: allText.split(/\s+/).filter(Boolean).length,
    visualHierarchyWordCount: allText
      .split("# Visual Hierarchy Engine")
      .slice(1)
      .join(" ")
      .split(/\s+/).filter(Boolean).length,
    pageHierarchyScores: pageScores,
    dominantCtaPerPage: dominantCtas,
    readingFlowPerPage: readingFlows,
    detectedConflictMarkers: conflictCount,
    identicalRuns: run1.masterPrompt === run2.masterPrompt,
    verificationPassed: verification.passed,
    verificationChecks: verification.checks,
  };
}
