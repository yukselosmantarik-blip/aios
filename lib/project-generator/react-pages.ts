import type { CompiledWebsiteProject } from "@/lib/website-compiler/types";
import { buildVirtualFile, routePathToPageFilePath } from "@/lib/project-generator/tree";
import type { VirtualFile } from "@/lib/project-generator/types";
import { isPremiumRestaurantLanding } from "@/lib/industries/restaurant/landing";
import { isBusinessServiceLanding } from "@/lib/industries/business/landing";
import { buildRootLayoutFile } from "@/lib/project-generator/react-layout";
import { buildRouteBoundaryFiles } from "@/lib/project-generator/react-route-files";
import {
  buildMetadataObjectLiteral,
  buildPageConfig,
  collectSectionComponents,
  pageComponentName,
  pageConfigExportName,
  pageConfigFilePath,
  serializePageConfigModule,
  type GeneratedPageConfig,
  type SectionComponentName,
} from "@/lib/project-generator/react-utils";

function buildPageFile(config: GeneratedPageConfig, project: CompiledWebsiteProject): VirtualFile {
  const page = project.pages.find((entry) => entry.id === config.pageId);
  const route = project.routes.find((entry) => entry.id === page?.routeId);
  const pageFilePath = routePathToPageFilePath(route?.routePath ?? config.route);
  const configExport = pageConfigExportName(config.pageId);
  const configImportPath = `@/content/pages/${pageConfigFilePath(config.pageId).replace("content/pages/", "").replace(".ts", "")}`;
  const componentNames = collectSectionComponents(config);
  const componentImports = componentNames.map((name) => `  ${name},`).join("\n");

  const warningComments = config.implementationWarnings
    .map((warning) => `// warning: ${warning}`)
    .join("\n");

  const patternComment = `// selected patterns: ${config.selectedPatternIds.join(", ")}`;

  const sectionElements = config.sections
    .map((section, index) => {
      return [
        `      <${section.componentName}`,
        `        section={${configExport}.sections[${index}]}`,
        "      />",
      ].join("\n");
    })
    .join("\n");

  const internalLinksBlock =
    !isPremiumRestaurantLanding(project) &&
    !isBusinessServiceLanding(project) &&
    config.internalLinks.length > 0
      ? [
          '      <nav aria-label="Interne Links">',
          "        <ul>",
          ...config.internalLinks.map(
            (link) =>
              `          <li><a href="${link}">${project.routes.find((entry) => entry.routePath === link)?.navigationLabel ?? link}</a></li>`,
          ),
          "        </ul>",
          "      </nav>",
        ].join("\n")
      : "";

  const content = [
    "/**",
    ` * GENERATED PAGE — ${config.pageName}`,
    ` * Route: ${config.route}`,
    " * Sprint 8.2B/8.2C — page-level React",
    " */",
    "",
    "import type { Metadata } from 'next';",
    `import { ${configExport} } from '${configImportPath}';`,
    "import {",
    componentImports,
    "} from '@/components/generated';",
    "",
    buildMetadataObjectLiteral(config.seo, config.route),
    "",
    warningComments ? warningComments : "",
    patternComment,
    "",
    `export default function ${pageComponentName(config.pageRole, config.pageName)}() {`,
    "  return (",
    '    <article className="pg-page">',
    config.pageRole === "home"
      ? `      {/* H1 direction: ${config.h1Direction} */}`
      : `      {/* page objective rendered via sections for ${config.pageName} */}`,
    internalLinksBlock,
    sectionElements,
    "    </article>",
    "  );",
    "}",
    "",
  ]
    .filter((line, index, lines) => !(line === "" && lines[index - 1] === ""))
    .join("\n");

  return buildVirtualFile(pageFilePath, "react-page", content, {
    description: `Generated React page for ${config.pageName}`,
    routePath: config.route,
    pageId: config.pageId,
    pageRole: config.pageRole,
    implementationStatus: "placeholder",
  });
}

function buildPageConfigFile(config: GeneratedPageConfig): VirtualFile {
  return buildVirtualFile(pageConfigFilePath(config.pageId), "page-config", serializePageConfigModule(config), {
    description: `Page configuration for ${config.pageName}`,
    pageId: config.pageId,
    pageRole: config.pageRole,
    implementationStatus: "metadata-only",
  });
}

export function buildReactPageFiles(project: CompiledWebsiteProject): VirtualFile[] {
  const pageConfigs = project.pages
    .map((page) => buildPageConfig(page, project))
    .sort((left, right) => left.pageId.localeCompare(right.pageId));

  return [
    buildRootLayoutFile(project),
    ...buildRouteBoundaryFiles(project),
    ...pageConfigs.map(buildPageConfigFile),
    ...pageConfigs.map((config) => buildPageFile(config, project)),
  ];
}

export function countTsxFiles(files: VirtualFile[]): number {
  return files.filter((file) => file.path.endsWith(".tsx")).length;
}

export function countPageConfigFiles(files: VirtualFile[]): number {
  return files.filter((file) => file.kind === "page-config").length;
}

export function countPlaceholderComponents(files: VirtualFile[]): number {
  return files.filter((file) => file.path.startsWith("components/generated/") && file.path.endsWith(".tsx")).length;
}

export function countReactPages(files: VirtualFile[]): number {
  return files.filter((file) => file.kind === "react-page").length;
}

export function collectRequiredSectionComponentNames(project: CompiledWebsiteProject): SectionComponentName[] {
  const names = new Set<SectionComponentName>();
  for (const page of project.pages) {
    for (const name of collectSectionComponents(buildPageConfig(page, project))) {
      names.add(name);
    }
  }
  return [...names].sort();
}
