# AIOS Architecture

> Technical reference for how AIOS is built, how data flows, and where to extend the system.

---

## Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js (App Router) | 16.2.x |
| UI | React | 19.2.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Database & Auth | Supabase (PostgreSQL) | — |
| Supabase client | `@supabase/ssr` + `@supabase/supabase-js` | 0.12.x / 2.11x |
| Fonts | Geist Sans, Geist Mono | via `next/font` |

---

## High-Level Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  Dashboard   │    │  Login Form  │    │   Logout     │  │
│  │  (RSC page)  │    │  (RSC page)  │    │   (Action)   │  │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘  │
└─────────┼───────────────────┼───────────────────┼──────────┘
          │                   │                   │
          ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Server                            │
│                                                              │
│  ┌──────────┐   ┌─────────────────┐   ┌─────────────────┐ │
│  │ proxy.ts │──►│ lib/supabase/   │──►│ Server Actions  │ │
│  │ (auth +  │   │ proxy.ts        │   │ auth.ts         │ │
│  │ redirect)│   │ (session refresh)│   │ projects.ts     │ │
│  └──────────┘   └─────────────────┘   └────────┬────────┘ │
│                                                   │          │
│  ┌──────────────────────────────────────────────▼────────┐ │
│  │ lib/supabase/server.ts  →  lib/projects.ts            │ │
│  └──────────────────────────────────────────────┬────────┘ │
└───────────────────────────────────────────────────┼─────────┘
                                                    │
                                                    ▼
                                          ┌─────────────────┐
                                          │    Supabase     │
                                          │  Auth + Postgres│
                                          │  (projects)     │
                                          └─────────────────┘
```

---

## Directory Structure

```
aios/
├── app/                      # Next.js App Router
│   ├── actions/
│   │   ├── auth.ts           # loginAction, logoutAction
│   │   └── projects.ts       # createProjectAction, deleteProjectAction
│   ├── login/
│   │   └── page.tsx          # Public login page
│   ├── layout.tsx            # Root layout, fonts, metadata
│   ├── page.tsx              # Protected dashboard (/)
│   └── globals.css           # Tailwind + CSS variables
├── components/               # React components (mostly Server Components)
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── StatsCard.tsx
│   ├── ProjectList.tsx
│   ├── CreateProjectForm.tsx
│   ├── DeleteProjectButton.tsx
│   ├── LogoutButton.tsx
│   └── QuickActions.tsx
├── lib/
│   ├── projects.ts           # Data access: getProjects, create, delete
│   └── supabase/
│       ├── client.ts         # Browser Supabase client
│       ├── server.ts         # Server Supabase client (cookies)
│       └── proxy.ts          # Session update + route guard logic
├── proxy.ts                  # Next.js 16 proxy entry point
├── docs/                     # Project documentation
└── public/                   # Static assets
```

---

## Request Lifecycle

### Authenticated dashboard request (`/`)

1. **Proxy** (`proxy.ts`) runs before the route renders.
2. `updateSession()` creates a Supabase server client from request cookies.
3. `supabase.auth.getUser()` validates the session with Supabase Auth.
4. If no user → redirect to `/login`.
5. If user → refresh session cookies and continue.
6. **Page** (`app/page.tsx`) calls `getProjects()` via the server Supabase client.
7. Server Components render HTML; forms post to Server Actions.

### Login request (`/login`)

1. Proxy allows unauthenticated access to `/login`.
2. User submits form → `loginAction` calls `signInWithPassword`.
3. Session cookies are written; user is redirected to `/`.
4. Authenticated users visiting `/login` are redirected to `/`.

### Mutation (create / delete project)

1. Form submits to a Server Action (`app/actions/projects.ts`).
2. `requireUser()` verifies authentication via `getUser()`.
3. Action calls `lib/projects.ts` → Supabase insert/delete.
4. `revalidatePath("/")` refreshes the dashboard data.

---

## Supabase Integration

### Clients

| File | Runtime | Purpose |
|------|---------|---------|
| `lib/supabase/server.ts` | Server (RSC, Actions) | Cookie-based session for reads/writes |
| `lib/supabase/client.ts` | Browser | Reserved for future client-side usage |
| `lib/supabase/proxy.ts` | Proxy (Node.js) | Session refresh on every matched request |

### Cookie handling

Both server and proxy clients use `@supabase/ssr` with `getAll` / `setAll` (never deprecated `get`/`set`/`remove`). The proxy is responsible for keeping session tokens fresh; the server client silently ignores cookie writes from Server Components.

### Environment variables

| Variable | Scope | Required |
|----------|-------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Yes |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public | Yes |

Store these in `.env.local` (gitignored).

---

## Database Schema (current)

### `projects`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | Primary key, default `gen_random_uuid()` |
| `name` | `text` | Required |
| `status` | `text` | e.g. `In Arbeit`, `Abgeschlossen`, `Geplant` |
| `type` | `text` | e.g. `Website`, `App`, `KI-Agent` |
| `created_at` | `timestamptz` | Default `now()` |

> **Note:** RLS and `user_id` are planned but not yet implemented. See [ROADMAP.md](./ROADMAP.md).

---

## Rendering Strategy

| Pattern | Usage in AIOS |
|---------|---------------|
| React Server Components | Pages, lists, forms (no `"use client"`) |
| Server Actions | Login, logout, create/delete project |
| `dynamic = "force-dynamic"` | Dashboard page (always fresh Supabase data) |
| Client Components | None currently — intentional for simplicity |

---

## Security Model (current)

| Layer | Mechanism |
|-------|-----------|
| Route access | Next.js proxy redirects unauthenticated users |
| Mutations | `requireUser()` in Server Actions |
| Session | HTTP-only cookies via `@supabase/ssr` |
| Database | **Not yet enforced** — RLS policies pending |

See [DECISIONS.md](./DECISIONS.md) for rationale and known gaps.

---

## Extension Guide

To add a new module (e.g. Clients):

1. Define the Supabase table and RLS policies.
2. Create `lib/clients.ts` with typed data functions.
3. Create `app/actions/clients.ts` with authenticated Server Actions.
4. Add components under `components/`.
5. Add a route under `app/` or extend the dashboard.
6. Update proxy matcher if new public routes are needed.
7. Document in BLUEPRINT, ROADMAP, and DECISIONS.

---

## Related Documents

- [Blueprint](./BLUEPRINT.md) — Product vision and scope
- [Decisions](./DECISIONS.md) — Architecture decision records
- [Design System](./DESIGN_SYSTEM.md) — UI conventions
