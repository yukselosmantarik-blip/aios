import type { CompiledComponent, CompiledWebsiteProject } from "@/lib/website-compiler/types";
import {
  buildVirtualFile,
  joinProjectPath,
  routePathToAppSegment,
  routePathToPageFilePath,
} from "@/lib/project-generator/tree";
import type {
  ComponentDescriptor,
  GeneratedRouteDescriptor,
  VirtualFile,
} from "@/lib/project-generator/types";

const SECTION_DESCRIPTOR_ALIASES: Record<string, string> = {
  Gallery: "GallerySection",
  MenuCategory: "MenuSection",
  MapBlock: "MapSection",
  HeroSection: "HeroSection",
  CTASection: "CTASection",
  ContactForm: "ContactForm",
  SiteHeader: "SiteHeader",
  SiteFooter: "SiteFooter",
};

function json(value: unknown, indent = 2): string {
  return JSON.stringify(value, null, indent);
}

function metadataShellExport(
  exportName: string,
  payload: Record<string, unknown>,
  note: string,
): string {
  return [
    "/**",
    " * GENERATED PROJECT SHELL — Sprint 8.2A",
    ` * ${note}`,
    " * React implementation is intentionally deferred.",
    " */",
    "",
    `export const ${exportName} = ${json(payload)} as const;`,
    "",
    `export type ${exportName.replace(/Metadata$/, "")} = typeof ${exportName};`,
    "",
  ].join("\n");
}

function descriptorShellExport(
  componentName: string,
  payload: Record<string, unknown>,
): string {
  return [
    "/**",
    " * GENERATED COMPONENT DESCRIPTOR — Sprint 8.2A",
    ` * Component: ${componentName}`,
    " * No JSX in this sprint.",
    " */",
    "",
    `export const ${componentName}Descriptor = ${json(payload)} as const;`,
    "",
    `export type ${componentName}Descriptor = typeof ${componentName}Descriptor;`,
    "",
  ].join("\n");
}

export function buildRootConfigFiles(project: CompiledWebsiteProject): VirtualFile[] {
  const slug = project.metadata.projectId.replace(/[^a-z0-9-]+/gi, "-").toLowerCase();
  const packageJson = {
    name: slug || "generated-website",
    version: "0.1.0",
    private: true,
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
      lint: "eslint",
    },
    dependencies: {
      next: "16.2.10",
      react: "19.2.4",
      "react-dom": "19.2.4",
    },
    devDependencies: {
      "@tailwindcss/postcss": "^4",
      "@types/node": "^20",
      "@types/react": "^19",
      "@types/react-dom": "^19",
      eslint: "^9",
      "eslint-config-next": "16.2.10",
      tailwindcss: "^4",
      typescript: "^5",
    },
  };

  const tsconfig = {
    compilerOptions: {
      target: "ES2017",
      lib: ["dom", "dom.iterable", "esnext"],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: "esnext",
      moduleResolution: "bundler",
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: "react-jsx",
      incremental: true,
      plugins: [{ name: "next" }],
      paths: { "@/*": ["./*"] },
    },
    include: [
      "next-env.d.ts",
      "**/*.ts",
      "**/*.tsx",
      ".next/types/**/*.ts",
      ".next/dev/types/**/*.ts",
      "**/*.mts",
    ],
    exclude: ["node_modules"],
  };

  const tailwindConfig = [
    "import type { Config } from 'tailwindcss';",
    "",
    "const config: Config = {",
    "  content: [",
    "    './app/**/*.{js,ts,jsx,tsx,mdx}',",
    "    './components/**/*.{js,ts,jsx,tsx,mdx}',",
    "  ],",
    "  theme: {",
    "    extend: {",
    `      colors: { primary: '${project.theme.primaryColor}', secondary: '${project.theme.secondaryColor}' },`,
    "    },",
    "  },",
    "  plugins: [],",
    "};",
    "",
    "export default config;",
    "",
  ].join("\n");

  const nextConfig = [
    "import type { NextConfig } from 'next';",
    "",
    "const nextConfig: NextConfig = {",
    "  /* generated project config */",
    "};",
    "",
    "export default nextConfig;",
    "",
  ].join("\n");

  const postcssConfig = [
    "const config = {",
    "  plugins: {",
    "    '@tailwindcss/postcss': {},",
    "  },",
    "};",
    "",
    "export default config;",
    "",
  ].join("\n");

  const eslintConfig = [
    "import { defineConfig, globalIgnores } from 'eslint/config';",
    "import nextVitals from 'eslint-config-next/core-web-vitals';",
    "import nextTs from 'eslint-config-next/typescript';",
    "",
    "const eslintConfig = defineConfig([",
    "  ...nextVitals,",
    "  ...nextTs,",
    "  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),",
    "]);",
    "",
    "export default eslintConfig;",
    "",
  ].join("\n");

  const readme = [
    `# ${project.metadata.projectName}`,
    "",
    "Generated Next.js App Router project shell (Sprint 8.2A).",
    "",
    "## Status",
    "",
    "- Virtual project tree only",
    "- Route metadata prepared",
    "- Component descriptors prepared",
    "- React pages and UI components deferred to later sprints",
    "",
    "## Routes",
    "",
    ...project.routes.map(
      (route) => `- \`${route.routePath}\` → ${route.navigationLabel} (${route.pageRole})`,
    ),
    "",
  ].join("\n");

  const envExample = [
    "# Generated website environment placeholders",
    "NEXT_PUBLIC_SITE_URL=https://example.com",
    "NEXT_PUBLIC_BUSINESS_NAME=" + project.business.businessName,
    "",
  ].join("\n");

  return [
    buildVirtualFile("package.json", "config", `${json(packageJson)}\n`, {
      description: "Project package manifest",
      implementationStatus: "metadata-only",
    }),
    buildVirtualFile("tsconfig.json", "config", `${json(tsconfig)}\n`, {
      description: "TypeScript configuration",
      implementationStatus: "metadata-only",
    }),
    buildVirtualFile("tailwind.config.ts", "config", tailwindConfig, {
      description: "Tailwind CSS configuration",
      implementationStatus: "metadata-only",
    }),
    buildVirtualFile("next.config.ts", "config", nextConfig, {
      description: "Next.js configuration",
      implementationStatus: "metadata-only",
    }),
    buildVirtualFile("postcss.config.js", "config", postcssConfig, {
      description: "PostCSS configuration",
      implementationStatus: "metadata-only",
    }),
    buildVirtualFile("eslint.config.js", "config", eslintConfig, {
      description: "ESLint configuration",
      implementationStatus: "metadata-only",
    }),
    buildVirtualFile("README.md", "documentation", readme, {
      description: "Project README",
      implementationStatus: "metadata-only",
    }),
    buildVirtualFile(".env.example", "config", envExample, {
      description: "Environment variable placeholders",
      implementationStatus: "placeholder",
    }),
  ];
}

