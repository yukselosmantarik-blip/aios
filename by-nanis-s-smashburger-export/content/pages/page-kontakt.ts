/**
 * GENERATED PAGE CONFIG — Sprint 8.2B
 * Page: Kontakt
 */

export const page_kontaktConfig = {
  "pageId": "page:kontakt",
  "pageName": "Kontakt",
  "pageRole": "contact",
  "title": "Kontakt | by Nani's",
  "description": "Gäste informieren und zur Speisekarte sowie zum Besuch vor Ort einladen — Burger liebhaber, familien, studenten",
  "route": "/contact",
  "h1Direction": "by Nani's — Reach the business quickly with a question or request.",
  "primaryCta": "Zur Speisekarte / Bestellen",
  "secondaryCta": "Standort & Öffnungszeiten",
  "selectedPatternIds": [
    "hero",
    "navbar",
    "footer",
    "location",
    "feature-grid",
    "cta-banner"
  ],
  "sections": [
    {
      "id": "section:kontakt-hero",
      "title": "by Nani's",
      "name": "HeroSection",
      "eyebrow": "100 % Halal",
      "description": "Gäste informieren und zur Speisekarte sowie zum Besuch vor Ort einladen",
      "type": "hero",
      "order": 1,
      "priority": 100,
      "hierarchyLevel": "dominant",
      "visualWeight": "very-high",
      "purpose": "Capture inquiries and enable direct contact.",
      "componentName": "HeroSection",
      "isPlaceholder": false,
      "missingData": [],
      "contentBlocks": [],
      "primaryCTA": "Zur Speisekarte / Bestellen",
      "secondaryCTA": "Standort & Öffnungszeiten",
      "media": [],
      "ctaReferences": [
        "/menu",
        "/contact"
      ],
      "mediaReferences": [],
      "headingLevel": 1,
      "sourcePatternIds": [
        "hero"
      ],
      "contentBody": "Gäste informieren und zur Speisekarte sowie zum Besuch vor Ort einladen",
      "contentLines": [
        "100 % Halal",
        "frische Zutaten"
      ],
      "trustBadges": [
        "100 % Halal",
        "frische Zutaten"
      ],
      "menuItems": [],
      "faqItems": [],
      "heroLayout": "legacy",
      "tagline": "100 % Halal",
      "primaryCtaHref": "/menu",
      "secondaryCtaHref": "/contact",
      "phone": "0162 2083583",
      "address": "Klosterstraße 21, 89143 Blaubeuren"
    },
    {
      "id": "section:kontakt-contactdetails",
      "title": "Kontakt",
      "name": "ContactDetails",
      "eyebrow": null,
      "description": ", , address: Blaubeuren",
      "type": "location",
      "order": 2,
      "priority": 69,
      "hierarchyLevel": "secondary",
      "visualWeight": "medium",
      "purpose": "Provide direct contact channels.",
      "componentName": "ContactSection",
      "isPlaceholder": true,
      "missingData": [
        "PLACEHOLDER: phone",
        "PLACEHOLDER: email",
        "PLACEHOLDER: street/PLZ"
      ],
      "contentBlocks": [
        "content-block:page-kontakt-contactdetails"
      ],
      "contentBody": ", , address: Blaubeuren",
      "contentLines": [
        ", , address: Blaubeuren"
      ],
      "trustBadges": [
        "100 % Halal",
        "frische Zutaten"
      ],
      "menuItems": [],
      "faqItems": [],
      "primaryCTA": null,
      "secondaryCTA": null,
      "media": [
        "[PLACEHOLDER: media asset]"
      ],
      "ctaReferences": [],
      "mediaReferences": [
        "[PLACEHOLDER: media asset]"
      ],
      "headingLevel": 2,
      "sourcePatternIds": [
        "location"
      ]
    },
    {
      "id": "section:kontakt-contactform",
      "title": "Kontakt",
      "name": "ContactForm",
      "eyebrow": "feature-grid",
      "description": "Fields: Name (required), Email (required, email type), Message (required textarea).",
      "type": "feature-grid",
      "order": 3,
      "priority": 99,
      "hierarchyLevel": "primary",
      "visualWeight": "high",
      "purpose": "Capture inquiries aligned with website goal.",
      "componentName": "FeatureGridSection",
      "isPlaceholder": false,
      "missingData": [],
      "contentBlocks": [
        "content-block:page-kontakt-contactform"
      ],
      "contentBody": "Fields: Name (required), Email (required, email type), Message (required textarea).",
      "contentLines": [
        "100 % Halal",
        "frische Zutaten"
      ],
      "trustBadges": [
        "100 % Halal",
        "frische Zutaten"
      ],
      "menuItems": [],
      "faqItems": [],
      "primaryCTA": null,
      "secondaryCTA": null,
      "media": [],
      "ctaReferences": [],
      "mediaReferences": [],
      "headingLevel": 2,
      "sourcePatternIds": [
        "feature-grid"
      ]
    },
    {
      "id": "section:kontakt-contactformvalidation",
      "title": "Kontakt",
      "name": "ContactFormValidation",
      "eyebrow": "feature-grid",
      "description": "Required field empty → inline error; invalid email → format error; server error → retry message.",
      "type": "feature-grid",
      "order": 4,
      "priority": 80,
      "hierarchyLevel": "primary",
      "visualWeight": "high",
      "purpose": "Define validation and error behavior.",
      "componentName": "FeatureGridSection",
      "isPlaceholder": false,
      "missingData": [],
      "contentBlocks": [
        "content-block:page-kontakt-contactformvalidation"
      ],
      "contentBody": "Required field empty → inline error; invalid email → format error; server error → retry message.",
      "contentLines": [
        "100 % Halal",
        "frische Zutaten"
      ],
      "trustBadges": [
        "100 % Halal",
        "frische Zutaten"
      ],
      "menuItems": [],
      "faqItems": [],
      "primaryCTA": null,
      "secondaryCTA": null,
      "media": [],
      "ctaReferences": [],
      "mediaReferences": [],
      "headingLevel": 2,
      "sourcePatternIds": [
        "feature-grid"
      ]
    },
    {
      "id": "section:kontakt-contactformsuccess",
      "title": "Kontakt",
      "name": "ContactFormSuccess",
      "eyebrow": "cta-banner",
      "description": "Success message + expectation .",
      "type": "cta-banner",
      "order": 5,
      "priority": 80,
      "hierarchyLevel": "primary",
      "visualWeight": "high",
      "purpose": "Confirm successful submission.",
      "componentName": "ContactSection",
      "isPlaceholder": true,
      "missingData": [
        "PLACEHOLDER: response time"
      ],
      "contentBlocks": [
        "content-block:page-kontakt-contactformsuccess"
      ],
      "contentBody": "Success message + expectation .",
      "contentLines": [
        "Success message + expectation ."
      ],
      "trustBadges": [
        "100 % Halal",
        "frische Zutaten"
      ],
      "menuItems": [],
      "faqItems": [],
      "primaryCTA": null,
      "secondaryCTA": null,
      "media": [
        "[PLACEHOLDER: media asset]"
      ],
      "ctaReferences": [],
      "mediaReferences": [
        "[PLACEHOLDER: media asset]"
      ],
      "headingLevel": 2,
      "sourcePatternIds": [
        "cta-banner"
      ]
    },
    {
      "id": "section:kontakt-openinghours",
      "title": "Kontakt",
      "name": "OpeningHours",
      "eyebrow": null,
      "description": ".",
      "type": "location",
      "order": 6,
      "priority": 57,
      "hierarchyLevel": "secondary",
      "visualWeight": "medium",
      "purpose": "Display visit availability.",
      "componentName": "LocationSection",
      "isPlaceholder": true,
      "missingData": [
        "PLACEHOLDER: Mo–So hours per day"
      ],
      "contentBlocks": [
        "content-block:page-kontakt-openinghours"
      ],
      "contentBody": ".",
      "contentLines": [
        "."
      ],
      "trustBadges": [
        "100 % Halal",
        "frische Zutaten"
      ],
      "menuItems": [],
      "faqItems": [],
      "primaryCTA": null,
      "secondaryCTA": null,
      "media": [
        "[PLACEHOLDER: media asset]"
      ],
      "ctaReferences": [],
      "mediaReferences": [
        "[PLACEHOLDER: media asset]"
      ],
      "headingLevel": 2,
      "sourcePatternIds": [
        "location"
      ]
    },
    {
      "id": "section:kontakt-mapembed",
      "title": "Kontakt",
      "name": "MapEmbed",
      "eyebrow": null,
      "description": "Map centered on Blaubeuren .",
      "type": "location",
      "order": 7,
      "priority": 60,
      "hierarchyLevel": "secondary",
      "visualWeight": "medium",
      "purpose": "Show geographic location.",
      "componentName": "LocationSection",
      "isPlaceholder": true,
      "missingData": [
        "PLACEHOLDER: exact coordinates"
      ],
      "contentBlocks": [
        "content-block:page-kontakt-mapembed"
      ],
      "contentBody": "Map centered on Blaubeuren .",
      "contentLines": [
        "Map centered on Blaubeuren ."
      ],
      "trustBadges": [
        "100 % Halal",
        "frische Zutaten"
      ],
      "menuItems": [],
      "faqItems": [],
      "primaryCTA": null,
      "secondaryCTA": null,
      "media": [
        "[PLACEHOLDER: media asset]"
      ],
      "ctaReferences": [],
      "mediaReferences": [
        "[PLACEHOLDER: media asset]"
      ],
      "headingLevel": 2,
      "sourcePatternIds": [
        "location"
      ]
    },
    {
      "id": "section:kontakt-directionscta",
      "title": "Kontakt",
      "name": "DirectionsCTA",
      "eyebrow": null,
      "description": ".",
      "type": "cta-banner",
      "order": 8,
      "priority": 71,
      "hierarchyLevel": "secondary",
      "visualWeight": "medium",
      "purpose": "Help users navigate to the business.",
      "componentName": "CTASection",
      "isPlaceholder": true,
      "missingData": [
        "PLACEHOLDER: Google Maps URL from client"
      ],
      "contentBlocks": [
        "content-block:page-kontakt-directionscta"
      ],
      "contentBody": ".",
      "contentLines": [
        "."
      ],
      "trustBadges": [
        "100 % Halal",
        "frische Zutaten"
      ],
      "menuItems": [],
      "faqItems": [],
      "primaryCTA": null,
      "secondaryCTA": null,
      "media": [
        "[PLACEHOLDER: media asset]"
      ],
      "ctaReferences": [],
      "mediaReferences": [
        "[PLACEHOLDER: media asset]"
      ],
      "headingLevel": 2,
      "sourcePatternIds": [
        "cta-banner"
      ]
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
    "title": "Kontakt | by Nani's",
    "titlePattern": "{page} | {businessName}",
    "metaDescription": "Gäste informieren und zur Speisekarte sowie zum Besuch vor Ort einladen — Burger liebhaber, familien, studenten",
    "canonical": "/contact",
    "robots": "index,follow",
    "openGraph": {
      "title": "by Nani's — Kontakt",
      "description": "Gäste informieren und zur Speisekarte sowie zum Besuch vor Ort einladen",
      "type": "website"
    },
    "twitter": {
      "card": "summary_large_image",
      "title": "by Nani's — Kontakt",
      "description": "Gäste informieren und zur Speisekarte sowie zum Besuch vor Ort einladen"
    },
    "primaryKeyword": "Smashburger",
    "supportingKeywords": [
      "Smashburger",
      "Hot Dogs",
      "Pommes",
      "Desserts",
      "Smashburger Restaurant"
    ],
    "h1Direction": "by Nani's — Reach the business quickly with a question or request.",
    "structuredDataType": "LocalBusiness",
    "breadcrumbRecommendation": [
      "Home",
      "Kontakt"
    ],
    "internalLinks": [
      "/",
      "/menu",
      "/about",
      "/gallery"
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
    "/",
    "/menu",
    "/about",
    "/gallery"
  ],
  "implementationWarnings": []
} as const;

export type page_kontaktConfigType = typeof page_kontaktConfig;
