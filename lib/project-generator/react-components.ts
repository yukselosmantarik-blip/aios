import type { CompiledWebsiteProject } from "@/lib/website-compiler/types";
import { buildVirtualFile } from "@/lib/project-generator/tree";
import type { VirtualFile } from "@/lib/project-generator/types";
import {
  buildSharedTypesFile,
  collectRequiredComponents,
  componentFilePath,
  heroVariantForPage,
  isClientComponent,
  placeholderLabel,
  type GeneratedComponentName,
} from "@/lib/project-generator/react-component-utils";

const STYLE_IMPORT = "import { cn, variants } from '@/styles/tailwind-mapping';";

function headerComment(name: string): string {
  return [
    "/**",
    ` * GENERATED COMPONENT — ${name}`,
    " * Sprint 8.2D — consumes centralized design tokens",
    " */",
    "",
  ].join("\n");
}

function clientDirectiveFor(name: GeneratedComponentName): string {
  return isClientComponent(name) ? "'use client';\n\n" : "";
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
    "  disabled?: boolean;",
    "};",
    "",
    "export function ButtonLink({ cta, className = '', disabled = false }: ButtonLinkProps) {",
    "  const classes = [",
    "    cta.variant === 'secondary' ? variants.buttonSecondary : variants.buttonPrimary,",
    "    className,",
    "  ].join(' ');",
    "",
    "  if (disabled) {",
    "    return (",
    "      <span className={classes} aria-disabled=\"true\">",
    "        {cta.label}",
    "      </span>",
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
    "import type { SectionBaseProps } from './types';",
    "",
    "type SectionHeadingProps = {",
    "  section: SectionBaseProps;",
    "};",
    "",
    "export function SectionHeading({ section }: SectionHeadingProps) {",
    "  const HeadingTag = section.headingLevel === 1 ? 'h1' : section.headingLevel === 3 ? 'h3' : 'h2';",
    "  return (",
    "    <div className=\"space-y-2\">",
    "      {section.eyebrow ? <p className={variants.badge}>{section.eyebrow}</p> : null}",
    "      <HeadingTag id={`${section.id}-heading`} className=\"text-[length:var(--font-size-2xl)] font-[var(--font-weight-semibold)] md:text-[length:var(--font-size-display)]\">",
    "        {section.title}",
    "      </HeadingTag>",
    "      {section.description ? <p className={variants.textMutedSmall}>{section.description}</p> : null}",
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
    "import type { MediaPlaceholderModel } from './types';",
    "",
    "type MediaPlaceholderProps = {",
    "  media: MediaPlaceholderModel;",
    "};",
    "",
    "export function MediaPlaceholder({ media }: MediaPlaceholderProps) {",
    "  return (",
    "    <figure className={`${variants.card} aspect-[16/9] flex items-center justify-center`}>",
    "      <figcaption className={variants.textMutedSmall}>",
    "        {media.altText ?? media.label}",
    "      </figcaption>",
    "    </figure>",
    "  );",
    "}",
    "",
  ].join("\n");
}

