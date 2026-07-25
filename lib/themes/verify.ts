import type { WebsiteTheme } from "@/lib/themes/types";

const THEME_TOP_LEVEL_KEYS: (keyof WebsiteTheme)[] = [
  "colors",
  "typography",
  "layout",
  "radius",
  "shadows",
  "motion",
];

export function verifyWebsiteThemeSerializable(
  theme: WebsiteTheme,
): { passed: boolean; detail: string } {
  try {
    const roundTrip = JSON.parse(JSON.stringify(theme)) as WebsiteTheme;
    for (const key of THEME_TOP_LEVEL_KEYS) {
      if (roundTrip[key] === undefined || typeof roundTrip[key] !== "object") {
        return { passed: false, detail: `Missing or invalid theme group: ${key}` };
      }
    }
    return { passed: true, detail: "Theme is JSON-serializable with required groups" };
  } catch {
    return { passed: false, detail: "Theme failed JSON serialization" };
  }
}
