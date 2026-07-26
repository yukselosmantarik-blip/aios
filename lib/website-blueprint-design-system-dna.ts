import type { WebsiteBrief } from "@/lib/website-briefs.types";
import type { BusinessProfile } from "@/lib/website-blueprint-page-dna";

export type { BusinessProfile } from "@/lib/website-blueprint-page-dna";
export type StyleTier = "premium" | "modern" | "default";

export type DesignSystemContext = {
  brief: WebsiteBrief;
  profile: BusinessProfile;
  tier: StyleTier;
  prefersMotion: boolean;
  primary: string;
  secondary: string;
  style: string;
  primaryCta: string;
};

type Rgb = { r: number; g: number; b: number };

const SCALE_STOPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

function clamp(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function rgbToHex({ r, g, b }: Rgb): string {
  return `#${[r, g, b]
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;
}

function parseHexColor(input: string): Rgb | null {
  const value = input.trim();
  const match = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!match) {
    return null;
  }

  const hex = match[1];
  if (hex.length === 3) {
    return {
      r: parseInt(hex[0] + hex[0], 16),
      g: parseInt(hex[1] + hex[1], 16),
      b: parseInt(hex[2] + hex[2], 16),
    };
  }

  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
}

function mixRgb(base: Rgb, target: Rgb, ratio: number): Rgb {
  return {
    r: clamp(base.r + (target.r - base.r) * ratio),
    g: clamp(base.g + (target.g - base.g) * ratio),
    b: clamp(base.b + (target.b - base.b) * ratio),
  };
}

function relativeLuminance({ r, g, b }: Rgb): number {
  const channels = [r, g, b].map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(foreground: Rgb, background: Rgb): number {
  const l1 = relativeLuminance(foreground);
  const l2 = relativeLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function pickReadableText(background: Rgb): string {
  const white: Rgb = { r: 255, g: 255, b: 255 };
  const nearBlack: Rgb = { r: 17, g: 24, b: 39 };
  return contrastRatio(white, background) >= contrastRatio(nearBlack, background)
    ? "#FFFFFF"
    : "#111827";
}

function generateColorScale(baseHex: string, label: string): string[] {
  const base = parseHexColor(baseHex);
  if (!base) {
    return SCALE_STOPS.map(
      (stop) =>
        `${label}-${stop}: [PLACEHOLDER — provide valid ${label} hex in brief; using neutral #6B7280 scale in dev until confirmed]`,
    );
  }

  const white: Rgb = { r: 255, g: 255, b: 255 };
  const black: Rgb = { r: 0, g: 0, b: 0 };

  const mixRatios: Record<number, { target: Rgb; ratio: number }> = {
    50: { target: white, ratio: 0.94 },
    100: { target: white, ratio: 0.88 },
    200: { target: white, ratio: 0.72 },
    300: { target: white, ratio: 0.56 },
    400: { target: white, ratio: 0.32 },
    500: { target: base, ratio: 0 },
    600: { target: black, ratio: 0.12 },
    700: { target: black, ratio: 0.24 },
    800: { target: black, ratio: 0.36 },
    900: { target: black, ratio: 0.48 },
    950: { target: black, ratio: 0.6 },
  };

  return SCALE_STOPS.map((stop) => {
    const mix = mixRatios[stop];
    const rgb =
      stop === 500 ? base : mixRgb(base, mix.target, mix.ratio);
    const marker = stop === 500 ? " (BASE — brief color)" : "";
    return `${label}-${stop}: ${rgbToHex(rgb)}${marker}`;
  });
}

function resolveColor(
  input: string,
  fallback: string,
): { hex: string; fromBrief: boolean } {
  const parsed = parseHexColor(input);
  if (parsed) {
    return { hex: rgbToHex(parsed), fromBrief: true };
  }
  const fallbackParsed = parseHexColor(fallback);
  return {
    hex: fallbackParsed ? rgbToHex(fallbackParsed) : fallback,
    fromBrief: false,
  };
}

function themeRecommendation(ctx: DesignSystemContext): {
  mode: "light-first" | "dark-first" | "single-light" | "single-dark";
  dualTheme: boolean;
  rationale: string;
} {
  const primary = parseHexColor(ctx.primary);
  const style = `${ctx.style} ${ctx.brief.preferred_style ?? ""} ${ctx.brief.additional_notes ?? ""}`.toLowerCase();
  const darkStyle = /dark|dunkel|night|premium.*dark|black/.test(style);
  const primaryIsDark = primary ? relativeLuminance(primary) < 0.2 : true;

  if (darkStyle && primaryIsDark) {
    return {
      mode: "dark-first",
      dualTheme: false,
      rationale:
        "Brief style notes suggest a dark premium aesthetic; use dark-first single theme unless client requests light variant.",
    };
  }

  if (primaryIsDark) {
    return {
      mode: "light-first",
      dualTheme: false,
      rationale:
        "Dark brand primary on light surfaces — standard light-first layout with dark text and brand accents.",
    };
  }

  return {
    mode: "single-light",
    dualTheme: false,
    rationale:
      "Brief does not justify theme switching — implement single light theme; mark dual theme as out of scope.",
  };
}

