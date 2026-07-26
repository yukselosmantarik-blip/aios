/**
 * GENERATED PAGE CONFIG — Sprint 8.2B
 * Page: Startseite
 */

export const page_startseiteConfig = {
  "pageId": "page:startseite",
  "pageName": "Startseite",
  "pageRole": "home",
  "title": "Startseite | by Nani's",
  "description": "100 % halal, frisch zubereitet und smashed to perfection – Smashburger, Hotdogs und mehr in Blaubeuren.",
  "route": "/",
  "h1Direction": "by Nani's Smashburger",
  "primaryCta": "Zur Speisekarte / Bestellen",
  "secondaryCta": "Standort & Öffnungszeiten",
  "selectedPatternIds": [
    "hero",
    "navbar",
    "footer",
    "statistics",
    "menu-grid",
    "usp-block",
    "testimonials",
    "gallery",
    "location",
    "faq",
    "cta-banner"
  ],
  "sections": [
    {
      "id": "home",
      "title": "by Nani's Smashburger",
      "name": "HeroSection",
      "eyebrow": "Smashed to Perfection",
      "description": "100 % halal, frisch zubereitet und smashed to perfection – mitten in Blaubeuren.",
      "type": "hero",
      "order": 1,
      "priority": 100,
      "hierarchyLevel": "dominant",
      "visualWeight": "very-high",
      "purpose": "Drive Burger liebhaber, familien, studenten toward Gäste informieren und zur Speisekarte sowie zum Besuch vor Ort einladen. Prioritize menu visibility and order path.",
      "componentName": "HeroSection",
      "isPlaceholder": false,
      "missingData": [],
      "contentBlocks": [],
      "primaryCTA": "Jetzt bestellen",
      "secondaryCTA": "Standort & Öffnungszeiten",
      "media": [],
      "ctaReferences": [
        "#menu",
        "#contact"
      ],
      "mediaReferences": [],
      "headingLevel": 1,
      "sourcePatternIds": [
        "hero"
      ],
      "contentBody": "100 % halal, frisch zubereitet und smashed to perfection – mitten in Blaubeuren.",
      "contentLines": [
        "Smashed to Perfection"
      ],
      "trustBadges": [
        "Smashed to Perfection"
      ],
      "menuItems": [],
      "faqItems": [],
      "heroLayout": "premium-restaurant",
      "tagline": "Smashed to Perfection",
      "primaryCtaHref": "#menu",
      "secondaryCtaHref": "#contact",
      "phone": "0162 2083583",
      "address": "Klosterstraße 21, 89143 Blaubeuren",
      "className": "hero-premium"
    },
    {
      "id": "menu",
      "title": "Unsere Speisekarte",
      "name": "MenuImageSection",
      "eyebrow": null,
      "description": "Burger, Hotdogs, Beilagen, Getränke und mehr – entdecke unser aktuelles Angebot.",
      "type": "menu-grid",
      "order": 2,
      "priority": 90,
      "hierarchyLevel": "primary",
      "visualWeight": "high",
      "purpose": "Present the full menu image",
      "componentName": "MenuImageSection",
      "isPlaceholder": false,
      "missingData": [],
      "contentBlocks": [],
      "primaryCTA": null,
      "secondaryCTA": null,
      "media": [],
      "ctaReferences": [],
      "mediaReferences": [],
      "headingLevel": 2,
      "sourcePatternIds": [
        "menu-grid"
      ],
      "contentBody": "",
      "contentLines": [],
      "trustBadges": [],
      "menuItems": [],
      "faqItems": []
    },
    {
      "id": "contact",
      "title": "Standort & Öffnungszeiten",
      "name": "BusinessInfoSection",
      "eyebrow": null,
      "description": "Besuchen Sie uns in Blaubeuren oder rufen Sie uns an.",
      "type": "contact-details",
      "order": 3,
      "priority": 85,
      "hierarchyLevel": "primary",
      "visualWeight": "high",
      "purpose": "Business contact and opening hours",
      "componentName": "BusinessInfoSection",
      "isPlaceholder": false,
      "missingData": [],
      "contentBlocks": [],
      "primaryCTA": null,
      "secondaryCTA": null,
      "media": [],
      "ctaReferences": [],
      "mediaReferences": [],
      "headingLevel": 2,
      "sourcePatternIds": [
        "location"
      ],
      "contentBody": "",
      "contentLines": [],
      "trustBadges": [],
      "menuItems": [],
      "faqItems": []
    }
  ],
  "ctas": {
    "primary": "Zur Speisekarte / Bestellen",
    "secondary": "Standort & Öffnungszeiten"
  },
  "mediaPlaceholders": [
    "[PLACEHOLDER: media asset]",
    "[PLACEHOLDER: media asset]",
    "[PLACEHOLDER: media asset]",
    "[PLACEHOLDER: media asset]",
    "[PLACEHOLDER: media asset]"
  ],
  "seo": {
    "title": "Startseite | by Nani's",
    "titlePattern": "{page} | {businessName}",
    "metaDescription": "100 % halal, frisch zubereitet und smashed to perfection – Smashburger, Hotdogs und mehr in Blaubeuren.",
    "canonical": "/",
    "robots": "index,follow",
    "openGraph": {
      "title": "by Nani's Smashburger — Startseite",
      "description": "100 % halal, frisch zubereitet und smashed to perfection – Smashburger, Hotdogs und mehr in Blaubeuren.",
      "type": "website"
    },
    "twitter": {
      "card": "summary_large_image",
      "title": "by Nani's Smashburger — Startseite",
      "description": "100 % halal, frisch zubereitet und smashed to perfection – Smashburger, Hotdogs und mehr in Blaubeuren."
    },
    "primaryKeyword": "Smashburger",
    "supportingKeywords": [
      "Smashburger",
      "Hot Dogs",
      "Pommes",
      "Desserts",
      "Smashburger Restaurant"
    ],
    "h1Direction": "by Nani's Smashburger",
    "structuredDataType": "Organization",
    "breadcrumbRecommendation": [
      "Home",
      "Startseite"
    ],
    "internalLinks": [
      "/menu",
      "/about",
      "/gallery",
      "/contact"
    ],
    "missingSeoInputs": []
  },
  "missingDataReferences": [
    "phone",
    "email",
    "opening hours",
    "testimonials",
    "legal text",
    "domain",
    "product prices"
  ],
  "internalLinks": [
    "/menu",
    "/about",
    "/gallery",
    "/contact"
  ],
  "implementationWarnings": [
    "high: Too many high-emphasis sections marked dominant."
  ]
} as const;

export type page_startseiteConfigType = typeof page_startseiteConfig;
