import type { ExportableWebsiteProject } from "@/lib/project-export/types";
import {
  EXPECTED_DIRECTORY_PREFIXES,
  REQUIRED_ROOT_FILES,
} from "@/lib/project-export/normalize";
import { BY_NANIS_RESTAURANT_ASSETS } from "@/lib/industries/restaurant/fixtures/by-nanis-assets";
import { verifyRestaurantAssetsOnDisk } from "@/lib/industries/restaurant/assets-verify";
import {
  exportPublicPathForRole,
  exportVirtualPathForRole,
} from "@/lib/industries/restaurant/customer-asset-export";

export type ExportVerificationCheck = {
  suite: string;
  name: string;
  passed: boolean;
  detail: string;
};

const REQUIRED_SMASHBURGER_ROUTES = [
  "/",
  "/menu",
  "/about",
  "/gallery",
  "/contact",
  "/impressum",
  "/datenschutz",
] as const;

const REQUIRED_CUSTOMER_ASSET_EXPORT_PATHS = [
  exportVirtualPathForRole(BY_NANIS_RESTAURANT_ASSETS.logo, "logo"),
  exportVirtualPathForRole(BY_NANIS_RESTAURANT_ASSETS.hero, "hero"),
  exportVirtualPathForRole(BY_NANIS_RESTAURANT_ASSETS.menu!, "menu"),
] as const;

export function verifySourceCustomerAssetsOnDisk(): ExportVerificationCheck[] {
  const verification = verifyRestaurantAssetsOnDisk(BY_NANIS_RESTAURANT_ASSETS);
  return [
    {
      suite: "source-assets",
      name: "Customer source assets exist under public/",
      passed: verification.passed,
      detail: verification.missing.length > 0 ? verification.missing.join(", ") : "All source assets found",
    },
  ];
}

export function verifyExportRouting(exportPackage: ExportableWebsiteProject): ExportVerificationCheck[] {
  const routePaths = new Set(exportPackage.routeSummary.map((route) => route.routePath));
  const checks: ExportVerificationCheck[] = [];

  for (const routePath of REQUIRED_SMASHBURGER_ROUTES) {
    checks.push({
      suite: "export-routing",
      name: `Route ${routePath} exported`,
      passed: routePaths.has(routePath),
      detail: routePaths.has(routePath)
        ? exportPackage.routeSummary.find((route) => route.routePath === routePath)?.pageFilePath ?? routePath
        : `Missing; have ${[...routePaths].join(", ")}`,
    });
  }

  checks.push({
    suite: "export-routing",
    name: "Legal routes use App Router page files",
    passed: ["/impressum", "/datenschutz"].every((routePath) => {
      const route = exportPackage.routeSummary.find((entry) => entry.routePath === routePath);
      return Boolean(route?.pageFilePath.startsWith("app/") && route.pageFilePath.endsWith("/page.tsx"));
    }),
    detail: exportPackage.routeSummary
      .filter((route) => route.routePath === "/impressum" || route.routePath === "/datenschutz")
      .map((route) => `${route.routePath} → ${route.pageFilePath}`)
      .join(", "),
  });

  return checks;
}

export function verifyExportProjectStructure(
  exportPackage: ExportableWebsiteProject,
): ExportVerificationCheck[] {
  const filePaths = new Set(exportPackage.files.map((file) => file.path));
  const directoryPaths = new Set(exportPackage.directories.map((directory) => directory.path));

  const checks: ExportVerificationCheck[] = [
    {
      suite: "export-structure",
      name: "Required root export files present",
      passed: REQUIRED_ROOT_FILES.every((path) => filePaths.has(path)),
      detail: REQUIRED_ROOT_FILES.filter((path) => !filePaths.has(path)).join(", ") || "Complete",
    },
    {
      suite: "export-structure",
      name: "Expected directory layout present",
      passed: EXPECTED_DIRECTORY_PREFIXES.every(
        (prefix) => directoryPaths.has(prefix) || filePaths.has(prefix),
      ),
      detail: EXPECTED_DIRECTORY_PREFIXES.join(", "),
    },
    {
      suite: "export-structure",
      name: "Export manifest matches package checksum",
      passed: exportPackage.manifest.checksum === exportPackage.checksum,
      detail: exportPackage.checksum,
    },
    {
      suite: "export-structure",
      name: "App Router shell files exported",
      passed: ["app/layout.tsx", "app/page.tsx", "app/not-found.tsx"].every((path) =>
        filePaths.has(path),
      ),
      detail: `${exportPackage.files.length} files`,
    },
  ];

  return checks;
}

