# AIOS Design System

> Visual language and component standards for AIOS — an AI-first business operating system.  
> **Primary experience:** dark mode. **Tone:** modern, minimal, premium, calm.

This document is the source of truth for all UI work. Implementations should map to the semantic tokens below rather than ad-hoc color or spacing choices.

---

## 1. Design Principles

AIOS UI should feel like a control plane — quiet, precise, and trustworthy. Every surface earns its place.

| Principle | Rule |
|-----------|------|
| **Clarity over decoration** | Hierarchy through typography and spacing, not ornament. No decorative gradients or glass effects. |
| **Calm density** | Show enough information to act, never more. Prefer scannable lists and cards over dense tables unless data requires it. |
| **One accent** | Blue is the only strong chromatic accent. Success, warning, and error are functional — not decorative. |
| **Dark by default** | Dark mode is the primary experience. Light mode is a secondary, parity-maintained variant. |
| **Motion with purpose** | Transitions clarify state change. No looping animations, parallax, or motion for its own sake. |
| **Consistency at scale** | New modules reuse existing tokens and patterns. Deviations require a decision in [DECISIONS.md](./DECISIONS.md). |
| **German UI copy** | User-facing strings remain in German until i18n is formalized. Documentation stays in English. |
| **Accessible by default** | Contrast, focus, and semantics are non-negotiable — not polish added at the end. |

**Reference aesthetic:** the restraint of Linear, the polish of Vercel, the trust of Stripe, the structure of Notion — adapted for a dark, operations-focused dashboard.

---

## 2. Color System

All colors are defined as **semantic tokens**. Use token names in code (`--color-surface`), not raw hex values, so themes stay maintainable.

### Dark mode (primary)

| Token | CSS variable | Hex | Usage |
|-------|--------------|-----|-------|
| **Background** | `--color-background` | `#09090B` | App shell, page canvas |
| **Surface** | `--color-surface` | `#18181B` | Cards, panels, dropdowns |
| **Surface elevated** | `--color-surface-elevated` | `#27272A` | Hover rows, nested panels, modals |
| **Border** | `--color-border` | `#3F3F46` | Dividers, input outlines, card edges |
| **Border subtle** | `--color-border-subtle` | `#27272A` | Low-emphasis separators |
| **Primary text** | `--color-text-primary` | `#FAFAFA` | Headings, body, labels |
| **Secondary text** | `--color-text-secondary` | `#A1A1AA` | Descriptions, meta, placeholders |
| **Text muted** | `--color-text-muted` | `#71717A` | Disabled copy, timestamps |
| **Accent** | `--color-accent` | `#3B82F6` | Primary actions, links, active nav, focus rings |
| **Accent hover** | `--color-accent-hover` | `#2563EB` | Button and link hover |
| **Accent subtle** | `--color-accent-subtle` | `#1E3A5F` | Selected nav item background, accent tint |
| **Success** | `--color-success` | `#22C55E` | Completed states, confirmations |
| **Success subtle** | `--color-success-subtle` | `#14532D` | Success badge backgrounds |
| **Warning** | `--color-warning` | `#F59E0B` | Caution states, pending actions |
| **Warning subtle** | `--color-warning-subtle` | `#78350F` | Warning badge backgrounds |
| **Error** | `--color-error` | `#EF4444` | Errors, destructive actions |
| **Error subtle** | `--color-error-subtle` | `#7F1D1D` | Error banners, destructive hover bg |

### Light mode (secondary)

Maintain token parity. Swap values only — never introduce new token names per theme.

| Token | Hex |
|-------|-----|
| Background | `#F4F4F5` |
| Surface | `#FFFFFF` |
| Surface elevated | `#FAFAFA` |
| Border | `#E4E4E7` |
| Border subtle | `#F4F4F5` |
| Primary text | `#09090B` |
| Secondary text | `#71717A` |
| Text muted | `#A1A1AA` |
| Accent | `#2563EB` |
| Accent hover | `#1D4ED8` |
| Accent subtle | `#EFF6FF` |
| Success | `#16A34A` |
| Success subtle | `#DCFCE7` |
| Warning | `#D97706` |
| Warning subtle | `#FEF3C7` |
| Error | `#DC2626` |
| Error subtle | `#FEE2E2` |

### Color rules

- Do **not** use pure black (`#000000`) or pure white (`#FFFFFF`) for large surfaces.
- Do **not** add secondary accent colors (purple, teal, etc.).
- Use **border + surface elevation** instead of heavy shadows in dark mode.
- Status colors appear only in badges, icons, banners, and inline alerts — not as page backgrounds.
- Minimum contrast ratio: **4.5:1** for body text, **3:1** for large text and UI components (WCAG AA).

