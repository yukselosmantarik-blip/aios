import { runBusinessExportVerification } from "@/lib/core/verify-business-export";

const skipPreviewBuild = process.argv.includes("--skip-preview-build");

runBusinessExportVerification({ skipPreviewBuild })
  .then((report) => {
    if (report.passed) {
      console.log(
        [
          "verify:business-export passed",
          `exportFiles=${report.exportFileCount}`,
          `zipFiles=${report.zipFileCount}`,
          `zipBytes=${report.zipArchiveBytes}`,
          `checks=${report.checks.length}`,
          `previewBuild=${report.previewBuildPassed === null ? "skipped" : report.previewBuildPassed}`,
        ].join(" "),
      );
      process.exit(0);
    }

    console.error("verify:business-export failed:");
    for (const check of report.checks.filter((entry) => !entry.passed)) {
      console.error(`  [${check.suite}] ${check.name}: ${check.detail}`);
    }
    process.exit(1);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
