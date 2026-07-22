# AIOS CRM Data Model

> **Status:** Migration-ready — SQL in `supabase/migrations/20260721143000_create_customers.sql` (not yet applied)  
> **Scope:** First CRM entity (`customers`)  
> **Last updated:** July 2026

This document defines the initial customer data model for the AIOS CRM module (Blueprint: **Clients**). It is intended for review before any Supabase migration or UI work begins.

---

## Purpose

AIOS needs a single source of truth for the businesses and people the team works with. The first CRM entity captures enough information to:

- Identify and contact a prospect or client
- Track where they are in the relationship lifecycle
- Assign accountability to an authenticated user
- Link to projects and other modules later

The model is deliberately **flat** for v1 — one primary contact embedded on the customer record. Complexity (multiple contacts, deals, activities) is deferred to extension tables.

---

## Entity Overview

| Property | Value |
|----------|-------|
| **Table name** | `customers` |
| **Module label (UI)** | Kunden |
| **Primary key** | `id` (uuid) |
| **Ownership** | Row owned by `owner_id` → `auth.users` |
| **Timestamps** | `created_at`, `updated_at` (automatic) |

### Relationship to existing modules

```
auth.users
    │
    └── owns ──► customers (1:n)
                      │
                      └── linked later ──► projects (n:m via junction table)
```

The `projects` table exists today without a client reference. A future `project_customers` or `projects.customer_id` column will connect delivery work to CRM records — out of scope for this proposal.

---

## Proposed Schema

| Column | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | Yes | `gen_random_uuid()` | Stable identifier for URLs, foreign keys, and audit |
| `company_name` | `text` | Yes | — | Legal or trading name of the organization |
| `website` | `text` | No | `null` | Company website URL |
| `industry` | `text` | No | `null` | Sector or vertical (e.g. Gastronomie, E-Commerce) |
| `contact_first_name` | `text` | Yes | — | Primary contact given name |
| `contact_last_name` | `text` | Yes | — | Primary contact family name |
| `email` | `text` | Yes | — | Primary contact email |
| `phone` | `text` | No | `null` | Primary contact phone number |
| `source` | `text` | No | `null` | Acquisition channel (see examples below) |
| `status` | `text` | Yes | `'lead'` | Sales pipeline stage (see below) |
| `owner_id` | `uuid` | Yes | — | FK → `auth.users.id` — authenticated user who owns the record |
| `created_at` | `timestamptz` | Yes | `now()` | When the record was created |
| `updated_at` | `timestamptz` | Yes | `now()` | When the record was last modified |

### Status values

| Value | Label (DE) | Meaning |
|-------|------------|---------|
| `lead` | Lead | New prospect; not yet contacted |
| `contacted` | Kontaktiert | Initial outreach completed (email, call, or message) |
| `meeting` | Meeting | Discovery call or meeting scheduled or completed |
| `proposal` | Angebot | Proposal or quote sent; awaiting decision |
| `customer` | Kunde | Active or past paying client |
| `inactive` | Inaktiv | No longer engaged; archived from active workflows |

Pipeline stages (`lead` → `proposal`) represent the **sales funnel**. Terminal states are `customer` (won) and `inactive` (lost or dormant).

Stored as `text` with a check constraint (or enum) — consistent with the existing `projects.status` pattern until generated types are adopted.

### Source values (recommended)

Free text in v1. Common values for UI picklists and reporting:

| Value | Label (DE) |
|-------|------------|
| `website` | Website |
| `instagram` | Instagram |
| `facebook` | Facebook |
| `google` | Google |
| `linkedin` | LinkedIn |
| `referral` | Empfehlung |
| `cold_call` | Kaltakquise |
| `other` | Sonstiges |

Not enforced at the database level in v1 — validated via application allowlist when forms ship.

---

## Field Rationale

### `id`

Every CRM record needs a permanent, non-guessable identifier. UUIDs align with Supabase and the existing `projects` table, enable safe exposure in URLs (`/customers/[id]`), and support future integrations without ID collision.

### `company_name`

The CRM unit in AIOS is the **organization**, not an individual. Company name is the primary display label in lists, search, and dashboard stats ("Kunden"). It answers: *Who is this business?*

Required because a customer without an organization name is ambiguous in a B2B context.

### `website`

Provides quick context and verification without leaving AIOS. Useful for agencies assessing a client's digital presence and for future AI agents that may analyze a site's stack or content.

Optional — not every lead has a website at first contact (e.g. pre-launch businesses).

### `industry`

Enables filtering, reporting, and eventually AI-assisted suggestions (templates, agent configs per vertical). Free text in v1 keeps the model flexible; a normalized `industries` lookup table can be added when repetition makes it worthwhile.

Optional — may be unknown at lead capture time.

### `contact_first_name` / `contact_last_name`

Split names support proper salutations, sorting by last name, and future personalization (email templates, notifications). A single `contact_name` field would complicate i18n and sorting later.

