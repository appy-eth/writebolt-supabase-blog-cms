<p align="center">
  <img src="public/images/writebolt-blog-logo.svg" alt="Writebolt Blog" width="280" />
</p>

<h1 align="center">Writebolt Blog CMS</h1>

<p align="center">
  <strong>The open-source blog CMS for Astro + Supabase.</strong><br/>
  A production-ready template with admin, categories, and scheduled publishing — plus an optional Next.js edition in the same repo.
</p>

<p align="center">
  <a href="#recommended-astro-template">Astro setup</a> ·
  <a href="#optional-nextjs-template">Next.js (optional)</a> ·
  <a href="#scheduled-publishing">Scheduled publishing</a> ·
  <a href="#writebolt-ads-optional">Ads (Next.js)</a> ·
  <a href="#features">Features</a> ·
  <a href="#ai-writing-assist-nextjs">AI Writing (Next.js)</a> ·
  <a href="https://writebolt.com">Writebolt Pro →</a>
</p>

<p align="center">
  <a href="https://github.com/appy-eth/writebolt-supabase-blog-cms/stargazers"><img src="https://img.shields.io/github/stars/appy-eth/writebolt-supabase-blog-cms?style=flat&color=22C55E" alt="Stars" /></a>
  <a href="https://github.com/appy-eth/writebolt-supabase-blog-cms/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="License" /></a>
  <a href="https://github.com/appy-eth/writebolt-supabase-blog-cms/issues"><img src="https://img.shields.io/github/issues/appy-eth/writebolt-supabase-blog-cms" alt="Issues" /></a>
  <img src="https://img.shields.io/badge/Astro-5-BC52EE?logo=astro&logoColor=white" alt="Astro 5" />
  <img src="https://img.shields.io/badge/Next.js-14-000000?logo=next.js&logoColor=white" alt="Next.js 14 (optional)" />
  <img src="https://img.shields.io/badge/Supabase-ready-3ECF8E" alt="Supabase" />
  <img src="https://img.shields.io/badge/TypeScript-strict-blue" alt="TypeScript" />
</p>

---

## Repository layout

This GitHub repository is a **monorepo**:

| Path | Stack | When to use |
|------|--------|-------------|
| **`writebolt-astro/`** | **Astro 5 + Supabase** | **Default.** Fast SSR blog, Markdown admin, minimal deps. |
| **Repository root** (`app/`, `components/`, …) | Next.js 14 + Supabase | Full MDX CMS, AI tools, embedded blog mode, `npx writebolt-blog init`. |

