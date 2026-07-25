import type { CompiledWebsiteProject } from "@/lib/website-compiler/types";
import { mergeWebsiteThemeIntoCssVariables } from "@/lib/project-generator/website-theme-css";

export type ThemeColors = {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  mutedColor: string;
};

export type ThemeTypography = {
  headingFont: string;
  bodyFont: string;
  fontSizes: Record<string, string>;
  fontWeights: Record<string, number>;
  lineHeights: Record<string, number>;
};

export type ThemeSpacing = {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  "2xl": string;
};

export type ThemeRadius = {
  small: string;
  medium: string;
  large: string;
  pill: string;
};

export type ThemeShadow = {
  sm: string;
  md: string;
  lg: string;
  xl: string;
};

export type GeneratedTheme = {
  mode: "light";
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  radius: ThemeRadius;
  shadow: ThemeShadow;
  breakpoints: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
  container: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
  zIndex: Record<string, number>;
  darkMode: {
    prepared: true;
    colors: ThemeColors;
  };
};

export type CssVariableMap = Record<string, string>;

export type TailwindVariantMap = {
  bgPrimary: string;
  bgSecondary: string;
  bgBackground: string;
  bgSurface: string;
  bgAccent: string;
  textPrimary: string;
  textMuted: string;
  textOnPrimary: string;
  borderDefault: string;
  roundedSm: string;
  roundedMd: string;
  roundedLg: string;
  roundedPill: string;
  shadowSm: string;
  shadowMd: string;
  shadowLg: string;
  shadowXl: string;
  container: string;
  mxAuto: string;
  focusRing: string;
  buttonPrimary: string;
  buttonSecondary: string;
  buttonOutline: string;
  buttonGhost: string;
  card: string;
  section: string;
  sectionContainer: string;
  badge: string;
  cta: string;
  placeholder: string;
  textMutedSmall: string;
  header: string;
  headerStatic: string;
  headerTransparent: string;
  footer: string;
  mobileSticky: string;
  input: string;
  skipLink: string;
  bodyRoot: string;
  motionSafe: string;
  cardElevated: string;
  cardInteractive: string;
  buttonText: string;
  buttonDestructive: string;
  faqDetails: string;
  reveal: string;
};

function tokenValue(
  project: CompiledWebsiteProject,
  group: keyof CompiledWebsiteProject["designTokens"],
  key: string,
  fallback: string,
): string {
  const value = project.designTokens[group]?.tokens[key];
  if (value === undefined || value === null) {
    return fallback;
  }
  const normalized = String(value).trim();
  if (!normalized || normalized.includes("[PLACEHOLDER")) {
    return fallback;
  }
  return normalized;
}

function sanitizeColor(value: string, fallback: string): string {
  const normalized = value.trim();
  if (!normalized || normalized.includes("[PLACEHOLDER")) {
    return fallback;
  }
  return normalized;
}