---

## 3. Typography

### Font stack

| Role | Family | Notes |
|------|--------|-------|
| **Sans (UI)** | Geist Sans | Primary typeface — loaded via `next/font` |
| **Mono (code / IDs)** | Geist Mono | UUIDs, API keys, technical values |

Fallback: `system-ui, -apple-system, sans-serif`.

### Type scale

| Token | Size | Line height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `display` | 36px / 2.25rem | 1.2 | 600 | Marketing or empty-state headlines only |
| `heading-lg` | 30px / 1.875rem | 1.25 | 600 | Page titles |
| `heading-md` | 24px / 1.5rem | 1.3 | 600 | Section titles |
| `heading-sm` | 18px / 1.125rem | 1.4 | 600 | Card titles, dialog titles |
| `body` | 14px / 0.875rem | 1.5 | 400 | Default body text |
| `body-sm` | 13px / 0.8125rem | 1.5 | 400 | Secondary content, table cells |
| `caption` | 12px / 0.75rem | 1.4 | 400 | Labels, timestamps, badge text |
| `stat` | 30px / 1.875rem | 1.2 | 600 | Dashboard metric values |

### Typography rules

- **Maximum two weights per view:** 400 (regular) and 600 (semibold). Avoid bold (700) except rare emphasis.
- **Sentence case** for UI labels. Title case only for proper nouns and product name "AIOS".
- **No all-caps** except short badge labels (max 12 characters).
- **Tabular numbers** (`font-variant-numeric: tabular-nums`) for stats, counts, and tabular data.
- **Truncation:** single-line labels truncate with ellipsis; multi-line descriptions clamp at 2 lines.

---

## 4. Spacing System

Base unit: **4px**. All spacing must be a multiple of 4.

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight inline gaps (icon + label) |
| `space-2` | 8px | Badge padding, compact lists |
| `space-3` | 12px | Form field internal gaps |
| `space-4` | 16px | Default component padding, grid gaps (mobile) |
| `space-5` | 20px | — |
| `space-6` | 24px | Card padding, section gaps |
| `space-8` | 32px | Between major sections |
| `space-10` | 40px | Main content padding (tablet) |
| `space-12` | 48px | Main content padding (desktop) |
| `space-16` | 64px | Large layout breaks, empty states |

### Spacing rules

- **Vertical rhythm:** stack sections with `space-8` (32px) minimum.
- **Card padding:** `space-6` (24px) on all sides.
- **Inline form groups:** `space-3` (12px) between label and field; `space-4` (16px) between fields.
- **Never use arbitrary values** (e.g. 13px, 27px).

---

## 5. Border Radius

Rounded corners should feel soft but precise — not pill-shaped except badges.

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 6px | Badges, small chips, checkboxes |
| `radius-md` | 8px | Buttons, inputs, dropdown items |
| `radius-lg` | 12px | Cards, dialogs, popovers |
| `radius-xl` | 16px | Large panels, login card |
| `radius-full` | 9999px | Status dots, avatar circles only |

**Rule:** default to `radius-md` for interactive elements and `radius-lg` for containers.

---

## 6. Shadows

Dark mode relies primarily on **surface contrast and borders**. Shadows are subtle and rare.

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-none` | none | Default for cards in dark mode |
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.4)` | Dropdowns, popovers |
| `shadow-md` | `0 4px 12px rgba(0,0,0,0.5)` | Dialogs, modals |
| `shadow-lg` | `0 8px 24px rgba(0,0,0,0.6)` | Floating panels only |

### Shadow rules

- Do **not** use colored shadows or glow effects.
- Do **not** stack multiple shadow tokens on one element.
- Light mode may use `shadow-sm` on cards where border contrast is lower.

---

## 7. Sidebar and Application Layout

### Shell structure

