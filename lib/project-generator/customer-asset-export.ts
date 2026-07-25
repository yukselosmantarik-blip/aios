import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { RestaurantAssets } from "@/lib/assets/types";
import type { CompiledWebsiteProject } from "@/lib/website-compiler/types";
import type { AssetId } from "@/lib/project-generator/asset-utils";
import type { RegistryAssetEntry } from "@/lib/project-generator/asset-engine";
import {
  exportPublicPathForRole,
  exportVirtualPathForRole,
  type CustomerAssetRole,
} from "@/lib/project-generator/customer-asset-paths";
import { buildVirtualFile } from "@/lib/project-generator/tree";
import type { VirtualFile } from "@/lib/project-generator/types";

export type { CustomerAssetRole } from "@/lib/project-generator/customer-asset-paths";
export {
  exportPublicPathForRole,
  exportVirtualPathForRole,
} from "@/lib/project-generator/customer-asset-paths";

const CUSTOMER_EXPORT_ROLES: CustomerAssetRole[] = ["logo", "hero"];

function sourcePathForRole(assets: RestaurantAssets, role: CustomerAssetRole): string {
  return role === "logo" ? assets.logo : assets.hero;
}

function absolutePublicAssetPath(sourcePublicPath: string): string {
  const relative = sourcePublicPath.replace(/^\//, "");
  return join(process.cwd(), "public", relative);
}

function readSourceAssetBase64(sourcePublicPath: string): string {
  return readFileSync(absolutePublicAssetPath(sourcePublicPath)).toString("base64");
}

function uploadedRegistryEntry(
  id: AssetId,
  role: CustomerAssetRole,
  sourcePublicPath: string,
  altText: string,
): RegistryAssetEntry {
  return {
    id,
    path: exportPublicPathForRole(sourcePublicPath, role),
    assetType: role,
    placeholder: false,
    replaceBeforeProduction: false,
    altText,
    source: "upload",
  };
}

function buildBase64AssetVirtualFile(
  role: CustomerAssetRole,
  sourcePath: string,
): VirtualFile {
  return {
    ...buildVirtualFile(
      exportVirtualPathForRole(sourcePath, role),
      "asset-placeholder",
      readSourceAssetBase64(sourcePath),
      {
        description: `Customer ${role} asset for export`,
        assetRole: role,
        isPlaceholder: false,
        implementationStatus: "generated",
      },
    ),
    contentEncoding: "base64",
  };
}

export function buildCustomerAssetRegistryOverrides(
  project: CompiledWebsiteProject,
  assets: RestaurantAssets,
): Partial<Record<AssetId, RegistryAssetEntry>> {
  const businessName = project.business.businessName;

  return {
    logo: uploadedRegistryEntry("logo", "logo", assets.logo, `${businessName} Logo`),
    hero: uploadedRegistryEntry("hero", "hero", assets.hero, `${businessName} — Hero`),
  };
}

export function buildCustomerAssetVirtualFiles(
  project: CompiledWebsiteProject,
  assets: RestaurantAssets,
): VirtualFile[] {
  void project;
  return CUSTOMER_EXPORT_ROLES.map((role) =>
    buildBase64AssetVirtualFile(role, sourcePathForRole(assets, role)),
  );
}

export function skippedPlaceholderAssetIds(
  assets: RestaurantAssets | undefined,
): Set<AssetId> {
  if (!assets) {
    return new Set();
  }
  return new Set(CUSTOMER_EXPORT_ROLES);
}