export function buildThemeFromProject(project: CompiledWebsiteProject): GeneratedTheme {
  const primaryColor = sanitizeColor(project.theme.primaryColor, "#111111");
  const secondaryColor = sanitizeColor(project.theme.secondaryColor, "#F59E0B");
  const accentColor = sanitizeColor(
    tokenValue(project, "colors", "color.accent", secondaryColor),
    secondaryColor,
  );
  const backgroundColor = sanitizeColor(
    tokenValue(project, "colors", "color.background", "#FFFFFF"),
    "#FFFFFF",
  );
  const surfaceColor = sanitizeColor(
    tokenValue(project, "colors", "color.surface", "#FAFAFA"),
    "#FAFAFA",
  );
  const textColor = sanitizeColor(
    tokenValue(project, "colors", "color.text", "#111827"),
    "#111827",
  );
  const mutedColor = sanitizeColor(
    tokenValue(project, "colors", "color.textMuted", "#6B7280"),
    "#6B7280",
  );

  const tier = project.site.styleTier;
  const sectionSpacing =
    tier === "premium" ? "5rem" : tier === "modern" ? "4rem" : "3rem";

  return {
    mode: "light",
    colors: {
      primaryColor,
      secondaryColor,
      accentColor,
      backgroundColor,
      surfaceColor,
      textColor,
      mutedColor,
    },
    typography: {
      headingFont:
        "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      bodyFont:
        "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      fontSizes: {
        xs: tokenValue(project, "typography", "font.caption", "0.75rem"),
        sm: tokenValue(project, "typography", "font.bodySmall", "0.875rem"),
        md: tokenValue(project, "typography", "font.body", "1rem"),
        lg: tokenValue(project, "typography", "font.bodyLarge", "1.125rem"),
        xl: tokenValue(project, "typography", "font.h3", "1.25rem"),
        "2xl": tokenValue(project, "typography", "font.h2", "1.5rem"),
        display: tokenValue(project, "typography", "font.displayL", "2.25rem"),
      },
      fontWeights: {
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      lineHeights: {
        tight: 1.2,
        snug: 1.35,
        normal: 1.5,
        relaxed: 1.65,
      },
    },
    spacing: {
      xs: tokenValue(project, "spacing", "spacing.stack", "0.5rem"),
      sm: tokenValue(project, "spacing", "spacing.inline", "0.75rem"),
      md: tokenValue(project, "spacing", "spacing.block", "1rem"),
      lg: sectionSpacing,
      xl: "4rem",
      "2xl": "6rem",
    },
    radius: {
      small: tokenValue(project, "radius", "radius.sm", "0.375rem"),
      medium: tokenValue(project, "radius", "radius.md", "0.75rem"),
      large: tokenValue(project, "radius", "radius.lg", "1rem"),
      pill: tokenValue(project, "radius", "radius.full", "9999px"),
    },
    shadow: {
      sm: tokenValue(project, "shadows", "shadow.sm", "0 1px 2px rgba(0,0,0,0.05)"),
      md: tokenValue(project, "shadows", "shadow.md", "0 4px 12px rgba(0,0,0,0.08)"),
      lg: tokenValue(project, "shadows", "shadow.lg", "0 12px 32px rgba(0,0,0,0.12)"),
      xl: "0 20px 40px rgba(0,0,0,0.14)",
    },
    breakpoints: {
      mobile: tokenValue(project, "breakpoints", "breakpoint.sm", "640px"),
      tablet: tokenValue(project, "breakpoints", "breakpoint.md", "768px"),
      desktop: tokenValue(project, "breakpoints", "breakpoint.lg", "1024px"),
    },
    container: {
      mobile: "100%",
      tablet: tokenValue(project, "layoutWidths", "layout.contentWidth", "48rem"),
      desktop: tokenValue(project, "layoutWidths", "layout.maxWidth", "80rem"),
    },
    zIndex: {
      base: 0,
      header: Number(tokenValue(project, "zIndex", "zIndex.header", "50")) || 50,
      sticky: Number(tokenValue(project, "zIndex", "zIndex.sticky", "40")) || 40,
      modal: Number(tokenValue(project, "zIndex", "zIndex.modal", "60")) || 60,
    },
    darkMode: {
      prepared: true,
      colors: {
        primaryColor,
        secondaryColor,
        accentColor,
        backgroundColor: "#0B0B0B",
        surfaceColor: "#141414",
        textColor: "#F5F5F5",
        mutedColor: "#A3A3A3",
      },
    },
  };
}

