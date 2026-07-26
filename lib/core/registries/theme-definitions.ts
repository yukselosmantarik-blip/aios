import type { ThemeRegistration } from "@/lib/core/registries/theme-types";

export const BUILTIN_THEME_DEFINITIONS: readonly ThemeRegistration[] = [
  {
    id: "premium",
    label: "Premium",
    legacyStyleTier: "premium",
    capabilities: {
      colorMode: "dark",
      motionLevel: "standard",
      layoutDensity: "spacious",
      stickyNavigation: true,
      heroEmphasis: true,
      spaciousSections: true,
    },
    metadata: {
      description: "High-end spacing, strong hierarchy, restrained motion.",
    },
  },
  {
    id: "luxury",
    label: "Luxury",
    legacyStyleTier: "premium",
    capabilities: {
      colorMode: "dark",
      motionLevel: "subtle",
      layoutDensity: "spacious",
      stickyNavigation: true,
      heroEmphasis: true,
      spaciousSections: true,
    },
    metadata: {
      description: "Premium tier with quieter motion and editorial layout.",
    },
  },
  {
    id: "modern",
    label: "Modern",
    legacyStyleTier: "modern",
    capabilities: {
      colorMode: "neutral",
      motionLevel: "standard",
      layoutDensity: "comfortable",
      stickyNavigation: true,
      heroEmphasis: true,
      spaciousSections: false,
    },
    metadata: {
      description: "Contemporary defaults with balanced density.",
    },
  },
  {
    id: "minimal",
    label: "Minimal",
    legacyStyleTier: "modern",
    capabilities: {
      colorMode: "light",
      motionLevel: "subtle",
      layoutDensity: "comfortable",
      stickyNavigation: true,
      heroEmphasis: false,
      spaciousSections: false,
    },
    metadata: {
      description: "Reduced ornament, content-first layout.",
    },
  },
  {
    id: "corporate",
    label: "Corporate",
    legacyStyleTier: "default",
    capabilities: {
      colorMode: "light",
      motionLevel: "subtle",
      layoutDensity: "compact",
      stickyNavigation: true,
      heroEmphasis: false,
      spaciousSections: false,
    },
    metadata: {
      description: "Trust-focused, efficient information density.",
    },
  },
  {
    id: "dark",
    label: "Dark",
    legacyStyleTier: "default",
    capabilities: {
      colorMode: "dark",
      motionLevel: "standard",
      layoutDensity: "comfortable",
      stickyNavigation: true,
      heroEmphasis: true,
      spaciousSections: false,
    },
    metadata: {
      description: "Dark surfaces without requiring premium spacing.",
    },
  },
  {
    id: "light",
    label: "Light",
    legacyStyleTier: "default",
    capabilities: {
      colorMode: "light",
      motionLevel: "standard",
      layoutDensity: "comfortable",
      stickyNavigation: true,
      heroEmphasis: true,
      spaciousSections: false,
    },
    metadata: {
      description: "Bright surfaces and readable body copy defaults.",
    },
  },
  {
    id: "creative",
    label: "Creative",
    legacyStyleTier: "modern",
    capabilities: {
      colorMode: "neutral",
      motionLevel: "expressive",
      layoutDensity: "comfortable",
      stickyNavigation: true,
      heroEmphasis: true,
      spaciousSections: false,
    },
    metadata: {
      description: "Stronger motion and asymmetric layout tolerance.",
    },
  },
] as const;
