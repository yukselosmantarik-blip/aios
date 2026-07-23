import type { PageRole } from "@/lib/website-blueprint-page-dna";

const PAGE_ROLE_ALIASES: Record<string, PageRole> = {
  home: "home",
  start: "home",
  startseite: "home",
  menu: "menu",
  speisekarte: "menu",
  speisen: "menu",
  about: "about",
  "about us": "about",
  "über uns": "about",
  "uber uns": "about",
  gallery: "gallery",
  galerie: "gallery",
  contact: "contact",
  kontakt: "contact",
  location: "location",
  standort: "location",
  services: "services",
  leistungen: "services",
  portfolio: "portfolio",
  reviews: "reviews",
  bewertungen: "reviews",
  team: "team",
  treatments: "treatments",
  behandlungen: "treatments",
};

const ROLE_SLUGS: Partial<Record<PageRole, string>> = {
  home: "",
  menu: "menu",
  about: "about",
  gallery: "gallery",
  contact: "contact",
  location: "location",
  services: "services",
  portfolio: "portfolio",
  reviews: "reviews",
  team: "team",
  treatments: "treatments",
};

export function parseList(value: string | null | undefined): string[] {
  if (!value?.trim()) {
    return [];
  }

  return value
    .replace(/\r/g, "")
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function normalizeKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function stableId(namespace: string, key: string): string {
  return `${namespace}:${normalizeKey(key)}`;
}

export function detectPageRole(page: string): PageRole {
  const normalized = page.trim().toLowerCase();
  return PAGE_ROLE_ALIASES[normalized] ?? "generic";
}

export function slugFromPageName(page: string, role: PageRole): string {
  const mapped = ROLE_SLUGS[role];
  if (mapped !== undefined) {
    return mapped;
  }

  return normalizeKey(page);
}

export function routePathFromSlug(slug: string): string {
  if (!slug || slug === "home") {
    return "/";
  }

  return slug.startsWith("/") ? slug : `/${slug}`;
}

export function assignUniqueSlugs(
  pages: Array<{ pageName: string; role: PageRole }>,
): Map<string, string> {
  const slugCounts = new Map<string, number>();
  const result = new Map<string, string>();

  pages.forEach(({ pageName, role }) => {
    let base = slugFromPageName(pageName, role) || "home";
    if (base === "home" && role !== "home") {
      base = normalizeKey(pageName) || "page";
    }

    const count = slugCounts.get(base) ?? 0;
    slugCounts.set(base, count + 1);
    const slug = count === 0 ? base : `${base}-${count + 1}`;
    result.set(pageName, slug);
  });

  return result;
}

export function normalizeComponentName(name: string): string {
  if (name.startsWith("MenuCategory_")) {
    return "MenuCategorySection";
  }
  if (name.startsWith("Service_")) {
    return "ServiceCard";
  }
  if (name.endsWith("Hero") && name !== "HeroSection") {
    return "PageHero";
  }
  return name;
}

export function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const map = new Map<string, T>();
  items.forEach((item) => {
    if (!map.has(item.id)) {
      map.set(item.id, item);
    }
  });
  return [...map.values()];
}

export function dedupeStrings(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

export function sortByOrder<T extends { order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order);
}

export function detectBusinessProfile(
  industry: string,
  businessName: string,
): "restaurant" | "dentist" | "agency" | "default" {
  const haystack = `${industry} ${businessName}`.toLowerCase();

  if (/burger|restaurant|imbiss|gastro|café|cafe|bistro|food|smashburger/.test(
    haystack,
  )) {
    return "restaurant";
  }

  if (/dentist|zahnarzt|dental|zahn|orthodont/.test(haystack)) {
    return "dentist";
  }

  if (/agency|agentur|marketing|design studio|studio|consulting|beratung/.test(
    haystack,
  )) {
    return "agency";
  }

  return "default";
}

export function detectStyleTier(
  preferredStyle: string | null,
  additionalNotes: string | null,
  referenceWebsites: string | null,
): "premium" | "modern" | "default" {
  const haystack = `${preferredStyle ?? ""} ${additionalNotes ?? ""} ${referenceWebsites ?? ""}`.toLowerCase();

  if (/premium|elegant|apple|luxury|minimal|hochwertig/.test(haystack)) {
    return "premium";
  }

  if (/modern|contemporary|clean|bold|zeitgemäß|zeitgemass/.test(haystack)) {
    return "modern";
  }

  return "default";
}

export function prefersMotionFromBrief(
  preferredStyle: string | null,
  additionalNotes: string | null,
  referenceWebsites: string | null,
): boolean {
  return /animation|bewegung|motion|apple|transition|parallax/i.test(
    `${preferredStyle ?? ""} ${additionalNotes ?? ""} ${referenceWebsites ?? ""}`,
  );
}

export function primaryCtaFromBrief(
  websiteGoal: string,
  profile: ReturnType<typeof detectBusinessProfile>,
): string {
  const goal = websiteGoal.toLowerCase();

  if (/bestell|order|shop|kauf|purchase/.test(goal)) {
    return "Jetzt bestellen";
  }

  if (/termin|appointment|buchen|book/.test(goal)) {
    return "Termin vereinbaren";
  }

  if (/kontakt|contact|anfrage|lead/.test(goal)) {
    return "Kontakt aufnehmen";
  }

  if (profile === "restaurant") {
    return "Zur Speisekarte / Bestellen";
  }

  if (profile === "dentist") {
    return "Termin anfragen";
  }

  if (profile === "agency") {
    return "Projekt anfragen";
  }

  return "Anfrage senden";
}

export function secondaryCtaFromBrief(
  profile: ReturnType<typeof detectBusinessProfile>,
  location: string | null,
): string {
  if (profile === "restaurant") {
    return "Standort & Öffnungszeiten";
  }

  if (profile === "dentist") {
    return "Leistungen ansehen";
  }

  if (profile === "agency") {
    return "Portfolio ansehen";
  }

  if (location) {
    return `${location} entdecken`;
  }

  return "Mehr erfahren";
}

export function briefUsp(
  uniqueSellingPoints: string | null,
  businessName: string,
  websiteGoal: string,
): string {
  if (uniqueSellingPoints?.trim()) {
    return uniqueSellingPoints.trim();
  }

  return `Deliver a clear, trustworthy presentation of ${businessName} that supports the stated website goal: ${websiteGoal}.`;
}

export function stripTimestampForDeterministicCompare(
  value: unknown,
): unknown {
  if (Array.isArray(value)) {
    return value.map(stripTimestampForDeterministicCompare);
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([key]) => key !== "generatedAt")
      .map(([key, nested]) => [key, stripTimestampForDeterministicCompare(nested)]);
    return Object.fromEntries(entries);
  }

  return value;
}

export function stableStringify(value: unknown): string {
  return JSON.stringify(stripTimestampForDeterministicCompare(value), null, 2);
}
