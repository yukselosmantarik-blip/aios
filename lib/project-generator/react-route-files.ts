import type { CompiledWebsiteProject } from "@/lib/website-compiler/types";
import { buildVirtualFile, joinProjectPath } from "@/lib/project-generator/tree";
import type { VirtualFile } from "@/lib/project-generator/types";
import {
  primaryLanguageCopy,
  routeSegmentDirectory,
  shouldGenerateRouteError,
  shouldGenerateRouteLoading,
} from "@/lib/project-generator/react-utils";

export function buildRootLoadingFile(project: CompiledWebsiteProject): VirtualFile {
  const copy = primaryLanguageCopy(project);

  const content = [
    "/**",
    " * GENERATED ROOT LOADING — Sprint 8.2B",
    " */",
    "",
    "export default function Loading() {",
    "  return (",
    '    <div className="pg-loading" role="status" aria-live="polite" aria-busy="true">',
    `      <p>${copy.loading}</p>`,
    '      <div className="pg-loading__skeleton" aria-hidden="true">',
    '        <div className="pg-loading__skeleton-block" />',
    '        <div className="pg-loading__skeleton-block" />',
    "      </div>",
    "    </div>",
    "  );",
    "}",
    "",
  ].join("\n");

  return buildVirtualFile("app/loading.tsx", "react-route", content, {
    description: "Generated root loading state",
    implementationStatus: "placeholder",
  });
}

export function buildRootErrorFile(project: CompiledWebsiteProject): VirtualFile {
  const copy = primaryLanguageCopy(project);

  const content = [
    "/**",
    " * GENERATED ROOT ERROR BOUNDARY — Sprint 8.2B",
    " */",
    "",
    "'use client';",
    "",
    "type ErrorPageProps = {",
    "  error: Error & { digest?: string };",
    "  reset: () => void;",
    "};",
    "",
    "export default function ErrorPage({ reset }: ErrorPageProps) {",
    "  return (",
    '    <section className="pg-error" role="alert">',
    `      <h1>${copy.errorTitle}</h1>`,
    `      <p>${copy.errorMessage}</p>`,
    "      <button type=\"button\" onClick={() => reset()}>",
    `        ${copy.errorRetry}`,
    "      </button>",
    "    </section>",
    "  );",
    "}",
    "",
  ].join("\n");

  return buildVirtualFile("app/error.tsx", "react-route", content, {
    description: "Generated root error boundary",
    implementationStatus: "placeholder",
  });
}

export function buildNotFoundFile(project: CompiledWebsiteProject): VirtualFile {
  const copy = primaryLanguageCopy(project);

  const content = [
    "/**",
    " * GENERATED NOT FOUND — Sprint 8.2B",
    " */",
    "",
    "import Link from 'next/link';",
    "",
    "export default function NotFound() {",
    "  return (",
    '    <section className="pg-not-found">',
    `      <h1>${copy.notFoundTitle}</h1>`,
    `      <p>${copy.notFoundMessage}</p>`,
    '      <Link href="/">',
    `        ${copy.notFoundHome}`,
    "      </Link>",
    "    </section>",
    "  );",
    "}",
    "",
  ].join("\n");

  return buildVirtualFile("app/not-found.tsx", "react-route", content, {
    description: "Generated not-found page",
    implementationStatus: "placeholder",
  });
}

function buildRouteLoadingFile(routePath: string, copy: ReturnType<typeof primaryLanguageCopy>): VirtualFile {
  const directory = routeSegmentDirectory(routePath);
  const content = [
    "/**",
    ` * GENERATED ROUTE LOADING — ${routePath}`,
    " */",
    "",
    "export default function Loading() {",
    "  return (",
    '    <div className="pg-loading pg-loading--route" role="status" aria-live="polite" aria-busy="true">',
    `      <p>${copy.loading}</p>`,
    "    </div>",
    "  );",
    "}",
    "",
  ].join("\n");

  return buildVirtualFile(joinProjectPath(directory, "loading.tsx"), "react-route", content, {
    description: `Route loading state for ${routePath}`,
    routePath,
    implementationStatus: "placeholder",
  });
}

function buildRouteErrorFile(routePath: string, copy: ReturnType<typeof primaryLanguageCopy>): VirtualFile {
  const directory = routeSegmentDirectory(routePath);
  const content = [
    "/**",
    ` * GENERATED ROUTE ERROR — ${routePath}`,
    " */",
    "",
    "'use client';",
    "",
    "type RouteErrorProps = {",
    "  error: Error & { digest?: string };",
    "  reset: () => void;",
    "};",
    "",
    "export default function RouteError({ reset }: RouteErrorProps) {",
    "  return (",
    '    <section className="pg-error pg-error--route" role="alert">',
    `      <h2>${copy.errorTitle}</h2>`,
    `      <p>${copy.errorMessage}</p>`,
    "      <button type=\"button\" onClick={() => reset()}>",
    `        ${copy.errorRetry}`,
    "      </button>",
    "    </section>",
    "  );",
    "}",
    "",
  ].join("\n");

  return buildVirtualFile(joinProjectPath(directory, "error.tsx"), "react-route", content, {
    description: `Route error boundary for ${routePath}`,
    routePath,
    implementationStatus: "placeholder",
  });
}

export function buildRouteBoundaryFiles(project: CompiledWebsiteProject): VirtualFile[] {
  const copy = primaryLanguageCopy(project);
  const files: VirtualFile[] = [
    buildRootLoadingFile(project),
    buildRootErrorFile(project),
    buildNotFoundFile(project),
  ];

  for (const page of project.pages) {
    const route = project.routes.find((entry) => entry.id === page.routeId);
    if (!route || route.routePath === "/") {
      continue;
    }

    if (shouldGenerateRouteLoading(page, project)) {
      files.push(buildRouteLoadingFile(route.routePath, copy));
    }
    if (shouldGenerateRouteError(page, project)) {
      files.push(buildRouteErrorFile(route.routePath, copy));
    }
  }

  return files;
}

export function countLoadingFiles(files: VirtualFile[]): number {
  return files.filter((file) => file.path.endsWith("loading.tsx")).length;
}

export function countErrorFiles(files: VirtualFile[]): number {
  return files.filter((file) => file.path.endsWith("error.tsx")).length;
}
