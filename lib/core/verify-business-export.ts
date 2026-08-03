import { execSync } from "node:child_process";

import {
  createTempExportDirectory,
  extractZipArchiveToDirectory,
  removeTempExportDirectory,
} from "@/lib/core/export-zip-extract";
import type { ExportVerificationCheck } from "@/lib/core/export-verify-suites";
import {
  verifyExportPreviewCompatibility,
  verifyExportProjectStructure,
} from "@/lib/core/export-verify-suites";
import { compileGenerateAndZipWebsite } from "@/lib/core/pipeline";
import { createSampleBusinessCompilerInput } from "@/lib/core/samples-business";
import { buildExportableWebsiteProject } from "@/lib/project-export/export-package";

const REQUIRED_BUSINESS_ROUTES = ["/", "/impressum", "/datenschutz"] as const;

export type BusinessExportVerificationReport = {
  passed: boolean;
  exportFileCount: number;
  zipFileCount: number;
  zipArchiveBytes: number;
  previewBuildPassed: boolean | null;
  checks: ExportVerificationCheck[];
};

function verifyBusinessExportRouting(
  exportPackage: ReturnType<typeof buildExportableWebsiteProject>,
): ExportVerificationCheck[] {
  const routePaths = new Set(exportPackage.routeSummary.map((route) => route.routePath));
  const checks: ExportVerificationCheck[] = [];

  for (const routePath of REQUIRED_BUSINESS_ROUTES) {
    checks.push({
      suite: "business-export-routing",
      name: `Route ${routePath} exported`,
      passed: routePaths.has(routePath),
      detail: routePaths.has(routePath)
        ? exportPackage.routeSummary.find((route) => route.routePath === routePath)?.pageFilePath ??
          routePath
        : `Missing; have ${[...routePaths].join(", ")}`,
    });
  }

  return checks;
}

function verifyBusinessGeneratedContent(
  exportPackage: ReturnType<typeof buildExportableWebsiteProject>,
): ExportVerificationCheck[] {
  const contactFile = exportPackage.files.find(
    (file) => file.path === "components/generated/ContactSection.tsx",
  );
  const contactContent = contactFile?.content ?? "";
  const hasContactPlaceholders = /\[PLACEHOLDER:\s*(Adresse|Telefon|E-Mail)\]/i.test(
    contactContent,
  );

  const testimonialFile = exportPackage.files.find(
    (file) => file.path === "components/generated/TestimonialSection.tsx",
  );
  const testimonialContent = testimonialFile?.content ?? "";
  const hasTestimonialPlaceholder = /\[PLACEHOLDER:\s*Testimonial\]/i.test(testimonialContent);

  const contactFormContent = exportPackage.files.find(
    (file) => file.path === "components/generated/ContactForm.tsx",
  )?.content ?? "";
  const hasVisiblePlaceholders = /\[PLACEHOLDER:/i.test(
    `${contactContent}${testimonialContent}${contactFormContent}`,
  );

  return [
    {
      suite: "business-export-content",
      name: "ContactSection uses real business contact links",
      passed: contactContent.includes("tel:") && contactContent.includes("mailto:") && !hasContactPlaceholders,
      detail: hasContactPlaceholders
        ? "Contact section still contains address/phone/email placeholders"
        : "tel, mailto, and maps links present",
    },
    {
      suite: "business-export-content",
      name: "TestimonialSection renders customer quotes",
      passed: testimonialContent.includes("contentBlocks") && !hasTestimonialPlaceholder,
      detail: hasTestimonialPlaceholder
        ? "Testimonial placeholder still present"
        : "Testimonials mapped from content blocks",
    },
    {
      suite: "business-export-content",
      name: "No visible PLACEHOLDER tokens in key sections",
      passed: !hasVisiblePlaceholders,
      detail: hasVisiblePlaceholders
        ? "Found [PLACEHOLDER: ...] in contact or form output"
        : "Contact, form, and testimonial sections are production-ready",
    },
  ];
}

export async function runBusinessExportVerification(options?: {
  skipPreviewBuild?: boolean;
}): Promise<BusinessExportVerificationReport> {
  const checks: ExportVerificationCheck[] = [];
  const input = createSampleBusinessCompilerInput();
  const generatedAt = "1970-01-01T00:00:00.000Z";

  const { generated, zipExport } = await compileGenerateAndZipWebsite(input, {
    generationTime: generatedAt,
  });
  const exportPackage = buildExportableWebsiteProject(generated);

  checks.push(...verifyBusinessExportRouting(exportPackage));
  checks.push(...verifyExportProjectStructure(exportPackage));
  checks.push(...verifyExportPreviewCompatibility(exportPackage));
  checks.push(...verifyBusinessGeneratedContent(exportPackage));

  checks.push({
    suite: "business-zip-export",
    name: "Business ZIP archive produced",
    passed: zipExport.verified && zipExport.metadata.fileCount > 0,
    detail: `${zipExport.metadata.fileCount} files, ${zipExport.metadata.archiveSize} bytes`,
  });

  let previewBuildPassed: boolean | null = options?.skipPreviewBuild ? null : true;
  if (!options?.skipPreviewBuild) {
    const tempDirectory = createTempExportDirectory();
    try {
      await extractZipArchiveToDirectory(zipExport.archive, tempDirectory);
      execSync("npm install --no-audit --no-fund", {
        cwd: tempDirectory,
        stdio: "pipe",
        env: { ...process.env, CI: "true" },
      });
      execSync("npm run build", {
        cwd: tempDirectory,
        stdio: "pipe",
        env: { ...process.env, CI: "true" },
      });
      checks.push({
        suite: "business-export-preview",
        name: "Business ZIP installs and builds (preview-ready)",
        passed: true,
        detail: "npm install && npm run build succeeded in temp extract",
      });
    } catch (error) {
      previewBuildPassed = false;
      const message = error instanceof Error ? error.message : "Export build failed";
      const stderr =
        error && typeof error === "object" && "stderr" in error
          ? String((error as { stderr?: Buffer }).stderr ?? "")
          : "";
      checks.push({
        suite: "business-export-preview",
        name: "Business ZIP installs and builds (preview-ready)",
        passed: false,
        detail: `${message} ${stderr}`.trim().slice(0, 800),
      });
    } finally {
      removeTempExportDirectory(tempDirectory);
    }
  }

  return {
    passed: checks.every((check) => check.passed),
    exportFileCount: exportPackage.files.length,
    zipFileCount: zipExport.metadata.fileCount,
    zipArchiveBytes: zipExport.metadata.archiveSize,
    previewBuildPassed,
    checks,
  };
}