Both required in v1 because AIOS assumes every customer has at least one reachable person — even if the company is a sole proprietorship.

### `email`

Primary async communication channel and unique identifier candidate within an owner's portfolio. Required for outreach, login invitations (future), and deduplication hints.

Validation at the application layer: RFC 5322–compatible format; uniqueness per `owner_id` is a future consideration, not enforced in v1.

### `phone`

Secondary contact channel, common in DACH markets for quick calls. Stored as `text` to preserve international formats (+49, extensions) without parsing complexity.

Optional — email-first workflows are sufficient for MVP.

### `source`

Records where the customer originated — the acquisition channel at the point of entry. Supports reporting questions such as: *Which channels produce the most leads? Which sources convert to paying customers?*

Examples include Website, Instagram, Google, LinkedIn, Referral, and Cold Call (see recommended values above).

Optional — may be unknown for legacy records or manual entry. Free text in v1 avoids blocking capture; a normalized `sources` lookup table can be added when reporting needs stricter categorization.

Useful for:

- **Marketing attribution** — measure ROI per channel
- **Sales analysis** — compare conversion rates from `lead` to `customer` by source
- **Dashboard breakdowns** — future stats such as "Leads by source this month"

### `status`

Drives pipeline views, dashboard metrics, and badge styling ([DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)). Six states model a realistic B2B sales pipeline without requiring a separate deals table in v1:

- **Lead** → new prospect, not yet contacted  
- **Contacted** → initial outreach completed  
- **Meeting** → discovery call or meeting in progress  
- **Proposal** → quote or proposal sent, awaiting decision  
- **Customer** → deal won; active or past paying relationship  
- **Inactive** → lost, disqualified, or dormant; excluded from active pipeline counts but retained for history  

Default `lead` matches typical CRM entry (new record = new opportunity). Pipeline stages are sequential in intent but may move backward (e.g. `proposal` → `meeting` after revision) — the application should allow any valid transition, not enforce strict ordering at the database level.

### `owner_id`

Links each customer to the authenticated Supabase user who created or is responsible for the record. This is the foundation for:

- Row Level Security (users see only their customers)
- "My clients" views
- Accountability in small teams before workspace/multi-tenant support exists

References `auth.users.id`. On user deletion, policy TBD (restrict delete vs. reassign) — document in migration phase.

### `created_at`

Immutable audit timestamp. Supports sorting ("newest first"), reporting, and SLA tracking later.

### `updated_at`

Signals recency of activity. Should be maintained by a database trigger on `UPDATE` so all mutation paths stay consistent — application code alone is easy to forget.

---

## Constraints and Indexes

Defined in `supabase/migrations/20260721143000_create_customers.sql`. Not yet applied to the remote database.

| Constraint / Index | Purpose |
|--------------------|---------|
| `PRIMARY KEY (id)` | Row identity |
| `FOREIGN KEY (owner_id) REFERENCES auth.users(id)` | Ownership integrity |
| `CHECK (status IN (...))` | Valid pipeline stages |
| `CHECK (char_length(trim(...)) > 0)` | Non-empty company name, contact names, email |
| `INDEX customers_owner_id_idx` | Fast per-user list queries |
| `INDEX customers_owner_id_status_idx` | Filtered dashboard counts and pipeline views |
| `INDEX customers_owner_id_source_idx` | Acquisition channel reporting |
| `INDEX customers_owner_id_created_at_desc_idx` | Default list sort |

### Row Level Security

Implemented in the migration (`customers_*_own` policies):

| Operation | Policy |
|-----------|--------|
| `SELECT` | `owner_id = auth.uid()` |
| `INSERT` | `owner_id = auth.uid()` |
| `UPDATE` | `owner_id = auth.uid()` |
| `DELETE` | `owner_id = auth.uid()` |

---

## TypeScript Shape (reference)

For alignment with `lib/projects.ts` when implementation begins:

```typescript
export type CustomerStatus =
  | "lead"
  | "contacted"
  | "meeting"
  | "proposal"
  | "customer"
  | "inactive";

export type Customer = {
  id: string;
  company_name: string;
  website: string | null;
  industry: string | null;
  contact_first_name: string;
  contact_last_name: string;
  email: string;
  phone: string | null;
  source: string | null;
  status: CustomerStatus;
  owner_id: string;
  created_at: string;
  updated_at: string;
};
```

---

## Extension Path

The v1 model is intentionally minimal. The following extensions can be added **without breaking** existing columns:

### Contact strategy (v1 → v3)

**Version 1** intentionally stores **one primary contact** directly on the customer record (`contact_first_name`, `contact_last_name`, `email`, `phone`). This keeps the schema flat, simplifies list views and create forms, and matches how most small teams track early-stage leads.

**Future versions** will introduce a dedicated `customer_contacts` table, allowing **unlimited contacts per company** (e.g. decision maker, billing contact, technical lead). When that ships:

