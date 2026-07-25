import type { CompiledWebsiteProject } from "@/lib/website-compiler/types";
import { buildVirtualFile } from "@/lib/project-generator/tree";
import type { VirtualFile } from "@/lib/project-generator/types";
import {
  heroVariantForPage,
  isClientComponent,
  placeholderLabel,
  componentFilePath,
  type GeneratedComponentName,
} from "@/lib/project-generator/react-component-utils";
import {
  STYLE_IMPORT,
  buildVisualSharedTypesFile,
  collectRequiredVisualFiles,
  footerVariantForProject,
  generatePremiumSectionWrapper,
  headerComment,
  headerVariantForProject,
  premiumSectionClose,
  premiumSectionImports,
  premiumSectionOpen,
  primitiveFilePath,
  VISUAL_LAYOUT_PRIMITIVES,
  type VisualLayoutPrimitive,
} from "@/lib/project-generator/visual-component-utils";

function clientDirectiveFor(name: GeneratedComponentName): string {
  return isClientComponent(name) ? "'use client';\n\n" : "";
}

function generateContainer(): string {
  return [
    headerComment("Container"),
    STYLE_IMPORT,
    "import type { ElementType, ReactNode } from 'react';",
    "",
    "type ContainerProps = {",
    "  as?: ElementType;",
    "  className?: string;",
    "  children: ReactNode;",
    "};",
    "",
    "export function Container({ as: Component = 'div', className, children }: ContainerProps) {",
    "  return <Component className={cn(variants.sectionContainer, className)}>{children}</Component>;",
    "}",
    "",
  ].join("\n");
}

function generateSectionShell(): string {
  return [
    headerComment("SectionShell"),
    STYLE_IMPORT,
    "import type { ReactNode } from 'react';",
    "",
    "type SectionShellProps = {",
    "  id: string;",
    "  headingId?: string;",
    "  className?: string;",
    "  children: ReactNode;",
    "};",
    "",
    "export function SectionShell({ id, headingId, className, children }: SectionShellProps) {",
    "  return (",
    "    <section",
    "      id={id}",
    "      className={cn(variants.section, variants.reveal, className)}",
    "      aria-labelledby={headingId}",
    "    >",
    "      {children}",
    "    </section>",
    "  );",
    "}",
    "",
  ].join("\n");
}

function generateCard(): string {
  return [
    headerComment("Card"),
    STYLE_IMPORT,
    "import type { CardVariant } from './types';",
    "import type { ReactNode } from 'react';",
    "",
    "type CardProps = {",
    "  variant?: CardVariant;",
    "  className?: string;",
    "  children: ReactNode;",
    "  as?: 'article' | 'div' | 'li';",
    "};",
    "",
    "const cardVariantMap: Record<CardVariant, string> = {",
    "  standard: variants.card,",
    "  elevated: variants.cardElevated,",
    "  bordered: cn(variants.card, 'border-2'),",
    "  feature: variants.cardInteractive,",
    "  product: variants.cardInteractive,",
    "  testimonial: variants.cardElevated,",
    "  media: cn(variants.card, 'overflow-hidden p-0'),",
    "  placeholder: variants.placeholder,",
    "  interactive: variants.cardInteractive,",
    "};",
    "",
    "export function Card({ variant = 'standard', className, children, as: Component = 'div' }: CardProps) {",
    "  return <Component className={cn(cardVariantMap[variant], className)}>{children}</Component>;",
    "}",
    "",
  ].join("\n");
}

function generateBadge(): string {
  return [
    headerComment("Badge"),
    STYLE_IMPORT,
    "import type { ReactNode } from 'react';",
    "",
    "type BadgeProps = {",
    "  className?: string;",
    "  children: ReactNode;",
    "};",
    "",
    "export function Badge({ className, children }: BadgeProps) {",
    "  return <span className={cn(variants.badge, className)}>{children}</span>;",
    "}",
    "",
  ].join("\n");
}

function generateStack(): string {
  return [
    headerComment("Stack"),
    STYLE_IMPORT,
    "import type { ReactNode } from 'react';",
    "",
    "type StackProps = {",
    "  gap?: 'sm' | 'md' | 'lg';",
    "  className?: string;",
    "  children: ReactNode;",
    "};",
    "",
    "const gapMap = {",
    "  sm: 'gap-[var(--spacing-sm)]',",
    "  md: 'gap-[var(--spacing-md)]',",
    "  lg: 'gap-[var(--spacing-lg)]',",
    "} as const;",
    "",
    "export function Stack({ gap = 'md', className, children }: StackProps) {",
    "  return <div className={cn('flex flex-col', gapMap[gap], className)}>{children}</div>;",
    "}",
    "",
  ].join("\n");
}

function generateCluster(): string {
  return [
    headerComment("Cluster"),
    STYLE_IMPORT,
    "import type { ReactNode } from 'react';",
    "",
    "type ClusterProps = {",
    "  gap?: 'sm' | 'md' | 'lg';",
    "  className?: string;",
    "  children: ReactNode;",
    "};",
    "",
    "const gapMap = {",
    "  sm: 'gap-[var(--spacing-sm)]',",
    "  md: 'gap-[var(--spacing-md)]',",
    "  lg: 'gap-[var(--spacing-lg)]',",
    "} as const;",
    "",
    "export function Cluster({ gap = 'md', className, children }: ClusterProps) {",
    "  return <div className={cn('flex flex-wrap items-center', gapMap[gap], className)}>{children}</div>;",
    "}",
    "",
  ].join("\n");
}

function generateResponsiveGrid(): string {
  return [
    headerComment("ResponsiveGrid"),
    STYLE_IMPORT,
    "import type { ReactNode } from 'react';",
    "",
    "type ResponsiveGridProps = {",
    "  columns?: 2 | 3 | 4;",
    "  className?: string;",
    "  children: ReactNode;",
    "};",
    "",
    "const columnMap = {",
    "  2: 'grid-cols-1 sm:grid-cols-2',",
    "  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',",
    "  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',",
    "} as const;",
    "",
    "export function ResponsiveGrid({ columns = 3, className, children }: ResponsiveGridProps) {",
    "  return (",
    "    <ul className={cn('grid gap-[var(--spacing-md)]', columnMap[columns], className)}>",
    "      {children}",
    "    </ul>",
    "  );",
    "}",
    "",
  ].join("\n");
}

function generateMediaFrame(): string {
  return [
    headerComment("MediaFrame"),
    STYLE_IMPORT,
    "import type { ReactNode } from 'react';",
    "",
    "type MediaFrameProps = {",
    "  ratio?: '16/9' | '4/3' | '1/1' | '3/4';",
    "  className?: string;",
    "  children: ReactNode;",
    "};",
    "",
    "const ratioMap = {",
    "  '16/9': 'aspect-[16/9]',",
    "  '4/3': 'aspect-[4/3]',",
    "  '1/1': 'aspect-square',",
    "  '3/4': 'aspect-[3/4]',",
    "} as const;",
    "",
    "export function MediaFrame({ ratio = '16/9', className, children }: MediaFrameProps) {",
    "  return (",
    "    <div",
    "      className={cn(",
    "        'overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]',",
    "        ratioMap[ratio],",
    "        className,",
    "      )}",
    "    >",
    "      {children}",
    "    </div>",
    "  );",
    "}",
    "",
  ].join("\n");
}

function generateDivider(): string {
  return [
    headerComment("Divider"),
    STYLE_IMPORT,
    "",
    "type DividerProps = {",
    "  className?: string;",
    "};",
    "",
    "export function Divider({ className }: DividerProps) {",
    "  return <hr className={cn('border-0 border-t border-[var(--color-border)]', className)} />;",
    "}",
    "",
  ].join("\n");
}