function semanticColors(ctx: DesignSystemContext): Record<string, string> {
  const primary = resolveColor(ctx.primary, "#111827");
  const secondary = resolveColor(ctx.secondary, "#F59E0B");
  const primaryRgb = parseHexColor(primary.hex) ?? { r: 17, g: 24, b: 39 };
  const secondaryRgb = parseHexColor(secondary.hex) ?? { r: 245, g: 158, b: 11 };
  const theme = themeRecommendation(ctx);

  const lightSurfaces = {
    background: "#FFFFFF",
    backgroundElevated: "#F9FAFB",
    surface: "#FFFFFF",
    surfaceHover: "#F3F4F6",
    card: "#FFFFFF",
    cardHover: "#F9FAFB",
    border: "#E5E7EB",
    borderStrong: "#D1D5DB",
    textPrimary: "#111827",
    textSecondary: "#4B5563",
    textMuted: "#6B7280",
  };

  const darkSurfaces =
    theme.mode === "dark-first"
      ? {
          background: "#0B0B0C",
          backgroundElevated: "#111111",
          surface: "#141414",
          surfaceHover: "#1C1C1E",
          card: "#161616",
          cardHover: "#1E1E20",
          border: "#2A2A2E",
          borderStrong: "#3A3A40",
          textPrimary: "#F5F5F7",
          textSecondary: "#D1D1D6",
          textMuted: "#98989D",
        }
      : lightSurfaces;

  const surfaces = theme.mode === "dark-first" ? darkSurfaces : lightSurfaces;
  const primaryHover = rgbToHex(mixRgb(primaryRgb, { r: 0, g: 0, b: 0 }, 0.12));
  const primaryPressed = rgbToHex(mixRgb(primaryRgb, { r: 0, g: 0, b: 0 }, 0.22));
  const onPrimary = pickReadableText(primaryRgb);
  const onSecondary = pickReadableText(secondaryRgb);

  return {
    ...surfaces,
    primary: `${primary.hex}${primary.fromBrief ? "" : " [PLACEHOLDER fallback]"}`,
    primaryHover,
    primaryPressed,
    secondary: `${secondary.hex}${secondary.fromBrief ? "" : " [PLACEHOLDER fallback]"}`,
    accent: secondary.hex,
    success: "#16A34A",
    warning: "#D97706",
    error: "#DC2626",
    info: "#2563EB",
    overlay: theme.mode === "dark-first" ? "rgba(0,0,0,0.72)" : "rgba(17,24,39,0.48)",
    focusRing: `${secondary.hex} / focus-visible:ring-2 ring-offset-2`,
    onPrimary,
    onSecondary,
  };
}

function sectionColorSystem(ctx: DesignSystemContext): string[] {
  const tokens = semanticColors(ctx);
  const usage: Record<string, string> = {
    background: "Page canvas and default body background.",
    backgroundElevated: "Subtle contrast bands, alternate sections.",
    surface: "Default component surfaces, panels.",
    surfaceHover: "Hover state for list rows and menu items.",
    card: "Card default background.",
    cardHover: "Interactive card hover background.",
    border: "Default dividers, input borders, card outlines.",
    borderStrong: "Emphasis borders, table headers.",
    textPrimary: "Headings, body default text.",
    textSecondary: "Supporting text, nav links default.",
    textMuted: "Captions, meta, placeholders.",
    primary: "Brand identity — logos, key headings accents (not large fills unless brief directs).",
    primaryHover: "Primary button hover, link hover on brand elements.",
    primaryPressed: "Primary button active/pressed.",
    secondary: "CTA buttons, key interactive accents from brief.",
    accent: "Highlights, badges, focus accents — maps to brief secondary.",
    success: "Form success, positive badges.",
    warning: "Non-blocking alerts.",
    error: "Form errors, destructive emphasis.",
    info: "Informational callouts.",
    overlay: "Modal/lightbox scrim.",
    focusRing: "Keyboard focus indicator — verify contrast visually; not certified WCAG here.",
  };

  const lines = [
    "Preserve brief colors: primary and secondary taken from Website Brief when valid hex.",
    "Supporting neutrals and state colors derived deterministically from theme recommendation.",
    "Contrast guidance: aim for WCAG 2.1 AA — verify with tooling; ratios below are advisory estimates only.",
    "",
  ];

  for (const [token, hex] of Object.entries(tokens)) {
    if (token.startsWith("on")) {
      continue;
    }
    const fgNote =
      token === "primary" || token === "secondary"
        ? ` Recommended foreground on this fill: ${token === "primary" ? tokens.onPrimary : tokens.onSecondary} (estimated — verify).`
        : "";
    lines.push(
      `- ${token}: ${hex} — Usage: ${usage[token] ?? "See component rules."}.${fgNote}`,
    );
  }

  return lines;
}

function sectionColorScale(ctx: DesignSystemContext): string[] {
  const primary = resolveColor(ctx.primary, "#111827");
  const secondary = resolveColor(ctx.secondary, "#F59E0B");

  return [
    "Deterministic mix scale: lighter stops blend toward #FFFFFF; 500 = brief base; darker stops blend toward #000000.",
    "",
    "### Primary scale",
    ...generateColorScale(primary.hex, "primary"),
    "",
    "### Secondary scale",
    ...generateColorScale(secondary.hex, "secondary"),
  ];
}

type TypographyToken = {
  name: string;
  desktop: string;
  tablet: string;
  mobile: string;
  weight: number;
  lineHeight: string;
  letterSpacing: string;
  usage: string;
};