export function buildAppShellFiles(project: CompiledWebsiteProject): VirtualFile[] {
  const files: VirtualFile[] = [];
  const layoutMetadata = {
    projectId: project.metadata.projectId,
    projectName: project.metadata.projectName,
    language: project.metadata.language,
    locale: project.metadata.locale,
    businessName: project.business.businessName,
    navigationItems: project.navigation.primaryNavigationItems.map((item) => ({
      label: item.label,
      routePath: item.routePath,
    })),
    footerVariant: project.footer.variant,
    theme: project.theme,
  };

  files.push(
    buildVirtualFile(
      "app/layout.tsx",
      "layout-shell",
      metadataShellExport("layoutMetadata", layoutMetadata, "Root layout metadata shell"),
      {
        description: "Root layout metadata shell",
        implementationStatus: "metadata-only",
      },
    ),
    buildVirtualFile(
      "app/loading.tsx",
      "layout-shell",
      metadataShellExport(
        "loadingMetadata",
        { strategy: "route-segment-loading", fallback: "skeleton" },
        "Global loading shell",
      ),
      {
        description: "Global loading shell",
        implementationStatus: "metadata-only",
      },
    ),
    buildVirtualFile(
      "app/error.tsx",
      "layout-shell",
      metadataShellExport(
        "errorMetadata",
        { boundary: "app", recoverable: true },
        "Global error boundary shell",
      ),
      {
        description: "Global error boundary shell",
        implementationStatus: "metadata-only",
      },
    ),
    buildVirtualFile(
      "app/not-found.tsx",
      "layout-shell",
      metadataShellExport(
        "notFoundMetadata",
        { statusCode: 404, routePath: "/404" },
        "Global not-found shell",
      ),
      {
        description: "Global not-found shell",
        implementationStatus: "metadata-only",
      },
    ),
  );

  for (const page of project.pages) {
    const route = project.routes.find((entry) => entry.id === page.routeId);
    if (!route) {
      continue;
    }

    const pageFilePath = routePathToPageFilePath(route.routePath);
    const payload = {
      pageId: page.id,
      routeId: route.id,
      pageName: page.pageName,
      pageRole: page.pageRole,
      routePath: route.routePath,
      appSegment: routePathToAppSegment(route.routePath),
      seo: page.seo,
      sections: page.orderedSections.map((section) => ({
        id: section.id,
        name: section.name,
        type: section.type,
        order: section.order,
      })),
      componentTree: page.componentTree,
      primaryCta: page.primaryCta,
      secondaryCta: page.secondaryCta,
      hierarchyScore: page.hierarchyScore,
    };

    files.push(
      buildVirtualFile(
        pageFilePath,
        "route-shell",
        metadataShellExport("routeMetadata", payload, `Route shell for ${route.routePath}`),
        {
          description: `Route metadata shell for ${route.pageName}`,
          routePath: route.routePath,
          pageId: page.id,
          pageRole: page.pageRole,
          implementationStatus: "metadata-only",
        },
      ),
    );
  }

  return files;
}