function generatePlaceholder(): string {
  return [
    headerComment("Placeholder"),
    STYLE_IMPORT,
    "import type { PlaceholderCategory } from './types';",
    "",
    "type PlaceholderProps = {",
    "  label: string;",
    "  category?: PlaceholderCategory;",
    "  className?: string;",
    "  launchBlocking?: boolean;",
    "};",
    "",
    "export function Placeholder({ label, category = 'other', className, launchBlocking = false }: PlaceholderProps) {",
    "  return (",
    "    <span",
    "      className={cn(",
    "        variants.placeholder,",
    "        launchBlocking && 'border-[var(--color-error)]',",
    "        className,",
    "      )}",
    "      data-placeholder-category={category}",
    "      role=\"note\"",
    "    >",
    "      {label}",
    "    </span>",
    "  );",
    "}",
    "",
  ].join("\n");
}

function generateButtonLink(): string {
  return [
    headerComment("ButtonLink"),
    STYLE_IMPORT,
    "import Link from 'next/link';",
    "import type { CTA } from './types';",
    "",
    "type ButtonLinkProps = {",
    "  cta: CTA;",
    "  className?: string;",
    "};",
    "",
    "const variantMap = {",
    "  primary: variants.buttonPrimary,",
    "  secondary: variants.buttonSecondary,",
    "  outline: variants.buttonOutline,",
    "  ghost: variants.buttonGhost,",
    "  text: variants.buttonText,",
    "  destructive: variants.buttonDestructive,",
    "} as const;",
    "",
    "export function ButtonLink({ cta, className }: ButtonLinkProps) {",
    "  const classes = cn(",
    "    variantMap[cta.variant ?? 'primary'],",
    "    variants.motionSafe,",
    "    'min-h-11 min-w-11',",
    "    cta.loading && 'opacity-70',",
    "    className,",
    "  );",
    "",
    "  if (cta.disabled || cta.loading) {",
    "    return (",
    "      <span className={classes} aria-disabled=\"true\" aria-busy={cta.loading ? 'true' : undefined}>",
    "        {cta.label}",
    "      </span>",
    "    );",
    "  }",
    "",
    "  if (cta.external) {",
    "    return (",
    "      <a href={cta.href} className={classes} target=\"_blank\" rel=\"noopener noreferrer\">",
    "        {cta.label}",
    "      </a>",
    "    );",
    "  }",
    "",
    "  return (",
    "    <Link href={cta.href} className={classes}>",
    "      {cta.label}",
    "    </Link>",
    "  );",
    "}",
    "",
  ].join("\n");
}

function generateSectionHeading(): string {
  return [
    headerComment("SectionHeading"),
    STYLE_IMPORT,
    "import { Badge } from './Badge';",
    "import type { SectionBaseProps } from './types';",
    "",
    "type SectionHeadingProps = {",
    "  section: SectionBaseProps;",
    "};",
    "",
    "export function SectionHeading({ section }: SectionHeadingProps) {",
    "  const HeadingTag = section.headingLevel === 1 ? 'h1' : section.headingLevel === 3 ? 'h3' : 'h2';",
    "  return (",
    "    <div className=\"max-w-3xl space-y-3\">",
    "      {section.eyebrow ? <Badge>{section.eyebrow}</Badge> : null}",
    "      <HeadingTag",
    "        id={`${section.id}-heading`}",
    "        className=\"text-[length:var(--font-size-2xl)] font-[var(--font-weight-semibold)] leading-tight md:text-[length:var(--font-size-display)]\"",
    "      >",
    "        {section.title}",
    "      </HeadingTag>",
    "      {section.description ? (",
    "        <p className=\"max-w-2xl text-[length:var(--font-size-md)] leading-relaxed text-[var(--color-text-muted)]\">",
    "          {section.description}",
    "        </p>",
    "      ) : null}",
    "    </div>",
    "  );",
    "}",
    "",
  ].join("\n");
}

function generateMediaPlaceholder(): string {
  return [
    headerComment("MediaPlaceholder"),
    STYLE_IMPORT,
    "import { resolveAsset } from '@/lib/assets/resolve-asset';",
    "import type { AssetId } from '@/lib/assets/registry';",
    "import { MediaFrame } from './MediaFrame';",
    "import { Placeholder } from './Placeholder';",
    "import type { MediaPlaceholderModel } from './types';",
    "",
    "type MediaPlaceholderProps = {",
    "  media: MediaPlaceholderModel;",
    "};",
    "",
    "export function MediaPlaceholder({ media }: MediaPlaceholderProps) {",
    "  const ratio = (media.aspectRatio as '16/9' | '4/3' | '1/1' | '3/4' | undefined) ?? '16/9';",
    "  const asset = resolveAsset((media.assetId ?? 'hero') as AssetId);",
    "  return (",
    "    <figure className=\"w-full\">",
    "      <MediaFrame ratio={ratio}>",
    "        <img",
    "          src={asset.path}",
    "          alt={media.altText ?? asset.altText}",
    "          className=\"h-full w-full object-cover\"",
    "          loading=\"lazy\"",
    "          data-asset-type={asset.assetType}",
    "          data-placeholder={String(asset.placeholder)}",
    "          data-replace-before-production={String(asset.replaceBeforeProduction)}",
    "        />",
    "      </MediaFrame>",
    "      <figcaption className=\"mt-2 space-y-1\">",
    "        <Placeholder label={media.label} category=\"image\" />",
    "        <span className=\"block text-[length:var(--font-size-sm)] text-[var(--color-text-muted)]\">",
    "          {media.altText ?? asset.altText}",
    "        </span>",
    "      </figcaption>",
    "    </figure>",
    "  );",
    "}",
    "",
  ].join("\n");
}

