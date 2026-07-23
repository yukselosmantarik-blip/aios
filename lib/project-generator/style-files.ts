import type { CompiledWebsiteProject } from "@/lib/website-compiler/types";
import { buildVirtualFile } from "@/lib/project-generator/tree";
import type { VirtualFile } from "@/lib/project-generator/types";
import { buildStyleSystem } from "@/lib/project-generator/style-engine";

function serializeObjectExport(name: string, value: unknown, typeName?: string): string {
  const lines = [
    "/**",
    " * GENERATED STYLE FILE — Sprint 8.2D",
    " */",
    "",
    `export const ${name} = ${JSON.stringify(value, null, 2)} as const;`,
    "",
  ];
  if (typeName) {
    lines.push(`export type ${typeName} = typeof ${name};`, "");
  }
  return lines.join("\n");
}

export function buildGlobalsCss(
  cssVariables: Record<string, string>,
  theme: ReturnType<typeof buildStyleSystem>["theme"],
): string {
  const rootVars = Object.entries(cssVariables)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join("\n");

  const darkVars = [
    `  --color-background: ${theme.darkMode.colors.backgroundColor};`,
    `  --color-surface: ${theme.darkMode.colors.surfaceColor};`,
    `  --color-text: ${theme.darkMode.colors.textColor};`,
    `  --color-text-primary: ${theme.darkMode.colors.textColor};`,
    `  --color-muted: ${theme.darkMode.colors.mutedColor};`,
    `  --color-text-muted: ${theme.darkMode.colors.mutedColor};`,
  ].join("\n");

  return [
    "/* GENERATED GLOBAL STYLES — Sprint 8.2D */",
    ":root {",
    rootVars,
    "}",
    "",
    ':root[data-theme="dark"] {',
    darkVars,
    "}",
    "",
    "@import 'tailwindcss';",
    "",
    "body {",
    "  font-family: var(--font-body);",
    "  color: var(--color-text-primary);",
    "  background: var(--color-background);",
    "}",
    "",
  ].join("\n");
}

export function buildThemeFile(theme: ReturnType<typeof buildStyleSystem>["theme"]): string {
  return serializeObjectExport("theme", theme, "Theme");
}

export function buildDesignTokensFile(
  designTokens: ReturnType<typeof buildStyleSystem>["designTokens"],
): string {
  return serializeObjectExport("designTokens", designTokens, "DesignTokens");
}

export function buildCssVariablesFile(
  cssVariables: ReturnType<typeof buildStyleSystem>["cssVariables"],
): string {
  return [
    "/**",
    " * GENERATED CSS VARIABLE MAP — Sprint 8.2D",
    " */",
    "",
    "export const cssVariables = {",
    ...Object.entries(cssVariables).map(
      ([key, value]) => `  ${JSON.stringify(key)}: ${JSON.stringify(value)},`,
    ),
    "} as const;",
    "",
    "export type CssVariables = typeof cssVariables;",
    "",
    "export function cssVariableBlock(selector = ':root'): string {",
    "  const lines = Object.entries(cssVariables).map(",
    "    ([name, value]) => `  ${name}: ${value};`,",
    "  );",
    "  return `${selector} {\\n${lines.join('\\n')}\\n}`;",
    "}",
    "",
  ].join("\n");
}

export function buildTailwindMappingFile(
  variants: ReturnType<typeof buildStyleSystem>["variants"],
): string {
  const utility = {
    bgPrimary: variants.bgPrimary,
    bgSecondary: variants.bgSecondary,
    bgBackground: variants.bgBackground,
    bgSurface: variants.bgSurface,
    bgAccent: variants.bgAccent,
    textPrimary: variants.textPrimary,
    textMuted: variants.textMuted,
    textOnPrimary: variants.textOnPrimary,
    borderDefault: variants.borderDefault,
    roundedSm: variants.roundedSm,
    roundedMd: variants.roundedMd,
    roundedLg: variants.roundedLg,
    roundedPill: variants.roundedPill,
    shadowSm: variants.shadowSm,
    shadowMd: variants.shadowMd,
    shadowLg: variants.shadowLg,
    shadowXl: variants.shadowXl,
    container: variants.container,
    mxAuto: variants.mxAuto,
  };

  return [
    "/**",
    " * GENERATED TAILWIND MAPPING — Sprint 8.2D",
    " * Components must consume variants/utilities from this module.",
    " */",
    "",
    "export const utilities = {",
    ...Object.entries(utility).map(
      ([key, value]) => `  ${key}: ${JSON.stringify(value)},`,
    ),
    "} as const;",
    "",
    "export const variants = {",
    ...Object.entries(variants).map(
      ([key, value]) => `  ${key}: ${JSON.stringify(value)},`,
    ),
    "} as const;",
    "",
    "export type UtilityClasses = typeof utilities;",
    "export type VariantClasses = typeof variants;",
    "",
    "export function cn(...classes: Array<string | false | null | undefined>): string {",
    "  return classes.filter(Boolean).join(' ');",
    "}",
    "",
  ].join("\n");
}

