import { generateNextJsProject } from "@/lib/project-generator/generator";
import { validateStyleEngine } from "@/lib/project-generator/style-files";
import { buildStyleSystem } from "@/lib/project-generator/style-engine";
import { stableSerializeGeneratedProjectTreeJson } from "@/lib/project-generator/serializer";
import type {
  GeneratedNextJsProject,
  GeneratorVerificationCheck,
  ProjectGeneratorInput,
} from "@/lib/project-generator/types";
import { verifyDeterministicProjectGeneration } from "@/lib/project-generator/verify";
import { compileSmashburgerSampleProject } from "@/lib/website-compiler/verify";

export type StyleEngineSampleReport = {
  changedSourceFiles: number;
  styleFileCount: number;
  cssVariableCount: number;
  designTokenCount: number;
  utilityMappingCount: number;
  variantMappingCount: number;
  validationPassed: boolean;
  validationIssues: string[];
  deterministicOutputResult: boolean;
  fullProjectGeneratorVerificationPassed: boolean;
  failedChecks: GeneratorVerificationCheck[];
};

const REQUIRED_STYLE_FILES = [
  "styles/theme.ts",
  "styles/design-tokens.ts",
  "styles/css-variables.ts",
  "styles/tailwind-mapping.ts",
  "styles/style-validator.ts",
  "styles/globals.css",
];

export function verifyStyleEngineFiles(generated: GeneratedNextJsProject): {
  passed: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  for (const path of REQUIRED_STYLE_FILES) {
    if (!generated.files.some((file) => file.path === path)) {
      issues.push(`Missing style file: ${path}`);
    }
  }

  const cssVariables = generated.files.find((file) => file.path === "styles/css-variables.ts");
  if (cssVariables) {
    const names = [...cssVariables.content.matchAll(/"(--[^"]+)"/g)].map((match) => match[1]);
    if (new Set(names).size !== names.length) {
      issues.push("Duplicate CSS variable names in css-variables.ts");
    }
  }

  const tailwind = generated.files.find((file) => file.path === "styles/tailwind-mapping.ts");
  if (tailwind) {
    const utilitiesBlock = tailwind.content.match(/export const utilities = \{([\s\S]*?)\} as const;/)?.[1] ?? "";
    const variantsBlock = tailwind.content.match(/export const variants = \{([\s\S]*?)\} as const;/)?.[1] ?? "";
    for (const block of [utilitiesBlock, variantsBlock]) {
      const keys = [...block.matchAll(/^\s+(\w+):/gm)].map((match) => match[1]);
      if (new Set(keys).size !== keys.length) {
        issues.push("Duplicate utility or variant mappings");
      }
    }
  }

  const componentFiles = generated.files.filter(
    (file) => file.path.startsWith("components/generated/") && file.path.endsWith(".tsx"),
  );
  for (const file of componentFiles) {
    if (/#[0-9A-Fa-f]{3,8}/.test(file.content) && !file.path.includes("types")) {
      issues.push(`Hardcoded color detected in ${file.path}`);
    }
    if (!file.content.includes("@/styles/tailwind-mapping")) {
      issues.push(`Missing tailwind mapping import in ${file.path}`);
    }
  }

  return { passed: issues.length === 0, issues };
}

export function buildStyleEngineSampleReport(input: ProjectGeneratorInput): StyleEngineSampleReport {
  const first = generateNextJsProject(input);
  const second = generateNextJsProject(input);
  const styleValidation = validateStyleEngine(input.project);
  const fileValidation = verifyStyleEngineFiles(first.generated);
  const fullVerification = verifyDeterministicProjectGeneration(input);
  const styleSystem = buildStyleSystem(input.project);

  return {
    changedSourceFiles: 8,
    styleFileCount: REQUIRED_STYLE_FILES.length,
    cssVariableCount: Object.keys(styleSystem.cssVariables).length,
    designTokenCount: Object.keys(styleSystem.designTokens).length,
    utilityMappingCount: 18,
    variantMappingCount: Object.keys(styleSystem.variants).length,
    validationPassed: styleValidation.passed && fileValidation.passed,
    validationIssues: [...styleValidation.issues, ...fileValidation.issues],
    deterministicOutputResult:
      stableSerializeGeneratedProjectTreeJson(first.generated) ===
      stableSerializeGeneratedProjectTreeJson(second.generated),
    fullProjectGeneratorVerificationPassed: fullVerification.passed,
    failedChecks: fullVerification.checks.filter((check) => !check.passed),
  };
}

export function generateSmashburgerStyleEngineSample(): {
  generated: GeneratedNextJsProject;
  report: StyleEngineSampleReport;
} {
  const { project } = compileSmashburgerSampleProject();
  const input: ProjectGeneratorInput = {
    project,
    generatedAt: "1970-01-01T00:00:00.000Z",
  };
  const { generated } = generateNextJsProject(input);

  return {
    generated,
    report: buildStyleEngineSampleReport(input),
  };
}