function generateSiteHeader(project: CompiledWebsiteProject): string {
  const headerVariant = headerVariantForProject(project);
  const navItems = project.navigation.primaryNavigationItems
    .map(
      (item) =>
        `  { label: ${JSON.stringify(item.label)}, href: ${JSON.stringify(item.routePath)} },`,
    )
    .join("\n");
  const cta = project.navigation.ctaItem;
  const headerClassMap: Record<string, string> = {
    static: "variants.headerStatic",
    sticky: "variants.header",
    "transparent-to-solid": "variants.headerTransparent",
    compact: "cn(variants.header, 'py-2')",
    "cta-focused": "variants.header",
  };
  const headerClassExpr = headerClassMap[headerVariant] ?? "variants.header";
  const useBrandLogo = Boolean(project.restaurantAssets);
  const logoClassName = useBrandLogo ? "h-10 w-auto max-w-[9rem]" : "h-8 w-auto";
  const wordmarkClassName = useBrandLogo
    ? "sr-only"
    : "text-lg font-[var(--font-weight-semibold)]";

  return [
    headerComment("SiteHeader"),
    clientDirectiveFor("SiteHeader"),
    STYLE_IMPORT,
    "import { resolveAsset } from '@/lib/assets/resolve-asset';",
    "import Link from 'next/link';",
    "import { useEffect, useState } from 'react';",
    "import { ButtonLink } from './ButtonLink';",
    "import { Container } from './Container';",
    "",
    `const headerVariant = ${JSON.stringify(headerVariant)} as const;`,
    "",
    "const navigationItems = [",
    navItems,
    "] as const;",
    "",
    "export function SiteHeader() {",
    "  const [open, setOpen] = useState(false);",
    "",
    "  useEffect(() => {",
    "    if (!open) return;",
    "    const onKeyDown = (event: KeyboardEvent) => {",
    "      if (event.key === 'Escape') setOpen(false);",
    "    };",
    "    window.addEventListener('keydown', onKeyDown);",
    "    return () => window.removeEventListener('keydown', onKeyDown);",
    "  }, [open]);",
    "",
    "  const logoAsset = resolveAsset('logo');",
    "",
    "  return (",
    "    <>",
    '      <a href="#main-content" className={variants.skipLink}>',
    "        Zum Inhalt springen",
    "      </a>",
    `      <header className={cn(${headerClassExpr}, variants.motionSafe)} data-header-variant={headerVariant}>`,
    "        <Container>",
    '          <div className="flex items-center justify-between gap-[var(--spacing-md)] py-[var(--spacing-sm)] md:py-[var(--spacing-md)]">',
    '            <Link href="/" className="flex items-center gap-[var(--spacing-sm)] focus-visible:outline-none">',
    "              <img",
    "                src={logoAsset.path}",
    "                alt={logoAsset.altText}",
    `                className=${JSON.stringify(logoClassName)}`,
    "                data-asset-type={logoAsset.assetType}",
    "                data-placeholder={String(logoAsset.placeholder)}",
    "                data-replace-before-production={String(logoAsset.replaceBeforeProduction)}",
    "              />",
    `              <span className=${JSON.stringify(wordmarkClassName)}>`,
    `                ${JSON.stringify(project.business.businessName)}`,
    "              </span>",
    "            </Link>",
    '            <button',
    '              type="button"',
    '              className={cn(variants.buttonOutline, variants.motionSafe, "md:hidden min-h-11 min-w-11")}',
    '              aria-expanded={open}',
    '              aria-controls="site-mobile-nav"',
    "              onClick={() => setOpen((value) => !value)}",
    "            >",
    "              Menü",
    "            </button>",
    '            <nav aria-label="Hauptnavigation" className="hidden md:block">',
    '              <ul className="flex flex-wrap items-center gap-[var(--spacing-md)]">',
    "                {navigationItems.map((item) => (",
    '                  <li key={item.href}>',
    '                    <Link',
    "                      href={item.href}",
    '                      className={cn("text-sm hover:underline focus-visible:outline-none", variants.motionSafe)}',
    "                    >",
    "                      {item.label}",
    "                    </Link>",
    "                  </li>",
    "                ))}",
    "              </ul>",
    "            </nav>",
    '            <div className="hidden md:block">',
    "              <ButtonLink cta={{ label: " + JSON.stringify(cta.label) + ", href: " + JSON.stringify(cta.routePath) + ", variant: 'primary' }} />",
    "            </div>",
    "          </div>",
    "        </Container>",
    '        <nav',
    '          id="site-mobile-nav"',
    "          className={open ? cn('border-t md:hidden', variants.borderDefault, variants.motionSafe) : 'hidden'}",
    '          aria-label="Mobile Navigation"',
    "        >",
    "          <Container>",
    '            <ul className="flex flex-col gap-[var(--spacing-sm)] py-[var(--spacing-md)]">',
    "              {navigationItems.map((item) => (",
    '                <li key={item.href}>',
    "                  <Link",
    "                    href={item.href}",
    "                    onClick={() => setOpen(false)}",
    '                    className="block min-h-11 py-2"',
    "                  >",
    "                    {item.label}",
    "                  </Link>",
    "                </li>",
    "              ))}",
    "            </ul>",
    "          </Container>",
    "        </nav>",
    "      </header>",
    "    </>",
    "  );",
    "}",
    "",
  ].join("\n");
}

function generateSiteFooter(project: CompiledWebsiteProject): string {
  const footerVariant = footerVariantForProject(project);
  const footerGroups = project.footer.navigationGroups
    .map((group) => {
      const items = group.items
        .map(
          (item) =>
            `          { label: ${JSON.stringify(item.label)}, href: ${JSON.stringify(item.routePath)} },`,
        )
        .join("\n");
      return [
        "    {",
        `      title: ${JSON.stringify(group.title)},`,
        "      items: [",
        items,
        "      ],",
        "    },",
      ].join("\n");
    })
    .join("\n");
  const footerCtaHref =
    project.routes.find((route) => route.id === project.footer.ctaArea.routeId)?.routePath ?? "/";

  return [
    headerComment("SiteFooter"),
    STYLE_IMPORT,
    "import Link from 'next/link';",
    "import { ButtonLink } from './ButtonLink';",
    "import { Cluster } from './Cluster';",
    "import { Container } from './Container';",
    "import { Placeholder } from './Placeholder';",
    "import { Stack } from './Stack';",
    "",
    `const footerVariant = ${JSON.stringify(footerVariant)} as const;`,
    "",
    "const footerGroups = [",
    footerGroups,
    "] as const;",
    "",
    "const contactPlaceholders = [",
    ...project.footer.contactPlaceholders.map((item) => `  ${JSON.stringify(item)},`),
    "] as const;",
    "",
    "const legalPlaceholders = [",
    ...project.footer.legalPlaceholders.map((item) => `  ${JSON.stringify(item)},`),
    "] as const;",
    "",
    "const socialPlaceholders = [",
    ...project.footer.socialPlaceholders.map((item) => `  ${JSON.stringify(item)},`),
    "] as const;",
    "",
    "export function SiteFooter() {",
    "  return (",
    '    <footer className={cn(variants.footer, variants.motionSafe)} data-footer-variant={footerVariant}>',
    "      <Container>",
    "        <Stack gap=\"lg\" className=\"py-[var(--spacing-xl)]\">",
    '          <div className="grid gap-[var(--spacing-lg)] md:grid-cols-2 lg:grid-cols-4">',
    "            {footerGroups.map((group) => (",
    '              <section key={group.title} aria-label={group.title}>',
    '                <h2 className="mb-3 text-sm font-[var(--font-weight-semibold)] uppercase tracking-wide">',
    "                  {group.title}",
    "                </h2>",
    '                <ul className="space-y-2">',
    "                  {group.items.map((item) => (",
    '                    <li key={item.href}>',
    "                      <Link href={item.href} className=\"text-sm hover:underline\">",
    "                        {item.label}",
    "                      </Link>",
    "                    </li>",
    "                  ))}",
    "                </ul>",
    "              </section>",
    "            ))}",
    '            <section aria-label="Kontakt">',
    '              <h2 className="mb-3 text-sm font-[var(--font-weight-semibold)] uppercase tracking-wide">Kontakt</h2>',
    '              <Cluster gap="sm">',
    "                {contactPlaceholders.map((label) => (",
    '                  <Placeholder key={label} label={label} category="phone" />',
    "                ))}",
    "              </Cluster>",
    "            </section>",
    '            <section aria-label="Rechtliches">',
    '              <h2 className="mb-3 text-sm font-[var(--font-weight-semibold)] uppercase tracking-wide">Rechtliches</h2>',
    '              <Cluster gap="sm">',
    "                {legalPlaceholders.map((label) => (",
    '                  <Placeholder key={label} label={label} category="legal" />',
    "                ))}",
    "              </Cluster>",
    "            </section>",
    "          </div>",
    '          <div className={cn("border-t pt-[var(--spacing-md)]", variants.borderDefault)}>',
    '            <div className="flex flex-col gap-[var(--spacing-md)] md:flex-row md:items-center md:justify-between">',
    '              <Cluster gap="sm" aria-label="Social Links">',
    "                {socialPlaceholders.map((label) => (",
    '                  <Placeholder key={label} label={label} category="social-link" />',
    "                ))}",
    "              </Cluster>",
    "              <ButtonLink",
    "                cta={{",
    "                  label: " + JSON.stringify(project.footer.ctaArea.label) + ",",
    "                  href: " + JSON.stringify(footerCtaHref) + ",",
    "                  variant: 'secondary',",
    "                }}",
    "              />",
    "            </div>",
    "          </div>",
    "        </Stack>",
    "      </Container>",
    "    </footer>",
    "  );",
    "}",
    "",
  ].join("\n");
}