function typographyTokens(tier: StyleTier): TypographyToken[] {
  const sizes: TypographyToken[] = [
    {
      name: "displayXL",
      desktop: "4.5rem (72px)",
      tablet: "3.75rem (60px)",
      mobile: "2.75rem (44px)",
      weight: tier === "premium" ? 600 : 700,
      lineHeight: "1.05",
      letterSpacing: "-0.03em",
      usage: "Home hero display only.",
    },
    {
      name: "displayL",
      desktop: "3.75rem (60px)",
      tablet: "3rem (48px)",
      mobile: "2.5rem (40px)",
      weight: tier === "premium" ? 600 : 700,
      lineHeight: "1.1",
      letterSpacing: "-0.025em",
      usage: "Marketing hero headlines.",
    },
    {
      name: "h1",
      desktop: tier === "premium" ? "3.5rem (56px)" : "3rem (48px)",
      tablet: "2.5rem (40px)",
      mobile: "2rem (32px)",
      weight: tier === "premium" ? 600 : 700,
      lineHeight: "1.15",
      letterSpacing: "-0.02em",
      usage: "Page H1 — one per page.",
    },
    {
      name: "h2",
      desktop: "2.25rem (36px)",
      tablet: "2rem (32px)",
      mobile: "1.75rem (28px)",
      weight: 600,
      lineHeight: "1.2",
      letterSpacing: "-0.015em",
      usage: "Section headings.",
    },
    {
      name: "h3",
      desktop: "1.5rem (24px)",
      tablet: "1.375rem (22px)",
      mobile: "1.25rem (20px)",
      weight: 600,
      lineHeight: "1.3",
      letterSpacing: "-0.01em",
      usage: "Subsection headings, card titles.",
    },
    {
      name: "h4",
      desktop: "1.125rem (18px)",
      tablet: "1.125rem (18px)",
      mobile: "1.0625rem (17px)",
      weight: 600,
      lineHeight: "1.4",
      letterSpacing: "0",
      usage: "Compact headings, footer columns.",
    },
    {
      name: "bodyLarge",
      desktop: "1.125rem (18px)",
      tablet: "1.0625rem (17px)",
      mobile: "1rem (16px)",
      weight: 400,
      lineHeight: "1.65",
      letterSpacing: "0",
      usage: "Intro paragraphs, lead text.",
    },
    {
      name: "body",
      desktop: tier === "premium" ? "1.0625rem (17px)" : "1rem (16px)",
      tablet: "1rem (16px)",
      mobile: "1rem (16px)",
      weight: 400,
      lineHeight: "1.6",
      letterSpacing: "0",
      usage: "Default body copy.",
    },
    {
      name: "bodySmall",
      desktop: "0.875rem (14px)",
      tablet: "0.875rem (14px)",
      mobile: "0.875rem (14px)",
      weight: 400,
      lineHeight: "1.5",
      letterSpacing: "0",
      usage: "Secondary descriptions, meta.",
    },
    {
      name: "label",
      desktop: "0.875rem (14px)",
      tablet: "0.875rem (14px)",
      mobile: "0.8125rem (13px)",
      weight: 500,
      lineHeight: "1.4",
      letterSpacing: "0.01em",
      usage: "Form labels, badges, eyebrows.",
    },
    {
      name: "caption",
      desktop: "0.75rem (12px)",
      tablet: "0.75rem (12px)",
      mobile: "0.75rem (12px)",
      weight: 400,
      lineHeight: "1.45",
      letterSpacing: "0.02em",
      usage: "Captions, legal microcopy.",
    },
    {
      name: "button",
      desktop: "0.9375rem (15px)",
      tablet: "0.9375rem (15px)",
      mobile: "1rem (16px)",
      weight: 600,
      lineHeight: "1",
      letterSpacing: "0.01em",
      usage: "All button labels.",
    },
  ];

  return sizes;
}

function sectionTypography(ctx: DesignSystemContext): string[] {
  const tier = ctx.tier;
  const meta = {
    premium: {
      category: "Neo-grotesk sans-serif",
      stack: 'Inter, "Segoe UI", system-ui, sans-serif',
      display: "Inter (free — no licensed font required)",
      body: "Inter",
      mono: "ui-monospace, Menlo, Monaco, Consolas, monospace",
      weights: "400 body, 500 labels, 600 headings, 700 optional hero",
    },
    modern: {
      category: "Geometric sans-serif",
      stack: 'Inter, "DM Sans", system-ui, sans-serif',
      display: "Inter or DM Sans",
      body: "Inter",
      mono: "ui-monospace, Menlo, Monaco, Consolas, monospace",
      weights: "400 body, 500 labels, 600 subheads, 700 headings",
    },
    default: {
      category: "System sans-serif",
      stack: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      display: "Inter (recommended)",
      body: "system-ui / Inter",
      mono: "ui-monospace, Menlo, Monaco, Consolas, monospace",
      weights: "400 body, 500 emphasis, 600 headings, 700 hero",
    },
  }[tier];

  const tokens = typographyTokens(tier);
  return [
    `Recommended font category: ${meta.category}.`,
    `Safe font-stack fallback: ${meta.stack}.`,
    `Display font recommendation: ${meta.display}.`,
    `Body font recommendation: ${meta.body}.`,
    `Monospace recommendation: ${meta.mono}.`,
    `Font weights: ${meta.weights}.`,
    "Letter spacing: negative tracking on display/h1/h2; neutral on body; +0.01–0.02em on labels/captions.",
    "Line heights: display 1.05–1.15; headings 1.2–1.4; body 1.6–1.65.",
    "",
    ...tokens.map(
      (token) =>
        `- ${token.name}: desktop ${token.desktop} | tablet ${token.tablet} | mobile ${token.mobile} | weight ${token.weight} | line-height ${token.lineHeight} | letter-spacing ${token.letterSpacing} | usage: ${token.usage}`,
    ),
  ];
}

