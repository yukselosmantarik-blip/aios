import type { CompiledWebsiteProject } from "@/lib/website-compiler/types";
import type { RestaurantBusinessProfile } from "@/lib/business-profiles/types";
import { resolveFooterBusinessProfile } from "@/lib/project-generator/restaurant-business-profile";
import { buildVirtualFile, routePathToAppSegment, routePathToPageFilePath } from "@/lib/project-generator/tree";
import type { GeneratedRouteDescriptor, VirtualFile } from "@/lib/project-generator/types";

export type LegalPageSpec = {
  routePath: string;
  title: string;
  pageId: string;
  kind: "impressum" | "datenschutz" | "legal";
};

function legalPageKind(routePath: string, label: string): LegalPageSpec["kind"] {
  if (routePath === "/impressum" || /impressum/i.test(label)) {
    return "impressum";
  }
  if (routePath === "/datenschutz" || /datenschutz/i.test(label)) {
    return "datenschutz";
  }
  return "legal";
}

function isRootLegalHref(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//") && !href.includes("#") && href.length > 1;
}

/** Path-only legal URL — never append home section hashes. */
export function normalizeLegalRouteHref(href: string): string {
  const pathOnly = href.split("#")[0]?.trim() ?? href;
  return pathOnly.startsWith("/") ? pathOnly : `/${pathOnly.replace(/^\/+/, "")}`;
}

function compiledProjectHasPageForRoute(
  project: CompiledWebsiteProject,
  routePath: string,
): boolean {
  const route = project.routes.find((entry) => entry.routePath === routePath);
  if (!route) {
    return false;
  }
  return project.pages.some((page) => page.routeId === route.id);
}

export function collectLegalPageSpecs(project: CompiledWebsiteProject): LegalPageSpec[] {
  const profile = resolveFooterBusinessProfile(project);
  const specs: LegalPageSpec[] = [];

  for (const link of profile.legalLinks) {
    const routePath = normalizeLegalRouteHref(link.href);
    if (!isRootLegalHref(routePath) || compiledProjectHasPageForRoute(project, routePath)) {
      continue;
    }
    specs.push({
      routePath,
      title: link.label,
      pageId: `page:legal-${routePath.replace(/^\//, "").replace(/\//g, "-")}`,
      kind: legalPageKind(routePath, link.label),
    });
  }

  return specs.sort((left, right) => left.routePath.localeCompare(right.routePath));
}

function impressumParagraphs(profile: RestaurantBusinessProfile, brandName: string): string[] {
  const lines = [
    "Angaben gemäß § 5 TMG",
    brandName,
    ...profile.addressLines.filter(Boolean),
  ];
  if (profile.phone) {
    lines.push(`Telefon: ${profile.phone}`);
  }
  if (profile.email) {
    lines.push(`E-Mail: ${profile.email}`);
  }
  lines.push(`Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV: ${brandName}`);
  return lines;
}

function datenschutzParagraphs(brandName: string): string[] {
  return [
    `Diese Datenschutzhinweise gelten für die Website von ${brandName}.`,
    "Beim Besuch dieser Website werden technisch notwendige Daten (z. B. IP-Adresse, Zeitpunkt des Zugriffs) durch den Hosting-Anbieter verarbeitet, um die Website auszuliefern und die Stabilität zu gewährleisten.",
    "Wenn Sie uns telefonisch kontaktieren, verarbeiten wir die von Ihnen mitgeteilten Informationen ausschließlich zur Bearbeitung Ihrer Anfrage.",
    "Es werden keine Marketing-Cookies gesetzt. Externe Kartenlinks (z. B. Google Maps) unterliegen den Datenschutzbestimmungen des jeweiligen Anbieters.",
    "Sie haben das Recht auf Auskunft, Berichtigung und Löschung Ihrer personenbezogenen Daten im Rahmen der gesetzlichen Vorgaben.",
  ];
}

function genericLegalParagraphs(title: string, brandName: string): string[] {
  return [
    `${title} — ${brandName}`,
    "Bitte ergänzen Sie diese Seite mit den finalen Rechtstexten vor dem Livegang.",
  ];
}

