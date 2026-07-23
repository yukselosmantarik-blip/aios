import type { CompiledWebsiteProject } from "@/lib/website-compiler/types";
import { buildVirtualFile } from "@/lib/project-generator/tree";
import type { VirtualFile } from "@/lib/project-generator/types";
import {
  isFeatureEnabled,
  primaryLanguageCopy,
} from "@/lib/project-generator/react-utils";

function layoutMetadata(project: CompiledWebsiteProject): string {
  const seo = project.seo[0] ?? project.pages[0]?.seo;
  if (!seo) {
    return [
      "export const metadata: Metadata = {",
      `  title: ${JSON.stringify(project.metadata.projectName)},`,
      `  description: ${JSON.stringify(project.business.websiteGoal.slice(0, 160))},`,
      "};",
    ].join("\n");
  }

  return [
    "export const metadata: Metadata = {",
    `  title: { default: ${JSON.stringify(project.metadata.projectName)}, template: ${JSON.stringify(seo.titlePattern)} },`,
    `  description: ${JSON.stringify(project.business.websiteGoal.slice(0, 160))},`,
    "  metadataBase: undefined,",
    `  robots: ${JSON.stringify(seo.robots)},`,
    "  openGraph: {",
    `    title: ${JSON.stringify(project.metadata.projectName)},`,
    `    description: ${JSON.stringify(project.business.websiteGoal.slice(0, 120))},`,
    "    type: 'website',",
    "  },",
    "};",
  ].join("\n");
}

export function buildRootLayoutFile(project: CompiledWebsiteProject): VirtualFile {
  const copy = primaryLanguageCopy(project);
  const showMobileSticky =
    isFeatureEnabled(project.featureFlags, "onlineOrdering") ||
    isFeatureEnabled(project.featureFlags, "contactForm");

  const layoutImports = [
    "import type { Metadata } from 'next';",
    "import type { ReactNode } from 'react';",
    "import '@/styles/globals.css';",
    "import { SiteFooter, SiteHeader } from '@/components/generated';",
    showMobileSticky ? "import { MobileStickyCTA } from '@/components/generated';" : "",
    "import { variants } from '@/styles/tailwind-mapping';",
  ].filter(Boolean);

  const content = [
    "/**",
    " * GENERATED ROOT LAYOUT — Sprint 8.2C",
    " */",
    "",
    ...layoutImports,
    "",
    layoutMetadata(project),
    "",
    "type RootLayoutProps = {",
    "  children: ReactNode;",
    "};",
    "",
    "export default function RootLayout({ children }: RootLayoutProps) {",
    "  return (",
    `    <html lang="${project.metadata.locale.split("-")[0] || project.metadata.language}">`,
    '      <body className={variants.bodyRoot}>',
    `        <a href="#main-content" className={variants.skipLink}>${copy.skipLink}</a>`,
    "        <SiteHeader />",
    '        <main id="main-content">{children}</main>',
    "        <SiteFooter />",
    showMobileSticky ? "        <MobileStickyCTA />" : "",
    "      </body>",
    "    </html>",
    "  );",
    "}",
    "",
  ]
    .filter((line, index, lines) => !(line === "" && lines[index - 1] === ""))
    .join("\n");

  return buildVirtualFile("app/layout.tsx", "react-layout", content, {
    description: "Generated App Router root layout",
    implementationStatus: "placeholder",
  });
}
