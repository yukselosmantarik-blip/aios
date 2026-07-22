# AIOS Decision Log

> Architecture Decision Records (ADRs) for AIOS.  
> Format: **Status** · **Context** · **Decision** · **Consequences**

New decisions are appended at the bottom with the next ADR number.

---

## ADR-001: Next.js App Router with React Server Components

**Status:** Accepted  
**Date:** 2026-07

### Context

AIOS needs a dashboard that loads authenticated data on every visit without exposing secrets to the browser or building a separate API layer.

### Decision

Use the Next.js App Router with React Server Components as the default rendering model. Data fetching happens in Server Components; mutations use Server Actions.

### Consequences

- ✅ Simpler architecture — no client-side data fetching library required
- ✅ Auth cookies stay on the server
- ⚠️ Server Actions must independently verify auth (proxy alone is insufficient)
- ⚠️ Requires `force-dynamic` or careful caching for live Supabase data

---

## ADR-002: Supabase as backend (Auth + PostgreSQL)

**Status:** Accepted  
**Date:** 2026-07

### Context

AIOS needs authentication, a relational database, and a fast path to CRUD without managing infrastructure.

### Decision

Use Supabase for PostgreSQL storage and email/password authentication. Connect via `@supabase/supabase-js` and `@supabase/ssr`.

### Consequences

- ✅ Auth and database in one platform
- ✅ SSR-compatible session handling with cookie helpers
- ⚠️ Must implement RLS before production multi-user deployment
- ⚠️ Schema changes require Supabase migrations or dashboard SQL

---

## ADR-003: `@supabase/ssr` with separate server and browser clients

**Status:** Accepted  
**Date:** 2026-07

### Context

Supabase auth helpers for Next.js (`@supabase/auth-helpers-nextjs`) are deprecated. Cookie handling must use `getAll` / `setAll` to avoid session bugs.

### Decision

- `lib/supabase/server.ts` — server client with `next/headers` cookies
- `lib/supabase/client.ts` — browser client (reserved for future client components)
- `lib/supabase/proxy.ts` — session refresh logic shared with proxy

Never use deprecated `get`/`set`/`remove` cookie methods.

### Consequences

- ✅ Aligns with current Supabase and Next.js recommendations
- ✅ Session refresh handled at the proxy layer
- ⚠️ Three client entry points to maintain

---

## ADR-004: Next.js 16 Proxy (formerly Middleware) for route protection

**Status:** Accepted  
**Date:** 2026-07

### Context

Next.js 16 renamed `middleware.ts` to `proxy.ts`. AIOS needs session refresh and redirect of unauthenticated users before pages render.

### Decision

Implement route protection in root `proxy.ts`, delegating to `lib/supabase/proxy.ts`:
- Unauthenticated → redirect to `/login`
- Authenticated on `/login` → redirect to `/`
- All other routes → refresh session and continue

### Consequences

- ✅ Centralized auth gate for page routes
- ⚠️ Server Actions on protected routes still need their own auth checks
- ⚠️ Redirect responses should preserve session cookies (known improvement area)

---

## ADR-005: Server Actions over REST API routes

**Status:** Accepted  
**Date:** 2026-07

### Context

Project CRUD and auth flows are form-driven mutations initiated from Server Components.

### Decision

Use Server Actions (`"use server"`) instead of Route Handlers (`app/api/`) for login, logout, and project mutations. Call `revalidatePath("/")` after mutations.

### Consequences

- ✅ Colocated with UI; no API boilerplate
- ✅ Built-in CSRF protection in Next.js
- ⚠️ Not suitable for external API consumers without additional Route Handlers

---

## ADR-006: Tailwind CSS utility-first styling

**Status:** Accepted  
**Date:** 2026-07

### Context

AIOS needs rapid UI iteration with a consistent dashboard aesthetic and minimal CSS maintenance.

### Decision

Use Tailwind CSS v4 with utility classes directly in components. Shared visual patterns are documented in [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md).

### Consequences

- ✅ Fast iteration, no separate CSS files per component
- ⚠️ Repeated utility strings until shared components or tokens are extracted
- ⚠️ Dark mode tokens exist in CSS but dashboard uses light-only classes

---

## ADR-007: German UI, English documentation

**Status:** Accepted  
**Date:** 2026-07

### Context

The product targets German-speaking operators. Documentation should remain accessible to international contributors and AI tooling.

### Decision

- User-facing UI copy: **German**
- Project documentation (`/docs`, README): **English**

### Consequences

- ✅ Clear separation for i18n later
- ⚠️ `lang="en"` on `<html>` should be updated to `de` when i18n is formalized

---

## ADR-008: Defer RLS until auth foundation is complete

**Status:** Accepted (temporary)  
**Date:** 2026-07

### Context

Authentication and dashboard CRUD were prioritized to validate the product shell. RLS requires schema changes (`user_id`) and Supabase policy work.

### Decision

Ship auth + proxy protection first. Implement RLS and per-user ownership in Phase 2 (see [ROADMAP.md](./ROADMAP.md)).

### Consequences

- ✅ Faster iteration on UI and auth flow
- ❌ **Not production-safe for multiple users until RLS ships**
- 📋 Tracked as P0 in security review

---

## ADR-009: Documentation in `/docs` as source of truth

**Status:** Accepted  
**Date:** 2026-07

### Context

As AIOS grows, decisions and design patterns scatter across chat, code comments, and memory. A structured docs folder scales with the team and AI agents.

### Decision

Maintain five core documents:

| File | Purpose |
|------|---------|
| `BLUEPRINT.md` | Product vision and scope |
| `ROADMAP.md` | Phased delivery plan |
| `ARCHITECTURE.md` | Technical structure |
| `DECISIONS.md` | Decision log (this file) |
| `DESIGN_SYSTEM.md` | UI patterns and tokens |

README links to all docs as the entry point.

### Consequences

- ✅ Onboarding and AI context improve
- ⚠️ Docs must be updated when architecture changes

---

## Template for New Decisions

```markdown
## ADR-XXX: [Title]

**Status:** Proposed | Accepted | Deprecated | Superseded by ADR-YYY
**Date:** YYYY-MM

### Context
[What problem or question triggered this decision?]

### Decision
[What was chosen?]

### Consequences
[Positive, negative, and follow-up items]
```
