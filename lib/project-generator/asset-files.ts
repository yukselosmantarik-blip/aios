import type { CompiledWebsiteProject } from "@/lib/website-compiler/types";
import {
  buildAssetIndexFile,
  buildAssetRegistryFile,
  buildResolveAssetFile,
} from "@/lib/project-generator/asset-engine";
import {
  ASSET_DEFINITIONS,
  ASSET_PUBLIC_DIRECTORIES,
  assetVirtualPath,
  buildPlaceholderSvg,
} from "@/lib/project-generator/asset-utils";
import {
  buildCustomerAssetVirtualFiles,
  skippedPlaceholderAssetIds,
} from "@/lib/project-generator/customer-asset-export";
import { buildVirtualFile } from "@/lib/project-generator/tree";
import type { VirtualFile } from "@/lib/project-generator/types";

export function buildAssetPlaceholderFiles(project: CompiledWebsiteProject): VirtualFile[] {
  const files: VirtualFile[] = [];
  const skipIds = skippedPlaceholderAssetIds(project.restaurantAssets);

  for (const directory of ASSET_PUBLIC_DIRECTORIES) {
    if (directory !== "public/fonts") {
      continue;
    }
    files.push(
      buildVirtualFile(`${directory}/.gitkeep`, "asset-placeholder", "", {
        description: `${directory} directory placeholder`,
        assetRole: "directory",
        isPlaceholder: true,
        implementationStatus: "generated",
      }),
    );
  }

  for (const definition of ASSET_DEFINITIONS) {
    if (skipIds.has(definition.id)) {
      continue;
    }
    files.push(
      buildVirtualFile(assetVirtualPath(definition), "asset-placeholder", buildPlaceholderSvg(definition), {
        description: `${definition.assetType} asset placeholder`,
        assetRole: definition.assetType,
        isPlaceholder: true,
        implementationStatus: "generated",
      }),
    );
  }

  return files;
}

export function buildAssetRegistryFiles(project: CompiledWebsiteProject): VirtualFile[] {
  return [
    buildVirtualFile("lib/assets/registry.ts", "registry", buildAssetRegistryFile(project), {
      description: "Generated asset registry",
      implementationStatus: "generated",
    }),
    buildVirtualFile("lib/assets/resolve-asset.ts", "registry", buildResolveAssetFile(), {
      description: "Generated asset resolver",
      implementationStatus: "generated",
    }),
    buildVirtualFile("lib/assets/index.ts", "registry", buildAssetIndexFile(), {
      description: "Generated asset module exports",
      implementationStatus: "generated",
    }),
  ];
}

export function buildAssetEngineFiles(project: CompiledWebsiteProject): VirtualFile[] {
  const customerAssets = project.restaurantAssets
    ? buildCustomerAssetVirtualFiles(project, project.restaurantAssets)
    : [];

  return [
    ...buildAssetPlaceholderFiles(project),
    ...customerAssets,
    ...buildAssetRegistryFiles(project),
  ];
}

export function countAssetPlaceholderFiles(files: VirtualFile[]): number {
  return files.filter((file) => file.kind === "asset-placeholder" && file.path.endsWith(".svg")).length;
}

export function countAssetRegistryFiles(files: VirtualFile[]): number {
  return files.filter((file) => file.path.startsWith("lib/assets/")).length;
}
