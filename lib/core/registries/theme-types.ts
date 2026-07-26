/**
 * Preset theme ids for cross-industry styling (registry metadata only).
 * Not yet wired to `WebsiteTheme` token export or brief resolution.
 */
export type ThemePresetId =
  | "premium"
  | "luxury"
  | "modern"
  | "minimal"
  | "corporate"
  | "dark"
  | "light"
  | "creative";

/** Aligns with compiler `SiteConfiguration.styleTier` for future bridging. */
export type ThemeStyleTier = "premium" | "modern" | "default";

export type ThemeColorMode = "light" | "dark" | "neutral";

export type ThemeMotionLevel = "subtle" | "standard" | "expressive";

export type ThemeLayoutDensity = "compact" | "comfortable" | "spacious";

/**
 * Styling and layout capabilities only — no industry or section logic.
 */
export type ThemeCapabilities = {
  colorMode: ThemeColorMode;
  motionLevel: ThemeMotionLevel;
  layoutDensity: ThemeLayoutDensity;
  /** Supports sticky header and scroll-driven header transitions. */
  stickyNavigation: boolean;
  /** Hero layouts with split media and elevated typography scale. */
  heroEmphasis: boolean;
  /** Wider section spacing and display-type scale. */
  spaciousSections: boolean;
};

export type ThemeRegistration = {
  id: ThemePresetId;
  label: string;
  capabilities: ThemeCapabilities;
  /**
   * Maps to existing brief/style heuristics (`detectStyleTier`) until themes
   * are fully token-driven.
   */
  legacyStyleTier: ThemeStyleTier;
  metadata?: {
    description?: string;
  };
};

export type ThemeRegistrySnapshot = {
  themes: ThemeRegistration[];
  count: number;
};
