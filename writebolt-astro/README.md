# Writebolt Blog — Astro

This folder is the blog you install from the [Writebolt repository](https://github.com/appy-eth/writebolt-supabase-blog-cms): [Astro](https://astro.build) + [Supabase](https://supabase.com), with a full admin CMS.

Install it in one of two ways. **Start with the copy-paste agent prompts** in the repository [README](../README.md) (requires [Supabase MCP](https://supabase.com/docs/guides/ai-tools/mcp) in Cursor). The agent installs the code and creates the tables; you finish with `npm run setup` in a terminal.

- **Add-on** — blog at `/blog` on an Astro site you already have. Same dev server and deployment.
- **Standalone** — this folder is the whole site. Articles at `/{slug}`.

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

When adding this blog to an **existing** Astro site, follow **[AGENTS.md](./AGENTS.md)**. Use `integration/astro.mjs`. Do not proxy this app and do not deploy it separately.

## Quick Start

See the repository [README](../README.md):

1. Connect Supabase MCP in Cursor.
2. Paste the **add-on** or **standalone** agent prompt into your project chat.
3. When the agent finishes, run `npm run setup` (or `npm run setup -- --standalone`) in a terminal and answer the wizard yourself.
4. Run `npm run dev` (from the site root on an add-on).

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

For a standalone blog on Vercel, switch the adapter to `@astrojs/vercel` in `astro.config.mjs`. An add-on uses the host site's adapter. Do not deploy this folder as its own project.

## Scheduled Publishing

The GitHub Action at `.github/workflows/publish-scheduled.yml` runs every 15 minutes and publishes **`scheduled`** articles whose **`scheduled_for`** timestamp has passed. Add **`SUPABASE_URL`** and **`SUPABASE_SERVICE_ROLE_KEY`** as repository secrets.

## License

MIT
