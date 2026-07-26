/**
 * GENERATED PROJECT SHELL — Sprint 8.2A
 * Shared site type metadata
 * React implementation is intentionally deferred.
 */

export const siteTypesMetadata = {
  "routes": [
    {
      "id": "route:startseite",
      "routePath": "/",
      "pageRole": "home"
    },
    {
      "id": "route:speisekarte",
      "routePath": "/menu",
      "pageRole": "menu"
    },
    {
      "id": "route:uber-uns",
      "routePath": "/about",
      "pageRole": "about"
    },
    {
      "id": "route:galerie",
      "routePath": "/gallery",
      "pageRole": "gallery"
    },
    {
      "id": "route:kontakt",
      "routePath": "/contact",
      "pageRole": "contact"
    }
  ],
  "pages": [
    {
      "id": "page:startseite",
      "pageName": "Startseite",
      "routeId": "route:startseite"
    },
    {
      "id": "page:speisekarte",
      "pageName": "Speisekarte",
      "routeId": "route:speisekarte"
    },
    {
      "id": "page:uber-uns",
      "pageName": "Über uns",
      "routeId": "route:uber-uns"
    },
    {
      "id": "page:galerie",
      "pageName": "Galerie",
      "routeId": "route:galerie"
    },
    {
      "id": "page:kontakt",
      "pageName": "Kontakt",
      "routeId": "route:kontakt"
    }
  ]
} as const;

export type siteTypes = typeof siteTypesMetadata;