function generateMobileStickyCTA(project: CompiledWebsiteProject): string {
  return [
    headerComment("MobileStickyCTA"),
    STYLE_IMPORT,
    "import { ButtonLink } from './ButtonLink';",
    "import { Container } from './Container';",
    "",
    "export function MobileStickyCTA() {",
    "  return (",
    '    <aside className={cn(variants.mobileSticky, variants.motionSafe)} aria-label="Schnellaktion">',
    "      <Container>",
    "        <ButtonLink",
    "          cta={{",
    `            label: ${JSON.stringify(project.site.primaryCta)},`,
    '            href: "/",',
    "            variant: 'primary',",
    "          }}",
    '          className="w-full justify-center"',
    "        />",
    "      </Container>",
    "    </aside>",
    "  );",
    "}",
    "",
  ].join("\n");
}

function generateLegacyHeroSection(project: CompiledWebsiteProject): string {
  const variant = heroVariantForPage("home", project.site.styleTier);
  const trustCue = placeholderLabel("Trust cue");
  const heroMedia = placeholderLabel("Hero media");

  return [
    headerComment("HeroSection"),
    ...premiumSectionImports([
      "import { Badge } from './Badge';",
      "import { ButtonLink } from './ButtonLink';",
      "import { Cluster } from './Cluster';",
      "import { MediaPlaceholder } from './MediaPlaceholder';",
      "import { Placeholder } from './Placeholder';",
    ]),
    "",
    `const heroVariant = ${JSON.stringify(variant)} as string;`,
    "",
    "function HeroSectionLegacy({ section }: SectionComponentProps) {",
    "  const mediaLabel = section.media[0] ?? " + JSON.stringify(heroMedia) + ";",
    "",
    "  return (",
    "    <SectionShell id={section.id} headingId={`${section.id}-heading`} className={section.className}>",
    "      <Container>",
    "        {heroVariant === 'centered' ? (",
    '          <Stack gap="lg" className="items-center text-center">',
    "            <SectionHeading section={section} />",
    "            {section.isPlaceholder ? (",
    "              <Placeholder label=" + JSON.stringify(trustCue) + " category=\"trust\" />",
    "            ) : null}",
    '            <Cluster gap="md" className="justify-center">',
    "              {section.primaryCTA ? (",
    "                <ButtonLink cta={{ label: section.primaryCTA, href: section.ctaReferences[0] ?? '/', variant: 'primary' }} />",
    "              ) : null}",
    "              {section.secondaryCTA ? (",
    "                <ButtonLink cta={{ label: section.secondaryCTA, href: '/', variant: 'secondary' }} />",
    "              ) : null}",
    "            </Cluster>",
    "            <MediaPlaceholder media={{ id: `${section.id}-media`, label: mediaLabel, altText: mediaLabel, assetId: 'hero' }} />",
    "          </Stack>",
    "        ) : heroVariant === 'split' ? (",
    '          <div className="grid gap-[var(--spacing-lg)] md:grid-cols-2 md:items-center">',
    '            <Stack gap="lg">',
    "              <SectionHeading section={section} />",
    "              {section.isPlaceholder ? (",
    "                <Placeholder label=" + JSON.stringify(trustCue) + " category=\"trust\" />",
    "              ) : null}",
    '              <Cluster gap="md">',
    "                {section.primaryCTA ? (",
    "                  <ButtonLink cta={{ label: section.primaryCTA, href: section.ctaReferences[0] ?? '/', variant: 'primary' }} />",
    "                ) : null}",
    "                {section.secondaryCTA ? (",
    "                  <ButtonLink cta={{ label: section.secondaryCTA, href: '/', variant: 'secondary' }} />",
    "                ) : null}",
    "              </Cluster>",
    "            </Stack>",
    "            <MediaPlaceholder media={{ id: `${section.id}-media`, label: mediaLabel, altText: mediaLabel, aspectRatio: '4/3', assetId: 'hero' }} />",
    "          </div>",
    "        ) : heroVariant === 'full-bleed' ? (",
    '          <Stack gap="lg">',
    '            <div className="relative overflow-hidden rounded-[var(--radius-lg)]">',
    "              <MediaPlaceholder media={{ id: `${section.id}-media`, label: mediaLabel, altText: mediaLabel, aspectRatio: '16/9', assetId: 'hero' }} />",
    '              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-[var(--color-background)]/90 to-transparent p-[var(--spacing-lg)]">',
    '                <Stack gap="md" className="max-w-2xl">',
    "                  <SectionHeading section={section} />",
    "                  {section.primaryCTA ? (",
    "                    <ButtonLink cta={{ label: section.primaryCTA, href: section.ctaReferences[0] ?? '/', variant: 'primary' }} />",
    "                  ) : null}",
    "                </Stack>",
    "              </div>",
    "            </div>",
    "          </Stack>",
    "        ) : heroVariant === 'product-focused' ? (",
    '          <div className="grid gap-[var(--spacing-lg)] lg:grid-cols-[1.2fr_1fr] lg:items-center">',
    "            <MediaPlaceholder media={{ id: `${section.id}-media`, label: mediaLabel, altText: mediaLabel, aspectRatio: '1/1', assetId: 'hero' }} />",
    '            <Stack gap="lg">',
    "              <Badge>{section.eyebrow ?? 'Featured'}</Badge>",
    "              <SectionHeading section={section} />",
    "              {section.primaryCTA ? (",
    "                <ButtonLink cta={{ label: section.primaryCTA, href: section.ctaReferences[0] ?? '/', variant: 'primary' }} />",
    "              ) : null}",
    "            </Stack>",
    "          </div>",
    "        ) : heroVariant === 'local-business' ? (",
    '          <Stack gap="lg">',
    "            <SectionHeading section={section} />",
    '            <Cluster gap="sm">',
    "              <Placeholder label=" + JSON.stringify(placeholderLabel("Adresse")) + " category=\"address\" />",
    "              <Placeholder label=" + JSON.stringify(placeholderLabel("Telefon")) + " category=\"phone\" />",
    "              <Placeholder label=" + JSON.stringify(placeholderLabel("Öffnungszeiten")) + " category=\"opening-hours\" />",
    "            </Cluster>",
    "            {section.primaryCTA ? (",
    "              <ButtonLink cta={{ label: section.primaryCTA, href: section.ctaReferences[0] ?? '/', variant: 'primary' }} />",
    "            ) : null}",
    "          </Stack>",
    "        ) : (",
    '          <Stack gap="lg" className="max-w-3xl">',
    "            <SectionHeading section={section} />",
    "            {section.description ? (",
    '              <p className="text-[length:var(--font-size-lg)] leading-relaxed text-[var(--color-text-muted)]">{section.description}</p>',
    "            ) : null}",
    "            {section.primaryCTA ? (",
    "              <ButtonLink cta={{ label: section.primaryCTA, href: section.ctaReferences[0] ?? '/', variant: 'primary' }} />",
    "            ) : null}",
    "          </Stack>",
    "        )}",
    "      </Container>",
    "    </SectionShell>",
    "  );",
    "}",
    "",
  ].join("\n");
}

function legacyHeroSectionSource(project: CompiledWebsiteProject): string {
  const legacy = generateLegacyHeroSection(project);
  const marker = "const heroVariant = ";
  const index = legacy.indexOf(marker);
  if (index === -1) {
    throw new Error("Expected heroVariant in legacy hero generator output");
  }
  return legacy.slice(index).trim();
}

