import { runExportVerification } from "@/lib/core/verify-export";

const skipPreviewBuild = process.argv.includes("--skip-preview-build");

runExportVerification({ skipPreviewBuild })
  .then((report) => {
    if (report.passed) {
      console.log(
        [
          "verify:export passed",
          `exportFiles=${report.exportFileCount}`,
          `zipFiles=${report.zipFileCount}`,
          `zipBytes=${report.zipArchiveBytes}`,
          `checks=${report.checks.length}`,
          `previewBuild=${report.previewBuildPassed === null ? "skipped" : report.previewBuildPassed}`,
        ].join(" "),
      );
      process.exit(0);
    }

    console.error("verify:export failed:");
    for (const check of report.checks.filter((entry) => !entry.passed)) {
      console.error(`  [${check.suite}] ${check.name}: ${check.detail}`);
    }
    process.exit(1);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
