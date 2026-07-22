# AIOS Roadmap

> Living document. Update phase status as work ships.

**Last updated:** July 2026  
**Current version:** `0.1.0`

---

## Overview

```
Phase 1 ──► Phase 2 ──► Phase 3 ──► Phase 4
Foundation   Security    Modules     Scale
  [done]      [active]   [planned]   [future]
```

---

## Phase 1 — Foundation ✅

**Goal:** Replace the default Next.js starter with a working AIOS dashboard connected to Supabase.

| Deliverable | Status |
|-------------|--------|
| Dashboard layout (sidebar, header, stats, project list) | ✅ Done |
| Supabase client setup (`@supabase/ssr`) | ✅ Done |
| Project CRUD (list, create, delete) | ✅ Done |
| Server Actions + automatic revalidation | ✅ Done |
| Email/password authentication | ✅ Done |
| Login page (`/login`) | ✅ Done |
| Route protection via Next.js proxy | ✅ Done |
| Project documentation system (`/docs`) | ✅ Done |

---

## Phase 2 — Security & Data Integrity 🔄

**Goal:** Make the platform production-safe for multiple users.

| Deliverable | Status | Notes |
|-------------|--------|-------|
| Row Level Security (RLS) on `projects` | ⬜ Planned | Required before multi-user use |
| `user_id` column on `projects` | ⬜ Planned | Per-user data isolation |
| Owner-scoped queries and mutations | ⬜ Planned | Server-side authorization |
| Proxy redirect cookie handling fix | ⬜ Planned | Session reliability |
| Server-side input validation (type, status) | ⬜ Planned | Allowlist enforcement |
| Graceful error handling (`error.tsx`) | ⬜ Planned | Avoid full-page crashes |
| Delete confirmation UX | ⬜ Planned | Prevent accidental loss |
| Supabase generated TypeScript types | ⬜ Planned | Schema-safe queries |

---

## Phase 3 — Core Modules 📋

**Goal:** Expand AIOS beyond projects into a full operating system.

### 3a — Clients

| Deliverable | Status |
|-------------|--------|
| `clients` table + RLS | ⬜ Planned |
| Client list and detail views | ⬜ Planned |
| Link projects to clients | ⬜ Planned |
| Stats card: live client count | ⬜ Planned |

### 3b — AI Agents

| Deliverable | Status |
|-------------|--------|
| `agents` table + RLS | ⬜ Planned |
| Agent registry UI | ⬜ Planned |
| Stats card: live agent count | ⬜ Planned |
| Agent status (active, idle, error) | ⬜ Planned |

### 3c — Navigation & Search

| Deliverable | Status |
|-------------|--------|
| Functional sidebar routes | ⬜ Planned |
| Global search in header | ⬜ Planned |
| Quick Actions wired to real flows | ⬜ Planned |

---

## Phase 4 — Scale & Polish 🔮

**Goal:** Prepare AIOS for teams, deployments, and long-term maintenance.

| Deliverable | Status |
|-------------|--------|
| Workspace / multi-tenant support | ⬜ Future |
| Role-based access control | ⬜ Future |
| Audit log for mutations | ⬜ Future |
| E2E test suite (Playwright) | ⬜ Future |
| CI pipeline (lint, build, test) | ⬜ Future |
| Staging + production environments | ⬜ Future |
| i18n (DE/EN) | ⬜ Future |
| Dark mode (design tokens ready) | ⬜ Future |

---

## Milestone Timeline (suggested)

| Milestone | Target | Scope |
|-----------|--------|-------|
| **M1 — MVP** | Complete | Dashboard + auth + projects |
| **M2 — Secure MVP** | Q3 2026 | RLS, ownership, error handling |
| **M3 — Clients & Agents** | Q4 2026 | Two new modules, live stats |
| **M4 — Team-ready** | 2027 | RBAC, tests, CI/CD |

---

## How to Update This Document

1. Move items from ⬜ to ✅ when shipped.
2. Add new items under the appropriate phase.
3. Record significant scope changes in [DECISIONS.md](./DECISIONS.md).
4. Keep phase descriptions aligned with [BLUEPRINT.md](./BLUEPRINT.md).