function generatePremiumRestaurantHeroSection(project: CompiledWebsiteProject): string {
  const addressPlaceholder = placeholderLabel("Adresse");
  const phonePlaceholder = placeholderLabel("Telefon");

  return [
    headerComment("HeroSection"),
    ...premiumSectionImports([
      "import { Badge } from './Badge';",
      "import { ButtonLink } from './ButtonLink';",
      "import { Cluster } from './Cluster';",
      "import { MediaPlaceholder } from './MediaPlaceholder';",
      "import { Placeholder } from './Placeholder';",
      "import { resolveAsset } from '@/lib/assets/resolve-asset';",
    ]),
    "",
    legacyHeroSectionSource(project),
    "",
    "export function HeroSection({ section }: SectionComponentProps) {",
    "  if (section.heroLayout === 'premium-restaurant') {",
    "    const heroAsset = resolveAsset('hero');",
    "    const primaryHref = section.primaryCtaHref ?? section.ctaReferences[0] ?? '/';",
    "    const secondaryHref = section.secondaryCtaHref ?? section.ctaReferences[1] ?? '/';",
    "",
    "    return (",
    "      <SectionShell",
    "        id={section.id}",
    "        headingId={`${section.id}-heading`}",
    "        className={cn('hero-premium', section.className)}",
    "      >",
    '        <div className="hero-premium__inner">',
    '          <div className="hero-premium__content">',
    '            <div className="hero-premium__animate">',
    "              {section.tagline ? (",
    '                <p className="hero-premium__tagline">{section.tagline}</p>',
    "              ) : null}",
    "              <h1 id={`${section.id}-heading`} className=\"hero-premium__title\">",
    "                {section.title}",
    "              </h1>",
    "              {section.description ? (",
    '                <p className="hero-premium__description">{section.description}</p>',
    "              ) : null}",
    "            </div>",
    '            <div className="hero-premium__meta hero-premium__animate">',
    "              {section.address ? (",
    '                <p>{section.address}</p>',
    "              ) : (",
    "                <Placeholder label=" + JSON.stringify(addressPlaceholder) + " category=\"address\" />",
    "              )}",
    "              {section.phone ? (",
    '                <p><a href={`tel:${section.phone.replace(/\\s+/g, "")}`}>{section.phone}</a></p>',
    "              ) : (",
    "                <Placeholder label=" + JSON.stringify(phonePlaceholder) + " category=\"phone\" />",
    "              )}",
    "            </div>",
    '            <div className="hero-premium__actions hero-premium__animate">',
    "              {section.primaryCTA ? (",
    "                <a className=\"hero-premium__cta-primary\" href={primaryHref}>",
    "                  {section.primaryCTA}",
    "                </a>",
    "              ) : null}",
    "              {section.secondaryCTA ? (",
    "                <a className=\"hero-premium__cta-secondary\" href={secondaryHref}>",
    "                  {section.secondaryCTA}",
    "                </a>",
    "              ) : null}",
    "            </div>",
    "          </div>",
    '          <div className="hero-premium__media hero-premium__animate hero-premium__animate--delay">',
    "            <img",
    "              src={heroAsset.path}",
    "              alt={heroAsset.altText}",
    '              className="hero-premium__image"',
    '              loading="eager"',
    '              fetchPriority="high"',
    "              decoding=\"async\"",
    "              data-asset-type={heroAsset.assetType}",
    "              data-placeholder={String(heroAsset.placeholder)}",
    "            />",
    "          </div>",
    "        </div>",
    "      </SectionShell>",
    "    );",
    "  }",
    "",
    "  return <HeroSectionLegacy section={section} />;",
    "}",
    "",
  ].join("\n");
}

function generateHeroSection(project: CompiledWebsiteProject): string {
  if (project.websiteTheme && project.restaurantAssets) {
    return generatePremiumRestaurantHeroSection(project);
  }
  return generateLegacyHeroSection(project).replace(
    "function HeroSectionLegacy({ section }: SectionComponentProps) {",
    "export function HeroSection({ section }: SectionComponentProps) {",
  );
}

function generateTrustSection(): string {
  return generatePremiumSectionWrapper("TrustSection", [
    '          <ResponsiveGrid columns={3}>',
    "            {section.missingData.length > 0 ? (",
    "              section.missingData.map((item) => (",
    '                <li key={item}>',
    '                  <Card variant="placeholder">',
    '                    <Placeholder label={item} category="trust" />',
    "                  </Card>",
    "                </li>",
    "              ))",
    "            ) : (",
    '              <li>',
    '                <Card variant="elevated">',
    "                  <Placeholder label=" + JSON.stringify(placeholderLabel("Trust proof")) + " category=\"trust\" />",
    "                </Card>",
    "              </li>",
    "            )}",
    "          </ResponsiveGrid>",
  ], ["import { Card } from './Card';", "import { Placeholder } from './Placeholder';", "import { ResponsiveGrid } from './ResponsiveGrid';"]);
}

function generateFeatureGridSection(): string {
  return generatePremiumSectionWrapper("FeatureGridSection", [
    "          {(() => {",
    "            const items = section.contentBlocks.length > 0 ? section.contentBlocks : [section.title];",
    "            if (items.length === 0) {",
    "              return (",
    "                <Placeholder label=" + JSON.stringify(placeholderLabel("Feature")) + " category=\"other\" />",
    "              );",
    "            }",
    "            return (",
    '              <ResponsiveGrid columns={3}>',
    "                {items.map((item) => (",
    '                  <li key={item}>',
    '                    <Card variant="interactive" as="article">',
    '                      <Stack gap="sm">',
    "                        <Placeholder label=" + JSON.stringify(placeholderLabel("Icon")) + " category=\"other\" className=\"w-fit\" />",
    '                        <h3 className="text-base font-[var(--font-weight-medium)]">{item}</h3>',
    '                        <p className="text-[length:var(--font-size-sm)] text-[var(--color-text-muted)]">{item}</p>',
    "                      </Stack>",
    "                    </Card>",
    "                  </li>",
    "                ))}",
    "              </ResponsiveGrid>",
    "            );",
    "          })()}",
  ], ["import { Card } from './Card';", "import { Placeholder } from './Placeholder';", "import { ResponsiveGrid } from './ResponsiveGrid';"]);
}

function generateMenuSection(project: CompiledWebsiteProject): string {
  const services = project.business.services.slice(0, 8).map((service, index) => ({
    id: `menu-item-${index + 1}`,
    name: service,
    category: index < 4 ? "Highlights" : "Klassiker",
  }));
  const itemsLiteral = JSON.stringify(
    services.map((item) => ({
      ...item,
      description: placeholderLabel("Description"),
      priceLabel: placeholderLabel("EUR price"),
      allergenLabel: placeholderLabel("Allergens"),
      dietaryLabel: placeholderLabel("Dietary info"),
      availabilityLabel: placeholderLabel("Availability"),
    })),
    null,
    2,
  );
  const categories = [...new Set(services.map((item) => item.category))];

  return [
    headerComment("MenuSection"),
    ...premiumSectionImports([
      "import { ButtonLink } from './ButtonLink';",
      "import { Card } from './Card';",
      "import { Cluster } from './Cluster';",
      "import { Placeholder } from './Placeholder';",
      "import { ResponsiveGrid } from './ResponsiveGrid';",
    ]),
    "",
    `const items = ${itemsLiteral} as const;`,
    `const categories = ${JSON.stringify(categories)} as const;`,
    "",
    "export function MenuSection({ section }: SectionComponentProps) {",
    ...premiumSectionOpen(),
    '          <nav aria-label="Menükategorien" className="-mx-[var(--spacing-md)] overflow-x-auto px-[var(--spacing-md)]">',
    '            <Cluster gap="sm" className="min-w-max pb-[var(--spacing-sm)]">',
    "              {categories.map((category) => (",
    '                <a',
    "                  key={category}",
    "                  href={`#${section.id}-${category.toLowerCase()}`}",
    '                  className={cn(variants.badge, variants.motionSafe, "whitespace-nowrap")}',
    "                >",
    "                  {category}",
    "                </a>",
    "              ))}",
    "            </Cluster>",
    "          </nav>",
    '          <Stack gap="lg">',
    "            {categories.map((category) => (",
    '              <div key={category} id={`${section.id}-${category.toLowerCase()}`}>',
    '                <h3 className="mb-[var(--spacing-md)] text-lg font-[var(--font-weight-semibold)]">{category}</h3>',
    '                <ResponsiveGrid columns={2}>',
    "                  {items",
    "                    .filter((item) => item.category === category)",
    "                    .map((item) => (",
    '                      <li key={item.id}>',
    '                        <Card variant="product" as="article">',
    '                          <Stack gap="sm">',
    '                            <div className="flex items-start justify-between gap-[var(--spacing-sm)]">',
    '                              <h4 className="font-[var(--font-weight-medium)]">{item.name}</h4>',
    '                              <Placeholder label={item.priceLabel ?? ' + JSON.stringify(placeholderLabel("EUR price")) + '} category="price" className="shrink-0" />',
    "                            </div>",
    '                            <p className="text-[length:var(--font-size-sm)] text-[var(--color-text-muted)]">{item.description}</p>',
    '                            <Cluster gap="sm">',
    '                              <Placeholder label={item.dietaryLabel ?? ' + JSON.stringify(placeholderLabel("Dietary info")) + '} category="product-data" />',
    '                              <Placeholder label={item.allergenLabel ?? ' + JSON.stringify(placeholderLabel("Allergens")) + '} category="product-data" />',
    '                              <Placeholder label={item.availabilityLabel ?? ' + JSON.stringify(placeholderLabel("Availability")) + '} category="product-data" />',
    "                            </Cluster>",
    "                          </Stack>",
    "                        </Card>",
    "                      </li>",
    "                    ))}",
    "                </ResponsiveGrid>",
    "              </div>",
    "            ))}",
    "          </Stack>",
    "          {section.primaryCTA ? (",
    "            <ButtonLink cta={{ label: section.primaryCTA, href: '/', variant: 'primary' }} />",
    "          ) : null}",
    ...premiumSectionClose(),
    "}",
    "",
  ].join("\n");
}