function generateSiteHeader(project: CompiledWebsiteProject): string {
  const navItems = project.navigation.primaryNavigationItems
    .map(
      (item) =>
        `  { label: ${JSON.stringify(item.label)}, href: ${JSON.stringify(item.routePath)} },`,
    )
    .join("\n");
  const cta = project.navigation.ctaItem;

  return [
    headerComment("SiteHeader"),
    clientDirectiveFor("SiteHeader"),
    STYLE_IMPORT,
    "import Link from 'next/link';",
    "import { useState } from 'react';",
    "import { ButtonLink } from './ButtonLink';",
    "",
    "const navigationItems = [",
    navItems,
    "] as const;",
    "",
    "export function SiteHeader() {",
    "  const [open, setOpen] = useState(false);",
    "  return (",
    '    <header className={variants.header}>',
'      <div className={cn(variants.sectionContainer, "flex items-center justify-between gap-4 py-4")}>',
    "        <Link href=\"/\" className=\"text-lg font-semibold\">",
    `          ${JSON.stringify(project.business.businessName)}`,
    "        </Link>",
    '        <button',
    '          type="button"',
    '          className={cn(variants.buttonOutline, "md:hidden")}',
    '          aria-expanded={open}',
    '          aria-controls="site-mobile-nav"',
    "          onClick={() => setOpen((value) => !value)}",
    "        >",
    "          Menü",
    "        </button>",
    '        <nav aria-label="Hauptnavigation" className="hidden md:block">',
    '          <ul className="flex flex-wrap items-center gap-4">',
    "            {navigationItems.map((item) => (",
    '              <li key={item.href}>',
    "                <Link href={item.href} className=\"text-sm hover:underline\">",
    "                  {item.label}",
    "                </Link>",
    "              </li>",
    "            ))}",
    "          </ul>",
    "        </nav>",
    "        <div className=\"hidden md:block\">",
    "          <ButtonLink cta={{ label: " + JSON.stringify(cta.label) + ", href: " + JSON.stringify(cta.routePath) + ", variant: 'primary' }} />",
    "        </div>",
    "      </div>",
    '      <nav id="site-mobile-nav" className={open ? cn("md:hidden border-t", variants.borderDefault) : "hidden"} aria-label="Mobile Navigation">',
'        <div className={cn(variants.sectionContainer, "py-4")}>',
    '          <ul className="flex flex-col gap-3">',
    "            {navigationItems.map((item) => (",
    '              <li key={item.href}>',
    "                <Link href={item.href} onClick={() => setOpen(false)}>",
    "                  {item.label}",
    "                </Link>",
    "              </li>",
    "            ))}",
    "          </ul>",
    "        </div>",
    "      </nav>",
    "    </header>",
    "  );",
    "}",
    "",
  ].join("\n");
}

function generateSiteFooter(project: CompiledWebsiteProject): string {
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

  return [
    headerComment("SiteFooter"),
    STYLE_IMPORT,
    "import Link from 'next/link';",
    "import { ButtonLink } from './ButtonLink';",
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
    '    <footer className={variants.footer}>',
'      <div className={cn(variants.sectionContainer, "grid gap-8 px-4 py-12 md:grid-cols-2 lg:grid-cols-4")}>',
    "        {footerGroups.map((group) => (",
    '          <section key={group.title} aria-label={group.title}>',
    '            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">{group.title}</h2>',
    "            <ul className=\"space-y-2\">",
    "              {group.items.map((item) => (",
    '                <li key={item.href}>',
    "                  <Link href={item.href}>{item.label}</Link>",
    "                </li>",
    "              ))}",
    "            </ul>",
    "          </section>",
    "        ))}",
    '        <section aria-label="Kontakt">',
    '          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">Kontakt</h2>',
    "          <ul className=\"space-y-2\">",
    "            {contactPlaceholders.map((label) => (",
    '              <li key={label}><span className={variants.textMutedSmall}>{label}</span></li>',
    "            ))}",
    "          </ul>",
    "        </section>",
    '        <section aria-label="Rechtliches">',
    '          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">Rechtliches</h2>',
    "          <ul className=\"space-y-2\">",
    "            {legalPlaceholders.map((label) => (",
    '              <li key={label}><span aria-disabled="true" className={variants.textMutedSmall}>{label}</span></li>',
    "            ))}",
    "          </ul>",
    "        </section>",
    "      </div>",
    '      <div className={cn("border-t px-4 py-6", variants.borderDefault)}>',
'        <div className={cn(variants.sectionContainer, "flex flex-col gap-4 md:flex-row md:items-center md:justify-between")}>',
    "          <ul className=\"flex flex-wrap gap-3\">",
    "            {socialPlaceholders.map((label) => (",
    '              <li key={label}><span className={variants.textMutedSmall}>{label}</span></li>',
    "            ))}",
    "          </ul>",
    "          <ButtonLink cta={{ label: " + JSON.stringify(project.footer.ctaArea.label) + ", href: " + JSON.stringify(project.routes.find((route) => route.id === project.footer.ctaArea.routeId)?.routePath ?? "/") + ", variant: 'secondary' }} />",
    "        </div>",
    "      </div>",
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
    "",
    "export function MobileStickyCTA() {",
    "  return (",
    '    <aside className={variants.mobileSticky} aria-label="Schnellaktion">',
    "      <ButtonLink",
    "        cta={{",
    `          label: ${JSON.stringify(project.site.primaryCta)},`,
    '          href: "/",',
    "          variant: 'primary',",
    "        }}",
    '        className="w-full justify-center"',
    "      />",
    "    </aside>",
    "  );",
    "}",
    "",
  ].join("\n");
}