function sectionSpacing(ctx: DesignSystemContext): string[] {
  const compact = /mobile first|schnell|kompakt/i.test(
    `${ctx.brief.additional_notes ?? ""} ${ctx.style}`,
  );

  const scale: Record<string, string> = {
    "0": "0px / 0rem",
    "1": "4px / 0.25rem",
    "2": "8px / 0.5rem",
    "3": "12px / 0.75rem",
    "4": "16px / 1rem",
    "6": "24px / 1.5rem",
    "8": "32px / 2rem",
    "10": "40px / 2.5rem",
    "12": "48px / 3rem",
    "16": "64px / 4rem",
    "20": "80px / 5rem",
    "24": "96px / 6rem",
    "32": "128px / 8rem",
  };

  return [
    "Base unit: 4px (0.25rem). All spacing derives from this scale.",
    ...Object.entries(scale).map(([token, value]) => `- spacing-${token}: ${value}`),
    "",
    `Section vertical spacing: mobile ${compact ? "spacing-12 (48px)" : "spacing-16 (64px)"}; desktop spacing-24 (96px).`,
    "Component spacing: internal gap spacing-4; between related elements spacing-6.",
    "Card padding: spacing-6 (24px) desktop; spacing-4 (16px) mobile.",
    "Form spacing: field gap spacing-4; label to input spacing-2; section gap spacing-8.",
    "Header spacing: horizontal padding spacing-4 mobile, spacing-6 tablet, spacing-8 desktop; height 64px.",
    "Footer spacing: padding-top spacing-16; column gap spacing-8; legal margin-top spacing-8.",
    `Mobile spacing adjustments: ${compact ? "reduce section spacing one step on mobile; prioritize spacing-8 between major blocks." : "maintain scale; avoid spacing-32 on mobile."}`,
  ];
}

function sectionLayout(): string[] {
  return [
    "Content max-width: 1280px (80rem) — primary marketing container.",
    "Wide content max-width: 1440px (90rem) — full-bleed heroes inner constraint.",
    "Reading width: 65ch (max-w-prose ~672px) — long-form text blocks.",
    "Page gutters: see breakpoint gutters below.",
    "Mobile gutters: 16px (spacing-4) each side.",
    "Tablet gutters: 24px (spacing-6) each side.",
    "Desktop gutters: 32px (spacing-8) each side.",
    "Grid columns: 4 col mobile, 8 col tablet, 12 col desktop.",
    "Grid gaps: 16px mobile, 24px tablet, 32px desktop.",
    "Section alignment rules: center section headings; left-align body copy; CTAs centered in bands.",
    "Full-bleed behavior: background/image edge-to-edge; inner content respects max-width container.",
    "Container behavior: mx-auto + horizontal padding from gutters; sticky header outside container full width.",
    "Breakpoints: sm 640px (large phones), md 768px (tablet), lg 1024px (desktop), xl 1280px (wide), 2xl 1536px (optional hero) — mobile-first min-width queries.",
  ];
}

function radiusTokens(tier: StyleTier): Record<string, string> {
  const map = {
    premium: {
      none: "0px",
      small: "4px",
      medium: "8px",
      large: "12px",
      xl: "16px",
      pill: "9999px",
      round: "50%",
    },
    modern: {
      none: "0px",
      small: "4px",
      medium: "6px",
      large: "10px",
      xl: "14px",
      pill: "9999px",
      round: "50%",
    },
    default: {
      none: "0px",
      small: "2px",
      medium: "4px",
      large: "8px",
      xl: "12px",
      pill: "9999px",
      round: "50%",
    },
  }[tier];

  return map;
}

function sectionRadius(ctx: DesignSystemContext): string[] {
  const tokens = radiusTokens(ctx.tier);
  return [
    ...Object.entries(tokens).map(([name, value]) => `- radius-${name}: ${value}`),
    "",
    `Buttons: radius-${ctx.tier === "premium" ? "medium" : "medium"} (${tokens.medium}).`,
    `Cards: radius-${ctx.tier === "premium" ? "large" : "medium"} (${ctx.tier === "premium" ? tokens.large : tokens.medium}).`,
    `Inputs: radius-${ctx.tier === "premium" ? "medium" : "small"} (${ctx.tier === "premium" ? tokens.medium : tokens.small}).`,
    `Images: match card radius (${tokens.large} featured, ${tokens.medium} thumbnails).`,
    `Modals: radius-${ctx.tier === "premium" ? "xl" : "large"}.`,
    "Badges: radius-pill.",
    "Navigation elements: radius-medium for dropdown panels; radius-small for nav icon buttons.",
  ];
}

function sectionBorder(ctx: DesignSystemContext): string[] {
  const tokens = semanticColors(ctx);
  return [
    "Default border width: 1px solid token border.",
    "Strong border width: 2px solid token borderStrong.",
    "Divider style: 1px border-b border token border; my spacing-8.",
    `Input border: 1px ${tokens.border}; focus ${tokens.focusRing}.`,
    `Card border: 1px ${tokens.border} (outlined variant) or none (elevated variant).`,
    `Focus border: 2px ring token accent/primary — verify visibility.`,
    `Error border: 1px ${tokens.error} + error message text ${tokens.error}.`,
    "Dark surface border guidance: on dark-first theme use border #2A2A2E default, #3A3A40 strong; avoid pure white borders.",
  ];
}

