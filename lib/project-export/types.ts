import type {
  ComponentDescriptor,
  GeneratedNextJsProject,
  GeneratedRouteDescriptor,
  VirtualFile,
} from "@/lib/project-generator/types";

export const EXPORT_VERSION = "8.5.0";
export const ZIP_EXPORT_VERSION = "8.6.0";

export const EXPORT_MANIFEST_PATH = "export-manifest.json";
export const EXPORT_PLACEHOLDER_REPORT_PATH = "export-placeholder-report.json";

export type ExportChecksumAlgorithm = "sha256";

export type ExportFileCategory =
  | "app"
  | "component"
  | "content"
  | "lib"
  | "public"
  | "style"
  | "type"
  | "config"
  | "documentation"
  | "asset"
  | "manifest"
  | "other";

export type ExportFileEncoding = "utf-8" | "base64";

export type PlaceholderCategory =
  | "logo"
  | "image"
  | "price"
  | "address"
  | "phone"
  | "email"
  | "opening-hours"
  | "testimonial"
  | "legal"
  | "map"
  | "social-link"
  | "product-data"
  | "domain"
  | "other";

export type ExportWarningSeverity = "info" | "warning" | "error";

export type NormalizedExportFile = {
  path: string;
  fileName: string;
  extension: string;
  category: ExportFileCategory;
  encoding: ExportFileEncoding;
  content: string;
  byteLength: number;
  checksum: string;
  executable: boolean;
  required: boolean;
  generated: boolean;
  placeholder: boolean;
  replaceBeforeProduction: boolean;
};

export type NormalizedExportDirectory = {
  path: string;
  category: ExportFileCategory | "root";
  required: boolean;
};

export type ExportManifest = {
  projectId: string;
  projectName: string;
  exportVersion: string;
  compilerVersion: string;
  generatorVersion: string;
  sourceBlueprintId: string;
  sourceBriefId: string;
  generatedAt: string;
  fileCount: number;
  directoryCount: number;
  routeCount: number;
  componentCount: number;
  assetCount: number;
  totalTextBytes: number;
  checksumAlgorithm: ExportChecksumAlgorithm;
  checksum: string;
  missingDataCount: number;
  warningCount: number;
  launchBlockingPlaceholderCount: number;
};

export type ExportProjectMetadata = {
  projectId: string;
  projectName: string;
  compilerVersion: string;
  generatorVersion: string;
  sourceBlueprintId: string;
  sourceBriefId: string;
  targetFramework: GeneratedNextJsProject["targetFramework"];
};

export type ExportRouteSummary = {
  id: string;
  routePath: string;
  pageFilePath: string;
  pageRole: string;
  seoTitle: string;
};

export type ExportComponentSummary = {
  registryPath: string;
  exportCount: number;
  descriptorCount: number;
  clientComponentCount: number;
  serverComponentCount: number;
};

export type ExportAssetSummary = {
  registryPath: string;
  assetCount: number;
  placeholderAssetCount: number;
  resolvedAssetCount: number;
};

export type ExportDependencySummary = {
  packageName: string;
  dependencyCount: number;
  devDependencyCount: number;
  scripts: string[];
  valid: boolean;
  issues: string[];
};

export type ExportValidationSummary = {
  passed: boolean;
  uniqueFilePaths: boolean;
  uniqueDirectoryPaths: boolean;
  requiredRootFilesPresent: boolean;
  routesValid: boolean;
  componentsValid: boolean;
  assetsValid: boolean;
  stylingValid: boolean;
  dependenciesValid: boolean;
  securityValid: boolean;
  unresolvedImportCount: number;
  unresolvedAssetCount: number;
  unknownTokenCount: number;
  detectedSecretCount: number;
  absoluteLocalPathCount: number;
  duplicatePathCount: number;
};

export type ExportPlaceholderEntry = {
  id: string;
  category: PlaceholderCategory;
  filePath: string;
  affectedRoute: string | null;
  affectedComponent: string | null;
  severity: ExportWarningSeverity;
  blocksLaunch: boolean;
  replacementInstruction: string;
};

export type ExportWarning = {
  code: string;
  severity: ExportWarningSeverity;
  message: string;
  filePath: string | null;
};

export type ZipReadyEntry = {
  relativePath: string;
  content: string;
  encoding: ExportFileEncoding;
  byteLength: number;
  checksum: string;
};

export type ExportableWebsiteProject = {
  exportVersion: string;
  generatedAt: string;
  checksum: string;
  projectMetadata: ExportProjectMetadata;
  manifest: ExportManifest;
  files: NormalizedExportFile[];
  directories: NormalizedExportDirectory[];
  virtualFiles: VirtualFile[];
  zipReadyEntries: ZipReadyEntry[];
  routeSummary: ExportRouteSummary[];
  componentSummary: ExportComponentSummary;
  assetSummary: ExportAssetSummary;
  dependencySummary: ExportDependencySummary;
  validationSummary: ExportValidationSummary;
  placeholderReport: ExportPlaceholderEntry[];
  warnings: ExportWarning[];
  routes: GeneratedRouteDescriptor[];
  componentDescriptors: ComponentDescriptor[];
};

export type ZipExportMetadata = {
  archiveSize: number;
  fileCount: number;
  directoryCount: number;
  checksum: string;
  generationTime: string;
};

export type ZipExportResult = {
  exportVersion: string;
  archive: Buffer;
  metadata: ZipExportMetadata;
  suggestedFilename: string;
  mimeType: "application/zip";
  verified: boolean;
};

export type ZipExportVerificationCheck = {
  name: string;
  passed: boolean;
  detail: string;
};

export type ZipExportVerificationReport = {
  passed: boolean;
  metadata: ZipExportMetadata;
  checks: ZipExportVerificationCheck[];
  deterministicChecksumMatch: boolean;
};

export type ExportSampleReport = {
  changedSourceFiles: number;
  exportFileCount: number;
  exportDirectoryCount: number;
  routeCount: number;
  componentCount: number;
  assetCount: number;
  placeholderCountByCategory: Record<PlaceholderCategory, number>;
  launchBlockingPlaceholderCount: number;
  warningCountBySeverity: Record<ExportWarningSeverity, number>;
  totalTextBytes: number;
  duplicatePathCount: number;
  unresolvedImportCount: number;
  unresolvedAssetCount: number;
  unknownTokenCount: number;
  detectedSecretCount: number;
  absoluteLocalPathCount: number;
  deterministicOutputResult: boolean;
  checksumStabilityResult: boolean;
  lintResult: boolean;
  buildResult: boolean;
  exportVerificationResult: boolean;
  fullProjectGeneratorVerificationResult: boolean;
  zipArchiveSize: number;
  zipFileCount: number;
  zipDirectoryCount: number;
  zipChecksum: string;
  zipDeterministicResult: boolean;
  zipVerificationResult: boolean;
  failedChecks: Array<{ name: string; passed: boolean; detail: string }>;
};