export function buildStyleValidatorFile(): string {
  return [
    "/**",
    " * GENERATED STYLE VALIDATOR — Sprint 8.2D",
    " */",
    "",
    "import { cssVariables } from './css-variables';",
    "import { designTokens } from './design-tokens';",
    "import { theme } from './theme';",
    "",
    "export type StyleValidationIssue = {",
    "  code: string;",
    "  message: string;",
    "};",
    "",
    "const REQUIRED_COLORS = [",
    "  'primaryColor',",
    "  'secondaryColor',",
    "  'accentColor',",
    "  'backgroundColor',",
    "  'surfaceColor',",
    "  'textColor',",
    "  'mutedColor',",
    "] as const;",
    "",
    "const REQUIRED_SPACING = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;",
    "",
    "export function validateStyleSystem(): { passed: boolean; issues: StyleValidationIssue[] } {",
    "  const issues: StyleValidationIssue[] = [];",
    "",
    "  for (const colorKey of REQUIRED_COLORS) {",
    "    const value = theme.colors[colorKey as keyof typeof theme.colors];",
    "    if (!value || String(value).includes('[PLACEHOLDER')) {",
    "      issues.push({ code: 'missing-color', message: `Missing color: ${colorKey}` });",
    "    }",
    "  }",
    "",
    "  for (const spacingKey of REQUIRED_SPACING) {",
    "    const value = theme.spacing[spacingKey as keyof typeof theme.spacing];",
    "    if (!value) {",
    "      issues.push({ code: 'missing-spacing', message: `Missing spacing: ${spacingKey}` });",
    "    }",
    "  }",
    "",
    "  if (!theme.typography.headingFont || !theme.typography.bodyFont) {",
    "    issues.push({ code: 'invalid-typography', message: 'Typography fonts must be defined' });",
    "  }",
    "",
    "  const cssNames = Object.keys(cssVariables);",
    "  if (new Set(cssNames).size !== cssNames.length) {",
    "    issues.push({ code: 'duplicate-css-variable', message: 'Duplicate CSS variable names detected' });",
    "  }",
    "",
    "  const tokenNames = Object.keys(designTokens);",
    "  if (new Set(tokenNames).size !== tokenNames.length) {",
    "    issues.push({ code: 'duplicate-token', message: 'Duplicate design token names detected' });",
    "  }",
    "",
    "  for (const tokenName of tokenNames) {",
    "    if (designTokens[tokenName as keyof typeof designTokens] === undefined) {",
    "      issues.push({ code: 'missing-token', message: `Missing token value: ${tokenName}` });",
    "    }",
    "  }",
    "",
    "  return { passed: issues.length === 0, issues };",
    "}",
    "",
  ].join("\n");
}

export function buildStyleEngineFiles(project: CompiledWebsiteProject): VirtualFile[] {
  const styleSystem = buildStyleSystem(project);

  return [
    buildVirtualFile("styles/theme.ts", "styles", buildThemeFile(styleSystem.theme), {
      description: "Generated theme object",
      implementationStatus: "metadata-only",
    }),
    buildVirtualFile(
      "styles/design-tokens.ts",
      "styles",
      buildDesignTokensFile(styleSystem.designTokens),
      {
        description: "Generated design token record",
        implementationStatus: "metadata-only",
      },
    ),
    buildVirtualFile(
      "styles/css-variables.ts",
      "styles",
      buildCssVariablesFile(styleSystem.cssVariables),
      {
        description: "Generated CSS variable map",
        implementationStatus: "metadata-only",
      },
    ),
    buildVirtualFile(
      "styles/tailwind-mapping.ts",
      "styles",
      buildTailwindMappingFile(styleSystem.variants),
      {
        description: "Generated Tailwind utility and variant mappings",
        implementationStatus: "metadata-only",
      },
    ),
    buildVirtualFile("styles/style-validator.ts", "styles", buildStyleValidatorFile(), {
      description: "Generated style validation utilities",
      implementationStatus: "metadata-only",
    }),
    buildVirtualFile(
      "styles/globals.css",
      "styles",
      buildGlobalsCss(styleSystem.cssVariables, styleSystem.theme),
      {
        description: "Generated global stylesheet with CSS variables",
        implementationStatus: "placeholder",
      },
    ),
  ];
}

export function validateStyleEngine(project: CompiledWebsiteProject): {
  passed: boolean;
  issues: string[];
} {
  const { theme, designTokens, cssVariables } = buildStyleSystem(project);
  const issues: string[] = [];

  const requiredColors = [
    "primaryColor",
    "secondaryColor",
    "accentColor",
    "backgroundColor",
    "surfaceColor",
    "textColor",
    "mutedColor",
  ] as const;

  for (const colorKey of requiredColors) {
    const value = theme.colors[colorKey];
    if (!value || value.includes("[PLACEHOLDER")) {
      issues.push(`Missing color: ${colorKey}`);
    }
  }

  for (const spacingKey of ["xs", "sm", "md", "lg", "xl", "2xl"] as const) {
    if (!theme.spacing[spacingKey]) {
      issues.push(`Missing spacing: ${spacingKey}`);
    }
  }

  if (!theme.typography.headingFont || !theme.typography.bodyFont) {
    issues.push("Invalid typography");
  }

  const cssNames = Object.keys(cssVariables);
  if (new Set(cssNames).size !== cssNames.length) {
    issues.push("Duplicate CSS variables");
  }

  const tokenNames = Object.keys(designTokens);
  if (new Set(tokenNames).size !== tokenNames.length) {
    issues.push("Duplicate design tokens");
  }

  for (const tokenName of tokenNames) {
    if (designTokens[tokenName] === undefined) {
      issues.push(`Missing token: ${tokenName}`);
    }
  }

  return { passed: issues.length === 0, issues };
}