function generateProductGridSection(project: CompiledWebsiteProject): string {
  const products = project.business.services.slice(0, 6).map((service, index) => ({
    id: `product-${index + 1}`,
    name: service,
    description: placeholderLabel("Description"),
    priceLabel: placeholderLabel("EUR price"),
    featured: index === 0,
  }));
  const itemsLiteral = JSON.stringify(products, null, 2);

  return [
    headerComment("ProductGridSection"),
    ...premiumSectionImports([
      "import { Badge } from './Badge';",
      "import { ButtonLink } from './ButtonLink';",
      "import { Card } from './Card';",
      "import { MediaPlaceholder } from './MediaPlaceholder';",
      "import { Placeholder } from './Placeholder';",
      "import { ResponsiveGrid } from './ResponsiveGrid';",
    ]),
    "",
    `const items = ${itemsLiteral} as const;`,
    "",
    "export function ProductGridSection({ section }: SectionComponentProps) {",
    ...premiumSectionOpen(),
    "          {items.length === 0 ? (",
    "            <Placeholder label=" + JSON.stringify(placeholderLabel("Product")) + " category=\"product-data\" />",
    "          ) : (",
    '            <ResponsiveGrid columns={3}>',
    "              {items.map((item) => (",
    '                <li key={item.id}>',
    '                  <Card variant={item.featured ? "elevated" : "product"} as="article">',
    '                    <Stack gap="sm">',
    "                      <MediaPlaceholder media={{ id: `${item.id}-media`, label: 'PRODUCT IMAGE REQUIRED', altText: item.name, aspectRatio: '4/3', assetId: 'product' }} />",
    '                      <div className="flex items-start justify-between gap-[var(--spacing-sm)]">',
    '                        <h3 className="font-[var(--font-weight-medium)]">{item.name}</h3>',
    "                        {item.featured ? <Badge>Featured</Badge> : null}",
    "                      </div>",
    '                      <p className="text-[length:var(--font-size-sm)] text-[var(--color-text-muted)]">{item.description}</p>',
    '                      <Placeholder label={item.priceLabel} category="price" />',
    "                      {section.primaryCTA ? (",
    "                        <ButtonLink cta={{ label: section.primaryCTA, href: '/', variant: 'outline' }} />",
    "                      ) : null}",
    "                    </Stack>",
    "                  </Card>",
    "                </li>",
    "              ))}",
    "            </ResponsiveGrid>",
    "          )}",
    ...premiumSectionClose(),
    "}",
    "",
  ].join("\n");
}

function generateGallerySection(): string {
  const mediaFallback = placeholderLabel("Produktbild");
  const useMasonry = true;

  return generatePremiumSectionWrapper("GallerySection", [
    "          {(() => {",
    `            const mediaItems = section.media.length > 0 ? section.media : [${JSON.stringify(mediaFallback)}];`,
    `            const useMasonry = ${useMasonry};`,
    "            return useMasonry ? (",
    '              <div className="columns-2 gap-[var(--spacing-md)] md:columns-3">',
    "                {mediaItems.map((item, index) => (",
    '                  <div key={`${section.id}-media-${index}`} className="mb-[var(--spacing-md)] break-inside-avoid">',
    "                    <MediaPlaceholder media={{ id: `${section.id}-media-${index}`, label: item, altText: item, aspectRatio: index % 2 === 0 ? '4/3' : '3/4', assetId: 'gallery' }} />",
    "                  </div>",
    "                ))}",
    "              </div>",
    "            ) : (",
    '              <ResponsiveGrid columns={3}>',
    "                {mediaItems.map((item, index) => (",
    '                  <li key={`${section.id}-media-${index}`}>',
    "                    <MediaPlaceholder media={{ id: `${section.id}-media-${index}`, label: item, altText: item, assetId: 'gallery' }} />",
    "                  </li>",
    "                ))}",
    "              </ResponsiveGrid>",
    "            );",
    "          })()}",
  ], ["import { MediaPlaceholder } from './MediaPlaceholder';", "import { ResponsiveGrid } from './ResponsiveGrid';"]);
}

function generateTestimonialSection(): string {
  return generatePremiumSectionWrapper("TestimonialSection", [
    '          <Card variant="testimonial" className="flex flex-col gap-[var(--spacing-md)] sm:flex-row sm:items-start">',
    "            {(() => {",
    "              const avatarAsset = resolveAsset('avatar');",
    "              return (",
    "                <img",
    "                  src={avatarAsset.path}",
    "                  alt={avatarAsset.altText}",
    '                  className="h-16 w-16 shrink-0 rounded-full object-cover"',
    "                  loading=\"lazy\"",
    "                  data-asset-type={avatarAsset.assetType}",
    "                  data-placeholder={String(avatarAsset.placeholder)}",
    "                  data-replace-before-production={String(avatarAsset.replaceBeforeProduction)}",
    "                />",
    "              );",
    "            })()}",
    "            <Placeholder label=" + JSON.stringify(placeholderLabel("Testimonial")) + " category=\"testimonial\" launchBlocking />",
    "          </Card>",
  ], [
    "import { resolveAsset } from '@/lib/assets/resolve-asset';",
    "import { Card } from './Card';",
    "import { Placeholder } from './Placeholder';",
  ]);
}

