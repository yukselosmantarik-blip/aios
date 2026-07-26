/**
 * GENERATED ASSET REGISTRY — Sprint 8.4
 * Components must request assets through resolveAsset() only.
 */

export const assetRegistry = {
  logo: {
    id: "logo",
    path: "/icons/logo.jpeg",
    assetType: "logo",
    placeholder: false,
    replaceBeforeProduction: false,
    altText: "by Nani's Logo",
    source: "upload",
  },
  favicon: {
    id: "favicon",
    path: "/icons/favicon.svg",
    assetType: "favicon",
    placeholder: true,
    replaceBeforeProduction: true,
    altText: "Favicon asset missing",
    source: "placeholder",
  },
  hero: {
    id: "hero",
    path: "/images/hero.png",
    assetType: "hero",
    placeholder: false,
    replaceBeforeProduction: false,
    altText: "by Nani's Smashburger — Hero",
    source: "upload",
  },
  gallery: {
    id: "gallery",
    path: "/images/gallery-placeholder.svg",
    assetType: "gallery",
    placeholder: true,
    replaceBeforeProduction: true,
    altText: "Gallery image missing — GALLERY IMAGE REQUIRED",
    source: "placeholder",
  },
  product: {
    id: "product",
    path: "/images/product-placeholder.svg",
    assetType: "product",
    placeholder: true,
    replaceBeforeProduction: true,
    altText: "Product image missing — PRODUCT IMAGE REQUIRED",
    source: "placeholder",
  },
  map: {
    id: "map",
    path: "/images/map-placeholder.svg",
    assetType: "map",
    placeholder: true,
    replaceBeforeProduction: true,
    altText: "Map asset missing",
    source: "placeholder",
  },
  avatar: {
    id: "avatar",
    path: "/images/avatar-placeholder.svg",
    assetType: "avatar",
    placeholder: true,
    replaceBeforeProduction: true,
    altText: "Avatar image missing",
    source: "placeholder",
  },
  menu: {
    id: "menu",
    path: "/images/menu.jpeg",
    assetType: "menu",
    placeholder: false,
    replaceBeforeProduction: false,
    altText: "Speisekarte von by Nani's",
    source: "upload",
  },
} as const;

export type AssetId = keyof typeof assetRegistry;

export type AssetType = (typeof assetRegistry)[AssetId]["assetType"];

export type AssetSource = (typeof assetRegistry)[AssetId]["source"];

export type ResolvedAsset = (typeof assetRegistry)[AssetId];
