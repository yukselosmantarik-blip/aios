export const ASSET_SPRINT = "8.4";

export type AssetType = "logo" | "favicon" | "hero" | "gallery" | "map" | "avatar";

export type AssetDefinition = {
  id: AssetId;
  fileName: string;
  publicPath: string;
  assetType: AssetType;
  placeholder: true;
  replaceBeforeProduction: true;
  altText: string;
  viewBox: string;
  label: string;
};

export const ASSET_IDS = ["logo", "favicon", "hero", "gallery", "map", "avatar"] as const;

export type AssetId = (typeof ASSET_IDS)[number];

export const ASSET_DEFINITIONS: readonly AssetDefinition[] = [
  {
    id: "logo",
    fileName: "logo.svg",
    publicPath: "/icons/logo.svg",
    assetType: "logo",
    placeholder: true,
    replaceBeforeProduction: true,
    altText: "Logo placeholder — replace before production",
    viewBox: "0 0 120 32",
    label: "LOGO PLACEHOLDER",
  },
  {
    id: "favicon",
    fileName: "favicon.svg",
    publicPath: "/icons/favicon.svg",
    assetType: "favicon",
    placeholder: true,
    replaceBeforeProduction: true,
    altText: "Favicon placeholder — replace before production",
    viewBox: "0 0 32 32",
    label: "FAVICON",
  },
  {
    id: "hero",
    fileName: "hero-placeholder.svg",
    publicPath: "/images/hero-placeholder.svg",
    assetType: "hero",
    placeholder: true,
    replaceBeforeProduction: true,
    altText: "Hero image placeholder — replace before production",
    viewBox: "0 0 640 360",
    label: "HERO PLACEHOLDER",
  },
  {
    id: "gallery",
    fileName: "gallery-placeholder.svg",
    publicPath: "/images/gallery-placeholder.svg",
    assetType: "gallery",
    placeholder: true,
    replaceBeforeProduction: true,
    altText: "Gallery image placeholder — replace before production",
    viewBox: "0 0 480 360",
    label: "GALLERY PLACEHOLDER",
  },
  {
    id: "map",
    fileName: "map-placeholder.svg",
    publicPath: "/images/map-placeholder.svg",
    assetType: "map",
    placeholder: true,
    replaceBeforeProduction: true,
    altText: "Map placeholder — replace before production",
    viewBox: "0 0 640 360",
    label: "MAP PLACEHOLDER",
  },
  {
    id: "avatar",
    fileName: "avatar-placeholder.svg",
    publicPath: "/images/avatar-placeholder.svg",
    assetType: "avatar",
    placeholder: true,
    replaceBeforeProduction: true,
    altText: "Avatar placeholder — replace before production",
    viewBox: "0 0 128 128",
    label: "AVATAR PLACEHOLDER",
  },
] as const;

export const ASSET_PUBLIC_DIRECTORIES = [
  "public",
  "public/images",
  "public/icons",
  "public/fonts",
] as const;

export function assetVirtualPath(definition: AssetDefinition): string {
  if (definition.id === "logo" || definition.id === "favicon") {
    return `public/icons/${definition.fileName}`;
  }
  return `public/images/${definition.fileName}`;
}

export function buildAssetMetadataComment(definition: AssetDefinition): string {
  return `<!-- ASSET_METADATA:${JSON.stringify({
    assetType: definition.assetType,
    placeholder: definition.placeholder,
    replaceBeforeProduction: definition.replaceBeforeProduction,
  })} -->`;
}

export function buildPlaceholderSvg(definition: AssetDefinition): string {
  const [, , width, height] = definition.viewBox.split(" ").map(Number);
  return [
    buildAssetMetadataComment(definition),
    `<!-- GENERATED PLACEHOLDER: ${definition.fileName} -->`,
    `<!-- Sprint ${ASSET_SPRINT} — deterministic asset engine -->`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${definition.viewBox}" role="img" aria-label="${definition.altText}">`,
    `  <rect width="${width}" height="${height}" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="6 4" />`,
    `  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" fill="currentColor">${definition.label}</text>`,
    "</svg>",
    "",
  ].join("\n");
}
