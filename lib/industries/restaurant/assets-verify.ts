import { existsSync } from "node:fs";
import { join } from "node:path";

import type { RestaurantAssets } from "@/lib/industries/restaurant/types";

export function collectRestaurantAssetPaths(assets: RestaurantAssets): string[] {
  const paths = [assets.logo, assets.hero, ...assets.gallery];
  if (assets.menu) {
    paths.push(assets.menu);
  }
  if (assets.business) {
    paths.push(assets.business);
  }
  return paths;
}

export function verifyRestaurantAssetsOnDisk(
  assets: RestaurantAssets,
  publicRoot: string = join(process.cwd(), "public"),
): { passed: boolean; missing: string[] } {
  const missing = collectRestaurantAssetPaths(assets).filter((publicPath) => {
    const relative = publicPath.replace(/^\//, "");
    return !existsSync(join(publicRoot, relative));
  });

  return { passed: missing.length === 0, missing };
}