```
┌─────────────────────────────────────────────────────────────┐
│  Sidebar (fixed)  │  Main content area                       │
│  240px desktop    │  flex-1, scrollable                      │
│                   │  ┌─────────────────────────────────────┐ │
│  Logo             │  │ Top bar (optional per route)        │ │
│  Navigation       │  ├─────────────────────────────────────┤ │
│  ─────────────    │  │ Page header                         │ │
│  User / logout    │  ├─────────────────────────────────────┤ │
│                   │  │ Content sections                    │ │
│                   │  └─────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Sidebar

| Property | Value |
|----------|-------|
| Width (desktop) | 240px |
| Width (tablet) | 64px (icon-only, collapsed) |
| Width (mobile) | Hidden; opened as overlay drawer |
| Background | `--color-background` (same as shell, separated by border) |
| Border | 1px right `--color-border-subtle` |
| Nav item height | 36px |
| Nav item padding | `space-2` vertical, `space-3` horizontal |
| Active item | `--color-accent-subtle` background + `--color-accent` text/icon |
| Hover item | `--color-surface-elevated` background |

### Main content

| Property | Value |
|----------|-------|
| Background | `--color-background` |
| Max content width | 1200px (centered on ultra-wide screens) |
| Padding | `space-12` desktop · `space-6` tablet · `space-4` mobile |
| Section gap | `space-8` |

### Top bar (header)

- Height: 56px
- Contains: page context, search (future), user menu
- Bottom border: 1px `--color-border-subtle`
- No drop shadow

---

## 8. Buttons

### Variants

| Variant | Background | Text | Border | Usage |
|---------|------------|------|--------|-------|
| **Primary** | `--color-accent` | white | none | Main action (one per view) |
| **Secondary** | transparent | `--color-text-primary` | 1px `--color-border` | Secondary actions |
| **Ghost** | transparent | `--color-text-secondary` | none | Tertiary, toolbar actions |
| **Destructive** | `--color-error-subtle` | `--color-error` | none | Delete, irreversible actions |

### Sizes

| Size | Height | Padding (horizontal) | Font |
|------|--------|------------------------|------|
| `sm` | 32px | 12px | `body-sm` |
| `md` | 36px | 16px | `body` |
| `lg` | 40px | 20px | `body` |

### Button rules

- **One primary button per section** — avoid competing CTAs.
- Border radius: `radius-md`.
- Hover: primary → `--color-accent-hover`; secondary → `--color-surface-elevated`.
- Disabled: 50% opacity, `cursor-not-allowed`, no hover change.
- Loading: replace label with spinner; preserve button width; disable interaction.
- Icon buttons: 36×36px (`md`), centered icon, `ghost` variant by default.
- Focus: 2px `--color-accent` ring, 2px offset (see Accessibility).

---

## 9. Form Fields

### Anatomy

Label → Input → Helper text / Error message

| Element | Spec |
|---------|------|
| Label | `body-sm`, `--color-text-primary`, `space-2` below label to input |
| Input height | 36px (single line) |
| Input padding | `space-3` horizontal |
| Background | `--color-surface` |
| Border | 1px `--color-border` |
| Border radius | `radius-md` |
| Placeholder | `--color-text-muted` |
| Focus border | `--color-accent` |
| Error border | `--color-error` |
| Error message | `caption`, `--color-error`, `space-2` above |

### Field types

| Type | Notes |
|------|-------|
| Text / email / password | Standard input styling |
| Select | Same dimensions as text input; chevron icon right |
| Textarea | Min height 96px; same border and focus rules |
| Checkbox / radio | 16px; accent color when checked |

### Form rules

- **Always show a visible label** — placeholders are not labels.
- Group related fields with `space-4` between fields, `space-6` between groups.
- Required fields: append `*` to label in `--color-text-muted`.
- Inline forms (dashboard create): may use horizontal layout on desktop, stack on mobile.
- Do not disable submit buttons for validation — show errors on submit.

---

## 10. Cards

Cards are the primary content container for modules.

| Property | Value |
|----------|-------|
| Background | `--color-surface` |
| Border | 1px `--color-border-subtle` |
| Border radius | `radius-lg` |
| Padding | `space-6` |
| Shadow | `shadow-none` (dark) · `shadow-sm` (light, optional) |
| Header → body gap | `space-4` |

### Card variants

| Variant | Usage |
|---------|-------|
| **Default** | Stats, lists, forms |
| **Interactive** | Clickable rows; add hover `--color-surface-elevated` |
| **Flat** | Nested inside another card; no border, `--color-surface-elevated` bg |

### Card rules

- One primary topic per card.
- Card titles use `heading-sm`.
- Avoid cards inside cards beyond one nesting level.

---

## 11. Tables

Use tables when comparing structured data across rows. Prefer cards/lists for fewer than 4 columns or mobile views.

| Property | Value |
|----------|-------|
| Header background | `--color-surface-elevated` |
| Header text | `caption`, `--color-text-secondary`, uppercase tracking |
| Row height | 44px minimum |
| Row border | 1px bottom `--color-border-subtle` |
| Row hover | `--color-surface-elevated` |
| Cell padding | `space-3` horizontal, `space-2` vertical |
| Font | `body-sm` |

### Table rules

- Left-align text; right-align numbers.
- Sticky header on scroll for tables with more than 8 rows.
- On **mobile (<768px):** convert to stacked card rows or horizontal scroll — never shrink text below `caption`.
- Empty table → use Empty state pattern (section 14).

---

## 12. Status Badges

Compact labels for entity state. Not interactive unless explicitly clickable.

| Status | Background | Text | Example |
|--------|------------|------|---------|
| **Neutral** | `--color-surface-elevated` | `--color-text-secondary` | Geplant |
| **Active / in progress** | `--color-accent-subtle` | `--color-accent` | In Arbeit |
| **Success** | `--color-success-subtle` | `--color-success` | Abgeschlossen |
| **Warning** | `--color-warning-subtle` | `--color-warning` | Ausstehend |
| **Error** | `--color-error-subtle` | `--color-error` | Fehler |

### Badge spec

| Property | Value |
|----------|-------|
| Height | 22px |
| Padding | `space-1` vertical, `space-2` horizontal |
| Border radius | `radius-sm` |
| Font | `caption`, weight 500 |
| Icon (optional) | 12px, left of label, `space-1` gap |

**Rule:** one badge per status dimension. Do not stack multiple badges on a single row item unless showing independent dimensions (e.g. status + type).

---

## 13. Dialogs and Dropdowns

### Dialog (modal)

| Property | Value |
|----------|-------|
| Overlay | `rgba(0, 0, 0, 0.7)` |
| Panel background | `--color-surface` |
| Panel border | 1px `--color-border` |
| Panel radius | `radius-lg` |
| Panel shadow | `shadow-md` |
| Max width | 480px (confirm) · 640px (forms) |
| Padding | `space-6` |
| Title | `heading-sm` |
| Actions | Right-aligned, `space-3` gap, primary on the right |

### Dropdown / popover

| Property | Value |
|----------|-------|
| Background | `--color-surface` |
| Border | 1px `--color-border` |
| Radius | `radius-md` |
| Shadow | `shadow-sm` |
| Item height | 36px |
| Item padding | `space-3` horizontal |
| Item hover | `--color-surface-elevated` |
| Divider | 1px `--color-border-subtle`, `space-1` vertical margin |

### Rules

- Trap focus inside open dialogs.
- Close on overlay click for non-destructive dialogs only.
- Destructive confirmations require explicit button click (no overlay dismiss).
- Dropdowns align to trigger's leading edge; flip if near viewport edge.

---

## 14. Empty, Loading and Error States

### Empty state

Centered within the parent container.

| Element | Spec |
|---------|------|
| Icon | 48px, `--color-text-muted`, optional |
| Title | `heading-sm`, `--color-text-primary` |
| Description | `body-sm`, `--color-text-secondary`, max-width 360px |
| Action | One primary button below, `space-4` gap |

**Copy tone:** helpful and direct — e.g. "Noch keine Projekte vorhanden" + "Projekt erstellen".

### Loading state

| Context | Pattern |
|---------|---------|
| Full page | Centered spinner, 24px, `--color-accent` |
| Section / card | Skeleton blocks using `--color-surface-elevated` with subtle pulse |
| Button | Inline spinner replacing label |
| Table | 5 skeleton rows |

**Rule:** prefer skeletons for content areas; spinners for actions and full-page loads. Pulse animation: 1.5s ease-in-out — the only allowed looping animation.

### Error state

| Context | Pattern |
|---------|---------|
| Inline field | Error message below field (see Forms) |
| Section | Banner: `--color-error-subtle` bg, `--color-error` text, `radius-md`, `space-4` padding |
| Full page | Empty state layout with error icon, message, and retry button |

**Rule:** show actionable recovery (retry, go back) — never a dead end.

---

## 15. Responsive Behavior

### Breakpoints

| Name | Min width | Layout behavior |
|------|-----------|-----------------|
| **Mobile** | 0 – 767px | Single column; sidebar as drawer overlay |
| **Tablet** | 768 – 1023px | Collapsed sidebar (icons); 2-column grids |
| **Desktop** | 1024 – 1439px | Full sidebar; 3-column stats grid |
| **Wide** | 1440px+ | Content max-width 1200px, centered |

### Responsive rules

| Component | Mobile | Tablet | Desktop |
|-----------|--------|--------|---------|
| Sidebar | Drawer | 64px icons | 240px full |
| Stats grid | 1 column | 2 columns | 3 columns |
| Page padding | 16px | 24px | 48px |
| Form layouts | Stacked | Stacked or inline | Inline where space allows |
| Tables | Card rows | Scroll or cards | Full table |
| Dialogs | Full-width minus 32px margin | Centered panel | Centered panel |

**Touch targets:** minimum 44×44px on mobile for all interactive elements.

---

## 16. Accessibility Rules

AIOS must meet **WCAG 2.1 Level AA** as a baseline.

| Rule | Requirement |
|------|-------------|
| **Color contrast** | 4.5:1 body text · 3:1 large text and UI components |
| **Focus visible** | 2px solid `--color-accent` outline, 2px offset; never `outline: none` without replacement |
| **Keyboard navigation** | All interactive elements reachable via Tab; logical tab order |
| **Skip link** | "Skip to main content" as first focusable element |
| **Semantic HTML** | Use `nav`, `main`, `aside`, `header`, `section`, `button`, `label` |
| **Language** | `<html lang="de">` for German UI |
| **Form labels** | Every input has an associated `<label>` or `aria-label` |
| **Error announcements** | `aria-live="polite"` on error banners and toast region |
| **Dialog focus trap** | Focus moves into dialog on open; returns to trigger on close |
| **Motion** | Respect `prefers-reduced-motion: reduce` — disable transitions and pulse |
| **Icons** | Decorative icons: `aria-hidden="true"`; functional icons: accessible name |

---

## 17. Animation and Interaction Rules

### Allowed transitions

| Property | Duration | Easing |
|----------|----------|--------|
| Color, background, border | 150ms | `ease` |
| Opacity | 150ms | `ease` |
| Transform (dropdown open) | 200ms | `ease-out` |
| Sidebar drawer | 250ms | `ease-in-out` |

### Prohibited

- Bounce, spring, or elastic easing
- Parallax scrolling
- Gradient animations
- Looping animations (except loading skeleton pulse and spinner)
- Hover animations that move layout (scale, translate on buttons)

### Interaction feedback

| Action | Feedback |
|--------|----------|
| Button click | Immediate visual press (opacity 0.9, 100ms) |
| Navigation | Active state on current route — no page transition animation |
| Toast (future) | Slide in from bottom-right, 200ms; auto-dismiss 4s |
| Delete confirm | Dialog only — no undo toast until undo is implemented |

---

## 18. Rules for Future AIOS Modules

When adding a module (Clients, AI Agents, Settings, etc.), follow this checklist:

### Before building

1. Read [BLUEPRINT.md](./BLUEPRINT.md) for module scope.
2. Confirm no new color tokens are needed — reuse semantic palette.
3. Define entity statuses and map them to badge tokens (section 12).

### Layout

4. Use the application shell: sidebar + main content area (section 7).
5. Open with a page header: title (`heading-lg`) + optional primary action.
6. Stack sections with `space-8`.

### Components

7. Wrap content in **cards** (section 10) — one concern per card.
8. Use **tables** only when row comparison justifies it (section 11).
9. Use **forms** with visible labels (section 9).
10. Provide **empty**, **loading**, and **error** states on every data view (section 14).

### Behavior

11. One **primary button** per section (section 8).
12. Destructive actions require **dialog confirmation** (section 13).
13. Mutations give feedback — optimistic UI only when rollback is implemented.
14. Respect **responsive breakpoints** (section 15) from the first implementation, not as a follow-up.

### Quality

15. Verify **accessibility** checklist (section 16) before merge.
16. Keep **motion** within allowed transitions (section 17).
17. Write UI copy in **German**.
18. If a new pattern is unavoidable, update this document and log a decision in [DECISIONS.md](./DECISIONS.md).

---

## Appendix: Iconography

Replace emoji placeholders with a consistent icon set (recommended: **Lucide**, 16px inline · 20px nav · 24px empty states). Icons inherit `--color-text-secondary` by default; active nav icons use `--color-accent`.

| Context | Size | Color |
|---------|------|-------|
| Sidebar nav | 20px | secondary → accent when active |
| Inline action | 16px | inherit text color |
| Empty state | 48px | muted |
| Button icon | 16px | inherit button text |

---

## Related Documents

- [Blueprint](./BLUEPRINT.md) — Product modules this system supports
- [Architecture](./ARCHITECTURE.md) — Component and file structure
- [Roadmap](./ROADMAP.md) — UI implementation phases
- [Decisions](./DECISIONS.md) — Design and architecture choices
