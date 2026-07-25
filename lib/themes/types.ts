/**
 * Serializable brand theme for generated standalone websites.
 * Values are plain strings/numbers suitable for JSON export and CSS custom properties.
 */
export type WebsiteThemeColors = {
  background: string;
  surface: string;
  surfaceElevated: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryHover: string;
  secondary: string;
  border: string;
};

export type WebsiteThemeTypography = {
  headingFont: string;
  bodyFont: string;
  headingWeight: number;
  bodyWeight: number;
  headingLetterSpacing: string;
};

export type WebsiteThemeLayout = {
  maxWidth: string;
  sectionSpacing: string;
  contentPadding: string;
  navigationHeight: string;
};

export type WebsiteThemeRadius = {
  small: string;
  medium: string;
  large: string;
  pill: string;
};

export type WebsiteThemeShadows = {
  small: string;
  medium: string;
  large: string;
};

export type WebsiteThemeMotion = {
  fast: string;
  normal: string;
  slow: string;
  easing: string;
};

export type WebsiteTheme = {
  colors: WebsiteThemeColors;
  typography: WebsiteThemeTypography;
  layout: WebsiteThemeLayout;
  radius: WebsiteThemeRadius;
  shadows: WebsiteThemeShadows;
  motion: WebsiteThemeMotion;
};

export type WebsiteThemeProjectKey = "by-nanis";
