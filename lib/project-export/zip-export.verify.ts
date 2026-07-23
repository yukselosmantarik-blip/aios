import { compileSmashburgerSampleProject } from "@/lib/website-compiler/verify";
import { generateNextJsProject } from "@/lib/project-generator/generator";
import { buildExportableWebsiteProject } from "@/lib/project-export/export-package";
import { createZipExport } from "@/lib/project-export/zip-export";
import type {
  ExportableWebsiteProject,
  ZipExportResult,
  ZipExportVerificationReport,
} from "@/lib/project-export/types";
import { verifyDeterministicZipExport } from "@/lib/project-export/zip-verify";

export async function generateSmashburgerZipExportSample(): Promise<{
  exportPackage: ExportableWebsiteProject;
  zipExport: ZipExportResult;
  zipVerification: ZipExportVerificationReport;
}> {
  const { project } = compileSmashburgerSampleProject();
  const generatedAt = "1970-01-01T00:00:00.000Z";
  const { generated } = generateNextJsProject({ project, generatedAt });
  const exportPackage = buildExportableWebsiteProject(generated);

  const zipExport = await createZipExport(exportPackage, {
    generationTime: generatedAt,
  });

  const zipVerification = await verifyDeterministicZipExport(
    exportPackage,
    async (packageToExport, generationTime) => {
      const result = await createZipExport(packageToExport, {
        generationTime,
        skipVerification: true,
      });

      return {
        archive: result.archive,
        metadata: result.metadata,
      };
    },
  );

  return {
    exportPackage,
    zipExport,
    zipVerification,
  };
}

export function formatZipExportSampleReport(input: {
  zipExport: ZipExportResult;
  zipVerification: ZipExportVerificationReport;
}): string {
  const failedChecks = input.zipVerification.checks.filter((check) => !check.passed);

  return [
    "Sprint 8.6 ZIP Export Engine — Smashburger sample",
    "",
    `Archive size: ${input.zipExport.metadata.archiveSize} bytes`,
    `File count: ${input.zipExport.metadata.fileCount}`,
    `Directory count: ${input.zipExport.metadata.directoryCount}`,
    `Archive checksum: ${input.zipExport.metadata.checksum}`,
    `Generation time: ${input.zipExport.metadata.generationTime}`,
    `Suggested filename: ${input.zipExport.suggestedFilename}`,
    `MIME type: ${input.zipExport.mimeType}`,
    `Verified after creation: ${input.zipExport.verified}`,
    `Deterministic checksum match: ${input.zipVerification.deterministicChecksumMatch}`,
    `ZIP verification: ${input.zipVerification.passed ? "PASSED" : "FAILED"}`,
    "",
    failedChecks.length > 0
      ? ["Failed checks:", ...failedChecks.map((check) => `- ${check.name}: ${check.detail}`)].join(
          "\n",
        )
      : "All ZIP verification checks passed.",
  ].join("\n");
}