export function buildSupportFiles(
  project: CompiledWebsiteProject,
  options?: { includeJsonPageContent?: boolean },
): VirtualFile[] {
  const siteConfig = {
    metadata: project.metadata,
    business: project.business,
    site: project.site,
    locale: project.locale,
    theme: project.theme,
    navigation: project.navigation,
    footer: project.footer,
    featureFlags: project.featureFlags,
    missingData: project.missingData,
  };

  const tokenExport = {
    designTokens: project.designTokens,
    source: "compiled-website-project",
  };

  const siteTypes = metadataShellExport(
    "siteTypesMetadata",
    {
      routes: project.routes.map((route) => ({
        id: route.id,
        routePath: route.routePath,
        pageRole: route.pageRole,
      })),
      pages: project.pages.map((page) => ({
        id: page.id,
        pageName: page.pageName,
        routeId: page.routeId,
      })),
    },
    "Shared site type metadata",
  );

  const componentTypes = metadataShellExport(
    "componentTypesMetadata",
    {
      components: project.components.map((component) => ({
        id: component.id,
        name: component.name,
        category: component.category,
      })),
    },
    "Shared component type metadata",
  );

  const contentFiles = options?.includeJsonPageContent === false
    ? []
    : project.pages.map((page) => {
        const route = project.routes.find((entry) => entry.id === page.routeId);
        const slug = route ? routePathToAppSegment(route.routePath) || "home" : page.pageName;
        return buildVirtualFile(
          joinProjectPath("content", "pages", `${slug}.json`),
          "content",
          `${json(
            {
              pageId: page.id,
              pageName: page.pageName,
              contentBlocks: project.contentBlocks
                .filter((block) => block.pageUsage.includes(page.id))
                .map((block) => ({
                  id: block.id,
                  type: block.type,
                  isPlaceholder: block.isPlaceholder,
                  content: block.content,
                })),
            },
            2,
          )}\n`,
          {
            description: `Structured content placeholder for ${page.pageName}`,
            pageId: page.id,
            implementationStatus: "placeholder",
          },
        );
      });

  return [
    buildVirtualFile(
      "lib/site-config.ts",
      "types",
      metadataShellExport("siteConfig", siteConfig, "Compiled site configuration export"),
      {
        description: "Site configuration export",
        implementationStatus: "metadata-only",
      },
    ),
    buildVirtualFile(
      "lib/tokens.ts",
      "types",
      metadataShellExport("designTokens", tokenExport, "Design token export"),
      {
        description: "Design token export",
        implementationStatus: "metadata-only",
      },
    ),
    buildVirtualFile("types/site.ts", "types", siteTypes, {
      description: "Site-level type metadata",
      implementationStatus: "metadata-only",
    }),
    buildVirtualFile("types/components.ts", "types", componentTypes, {
      description: "Component type metadata",
      implementationStatus: "metadata-only",
    }),
    ...contentFiles,
  ];
}

export function buildPublicAssetFiles(project: CompiledWebsiteProject): VirtualFile[] {
  const logoSvg = [
    "<!-- GENERATED PLACEHOLDER: logo.svg -->",
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 32" role="img" aria-label="${project.business.businessName} logo placeholder">`,
    "  <rect width=\"120\" height=\"32\" fill=\"transparent\" stroke=\"currentColor\" />",
    "  <text x=\"8\" y=\"20\" font-size=\"10\">LOGO PLACEHOLDER</text>",
    "</svg>",
    "",
  ].join("\n");

  return [
    buildVirtualFile("public/logo.svg", "asset-placeholder", logoSvg, {
      description: "Logo asset placeholder",
      assetRole: "logo",
      isPlaceholder: true,
      implementationStatus: "placeholder",
    }),
    buildVirtualFile(
      "public/favicon.ico",
      "asset-placeholder",
      "[PLACEHOLDER: binary favicon asset — not generated in Sprint 8.2A]\n",
      {
        description: "Favicon placeholder",
        assetRole: "favicon",
        isPlaceholder: true,
        implementationStatus: "placeholder",
      },
    ),
    buildVirtualFile(
      "public/og-image.jpg",
      "asset-placeholder",
      "[PLACEHOLDER: binary OG image asset — not generated in Sprint 8.2A]\n",
      {
        description: "Open Graph image placeholder",
        assetRole: "og-image",
        isPlaceholder: true,
        implementationStatus: "placeholder",
      },
    ),
    buildVirtualFile(
      "public/images/.gitkeep",
      "asset-placeholder",
      "",
      {
        description: "Images directory placeholder",
        assetRole: "images-directory",
        isPlaceholder: true,
        implementationStatus: "placeholder",
      },
    ),
  ];
}