function buildLegalPageBody(spec: LegalPageSpec, profile: RestaurantBusinessProfile): string[] {
  const brandName = profile.landing.brandName || profile.addressLines[0] || "Unternehmen";
  switch (spec.kind) {
    case "impressum":
      return impressumParagraphs(profile, brandName);
    case "datenschutz":
      return datenschutzParagraphs(brandName);
    default:
      return genericLegalParagraphs(spec.title, brandName);
  }
}

function legalPageComponentName(routePath: string): string {
  const slug = routePath
    .replace(/^\//, "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  return `${slug || "Legal"}Page`;
}

function buildLegalPageFile(
  spec: LegalPageSpec,
  project: CompiledWebsiteProject,
  profile: RestaurantBusinessProfile,
): VirtualFile {
  const brandName = profile.landing.brandName || project.business.businessName;
  const pageTitle = `${spec.title} | ${brandName}`;
  const metaDescription =
    spec.kind === "impressum"
      ? `Impressum und Anbieterkennzeichnung von ${brandName}.`
      : spec.kind === "datenschutz"
        ? `Datenschutzhinweise der Website von ${brandName}.`
        : `${spec.title} — ${brandName}`;
  const paragraphs = buildLegalPageBody(spec, profile);
  const componentName = legalPageComponentName(spec.routePath);
  const pageFilePath = routePathToPageFilePath(spec.routePath);

  const paragraphElements = paragraphs
    .map((text) => `        <p>${text.replace(/</g, "&lt;")}</p>`)
    .join("\n");

  const content = [
    "/**",
    ` * GENERATED LEGAL PAGE — ${spec.title}`,
    ` * Route: ${spec.routePath}`,
    " */",
    "",
    "import type { Metadata } from 'next';",
    "import Link from 'next/link';",
    "",
    "export const metadata: Metadata = {",
    `  title: ${JSON.stringify(pageTitle)},`,
    `  description: ${JSON.stringify(metaDescription)},`,
    "  robots: 'index,follow',",
    "  alternates: {",
    `    canonical: ${JSON.stringify(spec.routePath)},`,
    "  },",
    "};",
    "",
    `export default function ${componentName}() {`,
    "  return (",
    '    <article className="pg-page">',
    '      <section className="pg-legal-page" aria-labelledby="legal-page-heading">',
    `        <h1 id="legal-page-heading">${spec.title.replace(/</g, "&lt;")}</h1>`,
    paragraphElements,
    '        <p className="pg-legal-page__actions">',
    '          <Link href="/" className="landing-link-button">',
    "            Zur Startseite",
    "          </Link>",
    "        </p>",
    "      </section>",
    "    </article>",
    "  );",
    "}",
    "",
  ].join("\n");

  return buildVirtualFile(pageFilePath, "react-page", content, {
    description: `Generated legal page for ${spec.title}`,
    routePath: spec.routePath,
    pageId: spec.pageId,
    pageRole: "legal",
    implementationStatus: "placeholder",
  });
}

export function buildLegalReactPageFiles(project: CompiledWebsiteProject): VirtualFile[] {
  const profile = resolveFooterBusinessProfile(project);
  return collectLegalPageSpecs(project).map((spec) => buildLegalPageFile(spec, project, profile));
}

export function buildLegalRouteDescriptors(project: CompiledWebsiteProject): GeneratedRouteDescriptor[] {
  const profile = resolveFooterBusinessProfile(project);
  const brandName = profile.landing.brandName || project.business.businessName;

  return collectLegalPageSpecs(project).map((spec) => ({
    id: spec.pageId,
    pageName: spec.title,
    routePath: spec.routePath,
    appSegment: routePathToAppSegment(spec.routePath),
    pageFilePath: routePathToPageFilePath(spec.routePath),
    pageRole: "legal",
    isIndexable: true,
    seoTitle: `${spec.title} | ${brandName}`,
  }));
}