function shadowTokens(tier: StyleTier): Record<string, string> {
  const map = {
    premium: {
      shadowNone: "none",
      shadowSmall: "0 1px 2px rgba(17,24,39,0.04)",
      shadowMedium: "0 4px 12px rgba(17,24,39,0.06)",
      shadowLarge: "0 12px 32px rgba(17,24,39,0.08)",
      shadowFloating: "0 8px 24px rgba(17,24,39,0.1)",
      shadowModal: "0 24px 48px rgba(17,24,39,0.12)",
      insetHighlight: "inset 0 1px 0 rgba(255,255,255,0.06)",
    },
    modern: {
      shadowNone: "none",
      shadowSmall: "0 1px 3px rgba(17,24,39,0.08)",
      shadowMedium: "0 4px 16px rgba(17,24,39,0.1)",
      shadowLarge: "0 8px 24px rgba(17,24,39,0.12)",
      shadowFloating: "0 12px 32px rgba(17,24,39,0.14)",
      shadowModal: "0 24px 56px rgba(17,24,39,0.18)",
      insetHighlight: "inset 0 1px 0 rgba(255,255,255,0.08)",
    },
    default: {
      shadowNone: "none",
      shadowSmall: "0 1px 2px rgba(17,24,39,0.05)",
      shadowMedium: "0 2px 8px rgba(17,24,39,0.08)",
      shadowLarge: "0 4px 16px rgba(17,24,39,0.1)",
      shadowFloating: "0 8px 20px rgba(17,24,39,0.12)",
      shadowModal: "0 20px 40px rgba(17,24,39,0.15)",
      insetHighlight: "inset 0 1px 0 rgba(255,255,255,0.05)",
    },
  }[tier];
  return map;
}

function sectionShadow(ctx: DesignSystemContext): string[] {
  const shadows = shadowTokens(ctx.tier);
  const usage: Record<string, string> = {
    shadowNone: "Flat cards, inline elements.",
    shadowSmall: "Subtle card default, inputs.",
    shadowMedium: "Elevated cards, dropdowns.",
    shadowLarge: "Featured cards, popovers.",
    shadowFloating: "Sticky mobile CTA bar.",
    shadowModal: "Modals, lightbox.",
    insetHighlight: "Inset inputs on dark surfaces only.",
  };

  return [
    ...Object.entries(shadows).map(
      ([name, value]) =>
        `- ${name}: ${value} — Usage: ${usage[name]}. Hover: elevate one step (small→medium, medium→large). Dark theme: reduce opacity ~30%.`,
    ),
    "Avoid excessive shadows — premium tier uses fewer, larger soft shadows.",
  ];
}

function buttonVariantSpec(
  name: string,
  spec: Record<string, string>,
): string {
  return `${name}: ${Object.entries(spec)
    .map(([key, value]) => `${key}=${value}`)
    .join(" | ")}`;
}

function sectionButtons(ctx: DesignSystemContext): string[] {
  const colors = semanticColors(ctx);
  const radius = radiusTokens(ctx.tier).medium;
  const base = {
    height: "44px (h-11)",
    padding: "0 20px (px-5)",
    radius,
    typography: "token button",
    iconSpacing: "8px gap between icon and label",
    mobile: "full-width in sticky bars; min-width 44px touch target",
    focus: `focus-visible ring-2 ring-offset-2 ${colors.focusRing}`,
    disabled: "opacity 50%; pointer-events none",
    loading: "spinner replaces label; aria-busy true",
  };

  return [
    buttonVariantSpec("Primary", {
      ...base,
      background: colors.secondary,
      text: colors.onSecondary,
      border: "none",
      hover: `darken secondary ~8% (${colors.primaryHover} mix approach)`,
      active: "scale 0.98 pressScale",
    }),
    buttonVariantSpec("Secondary", {
      ...base,
      background: "transparent",
      text: colors.textPrimary,
      border: `1px ${colors.borderStrong}`,
      hover: `background ${colors.surfaceHover}`,
      active: "borderStrong",
    }),
    buttonVariantSpec("Ghost", {
      ...base,
      background: "transparent",
      text: colors.textSecondary,
      border: "none",
      hover: `background ${colors.surfaceHover}`,
      active: "textPrimary",
    }),
    buttonVariantSpec("Outline", {
      ...base,
      background: "transparent",
      text: colors.secondary,
      border: `1px ${colors.secondary}`,
      hover: `background ${colors.secondary} at 8% opacity`,
      active: "filled secondary",
    }),
    buttonVariantSpec("Destructive", {
      ...base,
      background: colors.error,
      text: "#FFFFFF",
      border: "none",
      hover: "darken error 10%",
      active: "scale 0.98",
    }),
    buttonVariantSpec("Text link", {
      height: "auto",
      padding: "0",
      radius: "0",
      typography: "body with underline offset",
      background: "transparent",
      text: colors.secondary,
      border: "none",
      hover: "underline",
      active: "opacity 80%",
      focus: base.focus,
      disabled: base.disabled,
      loading: "N/A",
      iconSpacing: "4px",
      mobile: "inline",
    }),
    buttonVariantSpec("Icon button", {
      height: "44px",
      width: "44px",
      padding: "0",
      radius: radiusTokens(ctx.tier).medium,
      typography: "N/A",
      background: colors.surface,
      text: colors.textPrimary,
      border: `1px ${colors.border}`,
      hover: colors.surfaceHover,
      active: "scale 0.98",
      focus: base.focus,
      disabled: base.disabled,
      loading: "spinner centered",
      iconSpacing: "N/A",
      mobile: "44px min",
    }),
  ];
}

