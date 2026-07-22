# AIOS Blueprint

> **AI Operating System** — a modular platform for managing projects, clients, and AI agents from a single dashboard.

---

## Vision

AIOS is the central control plane for modern businesses that build and operate digital products with AI. It replaces scattered tools with one authenticated workspace where teams can see what is in progress, act quickly, and scale operations without losing context.

**Long-term goal:** Become the default operating layer between business workflows and AI-powered execution.

---

## Problem Statement

Small and mid-sized teams often manage:

- Client projects across spreadsheets and chat
- Websites and apps without a unified status view
- AI agents as isolated experiments, not integrated workflows

AIOS addresses this by providing a structured dashboard that connects operational data (projects, clients, agents) with secure access and a consistent user experience.

---

## Product Scope

### In scope (current & near-term)

| Module | Description | Status |
|--------|-------------|--------|
| **Dashboard** | Overview with stats, quick actions, and project list | Live |
| **Projects** | Create, list, and delete projects | Live |
| **Authentication** | Email/password login, session management, route protection | Live |
| **Supabase backend** | PostgreSQL data layer with SSR-compatible auth | Live |

### Planned modules

| Module | Description | Priority |
|--------|-------------|----------|
| **Clients** | Customer records linked to projects | High |
| **AI Agents** | Agent registry, status, and task assignment | High |
| **Search** | Global search across entities | Medium |
| **Settings** | Profile, workspace, and integration config | Medium |
| **Notifications** | In-app alerts and activity feed | Low |

---

## Target Users

| Persona | Needs |
|---------|-------|
| **Founder / operator** | Single view of all active work |
| **Developer / builder** | Fast project creation and status tracking |
| **Agency lead** | Client and project overview without tool switching |

---

## Core Principles

1. **Server-first** — Data fetching and mutations run on the server by default (React Server Components, Server Actions).
2. **Secure by default** — Authentication required for the dashboard; database access must be enforced at the policy layer.
3. **Minimal UI, maximum clarity** — Dashboard patterns over feature-heavy interfaces.
4. **Modular growth** — New modules plug into the same layout, auth, and data patterns.
5. **Documentation-driven** — Product and technical decisions are recorded in `/docs` before they spread across the codebase.

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Time to create a project | < 10 seconds |
| Auth session reliability | No unexpected logouts during active use |
| Page load (dashboard) | Server-rendered, no client-side data waterfall |
| Module add time | New entity follows existing CRUD + docs pattern |

---

## Non-Goals (for now)

- Multi-tenant workspaces / organizations
- Real-time collaboration
- Mobile-native apps
- Billing and invoicing
- Public-facing marketing site within the same app

---

## Glossary

| Term | Definition |
|------|------------|
| **AIOS** | AI Operating System — this product |
| **Project** | A unit of work (website, app, or AI agent engagement) |
| **Module** | A functional area of the dashboard (Projects, Clients, etc.) |
| **Proxy** | Next.js 16 request interceptor for session refresh and route protection |

---

## Related Documents

- [Architecture](./ARCHITECTURE.md) — Technical structure and data flow
- [Roadmap](./ROADMAP.md) — Delivery phases and milestones
- [Decisions](./DECISIONS.md) — Recorded technical and product choices
- [Design System](./DESIGN_SYSTEM.md) — UI patterns and tokens