function generateFAQSection(): string {
  return generatePremiumSectionWrapper(
    "FAQSection",
    [
      "          {(() => {",
      "            const items = section.contentBlocks.length > 0",
      "              ? section.contentBlocks.map((block, index) => ({",
      "                  id: `${section.id}-faq-${index}`,",
      "                  question: section.title,",
      "                  answer: block,",
      "                  isPlaceholder: section.isPlaceholder,",
      "                }))",
      "              : [{",
      "                  id: `${section.id}-faq-1`,",
      "                  question: section.title,",
      "                  answer: " + JSON.stringify(placeholderLabel("FAQ answer")) + ",",
      "                  isPlaceholder: true,",
      "                }];",
      "            return (",
      '              <Stack gap="sm">',
      "                {items.map((item) => (",
      '                  <details key={item.id} className={variants.faqDetails}>',
      '                    <summary className="flex cursor-pointer list-none items-center justify-between gap-[var(--spacing-sm)] font-[var(--font-weight-medium)] focus-visible:outline-none [&::-webkit-details-marker]:hidden">',
      "                      <span>{item.question}</span>",
      '                      <span aria-hidden="true" className={cn("text-[var(--color-text-muted)] transition-transform", variants.motionSafe, "group-open:rotate-180")}>',
      "                        ▾",
      "                      </span>",
      "                    </summary>",
      '                    <p className="mt-[var(--spacing-sm)] text-[length:var(--font-size-sm)] text-[var(--color-text-muted)]">{item.answer}</p>',
      "                  </details>",
      "                ))}",
      "              </Stack>",
      "            );",
      "          })()}",
      "          {section.primaryCTA ? (",
      "            <ButtonLink cta={{ label: section.primaryCTA, href: '/', variant: 'text' }} />",
      "          ) : null}",
    ],
    ["import { ButtonLink } from './ButtonLink';"],
    true,
  );
}

function generateContactForm(project: CompiledWebsiteProject): string {
  const form = project.forms[0];
  const fields =
    form?.fields.map((field) => ({
      name: field.name,
      type: field.type,
      label: field.label,
      placeholder: field.placeholder,
      required: field.required,
    })) ?? [
      { name: "name", type: "text", label: "Name", placeholder: "Name", required: true },
      { name: "email", type: "email", label: "E-Mail", placeholder: "E-Mail", required: true },
      {
        name: "message",
        type: "textarea",
        label: "Nachricht",
        placeholder: "Nachricht",
        required: true,
      },
    ];

  return [
    headerComment("ContactForm"),
    clientDirectiveFor("ContactForm"),
    STYLE_IMPORT,
    "import { useState } from 'react';",
    "import { Placeholder } from './Placeholder';",
    "",
    "type FormStatus = 'idle' | 'loading' | 'success' | 'error';",
    "",
    "type ContactFormProps = {",
    "  className?: string;",
    "};",
    "",
    "export function ContactForm({ className }: ContactFormProps) {",
    "  const [status, setStatus] = useState<FormStatus>('idle');",
    "",
    "  return (",
    "    <form",
    "      className={cn('space-y-[var(--spacing-md)]', className)}",
    "      noValidate",
    "      aria-label=" + JSON.stringify(form?.name ?? "Kontaktformular") + "",
    "      onSubmit={(event) => {",
    "        event.preventDefault();",
    "        setStatus('loading');",
    "        window.setTimeout(() => setStatus('success'), 600);",
    "      }}",
    "    >",
    ...fields.map((field) => {
      if (field.type === "textarea") {
        return [
          "      <div>",
          `        <label htmlFor=${JSON.stringify(field.name)} className="block text-sm font-[var(--font-weight-medium)]">${field.label}${field.required ? " *" : ""}</label>`,
          `        <textarea id=${JSON.stringify(field.name)} name=${JSON.stringify(field.name)} placeholder=${JSON.stringify(field.placeholder)} className={variants.input} rows={4}${field.required ? " required" : ""} disabled={status === 'loading'} />`,
          "      </div>",
        ].join("\n");
      }
      return [
        "      <div>",
        `        <label htmlFor=${JSON.stringify(field.name)} className="block text-sm font-[var(--font-weight-medium)]">${field.label}${field.required ? " *" : ""}</label>`,
        `        <input id=${JSON.stringify(field.name)} name=${JSON.stringify(field.name)} type=${JSON.stringify(field.type)} placeholder=${JSON.stringify(field.placeholder)} className={variants.input}${field.required ? " required" : ""} disabled={status === 'loading'} />`,
        "      </div>",
      ].join("\n");
    }),
    "      <label className=\"flex items-start gap-[var(--spacing-sm)] text-sm\">",
    "        <input type=\"checkbox\" required disabled={status === 'loading'} />",
    "        <Placeholder label=" + JSON.stringify(form?.privacyPlaceholder ?? placeholderLabel("Privacy notice")) + " category=\"legal\" />",
    "      </label>",
    "      {status === 'loading' ? (",
    "        <Placeholder label=" + JSON.stringify(placeholderLabel("Loading")) + " category=\"other\" />",
    "      ) : null}",
    "      {status === 'success' ? (",
    "        <Placeholder label=" + JSON.stringify(form?.successMessage ?? placeholderLabel("Success message")) + " category=\"other\" />",
    "      ) : null}",
    "      {status === 'error' ? (",
    "        <Placeholder label=" + JSON.stringify(placeholderLabel("Error message")) + " category=\"other\" launchBlocking />",
    "      ) : null}",
    "      <button",
    "        type=\"submit\"",
    "        className={cn(variants.buttonPrimary, variants.motionSafe, 'min-h-11')}",
    "        disabled={status === 'loading'}",
    "        aria-busy={status === 'loading'}",
    "      >",
    "        " + (form?.successMessage ?? "Senden") + "",
    "      </button>",
    "    </form>",
    "  );",
    "}",
    "",
  ].join("\n");
}

function generateContactSection(): string {
  return generatePremiumSectionWrapper("ContactSection", [
    '          <div className="grid gap-[var(--spacing-lg)] md:grid-cols-2">',
    '            <Stack gap="md">',
    '              <ul className="space-y-[var(--spacing-sm)]">',
    "                <li><Placeholder label=" + JSON.stringify(placeholderLabel("Adresse")) + " category=\"address\" /></li>",
    "                <li><Placeholder label=" + JSON.stringify(placeholderLabel("Telefon")) + " category=\"phone\" /></li>",
    "                <li><Placeholder label=" + JSON.stringify(placeholderLabel("E-Mail")) + " category=\"email\" /></li>",
    "              </ul>",
    "            </Stack>",
    "            <ContactForm />",
    "          </div>",
  ], ["import { ContactForm } from './ContactForm';", "import { Placeholder } from './Placeholder';"]);
}

function generateLocationSection(): string {
  return generatePremiumSectionWrapper("LocationSection", [
    '          <div className="grid gap-[var(--spacing-lg)] md:grid-cols-2">',
    '            <Stack gap="md">',
    "              <MapSection section={section} />",
    "              <OpeningHours section={section} />",
    "            </Stack>",
    "            <Placeholder label=" + JSON.stringify(placeholderLabel("Parking or transit info")) + " category=\"other\" />",
    "          </div>",
  ], ["import { MapSection } from './MapSection';", "import { OpeningHours } from './OpeningHours';", "import { Placeholder } from './Placeholder';"]);
}

function generateMapSection(): string {
  return [
    headerComment("MapSection"),
    ...premiumSectionImports([
      "import { resolveAsset } from '@/lib/assets/resolve-asset';",
      "import { MediaFrame } from './MediaFrame';",
      "import { Placeholder } from './Placeholder';",
    ]),
    "",
    "export function MapSection({ section }: SectionComponentProps) {",
    "  const mapAsset = resolveAsset('map');",
    "  return (",
    "    <div className=\"space-y-2\">",
    "      <MediaFrame ratio=\"16/9\">",
    "        <img",
    "          src={mapAsset.path}",
    "          alt={mapAsset.altText}",
    "          className=\"h-full w-full object-cover\"",
    "          loading=\"lazy\"",
    "          data-asset-type={mapAsset.assetType}",
    "          data-placeholder={String(mapAsset.placeholder)}",
    "          data-replace-before-production={String(mapAsset.replaceBeforeProduction)}",
    "        />",
    "      </MediaFrame>",
    "      <Placeholder label=" + JSON.stringify(placeholderLabel("Map")) + " category=\"map\" />",
    "    </div>",
    "  );",
    "}",
    "",
  ].join("\n");
}