function sectionCards(ctx: DesignSystemContext): string[] {
  const colors = semanticColors(ctx);
  const radius = radiusTokens(ctx.tier);
  const glassOk =
    ctx.tier === "premium" &&
    /glass|blur|apple|premium/i.test(`${ctx.style} ${ctx.brief.preferred_style ?? ""}`);

  const cardBase = {
    background: colors.card,
    border: `1px ${colors.border}`,
    radius: radius.large,
    padding: "spacing-6 desktop / spacing-4 mobile",
    hover: "shadowMedium + translateY(-2px) desktop",
    focus: "focus-within ring-2 accent",
    mobile: "full width stack; no hover lift",
  };

  return [
    buttonVariantSpec("Standard card", {
      ...cardBase,
      typography: "h3 title + bodySmall description",
      imageRatio: "none",
    }),
    buttonVariantSpec("Feature card", {
      ...cardBase,
      typography: "h3 + body + optional label eyebrow",
      imageRatio: "optional 4:3 top",
    }),
    buttonVariantSpec("Product/menu card", {
      ...cardBase,
      typography: "h4 item name + bodySmall desc + label price [PLACEHOLDER]",
      imageRatio: "1:1 thumbnail top",
    }),
    buttonVariantSpec("Testimonial card", {
      ...cardBase,
      typography: "body quote + caption author",
      imageRatio: "optional 1:1 avatar",
    }),
    buttonVariantSpec("Media card", {
      ...cardBase,
      typography: "caption overlay optional",
      imageRatio: "16:9 cover",
    }),
    buttonVariantSpec("Interactive card", {
      ...cardBase,
      hover: "shadowLarge + scale 1.01",
      focus: "entire card clickable with aria-label",
    }),
    glassOk
      ? buttonVariantSpec("Glass card", {
          background: "rgba(255,255,255,0.72) + backdrop-blur-md",
          border: `1px ${colors.border}`,
          radius: radius.xl,
          padding: cardBase.padding,
          typography: "premium hero overlays only",
          imageRatio: "N/A",
          hover: "background opacity +0.05",
          focus: cardBase.focus,
          mobile: "reduce blur for performance if needed",
        })
      : "Glass card: omit — not compatible with brief style (no glass/premium blur signal).",
  ];
}

function sectionForms(ctx: DesignSystemContext): string[] {
  const colors = semanticColors(ctx);
  const radius = radiusTokens(ctx.tier).medium;

  const fieldBase = {
    height: "44px (h-11)",
    padding: "0 12px",
    border: `1px ${colors.border}`,
    radius,
    label: "above field; text label token; required asterisk with aria-label",
    placeholder: `textMuted; never replace label`,
    focus: `border accent; ring-2 ${colors.focusRing}`,
    error: `border error; message below bodySmall in error color`,
    disabled: "opacity 50%; bg surfaceHover",
    a11y: "htmlFor/id; aria-describedby errors; aria-invalid on error",
  };

  return [
    buttonVariantSpec("Text input", fieldBase),
    buttonVariantSpec("Textarea", {
      ...fieldBase,
      height: "min 120px",
      padding: "12px",
    }),
    buttonVariantSpec("Select", fieldBase),
    buttonVariantSpec("Checkbox", {
      size: "16px",
      border: fieldBase.border,
      radius: radiusTokens(ctx.tier).small,
      focus: fieldBase.focus,
      a11y: "label wraps control",
    }),
    buttonVariantSpec("Radio", {
      size: "16px",
      radius: "round",
      focus: fieldBase.focus,
      a11y: "fieldset legend for groups",
    }),
    buttonVariantSpec("Toggle", {
      track: "44x24px",
      radius: "pill",
      focus: fieldBase.focus,
      a11y: "role switch aria-checked",
    }),
    buttonVariantSpec("Search field", {
      ...fieldBase,
      padding: "0 12px 0 40px",
      icon: "leading search icon 20px",
    }),
    buttonVariantSpec("Form group", {
      gap: "spacing-4 between fields",
      sectionGap: "spacing-8",
    }),
    buttonVariantSpec("Validation message", {
      typography: "bodySmall",
      color: colors.error,
      placement: "below field",
    }),
    buttonVariantSpec("Success message", {
      typography: "bodySmall",
      color: colors.success,
      placement: "above form or inline banner",
    }),
  ];
}

function sectionNavigation(ctx: DesignSystemContext, primaryCta: string): string[] {
  return [
    "Desktop navbar: height 64px; logo left; nav links center or left; primary CTA button right; gap spacing-8.",
    "Mobile navbar: height 64px; logo center-left; hamburger right; CTA in menu or header icon.",
    "Sticky behavior: position sticky top-0 z-50 after scroll; backdrop-blur + backgroundElevated at 80% opacity.",
    "Scroll state: add shadowSmall after 64px scroll; compress optional on mobile (stay 64px).",
    "Logo placement: leading edge; links to home; text logo from brief business_name.",
    "Menu spacing: spacing-6 between nav items desktop; spacing-4 mobile menu vertical.",
    `Primary CTA placement: desktop header button „${primaryCta}"; mobile in menu + sticky footer on key pages.`,
    "Mobile menu open: slide-down panel 250ms; focus trap; body scroll lock; aria-expanded on toggle.",
    "Mobile menu close: X button, overlay click, Esc key; restore focus to hamburger.",
    "Focus management: first focusable in menu on open; return focus on close.",
    "Active-link indication: underline or textPrimary + font-weight 600; aria-current=page.",
  ];
}