function generateSectionWrapper(
  name: string,
  bodyLines: string[],
  imports: string[] = ["import type { SectionComponentProps } from './types';", "import { SectionHeading } from './SectionHeading';", STYLE_IMPORT],
  client = false,
): string {
  return [
    headerComment(name),
    client ? "'use client';\n" : "",
    ...imports,
    "",
    `export function ${name}({ section }: SectionComponentProps) {`,
    ...bodyLines,
    "}",
    "",
  ].join("\n");
}

function generateHeroSection(project: CompiledWebsiteProject): string {
  const variant = heroVariantForPage("home", project.site.styleTier);

  return generateSectionWrapper("HeroSection", [
    `  const variant = ${JSON.stringify(variant)};`,
    "  return (",
'    <section id={section.id} className={cn(variants.section, section.className)} aria-labelledby={`${section.id}-heading`}>',
'      <div className={cn(variants.sectionContainer, "grid gap-8 md:grid-cols-2 md:items-center")}>',
    "        <div className=\"space-y-4\">",
    "          <SectionHeading section={section} />",
    "          {section.isPlaceholder ? (",
    `            <p className={variants.placeholder}>${placeholderLabel("Trust cue")}</p>`,
    "          ) : null}",
    "          <div className=\"flex flex-col gap-3 sm:flex-row\">",
    "            {section.primaryCTA ? (",
    "              <ButtonLink cta={{ label: section.primaryCTA, href: section.ctaReferences[0] ? '/' : '/', variant: 'primary' }} />",
    "            ) : null}",
    "            {section.secondaryCTA ? (",
    "              <ButtonLink cta={{ label: section.secondaryCTA, href: '/', variant: 'secondary' }} />",
    "            ) : null}",
    "          </div>",
    "        </div>",
    "        <MediaPlaceholder media={{ id: `${section.id}-media`, label: section.media[0] ?? '" + placeholderLabel("Hero media") + "', altText: section.media[0] ?? '" + placeholderLabel("Hero media") + "' }} />",
    "      </div>",
    "      <p className=\"sr-only\">Variant: {variant}</p>",
    "    </section>",
    "  );",
  ], [
    "import type { SectionComponentProps } from './types';",
    "import { ButtonLink } from './ButtonLink';",
    "import { MediaPlaceholder } from './MediaPlaceholder';",
    "import { SectionHeading } from './SectionHeading';",
    STYLE_IMPORT,
  ]);
}

function generateTrustSection(): string {
  return generateSectionWrapper("TrustSection", [
    "  return (",
'    <section id={section.id} className={cn(variants.section, section.className)} aria-labelledby={`${section.id}-heading`}>',
'      <div className={cn(variants.sectionContainer, "space-y-6")}>',
    "        <SectionHeading section={section} />",
    `        <div className="grid gap-4 md:grid-cols-3">`,
    "          {section.missingData.length > 0 ? section.missingData.map((item) => (",
    `            <div key={item} className={variants.placeholder}>{item}</div>`,
    "          )) : (",
    `            <p className={variants.placeholder}>${placeholderLabel("Trust proof")}</p>`,
    "          )}",
    "        </div>",
    "      </div>",
    "    </section>",
    "  );",
  ]);
}

