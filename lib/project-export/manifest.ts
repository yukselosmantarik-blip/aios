import { CHECKSUM_ALGORITHM } from "@/lib/project-export/checksum";
import type {
  ExportManifest,
  ExportPlaceholderEntry,
  ExportProjectMetadata,
  ExportWarning,
  NormalizedExportFile,
} from "@/lib/project-export/types";
import { EXPORT_VERSION } from "@/lib/project-export/types";

export function buildExportManifest(input: {
  metadata: ExportProjectMetadata;
  generatedAt: string;
  files: NormalizedExportFile[];
  directoryCount: number;
  routeCount: number;
  componentCount: number;
  assetCount: number;
  checksum: string;
  placeholderReport: ExportPlaceholderEntry[];
  warnings: ExportWarning[];
  missingDataCount: number;
}): ExportManifest {
  const totalTextBytes = input.files.reduce((sum, file) => sum + file.byteLength, 0);
  const launchBlockingPlaceholderCount = input.placeholderReport.filter(
    (entry) => entry.blocksLaunch,
  ).length;

  return {
    projectId: input.metadata.projectId,
    projectName: input.metadata.projectName,
    exportVersion: EXPORT_VERSION,
    compilerVersion: input.metadata.compilerVersion,
    generatorVersion: input.metadata.generatorVersion,
    sourceBlueprintId: input.metadata.sourceBlueprintId,
    sourceBriefId: input.metadata.sourceBriefId,
    generatedAt: input.generatedAt,
    fileCount: input.files.length,
    directoryCount: input.directoryCount,
    routeCount: input.routeCount,
    componentCount: input.componentCount,
    assetCount: input.assetCount,
    totalTextBytes,
    checksumAlgorithm: CHECKSUM_ALGORITHM,
    checksum: input.checksum,
    missingDataCount: input.missingDataCount,
    warningCount: input.warnings.length,
    launchBlockingPlaceholderCount,
  };
}

export function serializeExportManifest(manifest: ExportManifest): string {
  return `${JSON.stringify(manifest, null, 2)}\n`;
}