> **New here?** Clone the repo, then **`cd writebolt-astro`** and follow [Recommended: Astro template](#recommended-astro-template) below.

---

## Recommended: Astro template

The **`writebolt-astro`** directory is the primary way to run this project. Full detail lives in [`writebolt-astro/README.md`](writebolt-astro/README.md).

### 1. Clone and enter the Astro app

```bash
git clone https://github.com/appy-eth/writebolt-supabase-blog-cms.git my-blog
cd my-blog/writebolt-astro
npm install
```

### 2. Create a Supabase project and apply the schema

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor → New query**.
3. Paste and run **`writebolt-astro/supabase/001_initial_schema.sql`** (Astro-specific schema — do not use the Next.js migration for this app).

### 3. Environment and seed

```bash
cp .env.example .env
```

Edit `.env` with your Supabase URL, anon key, service role key, admin username/password, and `SITE_URL` (default dev: `http://localhost:4321`). Then:

```bash
npm run setup
```

### 4. Run locally

```bash
npm run dev
```

- **Blog:** [http://localhost:4321](http://localhost:4321)
- **Admin:** [http://localhost:4321/admin/login](http://localhost:4321/admin/login)

<details>
<summary><strong>Troubleshooting: wrong folder / missing <code>package.json</code></strong></summary>

The Astro app’s `package.json` is inside **`writebolt-astro/`**. If you run `npm install` at the repository root, you are in the **Next.js** project instead.

</details>

---

## Optional: Next.js template

The **repository root** contains the original Next.js 14 + Supabase CMS (MDX, optional AI, layout modes, `WriteboltAd`, etc.). Use it when you need React/MDX, BYOK AI in the admin, or **embedded** blog mode inside an existing Next app.

### Standalone Next.js blog

From the **root** of the cloned repo (not `writebolt-astro/`):

```bash
cd my-blog   # repo root, sibling of writebolt-astro/
npm install
```

1. In Supabase **SQL Editor**, run **`supabase/migrations/001_writebolt_blog_schema.sql`** (Next.js schema — different tables from the Astro edition).
2. Run the interactive wizard:

```bash
npm run setup
```

`npm run setup` writes `.env.local` (Supabase URL, anon + service role keys, encryption key, and optional `NEWSLETTER_API_KEY`). If the database was not ready yet, run **`npm run setup -- --seed`** after the migration succeeds.

```bash
npm run dev
```

- Opens **[localhost:3000/admin](http://localhost:3000/admin)** by default; public blog at **`/blog`**.

### Add the blog to an existing Next.js + Supabase app

```bash
npx writebolt-blog init
```

> **Requires:** Node.js 18+, an existing **Next.js** project with Supabase configured in `.env.local`.

### Next.js layout modes

| Mode | What renders | Best for |
|------|-------------|----------|
| **Standalone** (default) | Full header with blog title, nav, footer | Dedicated blog site |
| **Embedded** | Blog content only — your app provides the layout | `/blog` section in your existing app |
| **Custom** | Blog header with your branding + nav links | Blog subdomain (`blog.company.com`) |

Switch anytime in **`/admin/settings`** → Layout.

### AI coding agent prompt (Next.js embed)

<details>
<summary><strong>📋 Copy prompt for AI coding agent (Next.js)</strong></summary>

```
Add the Writebolt Blog CMS to my existing Next.js + Supabase project.

Source repo: https://github.com/appy-eth/writebolt-supabase-blog-cms

Steps:
1. Clone the repo to a temp directory.
2. Copy these into my project (don't overwrite my existing supabase client/server files):
   - app/blog/, app/authors/, app/admin/
   - app/api/ai/, app/api/upload/, app/api/og/
   - app/rss.xml/, app/sitemap.xml/
   - components/blog/, components/admin/, components/callouts/,
     components/author/, components/seo/
   - components/layout/blog-header.tsx, blog-nav.tsx, blog-footer.tsx,
     blog-layout-provider.tsx, sidebar.tsx
   - lib/ai/, lib/storage/, lib/mdx/
   - lib/supabase/queries.ts (merge with existing if present)
   - lib/utils/ and types/ (merge with existing if present)
3. Run the SQL migrations from supabase/migrations/ against my Supabase
   database using my SUPABASE_SERVICE_ROLE_KEY from .env.local.
4. Set layout_mode to 'embedded' in the blog_settings table.
5. Add SETTINGS_ENCRYPTION_KEY to .env.local (generate: openssl rand -hex 32).
6. Delete the temp directory.
7. Verify /blog loads correctly.
```

</details>

---

## Scheduled publishing

### Astro (`writebolt-astro/`)

Scheduled articles use **`scheduled_for`** on **`articles`**. Enable the workflow in **`writebolt-astro/.github/workflows/publish-scheduled.yml`** (runs every **15 minutes**). Add repository secrets:

- **`SUPABASE_URL`**
- **`SUPABASE_SERVICE_ROLE_KEY`**

### Next.js (repository root)

Articles in **`scheduled`** status use **`scheduled_date`**. The root workflow **`.github/workflows/publish-drafts.yml`** runs every **6 hours** (or manually) and respects **`blog_settings.scheduled_publishing_enabled`**.

Add the same **`SUPABASE_URL`** and **`SUPABASE_SERVICE_ROLE_KEY`** secrets to the repo. See the workflow file for the exact REST calls.

---

## Writebolt ads (optional, Next.js)

The template includes **`components/WriteboltAd.tsx`** — an opt-in ad unit for the **Next.js** app. It is **not** wired into the Astro edition by default.

1. Register your site at [writebolt.app](https://writebolt.app) to get a **Site ID** (when registration opens).
2. Import and place the component where you want ads:

```tsx
import { WriteboltAd } from "@/components/WriteboltAd";

<WriteboltAd placement="in-article" siteId="your-site-id" />
<WriteboltAd placement="sidebar" siteId="your-site-id" />
<WriteboltAd placement="footer" siteId="your-site-id" />
```

Revenue share is **60% site owner / 40% Writebolt** when a `siteId` is set.

Optional env override: `NEXT_PUBLIC_WRITEBOLT_ADS_API_URL` (defaults to `https://api.writebolt.app`).

---

## Features

### Astro template (`writebolt-astro/`)

- Server-rendered pages with **`@astrojs/node`**
- Markdown in admin; Supabase as source of truth
- Categories in the header next to the logo
- Admin at **`/admin`** (env-based session auth)
- Scheduled publishing via GitHub Actions (see above)

### Next.js template (repository root)

- Article grid with sidebar, search, category/tag browsing
- Article pages with reading progress and table of contents (**MDX** + custom components)
- Author profiles, RSS, sitemap, SEO meta + JSON-LD
- **Embedded** / standalone / custom layout modes
- **`npx writebolt-blog init`** for existing apps
- Optional **`WriteboltAd`** component

### Admin CMS (both stacks)

- Articles, categories, settings (scope differs — see each template’s README)
- Next.js adds: media library, nav builder, AI settings UI, image storage modes, newsletter API hook

---

## AI writing assist (Next.js)

The **Next.js** admin includes BYOK (Bring Your Own Key) AI: generate drafts, rewrite, expand, headlines, excerpt, and images. Configure keys in **`/admin/settings/ai`**. The Astro edition focuses on a lightweight Markdown workflow without bundled AI providers.

| Feature | Next.js |
|---------|---------|
| Generate Draft | ✓ |
| Rewrite / Expand / Headlines / Excerpt | ✓ |
| Generate Image (DALL-E / Replicate) | ✓ |

---

## Database

**Important:** the Astro and Next.js templates use **different** SQL migrations and table shapes. Apply only the migration that matches the app you run.

| Template | Migration file |
|----------|----------------|
| **Astro** | `writebolt-astro/supabase/001_initial_schema.sql` |
| **Next.js** | `supabase/migrations/001_writebolt_blog_schema.sql` |

### Next.js tables (summary)

| Table | Purpose |
|-------|---------|
| `articles` | Posts with full-text search, reading time, SEO fields |
| `authors` | Writer profiles |
| `blog_settings` | Layout, CTAs, newsletter, scheduling flags |
| `categories` | Taxonomy |
| `nav_items` | Header navigation |
| `ai_settings` | Encrypted API keys |

After the correct migration is applied, run **`npm run setup`** from the **same** project folder (Astro: `writebolt-astro/` with `.env`; Next.js: repo root with `.env.local`).

---

## Image storage (Next.js)

| Mode | Best for |
|------|----------|
| **Local** (default) | Quick start |
| **Supabase Storage** | Higher volume, CDN |

Configured in **`/admin/settings`** → Image Storage.

---

## Project structure (monorepo)

```
writebolt-astro/             ← Recommended entry point
├── astro.config.mjs
├── src/
│   ├── pages/               # index, [slug], category, admin, api
│   ├── layouts/
│   └── lib/
├── supabase/
│   └── 001_initial_schema.sql
└── scripts/setup.mjs

# Next.js app (repository root)
app/
├── blog/
├── admin/
├── api/
├── rss.xml/
└── sitemap.xml/
components/
lib/
supabase/migrations/
```

---

## Environment variables

### Astro (`writebolt-astro/.env`)

See **`writebolt-astro/.env.example`**: `SUPABASE_*`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `SITE_URL`.

### Next.js (repository root, `.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SETTINGS_ENCRYPTION_KEY=  # from npm run setup

# Optional
# NEWSLETTER_API_KEY=
# OPENAI_API_KEY=sk-...
# REPLICATE_API_KEY=r8_...
# NEXT_PUBLIC_WRITEBOLT_ADS_API_URL=https://api.writebolt.app
```

---

## Deployment

### Astro

Build output targets **Node** by default (`npm run build` → `node dist/server/entry.mjs`). Deploy on Vercel, Railway, Fly, etc. For Vercel, you can switch to **`@astrojs/vercel`** in `writebolt-astro/astro.config.mjs`.

### Next.js

Works on **Vercel**, **Netlify** (Next adapter), or self-hosted **`npm run build && npm start`** from the repo root.

---

## Supercharge with Writebolt ⚡

Love the blog template? **[Writebolt](https://writebolt.com)** takes your blog further with researched long-form content, internal linking, and publishing via GitHub.

**[Try Writebolt Free →](https://writebolt.com)**

---

## Contributing

Issues and PRs are welcome for **either** template (`writebolt-astro/` or the Next.js root). Mention which stack you are changing in the description.

## License

MIT — use it for anything.

---

<p align="center">
  Built by <a href="https://appystudios.com">Appy Studios</a> · Powered by <a href="https://writebolt.com">Writebolt</a>
</p>
