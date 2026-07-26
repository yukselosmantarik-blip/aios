/**
 * GENERATED COMPONENT — MenuSection
 * Sprint 8.3 — premium visual component library
 */

import type { SectionComponentProps } from './types';
import { SectionHeading } from './SectionHeading';
import { SectionShell } from './SectionShell';
import { Container } from './Container';
import { Stack } from './Stack';
import { cn, variants } from '@/styles/tailwind-mapping';
import { ButtonLink } from './ButtonLink';
import { Card } from './Card';
import { Cluster } from './Cluster';
import { Placeholder } from './Placeholder';
import { ResponsiveGrid } from './ResponsiveGrid';

const items = [
  {
    "id": "menu-item-1",
    "name": "Smashburger",
    "category": "Highlights",
    "description": "[PLACEHOLDER: Description]",
    "priceLabel": "[PLACEHOLDER: EUR price]",
    "allergenLabel": "[PLACEHOLDER: Allergens]",
    "dietaryLabel": "[PLACEHOLDER: Dietary info]",
    "availabilityLabel": "[PLACEHOLDER: Availability]"
  },
  {
    "id": "menu-item-2",
    "name": "Hot Dogs",
    "category": "Highlights",
    "description": "[PLACEHOLDER: Description]",
    "priceLabel": "[PLACEHOLDER: EUR price]",
    "allergenLabel": "[PLACEHOLDER: Allergens]",
    "dietaryLabel": "[PLACEHOLDER: Dietary info]",
    "availabilityLabel": "[PLACEHOLDER: Availability]"
  },
  {
    "id": "menu-item-3",
    "name": "Pommes",
    "category": "Highlights",
    "description": "[PLACEHOLDER: Description]",
    "priceLabel": "[PLACEHOLDER: EUR price]",
    "allergenLabel": "[PLACEHOLDER: Allergens]",
    "dietaryLabel": "[PLACEHOLDER: Dietary info]",
    "availabilityLabel": "[PLACEHOLDER: Availability]"
  },
  {
    "id": "menu-item-4",
    "name": "Desserts",
    "category": "Highlights",
    "description": "[PLACEHOLDER: Description]",
    "priceLabel": "[PLACEHOLDER: EUR price]",
    "allergenLabel": "[PLACEHOLDER: Allergens]",
    "dietaryLabel": "[PLACEHOLDER: Dietary info]",
    "availabilityLabel": "[PLACEHOLDER: Availability]"
  },
  {
    "id": "menu-item-5",
    "name": "Kaffee",
    "category": "Klassiker",
    "description": "[PLACEHOLDER: Description]",
    "priceLabel": "[PLACEHOLDER: EUR price]",
    "allergenLabel": "[PLACEHOLDER: Allergens]",
    "dietaryLabel": "[PLACEHOLDER: Dietary info]",
    "availabilityLabel": "[PLACEHOLDER: Availability]"
  },
  {
    "id": "menu-item-6",
    "name": "Cocktails",
    "category": "Klassiker",
    "description": "[PLACEHOLDER: Description]",
    "priceLabel": "[PLACEHOLDER: EUR price]",
    "allergenLabel": "[PLACEHOLDER: Allergens]",
    "dietaryLabel": "[PLACEHOLDER: Dietary info]",
    "availabilityLabel": "[PLACEHOLDER: Availability]"
  },
  {
    "id": "menu-item-7",
    "name": "Getränke",
    "category": "Klassiker",
    "description": "[PLACEHOLDER: Description]",
    "priceLabel": "[PLACEHOLDER: EUR price]",
    "allergenLabel": "[PLACEHOLDER: Allergens]",
    "dietaryLabel": "[PLACEHOLDER: Dietary info]",
    "availabilityLabel": "[PLACEHOLDER: Availability]"
  },
  {
    "id": "menu-item-8",
    "name": "Take-Away",
    "category": "Klassiker",
    "description": "[PLACEHOLDER: Description]",
    "priceLabel": "[PLACEHOLDER: EUR price]",
    "allergenLabel": "[PLACEHOLDER: Allergens]",
    "dietaryLabel": "[PLACEHOLDER: Dietary info]",
    "availabilityLabel": "[PLACEHOLDER: Availability]"
  }
] as const;
const categories = ["Highlights","Klassiker"] as const;

export function MenuSection({ section }: SectionComponentProps) {
  return (
    <SectionShell id={section.id} headingId={`${section.id}-heading`} className={section.className}>
      <Container>
        <Stack gap="lg">
          <SectionHeading section={section} />
          <nav aria-label="Menükategorien" className="-mx-[var(--spacing-md)] overflow-x-auto px-[var(--spacing-md)]">
            <Cluster gap="sm" className="min-w-max pb-[var(--spacing-sm)]">
              {categories.map((category) => (
                <a
                  key={category}
                  href={`#${section.id}-${category.toLowerCase()}`}
                  className={cn(variants.badge, variants.motionSafe, "whitespace-nowrap")}
                >
                  {category}
                </a>
              ))}
            </Cluster>
          </nav>
          <Stack gap="lg">
            {categories.map((category) => (
              <div key={category} id={`${section.id}-${category.toLowerCase()}`}>
                <h3 className="mb-[var(--spacing-md)] text-lg font-[var(--font-weight-semibold)]">{category}</h3>
                <ResponsiveGrid columns={2}>
                  {items
                    .filter((item) => item.category === category)
                    .map((item) => (
                      <li key={item.id}>
                        <Card variant="product" as="article">
                          <Stack gap="sm">
                            <div className="flex items-start justify-between gap-[var(--spacing-sm)]">
                              <h4 className="font-[var(--font-weight-medium)]">{item.name}</h4>
                              <Placeholder label={item.priceLabel ?? "[PLACEHOLDER: EUR price]"} category="price" className="shrink-0" />
                            </div>
                            <p className="text-[length:var(--font-size-sm)] text-[var(--color-text-muted)]">{item.description}</p>
                            <Cluster gap="sm">
                              <Placeholder label={item.dietaryLabel ?? "[PLACEHOLDER: Dietary info]"} category="product-data" />
                              <Placeholder label={item.allergenLabel ?? "[PLACEHOLDER: Allergens]"} category="product-data" />
                              <Placeholder label={item.availabilityLabel ?? "[PLACEHOLDER: Availability]"} category="product-data" />
                            </Cluster>
                          </Stack>
                        </Card>
                      </li>
                    ))}
                </ResponsiveGrid>
              </div>
            ))}
          </Stack>
          {section.primaryCTA ? (
            <ButtonLink cta={{ label: section.primaryCTA, href: '/', variant: 'primary' }} />
          ) : null}
        </Stack>
      </Container>
    </SectionShell>
  );
}
