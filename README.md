# AIOS

**AI Operating System** — a modular dashboard for managing projects, clients, and AI agents.

Built with Next.js 16, React Server Components, and Supabase.

---

## Features

- **Dashboard** — Stats overview, project list, and quick actions
- **Projects** — Create, list, and delete projects via Supabase
- **Authentication** — Email/password login with SSR session handling
- **Route protection** — Unauthenticated users are redirected to `/login`

---

## Quick Start

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project with Email auth enabled

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

### 3. Set up the database

Run in the Supabase SQL editor:

```sql
create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'In Arbeit',
  type text not null default 'Website',
  created_at timestamptz default now()
);
```

Create a user under **Authentication → Users**, then start the app.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You will be redirected to `/login`.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Project Structure

```
aios/
├── app/              # Routes, layouts, server actions
├── components/       # UI components
├── lib/              # Data access and Supabase clients
├── docs/             # Project documentation
├── proxy.ts          # Auth proxy (Next.js 16)
└── public/           # Static assets
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [Blueprint](./docs/BLUEPRINT.md) | Product vision, scope, and principles |
| [Roadmap](./docs/ROADMAP.md) | Phased delivery plan and milestones |
| [Architecture](./docs/ARCHITECTURE.md) | Stack, data flow, and extension guide |
| [Decisions](./docs/DECISIONS.md) | Architecture decision records |
| [Design System](./docs/DESIGN_SYSTEM.md) | UI tokens, patterns, and conventions |

---

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router, Proxy)
- [React 19](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS 4](https://tailwindcss.com)
- [Supabase](https://supabase.com) (`@supabase/ssr`)

---

## Security Notice

Authentication and route protection are in place. **Row Level Security (RLS) is not yet configured** — do not deploy to production with multiple users until Phase 2 of the [Roadmap](./docs/ROADMAP.md) is complete.

---

## License

Private project.