function sectionIcons(ctx: DesignSystemContext): string[] {
  const stroke = ctx.tier === "premium" ? "1.5px" : "2px";
  return [
    `Recommended icon style: outline icons (Lucide recommended — free, consistent).`,
    `Stroke width: ${stroke} consistently.`,
    "Standard sizes: 16px inline, 20px default UI, 24px feature, 32px hero decorative.",
    "Button icon size: 20px with 8px gap to label.",
    "Navigation icon size: 24px hamburger/close; 20px inline nav.",
    "Decorative icons: aria-hidden true when adjacent text present.",
    "Accessibility: functional icons require aria-label; never icon-only without label.",
    "Do not mix filled and outline families on the same page.",
  ];
}

function sectionMedia(ctx: DesignSystemContext): string[] {
  const radius = radiusTokens(ctx.tier);
  return [
    "Hero image: 16:9 or 21:9; object-fit cover; priority load; optional gradient overlay rgba(17,24,39,0.35) for text contrast.",
    "Product image: 1:1 or 4:3; object-fit cover; radius-medium.",
    "Gallery image: uniform 4:3 grid; object-fit cover; radius-medium; lightbox full size.",
    "Card image ratios: menu 1:1; feature 4:3; testimonial avatar 1:1; media 16:9.",
    `Border radius: match card tokens — ${radius.medium} thumbnails, ${radius.large} hero cards.`,
    "Overlay behavior: gradient bottom-up on hero for headline legibility; verify contrast manually.",
    "Gradient behavior: subtle dark gradient on hero only; no decorative gradients elsewhere unless brief style notes.",
    "Object-fit rules: cover for photos; contain for logos.",
    "Loading behavior: blur-up placeholder dominant color from brief primary.",
    "Lazy-loading: loading=lazy below fold; fetchpriority=high hero only.",
    "Alt-text guidance: descriptive from content modules; decorative alt=\"\"; never empty on informative images.",
    "Mobile cropping behavior: object-position center; avoid critical detail at edges.",
    "Video fallback guidance: poster image [PLACEHOLDER]; no autoplay with sound; respect prefers-reduced-motion.",
  ];
}

function sectionMotionTokens(ctx: DesignSystemContext): string[] {
  const fast = ctx.prefersMotion || ctx.tier === "premium" ? "150ms" : "120ms";
  const normal = ctx.prefersMotion || ctx.tier === "premium" ? "250ms" : "200ms";
  const slow = ctx.prefersMotion || ctx.tier === "premium" ? "400ms" : "300ms";
  const hero = ctx.prefersMotion || ctx.tier === "premium" ? "600ms" : "350ms";

  return [
    `- durationFast: ${fast} — micro hovers, opacity toggles.`,
    `- durationNormal: ${normal} — buttons, cards, menu.`,
    `- durationSlow: ${slow} — section reveals, accordions.`,
    `- durationHero: ${hero} — hero stagger headline/CTA.`,
    "- easingStandard: cubic-bezier(0.4, 0, 0.2, 1) — default transitions.",
    "- easingEmphasized: cubic-bezier(0.16, 1, 0.3, 1) — hero entrances.",
    "- easingExit: cubic-bezier(0.4, 0, 1, 1) — close menus/modals.",
    "- hoverScale: 1.02 on buttons/cards desktop.",
    "- pressScale: 0.98 active state.",
    "- sectionRevealDistance: 16px translateY.",
    "- staggerDelay: 60ms between sibling elements.",
    "prefers-reduced-motion: reduce: set durations to 0ms or opacity-only; disable scale and parallax.",
    "Reference shared motion tokens in Page DNA Motion sections — do not redefine per page.",
  ];
}

function sectionTheme(ctx: DesignSystemContext): string[] {
  const theme = themeRecommendation(ctx);
  const colors = semanticColors(ctx);

  return [
    `Recommendation: ${theme.mode}${theme.dualTheme ? " + optional dual theme" : " (single theme)"}.`,
    `Rationale: ${theme.rationale}`,
    "Surface hierarchy: background → backgroundElevated → surface → card (lightest actionable layer on light theme).",
    "Text hierarchy: textPrimary headings/body; textSecondary supporting; textMuted meta.",
    "Contrast guidance: target WCAG 2.1 AA — validate primary/secondary button pairs with tooling; estimates not certification.",
    `Theme switching: ${theme.dualTheme ? "optional toggle in footer" : "avoid theme toggle — not justified by brief"}.`,
    `Dark-first overrides when active: background ${colors.background}; text ${colors.textPrimary}; borders use dark surface guidance.`,
  ];
}

