export const ASSET_SPRINT = "8.4";

export type AssetType =
  | "logo"
  | "favicon"
  | "hero"
  | "gallery"
  | "product"
  | "map"
  | "avatar"
  | "menu";

export const ASSET_IDS = [
  "logo",
  "favicon",
  "hero",
  "gallery",
  "product",
  "map",
  "avatar",
  "menu",
] as const;

export type AssetId = (typeof ASSET_IDS)[number];

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

export const ASSET_DEFINITIONS: readonly AssetDefinition[] = [
  {
    id: "logo",
    fileName: "logo.svg",
    publicPath: "/icons/logo.svg",
    assetType: "logo",
    placeholder: true,
    replaceBeforeProduction: true,
    altText: "Logo asset missing — LOGO REQUIRED",
    viewBox: "0 0 120 32",
    label: "LOGO REQUIRED",
  },
  {
    id: "favicon",
    fileName: "favicon.svg",
    publicPath: "/icons/favicon.svg",
    assetType: "favicon",
    placeholder: true,
    replaceBeforeProduction: true,
    altText: "Favicon asset missing",
    viewBox: "0 0 32 32",
    label: "FAVICON REQUIRED",
  },
  {
    id: "hero",
    fileName: "hero-placeholder.svg",
    publicPath: "/images/hero-placeholder.svg",
    assetType: "hero",
    placeholder: true,
    replaceBeforeProduction: true,
    altText: "Hero image missing — HERO IMAGE REQUIRED",
    viewBox: "0 0 640 360",
    label: "HERO IMAGE REQUIRED",
  },
  {
    id: "gallery",
    fileName: "gallery-placeholder.svg",
    publicPath: "/images/gallery-placeholder.svg",
    assetType: "gallery",
    placeholder: true,
    replaceBeforeProduction: true,
    altText: "Gallery image missing — GALLERY IMAGE REQUIRED",
    viewBox: "0 0 480 360",
    label: "GALLERY IMAGE REQUIRED",
  },
  {
    id: "product",
    fileName: "product-placeholder.svg",
    publicPath: "/images/product-placeholder.svg",
    assetType: "product",
    placeholder: true,
    replaceBeforeProduction: true,
    altText: "Product image missing — PRODUCT IMAGE REQUIRED",
    viewBox: "0 0 480 360",
    label: "PRODUCT IMAGE REQUIRED",
  },
  {
    id: "map",
    fileName: "map-placeholder.svg",
    publicPath: "/images/map-placeholder.svg",
    assetType: "map",
    placeholder: true,
    replaceBeforeProduction: true,
    altText: "Map asset missing",
    viewBox: "0 0 640 360",
    label: "MAP REQUIRED",
  },
  {
    id: "avatar",
    fileName: "avatar-placeholder.svg",
    publicPath: "/images/avatar-placeholder.svg",
    assetType: "avatar",
    placeholder: true,
    replaceBeforeProduction: true,
    altText: "Avatar image missing",
    viewBox: "0 0 128 128",
    label: "AVATAR REQUIRED",
  },
  {
    id: "menu",
    fileName: "menu-placeholder.svg",
    publicPath: "/images/menu-placeholder.svg",
    assetType: "menu",
    placeholder: true,
    replaceBeforeProduction: true,
    altText: "Menu image missing — MENU IMAGE REQUIRED",
    viewBox: "0 0 480 640",
    label: "MENU IMAGE REQUIRED",
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
