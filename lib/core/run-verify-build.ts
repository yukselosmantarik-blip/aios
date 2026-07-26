import { runBuildVerification } from "@/lib/core/verify-build";

const report = runBuildVerification();

if (report.passed) {
  console.log(
    `verify:build passed (routes=${report.compileRouteCount}, checks=${report.checks.length})`,
  );
  process.exit(0);
}

console.error("verify:build failed:");
for (const check of report.checks.filter((entry) => !entry.passed)) {
  console.error(`  [${check.suite}] ${check.name}: ${check.detail}`);
}
process.exit(1);