function generateOpeningHours(): string {
  return [
    headerComment("OpeningHours"),
    ...premiumSectionImports(["import { Placeholder } from './Placeholder';"]),
    "",
    "export function OpeningHours({ section }: SectionComponentProps) {",
    "  return (",
    '    <Stack gap="sm">',
    '      <h3 className="text-base font-[var(--font-weight-medium)]">Öffnungszeiten</h3>',
    "      <Placeholder label=" + JSON.stringify(placeholderLabel("Öffnungszeiten")) + " category=\"opening-hours\" />",
    "    </Stack>",
    "  );",
    "}",
    "",
  ].join("\n");
}

function generateCTASection(): string {
  return generatePremiumSectionWrapper("CTASection", [
    '          <Card variant="elevated" className="flex flex-col gap-[var(--spacing-md)] md:flex-row md:items-center md:justify-between">',
    '            <p className="max-w-2xl text-[length:var(--font-size-md)] text-[var(--color-text-muted)]">{section.description}</p>',
    '            <Cluster gap="md">',
    "              {section.primaryCTA ? (",
    "                <ButtonLink cta={{ label: section.primaryCTA, href: '/', variant: 'primary' }} />",
    "              ) : null}",
    "              {section.secondaryCTA ? (",
    "                <ButtonLink cta={{ label: section.secondaryCTA, href: '/', variant: 'secondary' }} />",
    "              ) : null}",
    "            </Cluster>",
    "          </Card>",
  ], ["import { ButtonLink } from './ButtonLink';", "import { Card } from './Card';", "import { Cluster } from './Cluster';"]);
}

function generateContentSection(): string {
  return generatePremiumSectionWrapper("ContentSection", [
    "          {section.contentBlocks.length > 0 ? (",
    '            <Stack gap="md" className="max-w-3xl">',
    "              {section.contentBlocks.map((block) => (",
    '                <p key={block} className="text-[length:var(--font-size-md)] leading-relaxed">{block}</p>',
    "              ))}",
    "            </Stack>",
    "          ) : (",
    "            <Placeholder label=" + JSON.stringify(placeholderLabel("Rich text content")) + " category=\"other\" />",
    "          )}",
    "          {section.media.length > 0 ? (",
    "            <MediaPlaceholder media={{ id: `${section.id}-media`, label: section.media[0], altText: section.media[0], assetId: 'hero' }} />",
    "          ) : null}",
    "          {section.primaryCTA ? (",
    "            <ButtonLink cta={{ label: section.primaryCTA, href: '/', variant: 'primary' }} />",
    "          ) : null}",
  ], [
    "import { ButtonLink } from './ButtonLink';",
    "import { MediaPlaceholder } from './MediaPlaceholder';",
    "import { Placeholder } from './Placeholder';",
  ]);
}

function generateGenericSection(): string {
  return generatePremiumSectionWrapper("GenericSection", [
    "          {section.contentBlocks.length > 0 ? (",
    '            <Stack gap="sm">',
    "              {section.contentBlocks.map((block) => (",
    '                <p key={block} className="text-[length:var(--font-size-sm)]">{block}</p>',
    "              ))}",
    "            </Stack>",
    "          ) : (",
    "            <Placeholder label={`Unmapped section type: ${section.type}`} category=\"other\" />",
    "          )}",
    "          {section.missingData.map((item) => (",
    "            <Placeholder key={item} label={item} category=\"other\" />",
    "          ))}",
  ], ["import { Placeholder } from './Placeholder';"]);
}

function generatePrimitiveContent(name: VisualLayoutPrimitive): string {
  switch (name) {
    case "Container":
      return generateContainer();
    case "SectionShell":
      return generateSectionShell();
    case "Card":
      return generateCard();
    case "Badge":
      return generateBadge();
    case "Stack":
      return generateStack();
    case "Cluster":
      return generateCluster();
    case "ResponsiveGrid":
      return generateResponsiveGrid();
    case "MediaFrame":
      return generateMediaFrame();
    case "Divider":
      return generateDivider();
    case "Placeholder":
      return generatePlaceholder();
    default:
      return generateContainer();
  }
}

function generateVisualComponentContent(
  name: GeneratedComponentName,
  project: CompiledWebsiteProject,
): string {
  switch (name) {
    case "ButtonLink":
      return generateButtonLink();
    case "SectionHeading":
      return generateSectionHeading();
    case "MediaPlaceholder":
      return generateMediaPlaceholder();
    case "SiteHeader":
      return generateSiteHeader(project);
    case "SiteFooter":
      return generateSiteFooter(project);
    case "MobileStickyCTA":
      return generateMobileStickyCTA(project);
    case "HeroSection":
      return generateHeroSection(project);
    case "TrustSection":
      return generateTrustSection();
    case "FeatureGridSection":
      return generateFeatureGridSection();
    case "MenuSection":
      return generateMenuSection(project);
    case "ProductGridSection":
      return generateProductGridSection(project);
    case "GallerySection":
      return generateGallerySection();
    case "TestimonialSection":
      return generateTestimonialSection();
    case "FAQSection":
      return generateFAQSection();
    case "ContactForm":
      return generateContactForm(project);
    case "ContactSection":
      return generateContactSection();
    case "LocationSection":
      return generateLocationSection();
    case "MapSection":
      return generateMapSection();
    case "OpeningHours":
      return generateOpeningHours();
    case "CTASection":
      return generateCTASection();
    case "ContentSection":
      return generateContentSection();
    case "GenericSection":
      return generateGenericSection();
    default:
      return generateGenericSection().replace("GenericSection", name);
  }
}

function visualFileMetadata(
  name: string,
  description: string,
): VirtualFile["metadata"] {
  return {
    description,
    componentName: name,
    isPlaceholder: false,
    implementationStatus: "generated" as VirtualFile["metadata"]["implementationStatus"],
  };
}

export function buildVisualComponentFiles(project: CompiledWebsiteProject): VirtualFile[] {
  const required = collectRequiredVisualFiles(project);
  const files: VirtualFile[] = [
    buildVirtualFile("components/generated/types.ts", "react-component", buildVisualSharedTypesFile(), {
      description: "Generated shared visual component types",
      implementationStatus: "generated" as VirtualFile["metadata"]["implementationStatus"],
    }),
  ];

  for (const name of required) {
    const isPrimitive = (VISUAL_LAYOUT_PRIMITIVES as readonly string[]).includes(name);
    const path = isPrimitive
      ? primitiveFilePath(name as VisualLayoutPrimitive)
      : componentFilePath(name as GeneratedComponentName);
    const content = isPrimitive
      ? generatePrimitiveContent(name as VisualLayoutPrimitive)
      : generateVisualComponentContent(name as GeneratedComponentName, project);

    files.push(
      buildVirtualFile(path, "react-component", content, visualFileMetadata(name, `Generated visual component ${name}`)),
    );
  }

  return files;
}

export function countVisualComponentFiles(files: VirtualFile[]): number {
  return files.filter((file) => file.kind === "react-component" && file.path.endsWith(".tsx")).length;
}

export function countClientComponents(files: VirtualFile[]): number {
  return files.filter(
    (file) => file.kind === "react-component" && file.path.endsWith(".tsx") && file.content.includes("'use client'"),
  ).length;
}

export function countServerComponents(files: VirtualFile[]): number {
  return countVisualComponentFiles(files) - countClientComponents(files);
}

export function countVisualPrimitives(files: VirtualFile[]): number {
  return files.filter((file) =>
    VISUAL_LAYOUT_PRIMITIVES.some((primitive) => file.path === primitiveFilePath(primitive)),
  ).length;
}