- Existing embedded contact fields remain on `customers` as the **primary contact** — no breaking migration
- Additional contacts live in `customer_contacts` with their own name, email, phone, and role
- The primary contact may be denormalized on `customers` for fast list rendering, synced from `customer_contacts` where `is_primary = true`

This approach avoids a breaking schema change while giving larger accounts room to grow.

### Near-term (v2)

| Extension | Approach | Why |
|-----------|----------|-----|
| **Link to projects** | Add `customer_id uuid` on `projects` (nullable FK) | Connect delivery work to CRM entity; enables "projects per client" view |
| **Notes** | New `customer_notes` table (`customer_id`, `body`, `author_id`, timestamps) | Free-form history without bloating the main row |
| **Tags** | New `customer_tags` + junction table | Flexible categorization without schema changes per tag |
| **Industry lookup** | New `industries` table; replace free text with `industry_id` | Normalized filtering when repetition justifies it |

### Mid-term (v3)

| Extension | Approach | Why |
|-----------|----------|-----|
| **Multiple contacts** | New `customer_contacts` table; embedded fields remain as primary contact | Accounts with several stakeholders — see Contact strategy above |
| **Addresses** | New `customer_addresses` table | Billing, shipping, legal seat |
| **Activity log** | New `customer_activities` table (calls, emails, status changes) | Timeline view; AI agent action logging |
| **Custom fields** | JSONB `metadata` column or EAV table | Vertical-specific fields without migrations |
| **Company hierarchy** | Self-referential `parent_customer_id` | Agencies with sub-brands or group structures |

### Long-term

| Extension | Approach | Why |
|-----------|----------|-----|
| **Workspace / team** | Replace `owner_id`-only RLS with `workspace_id` + roles | Multi-user teams (see [ROADMAP.md](./ROADMAP.md) Phase 4) |
| **Deals / pipeline** | New `deals` table with monetary values alongside status on `customers` | Revenue forecasting; status on `customers` remains the lightweight pipeline for v1 |
| **Integrations** | External IDs on customer (`hubspot_id`, etc.) | Sync with third-party CRMs |
| **AI enrichment** | Background jobs writing to `metadata` | Auto-fill industry, summary from website |

### Migration-safe rules

1. **Add columns as nullable** when introducing optional data.
2. **Never rename** v1 columns in place — add new, migrate, deprecate.
3. **Keep `owner_id`** until workspace model explicitly replaces it.
4. **Use junction tables** for many-to-many (customers ↔ projects, customers ↔ tags).

---

## Dashboard Impact (future)

When implemented, this entity feeds:

| Surface | Data |
|---------|------|
| Stats card "Kunden" | `COUNT(*) WHERE status = 'customer' AND owner_id = auth.uid()` |
| Pipeline summary (future) | `COUNT(*) GROUP BY status` for active stages (`lead` through `proposal`) |
| Leads by source (future) | `COUNT(*) GROUP BY source WHERE status != 'inactive'` |
| Quick action "+ Neuer Kunde" | Create form → `customers` insert |
| Sidebar "Kunden" | List route filtered by `owner_id` |
| Search (future) | Index on `company_name`, `email`, `contact_*` |

No UI is built in this phase — listed here to validate the model against product requirements.

---

## Open Questions

Resolve before migration:

| # | Question | Options |
|---|----------|---------|
| 1 | Table name: `customers` vs `clients`? | **`customers`** (CRM standard) with UI label "Kunden"; alias documented in Blueprint |
| 2 | Unique email per owner? | Allow duplicates in v1; add unique index later if needed |
| 3 | Soft delete vs hard delete? | Prefer **status = inactive**; hard delete only via explicit action |
| 4 | `website` validation | Store as text; normalize URL in application layer |
| 5 | Backfill `projects.customer_id`? | Nullable FK added when CRM ships; existing projects remain unlinked |
| 6 | `source` as free text vs lookup table? | Free text in v1 with UI allowlist; normalize to `sources` table when reporting needs strict categories |

---

## Related Documents

- [Blueprint](./BLUEPRINT.md) — Clients module scope
- [Roadmap](./ROADMAP.md) — Phase 3a delivery plan
- [Architecture](./ARCHITECTURE.md) — Data access patterns
- [Design System](./DESIGN_SYSTEM.md) — Status badge mapping for pipeline stages (Lead → Inaktiv) and terminal states
- [Decisions](./DECISIONS.md) — Log schema approval as ADR when migration is approved

---

## Approval Checklist

Before applying the migration to Supabase:

- [x] Schema reviewed and field list confirmed
- [x] Status values aligned with UI copy (German labels)
- [x] RLS policy approach agreed
- [x] Extension path accepted for v1 simplicity
- [ ] Migration applied and verified on Supabase
- [ ] Open questions resolved
- [ ] ADR added to DECISIONS.md
