/**
 * GENERATED STYLE VALIDATOR — Sprint 8.2D
 */

import { cssVariables } from './css-variables';
import { designTokens } from './design-tokens';
import { theme } from './theme';

export type StyleValidationIssue = {
  code: string;
  message: string;
};

const REQUIRED_COLORS = [
  'primaryColor',
  'secondaryColor',
  'accentColor',
  'backgroundColor',
  'surfaceColor',
  'textColor',
  'mutedColor',
] as const;

const REQUIRED_SPACING = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;

export function validateStyleSystem(): { passed: boolean; issues: StyleValidationIssue[] } {
  const issues: StyleValidationIssue[] = [];

  for (const colorKey of REQUIRED_COLORS) {
    const value = theme.colors[colorKey as keyof typeof theme.colors];
    if (!value || String(value).includes('[PLACEHOLDER')) {
      issues.push({ code: 'missing-color', message: `Missing color: ${colorKey}` });
    }
  }

  for (const spacingKey of REQUIRED_SPACING) {
    const value = theme.spacing[spacingKey as keyof typeof theme.spacing];
    if (!value) {
      issues.push({ code: 'missing-spacing', message: `Missing spacing: ${spacingKey}` });
    }
  }

  if (!theme.typography.headingFont || !theme.typography.bodyFont) {
    issues.push({ code: 'invalid-typography', message: 'Typography fonts must be defined' });
  }

  const cssNames = Object.keys(cssVariables);
  if (new Set(cssNames).size !== cssNames.length) {
    issues.push({ code: 'duplicate-css-variable', message: 'Duplicate CSS variable names detected' });
  }

  const tokenNames = Object.keys(designTokens);
  if (new Set(tokenNames).size !== tokenNames.length) {
    issues.push({ code: 'duplicate-token', message: 'Duplicate design token names detected' });
  }

  for (const tokenName of tokenNames) {
    if (designTokens[tokenName as keyof typeof designTokens] === undefined) {
      issues.push({ code: 'missing-token', message: `Missing token value: ${tokenName}` });
    }
  }

  return { passed: issues.length === 0, issues };
}