export function buildDesignTokenRecord(
  theme: GeneratedTheme,
  project: CompiledWebsiteProject,
): Record<string, string | number> {
  return {
    "color.primary": theme.colors.primaryColor,
    "color.secondary": theme.colors.secondaryColor,
    "color.accent": theme.colors.accentColor,
    "color.background": theme.colors.backgroundColor,
    "color.surface": theme.colors.surfaceColor,
    "color.text": theme.colors.textColor,
    "color.muted": theme.colors.mutedColor,
    "color.border": tokenValue(project, "colors", "color.border", "#E5E7EB"),
    "color.error": tokenValue(project, "colors", "color.error", "#DC2626"),
    "font.heading": theme.typography.headingFont,
    "font.body": theme.typography.bodyFont,
    "spacing.xs": theme.spacing.xs,
    "spacing.sm": theme.spacing.sm,
    "spacing.md": theme.spacing.md,
    "spacing.lg": theme.spacing.lg,
    "spacing.xl": theme.spacing.xl,
    "spacing.2xl": theme.spacing["2xl"],
    "radius.small": theme.radius.small,
    "radius.medium": theme.radius.medium,
    "radius.large": theme.radius.large,
    "radius.pill": theme.radius.pill,
    "shadow.sm": theme.shadow.sm,
    "shadow.md": theme.shadow.md,
    "shadow.lg": theme.shadow.lg,
    "shadow.xl": theme.shadow.xl,
    "container.mobile": theme.container.mobile,
    "container.tablet": theme.container.tablet,
    "container.desktop": theme.container.desktop,
    "breakpoint.mobile": theme.breakpoints.mobile,
    "breakpoint.tablet": theme.breakpoints.tablet,
    "breakpoint.desktop": theme.breakpoints.desktop,
    "z-index.header": theme.zIndex.header,
    "z-index.sticky": theme.zIndex.sticky,
    "z-index.modal": theme.zIndex.modal,
  };
}

export function buildCssVariableMap(theme: GeneratedTheme, project: CompiledWebsiteProject): CssVariableMap {
  const borderColor = tokenValue(project, "colors", "color.border", "#E5E7EB");

  const base: CssVariableMap = {
    "--color-primary": theme.colors.primaryColor,
    "--color-secondary": theme.colors.secondaryColor,
    "--color-accent": theme.colors.accentColor,
    "--color-background": theme.colors.backgroundColor,
    "--color-surface": theme.colors.surfaceColor,
    "--color-text": theme.colors.textColor,
    "--color-text-primary": theme.colors.textColor,
    "--color-muted": theme.colors.mutedColor,
    "--color-text-muted": theme.colors.mutedColor,
    "--color-border": borderColor,
    "--color-error": tokenValue(project, "colors", "color.error", "#DC2626"),
    "--font-heading": theme.typography.headingFont,
    "--font-body": theme.typography.bodyFont,
    "--font-size-xs": theme.typography.fontSizes.xs,
    "--font-size-sm": theme.typography.fontSizes.sm,
    "--font-size-md": theme.typography.fontSizes.md,
    "--font-size-lg": theme.typography.fontSizes.lg,
    "--font-size-xl": theme.typography.fontSizes.xl,
    "--font-size-2xl": theme.typography.fontSizes["2xl"],
    "--font-size-display": theme.typography.fontSizes.display,
    "--font-weight-regular": String(theme.typography.fontWeights.regular),
    "--font-weight-medium": String(theme.typography.fontWeights.medium),
    "--font-weight-semibold": String(theme.typography.fontWeights.semibold),
    "--font-weight-bold": String(theme.typography.fontWeights.bold),
    "--line-height-tight": String(theme.typography.lineHeights.tight),
    "--line-height-snug": String(theme.typography.lineHeights.snug),
    "--line-height-normal": String(theme.typography.lineHeights.normal),
    "--line-height-relaxed": String(theme.typography.lineHeights.relaxed),
    "--spacing-xs": theme.spacing.xs,
    "--spacing-sm": theme.spacing.sm,
    "--spacing-md": theme.spacing.md,
    "--spacing-lg": theme.spacing.lg,
    "--spacing-xl": theme.spacing.xl,
    "--spacing-2xl": theme.spacing["2xl"],
    "--radius-sm": theme.radius.small,
    "--radius-md": theme.radius.medium,
    "--radius-lg": theme.radius.large,
    "--radius-pill": theme.radius.pill,
    "--shadow-sm": theme.shadow.sm,
    "--shadow-md": theme.shadow.md,
    "--shadow-lg": theme.shadow.lg,
    "--shadow-xl": theme.shadow.xl,
    "--container-mobile": theme.container.mobile,
    "--container-tablet": theme.container.tablet,
    "--container-desktop": theme.container.desktop,
    "--breakpoint-mobile": theme.breakpoints.mobile,
    "--breakpoint-tablet": theme.breakpoints.tablet,
    "--breakpoint-desktop": theme.breakpoints.desktop,
    "--z-index-header": String(theme.zIndex.header),
    "--z-index-sticky": String(theme.zIndex.sticky),
    "--z-index-modal": String(theme.zIndex.modal),
    "--dark-color-background": theme.darkMode.colors.backgroundColor,
    "--dark-color-surface": theme.darkMode.colors.surfaceColor,
    "--dark-color-text": theme.darkMode.colors.textColor,
    "--dark-color-muted": theme.darkMode.colors.mutedColor,
  };

  return mergeWebsiteThemeIntoCssVariables(base, project.websiteTheme);
}