export function verifyExportAssetCopying(exportPackage: ExportableWebsiteProject): ExportVerificationCheck[] {
  const checks: ExportVerificationCheck[] = [];

  for (const virtualPath of REQUIRED_CUSTOMER_ASSET_EXPORT_PATHS) {
    const file = exportPackage.files.find((entry) => entry.path === virtualPath);
    checks.push({
      suite: "export-assets",
      name: `Customer asset copied to ${virtualPath}`,
      passed: Boolean(file && file.byteLength > 0),
      detail: file ? `${file.byteLength} bytes` : "Missing",
    });
  }

  checks.push({
    suite: "export-assets",
    name: "Registry paths match exported public files",
    passed: exportPackage.validationSummary.assetsValid,
    detail: `${exportPackage.validationSummary.unresolvedAssetCount} unresolved assets`,
  });

  checks.push({
    suite: "export-assets",
    name: "No AIOS customer public paths in export tree",
    passed: !exportPackage.virtualFiles.some((file) => file.content.includes("/customers/")),
    detail: "Export-local /icons and /images only",
  });

  const logoPublic = exportPublicPathForRole(BY_NANIS_RESTAURANT_ASSETS.logo, "logo");
  checks.push({
    suite: "export-assets",
    name: "Logo registry path points to export-local file",
    passed: exportPackage.virtualFiles
      .find((file) => file.path === "lib/assets/registry.ts")
      ?.content.includes(logoPublic) ?? false,
    detail: logoPublic,
  });

  return checks;
}

export function verifyExportPreviewCompatibility(
  exportPackage: ExportableWebsiteProject,
): ExportVerificationCheck[] {
  const packageJson = exportPackage.files.find((file) => file.path === "package.json")?.content ?? "";
  let parsed: {
    scripts?: Record<string, string>;
    dependencies?: Record<string, string>;
  } = {};

  try {
    parsed = JSON.parse(packageJson) as typeof parsed;
  } catch {
    parsed = {};
  }

  const scripts = parsed.scripts ?? {};
  const dependencies = parsed.dependencies ?? {};

  return [
    {
      suite: "export-preview",
      name: "package.json parses for preview/build",
      passed: Boolean(parsed.scripts && parsed.dependencies),
      detail: "Valid JSON manifest",
    },
    {
      suite: "export-preview",
      name: "Preview scripts exported (dev, build, start)",
      passed: ["dev", "build", "start"].every((script) => Boolean(scripts[script])),
      detail: Object.keys(scripts).join(", "),
    },
    {
      suite: "export-preview",
      name: "Next.js and React dependencies pinned for standalone run",
      passed: Boolean(dependencies.next && dependencies.react && dependencies["react-dom"]),
      detail: `next@${dependencies.next ?? "?"} react@${dependencies.react ?? "?"}`,
    },
    {
      suite: "export-preview",
      name: "Environment template included for local preview",
      passed: exportPackage.files.some((file) => file.path === ".env.example"),
      detail: ".env.example",
    },
    {
      suite: "export-preview",
      name: "No secret env files in export package",
      passed: !exportPackage.files.some((file) => file.path === ".env.local"),
      detail: "Secrets excluded",
    },
  ];
}