export function resolveDescriptorName(component: CompiledComponent): string {
  return SECTION_DESCRIPTOR_ALIASES[component.name] ?? component.name;
}

export function buildComponentDescriptorFiles(
  project: CompiledWebsiteProject,
): { files: VirtualFile[]; descriptors: ComponentDescriptor[] } {
  const descriptors: ComponentDescriptor[] = project.components.map((component) => {
    const name = resolveDescriptorName(component);
    return {
      id: component.id,
      name,
      filePath: joinProjectPath("components", `${name}.descriptor.ts`),
      category: component.category,
      purpose: component.purpose,
      propsSchema: component.propsSchema,
      variants: component.variants,
      pageUsage: component.pageUsage,
      sourceComponentId: component.id,
      implementationStatus: "descriptor-only",
    };
  });

  const files = descriptors.map((descriptor) => {
    const source = project.components.find((component) => component.id === descriptor.sourceComponentId);
    const payload = {
      id: descriptor.id,
      name: descriptor.name,
      category: descriptor.category,
      purpose: descriptor.purpose,
      propsSchema: descriptor.propsSchema,
      variants: descriptor.variants,
      states: source?.states ?? [],
      responsiveBehavior: source?.responsiveBehavior ?? "",
      accessibilityRequirements: source?.accessibilityRequirements ?? [],
      motionBehavior: source?.motionBehavior ?? "",
      designTokenReferences: source?.designTokenReferences ?? [],
      pageUsage: descriptor.pageUsage,
      missingDataRequirements: source?.missingDataRequirements ?? [],
      implementationStatus: descriptor.implementationStatus,
    };

    return buildVirtualFile(
      descriptor.filePath,
      "component-descriptor",
      descriptorShellExport(descriptor.name, payload),
      {
        description: `Component descriptor for ${descriptor.name}`,
        componentName: descriptor.name,
        implementationStatus: "descriptor",
      },
    );
  });

  const registryContent = [
    "/**",
    " * GENERATED COMPONENT REGISTRY — Sprint 8.2A",
    " * Descriptor-only registry. No JSX.",
    " */",
    "",
    ...descriptors.map(
      (descriptor) =>
        `import { ${descriptor.name}Descriptor } from './${descriptor.name}.descriptor';`,
    ),
    "",
    "export const componentRegistry = {",
    ...descriptors.map(
      (descriptor) => `  ${descriptor.name}: ${descriptor.name}Descriptor,`,
    ),
    "} as const;",
    "",
    "export type ComponentRegistry = typeof componentRegistry;",
    "",
    "export const componentDescriptorNames = [",
    ...descriptors.map((descriptor) => `  '${descriptor.name}',`),
    "] as const;",
    "",
  ].join("\n");

  files.push(
    buildVirtualFile("components/registry.ts", "registry", registryContent, {
      description: "Component descriptor registry",
      implementationStatus: "descriptor",
    }),
  );

  return { files, descriptors };
}

export function buildRouteDescriptors(project: CompiledWebsiteProject): GeneratedRouteDescriptor[] {
  return project.routes
    .map((route) => {
      const page = project.pages.find((entry) => entry.routeId === route.id);
      return {
        id: route.id,
        pageName: route.pageName,
        routePath: route.routePath,
        appSegment: routePathToAppSegment(route.routePath),
        pageFilePath: routePathToPageFilePath(route.routePath),
        pageRole: route.pageRole,
        isIndexable: route.isIndexable,
        seoTitle: page?.seo.title ?? route.navigationLabel,
      };
    })
    .sort((left, right) => left.routePath.localeCompare(right.routePath));
}

export function buildAllVirtualFiles(
  project: CompiledWebsiteProject,
  options?: { includeAppShells?: boolean; includeJsonPageContent?: boolean },
): {
  files: VirtualFile[];
  routes: GeneratedRouteDescriptor[];
  componentDescriptors: ComponentDescriptor[];
} {
  const includeAppShells = options?.includeAppShells ?? true;
  const includeJsonPageContent = options?.includeJsonPageContent ?? true;
  const { files: componentFiles, descriptors } = buildComponentDescriptorFiles(project);
  const files = [
    ...buildRootConfigFiles(project),
    ...(includeAppShells ? buildAppShellFiles(project) : []),
    ...buildSupportFiles(project, { includeJsonPageContent }),
    ...buildPublicAssetFiles(project),
    ...componentFiles,
  ];

  return {
    files,
    routes: buildRouteDescriptors(project),
    componentDescriptors: descriptors.sort((left, right) => left.name.localeCompare(right.name)),
  };
}
