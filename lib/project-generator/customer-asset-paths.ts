import { extname } from "node:path";

export type CustomerAssetRole = "logo" | "hero" | "menu";

export function exportPublicPathForRole(
  sourcePublicPath: string,
  role: CustomerAssetRole,
): string {
  const extension = extname(sourcePublicPath) || ".jpg";
  if (role === "logo") {
    return `/icons/logo${extension}`;
  }
  if (role === "menu") {
    return `/images/menu${extension}`;
  }
  return `/images/hero${extension}`;
}

export function exportVirtualPathForRole(
  sourcePublicPath: string,
  role: CustomerAssetRole,
): string {
  return `public${exportPublicPathForRole(sourcePublicPath, role)}`;
}
