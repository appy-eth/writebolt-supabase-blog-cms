# Writebolt Blog — Astro Edition (**recommended**)

This folder is the **primary** open-source blog template in the [Writebolt monorepo](https://github.com/appy-eth/writebolt-supabase-blog-cms): [Astro](https://astro.build) + [Supabase](https://supabase.com), Markdown-first, server-rendered, with a built-in admin panel.

> **Looking for Next.js?** Use the repository **root** (`../` from here): MDX, AI assist, embedded layout mode, and `npx writebolt-blog init`. See the main [**README.md**](../README.md) → *Optional: Next.js template*.

## Features

- **Astro SSR** — server-rendered pages with the `@astrojs/node` adapter
- **Supabase** as the single source of truth (no local markdown files for published content)
- **Admin panel** at `/admin` — create, edit, schedule, archive, and delete articles
- **Categories** — managed in admin; visible categories appear in the site header next to the logo
- **Scheduled publishing** via GitHub Actions (every 15 min) — see `.github/workflows/publish-scheduled.yml`
- **Markdown editor** with live slug generation
- **Env-based auth** — no Supabase Auth dependency; SHA-256 hashed session cookie

## Quick Start

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com) and create a new project. Then run **`supabase/001_initial_schema.sql`** in the SQL Editor (this file is **only** for the Astro app — the Next.js edition uses a different migration at the repo root).

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in Supabase URL, anon key, service role key, admin username and password, and `SITE_URL` (e.g. `http://localhost:4321` for local dev).

### 3. Install and seed

```bash
npm install
npm run setup   # seeds default author + site settings (if not already in DB)
```

### 4. Run

```bash
npm run dev
```

- Blog: `http://localhost:4321`
- Admin: `http://localhost:4321/admin/login`

## Project Structure

```
src/
├── layouts/
│   ├── Base.astro          # Public layout (header with logo + categories)
│   └── Admin.astro         # Admin layout with sidebar
├── lib/
│   ├── supabase.ts         # Public + admin Supabase clients
│   ├── auth.ts             # Session auth helpers
│   ├── data.ts             # Data-fetching functions
│   └── utils.ts             # Slug, date formatting
├── pages/
│   ├── index.astro         # Homepage article grid
│   ├── [slug].astro        # Single article
│   ├── 404.astro
│   ├── category/
│   │   └── [slug].astro    # Category archive
│   ├── admin/
│   │   ├── login.astro
│   │   ├── index.astro     # Article list
│   │   ├── new.astro       # New article
│   │   ├── edit/[id].astro
│   │   ├── categories.astro
│   │   └── settings.astro
│   └── api/
│       └── auth/logout.ts
├── styles/
│   └── global.css
supabase/
└── 001_initial_schema.sql
.github/workflows/
└── publish-scheduled.yml
```

## Deployment

Build and deploy anywhere that supports Node.js (Vercel, Railway, Fly, etc.):

```bash
npm run build
node dist/server/entry.mjs
```

For Vercel, switch the adapter to `@astrojs/vercel` in `astro.config.mjs`.

## Scheduled Publishing

The GitHub Action at `.github/workflows/publish-scheduled.yml` runs every 15 minutes and flips **`scheduled`** articles whose **`scheduled_for`** timestamp has passed to **`published`**. Add **`SUPABASE_URL`** and **`SUPABASE_SERVICE_ROLE_KEY`** as repository secrets on **this** GitHub repo (or your fork).

## License

MIT