function generateFeatureGridSection(): string {
  return generateSectionWrapper("FeatureGridSection", [
    "  const items = section.contentBlocks.length > 0 ? section.contentBlocks : [section.title];",
    "  return (",
'    <section id={section.id} className={cn(variants.section, section.className)} aria-labelledby={`${section.id}-heading`}>',
'      <div className={cn(variants.sectionContainer, "space-y-6")}>',
    "        <SectionHeading section={section} />",
    "        {items.length === 0 ? (",
    `          <p className={variants.placeholder}>Keine Inhalte verfügbar.</p>`,
    "        ) : (",
    `          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">`,
    "            {items.map((item) => (",
'              <li key={item} className={variants.card}>',
    "                <p>{item}</p>",
    "              </li>",
    "            ))}",
    "          </ul>",
    "        )}",
    "      </div>",
    "    </section>",
    "  );",
  ]);
}

function generateMenuSection(project: CompiledWebsiteProject): string {
  const services = project.business.services.slice(0, 8).map((service, index) => ({
    id: `menu-item-${index + 1}`,
    name: service,
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

  return generateSectionWrapper("MenuSection", [
    `  const items = ${itemsLiteral} as const;`,
    "  return (",
'    <section id={section.id} className={cn(variants.section, section.className)} aria-labelledby={`${section.id}-heading`}>',
'      <div className={cn(variants.sectionContainer, "space-y-6")}>',
    "        <SectionHeading section={section} />",
    `        <div className="grid gap-4 md:grid-cols-2">`,
    "          {items.map((item) => (",
    `            <article key={item.id} className={variants.card}>`,
    "              <h3 className=\"font-medium\">{item.name}</h3>",
    "              <p className={variants.textMutedSmall}>{item.description}</p>",
    "              <p className=\"mt-2 text-sm\">{item.priceLabel}</p>",
    "            </article>",
    "          ))}",
    "        </div>",
    "        {section.primaryCTA ? (",
    "          <ButtonLink cta={{ label: section.primaryCTA, href: '/', variant: 'primary' }} />",
    "        ) : null}",
    "      </div>",
    "    </section>",
    "  );",
  ], [
    "import type { SectionComponentProps } from './types';",
    "import { ButtonLink } from './ButtonLink';",
    "import { SectionHeading } from './SectionHeading';",
    STYLE_IMPORT,
  ]);
}

function generateProductGridSection(project: CompiledWebsiteProject): string {
  const products = project.business.services.slice(0, 6).map((service, index) => ({
    id: `product-${index + 1}`,
    name: service,
    description: placeholderLabel("Description"),
    priceLabel: placeholderLabel("EUR price"),
  }));
  const itemsLiteral = JSON.stringify(products, null, 2);

  return generateSectionWrapper("ProductGridSection", [
    `  const items = ${itemsLiteral} as const;`,
    "  return (",
'    <section id={section.id} className={cn(variants.section, section.className)} aria-labelledby={`${section.id}-heading`}>',
'      <div className={cn(variants.sectionContainer, "space-y-6")}>',
    "        <SectionHeading section={section} />",
    `        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">`,
    "          {items.map((item) => (",
    `            <article key={item.id} className={variants.card}>`,
    "              <h3 className=\"font-medium\">{item.name}</h3>",
    "              <p className={variants.textMutedSmall}>{item.description}</p>",
    "              <p className=\"mt-2 text-sm\">{item.priceLabel}</p>",
    "            </article>",
    "          ))}",
    "        </div>",
    "      </div>",
    "    </section>",
    "  );",
  ]);
}

function generateGallerySection(): string {
  const mediaFallback = placeholderLabel("Produktbild");
  return generateSectionWrapper("GallerySection", [
    `  const mediaItems = section.media.length > 0 ? section.media : [${JSON.stringify(mediaFallback)}];`,
    "  return (",
'    <section id={section.id} className={cn(variants.section, section.className)} aria-labelledby={`${section.id}-heading`}>',
'      <div className={cn(variants.sectionContainer, "space-y-6")}>',
    "        <SectionHeading section={section} />",
    `        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">`,
    "          {mediaItems.map((item, index) => (",
    "            <MediaPlaceholder key={`${section.id}-media-${index}`} media={{ id: `${section.id}-media-${index}`, label: item, altText: item }} />",
    "          ))}",
    "        </div>",
    "      </div>",
    "    </section>",
    "  );",
  ], [
    "import type { SectionComponentProps } from './types';",
    "import { MediaPlaceholder } from './MediaPlaceholder';",
    "import { SectionHeading } from './SectionHeading';",
    STYLE_IMPORT,
  ]);
}

function generateTestimonialSection(): string {
  return generateSectionWrapper("TestimonialSection", [
    "  return (",
'    <section id={section.id} className={cn(variants.section, section.className)} aria-labelledby={`${section.id}-heading`}>',
'      <div className={cn(variants.sectionContainer, "space-y-6")}>',
    "        <SectionHeading section={section} />",
    `        <p className={variants.placeholder}>${placeholderLabel("Testimonial")}</p>`,
    "      </div>",
    "    </section>",
    "  );",
  ]);
}

function generateFAQSection(): string {
  return generateSectionWrapper(
    "FAQSection",
    [
      "  const items = section.contentBlocks.length > 0",
      "    ? section.contentBlocks.map((block, index) => ({",
      "        id: `${section.id}-faq-${index}`,",
      "        question: section.title,",
      "        answer: block,",
      "        isPlaceholder: section.isPlaceholder,",
      "      }))",
      "    : [{",
      `        id: \`\${section.id}-faq-1\`,`,
      "        question: section.title,",
      `        answer: ${JSON.stringify(placeholderLabel("FAQ answer"))},`,
      "        isPlaceholder: true,",
      "      }];",
      "  return (",
  '    <section id={section.id} className={cn(variants.section, section.className)} aria-labelledby={`${section.id}-heading`}>',
  '      <div className={cn(variants.sectionContainer, "space-y-6")}>',
      "        <SectionHeading section={section} />",
      "        <div className=\"space-y-3\">",
      "          {items.map((item) => (",
      '            <details key={item.id} className={cn(variants.card, "p-4")}>',
      '              <summary className="cursor-pointer font-medium">{item.question}</summary>',
      '              <p className={cn("mt-2", variants.textMutedSmall)}>{item.answer}</p>',
      "            </details>",
      "          ))}",
      "        </div>",
      "      </div>",
      "    </section>",
      "  );",
    ],
    ["import type { SectionComponentProps } from './types';", "import { SectionHeading } from './SectionHeading';", STYLE_IMPORT],
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
    "type ContactFormProps = {",
    "  className?: string;",
    "};",
    "",
    "export function ContactForm({ className = '' }: ContactFormProps) {",
    "  return (",
    `    <form className={\`space-y-4 \${className}\`} noValidate aria-label=${JSON.stringify(form?.name ?? "Kontaktformular")}>`,
    ...fields.map((field) => {
      if (field.type === "textarea") {
        return [
          "      <div>",
          `        <label htmlFor=${JSON.stringify(field.name)} className="block text-sm font-medium">${field.label}${field.required ? " *" : ""}</label>`,
          `        <textarea id=${JSON.stringify(field.name)} name=${JSON.stringify(field.name)} placeholder=${JSON.stringify(field.placeholder)} className={variants.input} rows={4}${field.required ? " required" : ""} />`,
          "      </div>",
        ].join("\n");
      }
      return [
        "      <div>",
        `        <label htmlFor=${JSON.stringify(field.name)} className="block text-sm font-medium">${field.label}${field.required ? " *" : ""}</label>`,
        `        <input id=${JSON.stringify(field.name)} name=${JSON.stringify(field.name)} type=${JSON.stringify(field.type)} placeholder=${JSON.stringify(field.placeholder)} className={variants.input}${field.required ? " required" : ""} />`,
        "      </div>",
      ].join("\n");
    }),
    `      <p className={variants.placeholder}>${form?.privacyPlaceholder ?? placeholderLabel("Privacy notice")}</p>`,
    `      <button type="button" className={variants.buttonPrimary} disabled aria-disabled="true">${form?.successMessage ?? "Senden"} (${form?.submissionBehaviorPlaceholder ?? "no backend"})</button>`,
    "    </form>",
    "  );",
    "}",
    "",
  ].join("\n");
}

function generateContactSection(): string {
  return generateSectionWrapper("ContactSection", [
    "  return (",
'    <section id={section.id} className={cn(variants.section, section.className)} aria-labelledby={`${section.id}-heading`}>',
'      <div className={cn(variants.sectionContainer, "grid gap-8 md:grid-cols-2")}>',
    "        <div className=\"space-y-4\">",
    "          <SectionHeading section={section} />",
    `          <ul className="space-y-2">`,
    `            <li className={variants.placeholder}>${placeholderLabel("Adresse")}</li>`,
    `            <li className={variants.placeholder}>${placeholderLabel("Telefon")}</li>`,
    `            <li className={variants.placeholder}>${placeholderLabel("E-Mail")}</li>`,
    "          </ul>",
    "        </div>",
    "        <ContactForm />",
    "      </div>",
    "    </section>",
    "  );",
  ], [
    "import type { SectionComponentProps } from './types';",
    "import { ContactForm } from './ContactForm';",
    "import { SectionHeading } from './SectionHeading';",
    STYLE_IMPORT,
  ]);
}

function generateLocationSection(): string {
  return generateSectionWrapper("LocationSection", [
    "  return (",
'    <section id={section.id} className={cn(variants.section, section.className)} aria-labelledby={`${section.id}-heading`}>',
'      <div className={cn(variants.sectionContainer, "grid gap-8 md:grid-cols-2")}>',
    "        <div className=\"space-y-4\">",
    "          <SectionHeading section={section} />",
    "          <MapSection section={section} />",
    "          <OpeningHours section={section} />",
    "        </div>",
    `        <div className={variants.placeholder}>${placeholderLabel("Parking or transit info")}</div>`,
    "      </div>",
    "    </section>",
    "  );",
  ], [
    "import type { SectionComponentProps } from './types';",
    "import { MapSection } from './MapSection';",
    "import { OpeningHours } from './OpeningHours';",
    "import { SectionHeading } from './SectionHeading';",
    STYLE_IMPORT,
  ]);
}

function generateMapSection(): string {
  return generateSectionWrapper("MapSection", [
    "  return (",
'    <div className={cn(variants.placeholder, "min-h-48 flex items-center justify-center")} role="img" aria-label=' + JSON.stringify(placeholderLabel("Map")) + '>',
    `      ${placeholderLabel("Map")}`,
    "    </div>",
    "  );",
  ], ["import type { SectionComponentProps } from './types';", STYLE_IMPORT]);
}

function generateOpeningHours(): string {
  return generateSectionWrapper("OpeningHours", [
    "  return (",
    "    <div className=\"space-y-2\">",
    "      <h3 className=\"text-base font-medium\">Öffnungszeiten</h3>",
    `      <p className={variants.placeholder}>${placeholderLabel("Öffnungszeiten")}</p>`,
    "    </div>",
    "  );",
  ], ["import type { SectionComponentProps } from './types';", STYLE_IMPORT]);
}

function generateCTASection(): string {
  return generateSectionWrapper("CTASection", [
    "  return (",
'    <section id={section.id} className={cn(variants.section, section.className)} aria-labelledby={`${section.id}-heading`}>',
'      <div className={cn(variants.sectionContainer, variants.card, "flex flex-col gap-4 md:flex-row md:items-center md:justify-between")}>',
    "        <SectionHeading section={section} />",
    "        <div className=\"flex flex-col gap-3 sm:flex-row\">",
    "          {section.primaryCTA ? (",
    "            <ButtonLink cta={{ label: section.primaryCTA, href: '/', variant: 'primary' }} />",
    "          ) : null}",
    "          {section.secondaryCTA ? (",
    "            <ButtonLink cta={{ label: section.secondaryCTA, href: '/', variant: 'secondary' }} />",
    "          ) : null}",
    "        </div>",
    "      </div>",
    "    </section>",
    "  );",
  ], [
    "import type { SectionComponentProps } from './types';",
    "import { ButtonLink } from './ButtonLink';",
    "import { SectionHeading } from './SectionHeading';",
    STYLE_IMPORT,
  ]);
}

function generateContentSection(): string {
  return generateSectionWrapper("ContentSection", [
    "  return (",
'    <section id={section.id} className={cn(variants.section, section.className)} aria-labelledby={`${section.id}-heading`}>',
'      <div className={cn(variants.sectionContainer, "space-y-6")}>',
    "        <SectionHeading section={section} />",
    "        {section.contentBlocks.length > 0 ? (",
    "          <div className=\"space-y-4\">",
    "            {section.contentBlocks.map((block) => (",
    "              <p key={block} className=\"max-w-3xl text-base\">{block}</p>",
    "            ))}",
    "          </div>",
    "        ) : (",
    `          <p className={variants.placeholder}>${placeholderLabel("Rich text content")}</p>`,
    "        )}",
    "      </div>",
    "    </section>",
    "  );",
  ]);
}

function generateGenericSection(): string {
  return generateSectionWrapper("GenericSection", [
    "  return (",
'    <section id={section.id} className={cn(variants.section, section.className)} aria-labelledby={`${section.id}-heading`}>',
'      <div className={cn(variants.sectionContainer, "space-y-4")}>',
    "        <SectionHeading section={section} />",
    `        <p className={variants.placeholder}>Unmapped section type: {section.type}</p>`,
    "        {section.missingData.map((item) => (",
    `          <p key={item} className={variants.placeholder}>{item}</p>`,
    "        ))}",
    "      </div>",
    "    </section>",
    "  );",
  ]);
}

function generateComponentContent(
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

export function buildReactComponentFiles(project: CompiledWebsiteProject): VirtualFile[] {
  const required = collectRequiredComponents(project);
  const files: VirtualFile[] = [
    buildVirtualFile("components/generated/types.ts", "react-component", buildSharedTypesFile(), {
      description: "Generated shared component types",
      implementationStatus: "placeholder",
    }),
  ];

  for (const name of required) {
    files.push(
      buildVirtualFile(componentFilePath(name), "react-component", generateComponentContent(name, project), {
        description: `Generated React component ${name}`,
        componentName: name,
        isPlaceholder: true,
        implementationStatus: "placeholder",
      }),
    );
  }

  return files;
}

export function countReactComponentFiles(files: VirtualFile[]): number {
  return files.filter((file) => file.kind === "react-component" && file.path.endsWith(".tsx")).length;
}

export function countClientComponents(files: VirtualFile[]): number {
  return files.filter(
    (file) => file.kind === "react-component" && file.path.endsWith(".tsx") && file.content.includes("'use client'"),
  ).length;
}

export function countServerComponents(files: VirtualFile[]): number {
  return countReactComponentFiles(files) - countClientComponents(files);
}
