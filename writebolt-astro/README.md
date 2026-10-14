# Writebolt Blog — Astro

This folder is the blog you install from the [Writebolt repository](https://github.com/appy-eth/writebolt-supabase-blog-cms): [Astro](https://astro.build) + [Supabase](https://supabase.com), with a full admin CMS.

Install it in one of two ways. The full steps are in the repository [README](../README.md).

- **Add-on** — add a Supabase-powered blog to a website you already have. Set `BLOG_BASE_PATH=/blog`. Articles are published at `/blog/{slug}`.
- **Standalone** — create a blog or news website on its own. Leave `BLOG_BASE_PATH` empty. Articles are published at `/{slug}`.

> **Looking for Next.js?** That edition is the repository root (`../`). See the main [README](../README.md) → *Next.js edition*.

## Features

- **Astro SSR** with the `@astrojs/node` adapter
- **Supabase** as the single source of truth
- **Public blog:** article grid, search, pagination, tags, categories, author profiles, sidebar (popular posts, CTA, newsletter), related articles, table of contents, breadcrumbs, reading progress, dark mode, embedded-layout category chips
- **In-article blocks:** `<CTAInline />`, `<LeadMagnet />`, `<NewsletterSignup />`, `<CTASidebar />` in Markdown (same as the Next.js MDX components)
- **SEO:** title templates, Open Graph (including generated `/api/og` fallback), NewsArticle JSON-LD, RSS, sitemap, Google News sitemap, robots.txt (allows Googlebot-News), Google Analytics
- **Admin** at `/admin` — articles, categories, authors, media library, custom nav, full site settings, scheduled publishing
- **AI writing assist** (BYOK) — drafts, rewrite, expand, headlines, excerpt, image generation
- **Image storage** — local `public/images` or Supabase Storage
- **Newsletter** — API hook + optional embed form
- **Writebolt ads** — optional site ID in settings
- **Env-based auth** — SHA-256 hashed session cookie (no Supabase Auth required)

When adding this blog to an **existing** Astro site, follow **[AGENTS.md](./AGENTS.md)** (layout mode, homepage heading, featured categories, CTAs).

## Quick Start

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com) and create a new project. Then run **`supabase/001_initial_schema.sql`** in the SQL Editor (this file is **only** for the Astro app).

If you already applied an older slim Astro schema, run **`supabase/002_feature_parity.sql`** as well to add the extra columns and tables.

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in Supabase URL, anon key, service role key, admin username and password, and `SITE_URL`. For an add-on on an existing site, also set `BLOG_BASE_PATH=/blog`. Leave that empty for a standalone blog. `npm run setup` will generate `SETTINGS_ENCRYPTION_KEY` if it is missing.

### 3. Install and seed

```bash
npm install
npm run setup
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
├── components/          # Public + admin UI (cards, sidebar, newsletter, TOC, …)
├── layouts/
│   ├── Base.astro       # Public layout (header, footer, SEO, theme)
│   └── Admin.astro      # Admin shell
├── lib/
│   ├── data.ts          # Public + admin queries
│   ├── ai/              # BYOK text + image generation
│   └── storage/         # Local or Supabase Storage
├── pages/
│   ├── index.astro      # Homepage
│   ├── [slug].astro     # Article
│   ├── category/ tag/ authors/
│   ├── rss.xml.ts  sitemap.xml.ts  news-sitemap.xml.ts  robots.txt.ts
│   ├── admin/           # CMS
│   └── api/             # Newsletter, upload, AI
└── styles/global.css
supabase/
├── 001_initial_schema.sql
└── 002_feature_parity.sql   # Upgrade from the original slim schema
```

## Deployment

```bash
npm run build
node dist/server/entry.mjs
```

For Vercel, switch the adapter to `@astrojs/vercel` in `astro.config.mjs`.

## Scheduled Publishing

The GitHub Action at `.github/workflows/publish-scheduled.yml` runs every 15 minutes and publishes **`scheduled`** articles whose **`scheduled_for`** timestamp has passed. Add **`SUPABASE_URL`** and **`SUPABASE_SERVICE_ROLE_KEY`** as repository secrets.

## License

MIT