export function buildTailwindVariantMap(): TailwindVariantMap {
  const focusRing =
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]";

  return {
    bgPrimary: "bg-[var(--color-primary)]",
    bgSecondary: "bg-[var(--color-secondary)]",
    bgBackground: "bg-[var(--color-background)]",
    bgSurface: "bg-[var(--color-surface)]",
    bgAccent: "bg-[var(--color-accent)]",
    textPrimary: "text-[var(--color-text-primary)]",
    textMuted: "text-[var(--color-text-muted)]",
    textOnPrimary: "text-[var(--color-background)]",
    borderDefault: "border border-[var(--color-border)]",
    roundedSm: "rounded-[var(--radius-sm)]",
    roundedMd: "rounded-[var(--radius-md)]",
    roundedLg: "rounded-[var(--radius-lg)]",
    roundedPill: "rounded-[var(--radius-pill)]",
    shadowSm: "shadow-[var(--shadow-sm)]",
    shadowMd: "shadow-[var(--shadow-md)]",
    shadowLg: "shadow-[var(--shadow-lg)]",
    shadowXl: "shadow-[var(--shadow-xl)]",
    container:
      "mx-auto w-full max-w-[var(--container-desktop)] px-[var(--spacing-md)] md:px-[var(--spacing-lg)]",
    mxAuto: "mx-auto",
    focusRing,
    buttonPrimary: `inline-flex items-center justify-center px-[var(--spacing-md)] py-[var(--spacing-sm)] text-[var(--font-size-sm)] font-[var(--font-weight-medium)] ${focusRing} bg-[var(--color-primary)] text-[var(--color-background)] rounded-[var(--radius-md)]`,
    buttonSecondary: `inline-flex items-center justify-center px-[var(--spacing-md)] py-[var(--spacing-sm)] text-[var(--font-size-sm)] font-[var(--font-weight-medium)] ${focusRing} border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-[var(--radius-md)]`,
    buttonOutline: `inline-flex items-center justify-center px-[var(--spacing-md)] py-[var(--spacing-sm)] text-[var(--font-size-sm)] font-[var(--font-weight-medium)] ${focusRing} border border-[var(--color-primary)] text-[var(--color-primary)] bg-transparent rounded-[var(--radius-md)]`,
    buttonGhost: `inline-flex items-center justify-center px-[var(--spacing-md)] py-[var(--spacing-sm)] text-[var(--font-size-sm)] font-[var(--font-weight-medium)] ${focusRing} text-[var(--color-text-primary)] bg-transparent rounded-[var(--radius-md)]`,
    card: `rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-[var(--spacing-md)] md:p-[var(--spacing-lg)] shadow-[var(--shadow-sm)]`,
    section:
      "w-full py-[var(--spacing-lg)] md:py-[var(--spacing-xl)] bg-[var(--color-background)] text-[var(--color-text-primary)] font-[family-name:var(--font-body)]",
    sectionContainer: "mx-auto w-full max-w-[var(--container-desktop)] px-[var(--spacing-md)] md:px-[var(--spacing-lg)]",
    badge:
      "inline-flex items-center rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[var(--color-surface)] px-[var(--spacing-sm)] py-[var(--spacing-xs)] text-[var(--font-size-xs)] text-[var(--color-text-muted)]",
    cta: `inline-flex items-center justify-center px-[var(--spacing-lg)] py-[var(--spacing-sm)] text-[var(--font-size-sm)] font-[var(--font-weight-semibold)] ${focusRing} bg-[var(--color-primary)] text-[var(--color-background)] rounded-[var(--radius-md)] shadow-[var(--shadow-md)]`,
    placeholder:
      "rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-[var(--spacing-sm)] py-[var(--spacing-sm)] text-[var(--font-size-sm)] text-[var(--color-text-muted)]",
    textMutedSmall: "text-[var(--font-size-sm)] text-[var(--color-text-muted)]",
    header:
      "sticky top-0 z-[var(--z-index-header)] border-b border-[var(--color-border)] bg-[var(--color-background)]",
    headerStatic:
      "relative z-[var(--z-index-header)] border-b border-[var(--color-border)] bg-[var(--color-background)]",
    headerTransparent:
      "fixed inset-x-0 top-0 z-[var(--z-index-header)] border-b border-transparent bg-transparent motion-safe:transition-colors motion-reduce:transition-none",
    footer: "border-t border-[var(--color-border)] bg-[var(--color-surface)]",
    mobileSticky:
      "fixed inset-x-0 bottom-0 z-[var(--z-index-sticky)] border-t border-[var(--color-border)] bg-[var(--color-background)] p-[var(--spacing-md)] md:hidden",
    input:
      "mt-1 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] px-[var(--spacing-sm)] py-[var(--spacing-sm)] text-[var(--font-size-sm)] text-[var(--color-text-primary)]",
    skipLink:
      "sr-only focus:not-sr-only focus:absolute focus:left-[var(--spacing-md)] focus:top-[var(--spacing-md)] focus:z-[var(--z-index-modal)] focus:rounded-[var(--radius-md)] focus:bg-[var(--color-background)] focus:px-[var(--spacing-md)] focus:py-[var(--spacing-sm)]",
    bodyRoot: "bg-[var(--color-background)] text-[var(--color-text-primary)] font-[family-name:var(--font-body)]",
    motionSafe:
      "motion-safe:transition-all motion-safe:duration-200 motion-reduce:transition-none",
    cardElevated: `rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-[var(--spacing-md)] md:p-[var(--spacing-lg)] shadow-[var(--shadow-md)] ${focusRing}`,
    cardInteractive: `rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-[var(--spacing-md)] md:p-[var(--spacing-lg)] shadow-[var(--shadow-sm)] motion-safe:transition-all motion-safe:duration-200 motion-reduce:transition-none hover:shadow-[var(--shadow-md)] focus-within:shadow-[var(--shadow-md)] ${focusRing}`,
    buttonText: `inline-flex items-center justify-center px-[var(--spacing-sm)] py-[var(--spacing-xs)] text-[var(--font-size-sm)] font-[var(--font-weight-medium)] ${focusRing} text-[var(--color-primary)] bg-transparent rounded-[var(--radius-md)]`,
    buttonDestructive: `inline-flex items-center justify-center px-[var(--spacing-md)] py-[var(--spacing-sm)] text-[var(--font-size-sm)] font-[var(--font-weight-medium)] ${focusRing} bg-[var(--color-error)] text-[var(--color-background)] rounded-[var(--radius-md)]`,
    faqDetails:
      "group rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-[var(--spacing-md)] open:shadow-[var(--shadow-sm)]",
    reveal:
      "motion-safe:animate-none motion-safe:opacity-100 motion-reduce:opacity-100",
  };
}

export function buildStyleSystem(project: CompiledWebsiteProject): {
  theme: GeneratedTheme;
  designTokens: Record<string, string | number>;
  cssVariables: CssVariableMap;
  variants: TailwindVariantMap;
} {
  const theme = buildThemeFromProject(project);
  return {
    theme,
    designTokens: buildDesignTokenRecord(theme, project),
    cssVariables: buildCssVariableMap(theme, project),
    variants: buildTailwindVariantMap(),
  };
}