function sectionTailwind(ctx: DesignSystemContext): string[] {
  const colors = semanticColors(ctx);
  const radius = radiusTokens(ctx.tier);
  const shadows = shadowTokens(ctx.tier);

  return [
    "Proposed theme.extend (do not commit config — implement in project):",
    `colors: primary DEFAULT ${colors.primary}, primary-foreground ${colors.onPrimary}, secondary DEFAULT ${colors.secondary}, accent DEFAULT ${colors.accent}, background ${colors.background}, foreground ${colors.textPrimary}, muted ${colors.textMuted}, border ${colors.border}, destructive ${colors.error}.`,
    "fontSize: map displayXL, displayL, h1–h4, bodyLarge, body, bodySmall, label, caption, button from typography tokens.",
    "spacing: extend with scale 0,1,2,3,4,6,8,10,12,16,20,24,32 as rem values.",
    `borderRadius: sm ${radius.small}, md ${radius.medium}, lg ${radius.large}, xl ${radius.xl}, pill ${radius.pill}.`,
    `boxShadow: sm '${shadows.shadowSmall}', md '${shadows.shadowMedium}', lg '${shadows.shadowLarge}', float '${shadows.shadowFloating}', modal '${shadows.shadowModal}'.`,
    "maxWidth: content 80rem, wide 90rem, prose 65ch.",
    `transitionDuration: fast ${ctx.prefersMotion ? "150ms" : "120ms"}, normal 250ms, slow 400ms, hero 600ms.`,
    "transitionTimingFunction: standard cubic-bezier(0.4,0,0.2,1), emphasized cubic-bezier(0.16,1,0.3,1).",
  ];
}

function sectionConsistencyRules(ctx: DesignSystemContext): string[] {
  return [
    "One primary CTA style site-wide — Secondary token fill, button token typography.",
    `Consistent card radius — ${radiusTokens(ctx.tier).large} default.`,
    "Consistent section spacing — spacing-16 mobile / spacing-24 desktop between major sections.",
    "Maximum button variants per view: 1 primary + 1 secondary; avoid third competing CTA.",
    "Heading hierarchy: one h1; section titles h2; subsections h3 — no skipped levels.",
    "Icon consistency: single outline family; one stroke width.",
    "Motion consistency: use motion tokens only; no ad-hoc durations.",
    "Form consistency: shared input height 44px; shared error pattern.",
    "Image treatment consistency: match media system ratios; shared radius tokens.",
    "Page DNA components must reference these tokens — not local hex values.",
  ];
}

function sectionDesignQa(): string[] {
  return [
    "Color consistency: all components use semantic tokens; no hardcoded hex outside theme file.",
    "Typography consistency: only defined type tokens; no arbitrary text sizes.",
    "Spacing consistency: only spacing scale; no magic numbers.",
    "Responsive behavior: verify sm/md/lg breakpoints for every Page DNA layout.",
    "Contrast review: run automated checker on primary/secondary buttons and body text — manual sign-off.",
    "Keyboard navigation: tab through header, menu, forms, modals.",
    "Focus visibility: focus ring visible on all interactive elements.",
    "Motion reduction: test with prefers-reduced-motion enabled.",
    "Image optimization: WebP/AVIF, width/height attributes, lazy below fold.",
    "CTA consistency: same primary label styling on all pages per Page DNA.",
    "Form states: error, success, disabled verified on contact page.",
    "Loading states: skeletons on menu/gallery grids.",
    "Empty states: menu filter empty state present.",
  ];
}

const DESIGN_SYSTEM_SECTIONS: Array<{
  id: number;
  title: string;
  build: (ctx: DesignSystemContext) => string[];
}> = [
  { id: 1, title: "Color System", build: sectionColorSystem },
  { id: 2, title: "Color Scale", build: sectionColorScale },
  { id: 3, title: "Typography System", build: sectionTypography },
  { id: 4, title: "Spacing System", build: sectionSpacing },
  { id: 5, title: "Layout System", build: () => sectionLayout() },
  { id: 6, title: "Border Radius System", build: sectionRadius },
  { id: 7, title: "Border System", build: sectionBorder },
  { id: 8, title: "Shadow and Elevation System", build: sectionShadow },
  { id: 9, title: "Button System", build: sectionButtons },
  { id: 10, title: "Card System", build: sectionCards },
  { id: 11, title: "Form System", build: sectionForms },
  {
    id: 12,
    title: "Navigation System",
    build: (ctx: DesignSystemContext) => sectionNavigation(ctx, ctx.primaryCta),
  },
  { id: 13, title: "Icon System", build: sectionIcons },
  { id: 14, title: "Image and Media System", build: sectionMedia },
  { id: 15, title: "Motion Tokens", build: sectionMotionTokens },
  { id: 16, title: "Theme Strategy", build: sectionTheme },
  { id: 17, title: "Tailwind Mapping", build: sectionTailwind },
  { id: 18, title: "Component Consistency Rules", build: sectionConsistencyRules },
  { id: 19, title: "Design QA Checklist", build: () => sectionDesignQa() },
] as const;

export function buildDesignSystemDna(ctx: DesignSystemContext): string {
  const lines = [
    "# Design System DNA",
    "",
    "Implementation-ready design tokens derived from Website Brief only.",
    `Visual style tier: ${ctx.tier} | Profile: ${ctx.profile} | Style notes: ${ctx.style.slice(0, 120)}.`,
    "Page DNA components must reference these tokens — see Component Consistency Rules.",
    "",
  ];

  for (const section of DESIGN_SYSTEM_SECTIONS) {
    lines.push(`## ${section.id}. ${section.title}`);
    lines.push("");
    lines.push(...section.build(ctx));
    lines.push("");
  }

  return lines.join("\n");
}

export function designSystemSectionTitles(): string[] {
  return DESIGN_SYSTEM_SECTIONS.map((section) => `${section.id}. ${section.title}`);
}

export function extractDesignSystemDnaWordCount(content: string): number {
  const match = content.match(/# Design System DNA[\s\S]*?(?=\n# Technical Recommendations|\n---|\n# Development|$)/);
  const text = match ? match[0] : content;
  return text.split(/\s+/).filter(Boolean).length;
}
