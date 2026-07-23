import {
  ASSET_DEFINITIONS,
  type AssetDefinition,
  type AssetId,
} from "@/lib/project-generator/asset-utils";

export type AssetSource = "placeholder" | "ai-generated" | "upload";

export type RegistryAssetEntry = {
  id: AssetId;
  path: string;
  assetType: AssetDefinition["assetType"];
  placeholder: boolean;
  replaceBeforeProduction: boolean;
  altText: string;
  source: AssetSource;
};

export function buildRegistryAssetEntries(): Record<AssetId, RegistryAssetEntry> {
  const entries = {} as Record<AssetId, RegistryAssetEntry>;

  for (const definition of ASSET_DEFINITIONS) {
    entries[definition.id] = {
      id: definition.id,
      path: definition.publicPath,
      assetType: definition.assetType,
      placeholder: definition.placeholder,
      replaceBeforeProduction: definition.replaceBeforeProduction,
      altText: definition.altText,
      source: "placeholder",
    };
  }

  return entries;
}

export function buildAssetRegistryFile(): string {
  const entries = buildRegistryAssetEntries();
  const serializedEntries = ASSET_DEFINITIONS.map((definition) => {
    const entry = entries[definition.id];
    return [
      `  ${definition.id}: {`,
      `    id: ${JSON.stringify(entry.id)},`,
      `    path: ${JSON.stringify(entry.path)},`,
      `    assetType: ${JSON.stringify(entry.assetType)},`,
      `    placeholder: ${entry.placeholder},`,
      `    replaceBeforeProduction: ${entry.replaceBeforeProduction},`,
      `    altText: ${JSON.stringify(entry.altText)},`,
      `    source: ${JSON.stringify(entry.source)},`,
      "  },",
    ].join("\n");
  }).join("\n");

  return [
    "/**",
    " * GENERATED ASSET REGISTRY — Sprint 8.4",
    " * Components must request assets through resolveAsset() only.",
    " */",
    "",
    "export const assetRegistry = {",
    serializedEntries,
    "} as const;",
    "",
    "export type AssetId = keyof typeof assetRegistry;",
    "",
    "export type AssetType = (typeof assetRegistry)[AssetId][\"assetType\"];",
    "",
    "export type AssetSource = (typeof assetRegistry)[AssetId][\"source\"];",
    "",
    "export type ResolvedAsset = (typeof assetRegistry)[AssetId];",
    "",
  ].join("\n");
}

export function buildResolveAssetFile(): string {
  return [
    "/**",
    " * GENERATED ASSET RESOLVER — Sprint 8.4",
    " */",
    "",
    "import { assetRegistry, type AssetId, type ResolvedAsset } from './registry';",
    "",
    "export function resolveAsset(id: AssetId): ResolvedAsset {",
    "  const asset = assetRegistry[id];",
    "  if (!asset) {",
    "    throw new Error(`Unknown asset id: ${String(id)}`);",
    "  }",
    "  return asset;",
    "}",
    "",
  ].join("\n");
}

export function buildAssetIndexFile(): string {
  return [
    "/**",
    " * GENERATED ASSET MODULE — Sprint 8.4",
    " */",
    "",
    "export { assetRegistry } from './registry';",
    "export { resolveAsset } from './resolve-asset';",
    "export type { AssetId, AssetSource, AssetType, ResolvedAsset } from './registry';",
    "",
  ].join("\n");
}
