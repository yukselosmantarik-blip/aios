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

type CustomerAssetSpec = {
  role: CustomerAssetRole;
  assetId: AssetId;
  pickPath: (assets: RestaurantAssets) => string | undefined;
};

const CUSTOMER_ASSET_SPECS: CustomerAssetSpec[] = [
  { role: "logo", assetId: "logo", pickPath: (assets) => assets.logo },
  { role: "hero", assetId: "hero", pickPath: (assets) => assets.hero },
  { role: "menu", assetId: "menu", pickPath: (assets) => assets.menu },
];

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
    assetType: role === "logo" ? "logo" : role === "hero" ? "hero" : "menu",
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
  const landing = project.restaurantBusinessProfile?.landing;
  const brandName = landing?.brandName ?? project.business.businessName;
  const overrides: Partial<Record<AssetId, RegistryAssetEntry>> = {
    logo: uploadedRegistryEntry("logo", "logo", assets.logo, `${brandName} Logo`),
    hero: uploadedRegistryEntry(
      "hero",
      "hero",
      assets.hero,
      `${landing?.heroHeading ?? brandName} — Hero`,
    ),
  };

  if (assets.menu) {
    overrides.menu = uploadedRegistryEntry(
      "menu",
      "menu",
      assets.menu,
      landing?.menuImageAlt ?? `Speisekarte von ${brandName}`,
    );
  }

  return overrides;
}

export function buildCustomerAssetVirtualFiles(
  project: CompiledWebsiteProject,
  assets: RestaurantAssets,
): VirtualFile[] {
  void project;
  return CUSTOMER_ASSET_SPECS.flatMap((spec) => {
    const sourcePath = spec.pickPath(assets);
    if (!sourcePath) {
      return [];
    }
    return [buildBase64AssetVirtualFile(spec.role, sourcePath)];
  });
}

export function skippedPlaceholderAssetIds(
  assets: RestaurantAssets | undefined,
): Set<AssetId> {
  if (!assets) {
    return new Set();
  }

  const skipped = new Set<AssetId>(["logo", "hero"]);
  if (assets.menu) {
    skipped.add("menu");
  }
  return skipped;
}
