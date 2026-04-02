<p align="center">
  <img src="public/images/writebolt-blog-logo.svg" alt="Writebolt Blog" width="280" />
</p>

<h1 align="center">Writebolt Blog CMS</h1>

<p align="center">
  <strong>The open-source blog CMS for Next.js + Supabase.</strong><br/>
  Drop a production-grade blog into any app — or run it standalone.
</p>

<p align="center">
  <a href="#standalone-blog">Standalone Blog</a> ·
  <a href="#add-to-existing-app">Add to Existing App</a> ·
  <a href="#scheduled-publishing">Scheduled publishing</a> ·
  <a href="#writebolt-ads-optional">Ads (optional)</a> ·
  <a href="#features">Features</a> ·
  <a href="#ai-writing-assist">AI Writing</a> ·
  <a href="https://writebolt.com">Writebolt Pro →</a>
</p>

<p align="center">
  <a href="https://github.com/appy-eth/writebolt-supabase-blog-cms/stargazers"><img src="https://img.shields.io/github/stars/appy-eth/writebolt-supabase-blog-cms?style=flat&color=22C55E" alt="Stars" /></a>
  <a href="https://github.com/appy-eth/writebolt-supabase-blog-cms/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="License" /></a>
  <a href="https://github.com/appy-eth/writebolt-supabase-blog-cms/issues"><img src="https://img.shields.io/github/issues/appy-eth/writebolt-supabase-blog-cms" alt="Issues" /></a>
  <img src="https://img.shields.io/badge/Next.js-14-black" alt="Next.js 14" />
  <img src="https://img.shields.io/badge/Supabase-ready-3ECF8E" alt="Supabase" />
  <img src="https://img.shields.io/badge/TypeScript-strict-blue" alt="TypeScript" />
</p>


## The Blog CMS For Supabase

Supabase has become the defacto database or 'BAAS' for developers and vibe coders everywhere, yet blogging is often an afterthought with websites so easy to create. Plus there's the headache of needing a CMS to manage content and SEO, and a quality UI that doesn't look like AI slop.

Writebolt gives you a **full-featured blog CMS** that runs on your existing Supabase project or as a standalone Supabase-powered blog. It has everything you need including a stunning design, blog home page and article page, full schema that slots into your Supabase config, easy setup (git clone + `npm install` + setup wizard), Bring-Your-Own-Key AI powered article and image generation and more.

---

## Setup

Writebolt Blog CMS For Supabase offers two setup types — as a standalone blog website, or a blog you can add to your existing website.

### Standalone Blog

A complete blog site from scratch.

```bash
git clone https://github.com/appy-eth/writebolt-supabase-blog-cms.git my-blog
cd my-blog
npm install
npm run setup
```

`npm run setup` writes your `.env.local` (Supabase URL, keys, encryption key). Have your Supabase URL and keys ready from [supabase.com](https://supabase.com) → **Settings → API**.

Then apply the database schema and seed default content:

1. Open **Supabase → SQL Editor → New query**
2. Paste the full contents of **`supabase/migrations/001_writebolt_blog_schema.sql`**
3. Click **Run**

```bash
npm run seed
npm run dev
```

Visit [localhost:3000](http://localhost:3000) → your blog. Visit [localhost:3000/admin](http://localhost:3000/admin) → start writing.

<details>
<summary><strong>Troubleshooting: <code>npm install</code> says package.json not found</strong></summary>

The repo you cloned must include the full app at the root (you should see `package.json` on GitHub). If the remote only had a README, clone again after the full project is pushed, or pull the latest `main`.

</details>

---

### Add to Existing App

Already have a Next.js + Supabase app or website? One command only.

```bash
npx writebolt-blog init
```

This detects your project, copies the blog files in, runs the database migrations, and sets the layout to **embedded** mode (your app's layout wraps the blog — no duplicate headers/footers). Your blog is immediately live at `/blog`.

> **Requires:** Node.js 18+, an existing Next.js project with Supabase configured in `.env.local`.

---

### Using an AI Coding Agent?

If you're building with **Claude Code**, **Cursor**, **Codex**, or **Gemini**, paste this prompt:

<details>
<summary><strong>📋 Copy prompt for AI coding agent</strong></summary>

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

## Three Layout Modes

| Mode | What renders | Best for |
|------|-------------|----------|
| **Standalone** (default) | Full header with blog title, nav, footer | Dedicated blog site |
| **Embedded** | Blog content only — your app provides the layout | `/blog` section in your existing app |
| **Custom** | Blog header with your branding + nav links | Blog subdomain (`blog.company.com`) |

Switch anytime in `/admin/settings` → Layout. No code changes, takes effect immediately.

---

## Scheduled publishing

Put Markdown or MDX files in **`content/drafts/`** with a **`publishDate`** in the frontmatter (and optionally `draft: true`). Published file-based posts live in **`content/posts/`** (see `writebolt.config.json` → `content_dir`).

**GitHub Action:** [`.github/workflows/publish-drafts.yml`](.github/workflows/publish-drafts.yml) runs **daily at 6:00 UTC** (and can be triggered manually under **Actions → Publish scheduled drafts → Run workflow**). It moves any draft whose `publishDate` is today or in the past into `content/posts/`, strips `draft: true` from frontmatter, and commits the result.

Example frontmatter:

```markdown
---
title: "Why Edge Computing Matters in 2026"
slug: "edge-computing-2026"
publishDate: "2026-04-15"
tags: ["edge", "cloud", "infrastructure"]
draft: true
---

Article content here…
```

**Workflow:** create `content/drafts/my-article.mdx` → set `publishDate` → commit and push. On the due date, the Action publishes the file automatically.

**Local preview:** in development only, visit [`/drafts`](http://localhost:3000/drafts) to see upcoming scheduled files. This route **404s in production**.

> **Note:** The live blog UI reads articles from **Supabase** by default. File-based `content/posts` is for Git-based workflows (e.g. PRs from Writebolt) and the scheduled-draft Action. Sync MDX into your database if you want posts to appear in the app without a separate import step.

---

## Writebolt ads (optional)

The template includes **`components/WriteboltAd.tsx`** — an opt-in ad unit that calls the Writebolt ads API when it exists. It is **not** inserted into any layout by default.

1. Register your site at [writebolt.app](https://writebolt.app) to get a **Site ID** (when registration opens).
2. Import and place the component where you want ads:

```tsx
import { WriteboltAd } from "@/components/WriteboltAd";

<WriteboltAd placement="in-article" siteId="your-site-id" />
<WriteboltAd placement="sidebar" siteId="your-site-id" />
<WriteboltAd placement="footer" siteId="your-site-id" />
```

Revenue share is **60% site owner / 40% Writebolt** when a `siteId` is set. Without `siteId`, house ads may still serve; revenue stays with Writebolt.

If the API is unreachable or returns no ad, the component renders **nothing** (no empty boxes). Optional env override: `NEXT_PUBLIC_WRITEBOLT_ADS_API_URL` (defaults to `https://api.writebolt.app`).

---

## Features

### Blog Frontend
- 📰 Article grid with sidebar, Featured / Latest / Popular tabs
- 📖 Article pages with reading progress bar and auto-generated table of contents
- 👤 Author profiles with bio, avatar, social links, and article listings
- 🏷️ Categories and tags — graceful degradation (no empty UI if not configured yet)
- 🔍 Full-text search powered by Supabase
- 📡 RSS feed and dynamic sitemap
- 🔗 SEO meta tags, Open Graph images, JSON-LD structured data
- 📝 MDX with custom components (CTAs, lead magnets, callouts)
- 🌙 Dark mode
- 📱 Mobile responsive, accessible, Lighthouse 90+

### Admin CMS (`/admin`)
- ✏️ Article editor with live Markdown preview
- 📂 Category management with drag-to-reorder
- 🖼️ Media library — browse, upload, delete images
- 🧭 Navigation menu builder with drag-to-reorder
- ⚙️ Full settings panel — site identity, layout, CTAs, newsletter, SEO, social links
- 💾 Image storage — local filesystem (default) or Supabase Storage

### AI Writing Assist (BYOK — Bring Your Own Key)

All AI features use **your own API keys**. No third-party signups. Your keys, your costs (~$0.01–$0.10 per article).

| Feature | What it does |
|---------|-------------|
| ✨ Generate Draft | Full article from a topic |
| 🔄 Rewrite | Improve clarity of selected text |
| 📝 Expand | Turn bullet points into paragraphs |
| 💡 Suggest Headlines | 5 alternative headline options |
| 📋 Generate Excerpt | 1-2 sentence article summary |
| 🎨 Generate Image | Featured/inline images via DALL-E or Replicate Flux |

Setup: add your OpenAI key in `/admin/settings/ai`. Encrypted with AES-256-GCM.

---

## Database

All tables use Row Level Security. Safe to add alongside existing tables — no conflicts.

| Table | Purpose |
|-------|---------|
| `articles` | Blog posts with full-text search, reading time, SEO fields |
| `authors` | Writer profiles with social links |
| `blog_settings` | Runtime config — layout, CTAs, newsletter, SEO, social links |
| `categories` | Optional taxonomy with auto-updating article counts |
| `nav_items` | Configurable header navigation links |
| `ai_settings` | Encrypted BYOK API key storage |

Apply **`supabase/migrations/001_writebolt_blog_schema.sql`** in the Supabase SQL Editor, then run **`npm run seed`** for default rows.

---

## Image Storage

| Mode | Best for |
|------|----------|
| **Local** (default) | Quick start, blogs under ~200 articles |
| **Supabase Storage** | High-volume blogs, CDN delivery |

Switch in `/admin/settings` → Image Storage.

---

## Project Structure

```
content/
├── drafts/                  # Scheduled MD/MDX (GitHub Action → posts/)
└── posts/                   # Published file-based posts (writebolt.config.json)

app/
├── blog/                    # Blog frontend
├── drafts/                  # Dev-only preview of scheduled drafts (/drafts)
├── authors/                 # Author profiles
├── admin/                   # CMS admin panel
│   ├── categories/          # Category management
│   ├── media/               # Media library
│   └── settings/            # Blog + AI settings
├── api/
│   ├── ai/                  # BYOK AI endpoints
│   ├── upload/              # Image upload handler
│   └── og/                  # Dynamic Open Graph images
├── rss.xml/                 # RSS feed
└── sitemap.xml/             # Dynamic sitemap

components/
├── WriteboltAd.tsx          # Optional Writebolt ad network (not used by default)
├── blog/                    # Article cards, progress bar, TOC, search
├── admin/                   # Editor, AI toolbar, media library
├── callouts/                # CTA, lead magnet, newsletter
├── author/                  # Author card, profile
├── layout/                  # Blog header, nav, footer, sidebar
└── seo/                     # Meta tags, JSON-LD

lib/
├── supabase/                # Client, server, query helpers
├── ai/                      # Provider, prompts, text/image generation
├── storage/                 # Local + Supabase Storage abstraction
├── mdx/                     # MDX config and components
└── utils/                   # Reading time, slugs, search
```

---

## Environment Variables

```env
# Required (set during setup)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SETTINGS_ENCRYPTION_KEY=  # auto-generated during setup

# Optional (can also be set in /admin/settings/ai)
OPENAI_API_KEY=sk-...
REPLICATE_API_KEY=r8_...

# Optional — Writebolt ads API base URL (default: https://api.writebolt.app)
# NEXT_PUBLIC_WRITEBOLT_ADS_API_URL=https://api.writebolt.app
```

---

## Deployment

Works anywhere Next.js runs:

- **Vercel** — `npx vercel`, add env vars in project settings
- **Netlify** — works with the Next.js adapter
- **Self-hosted** — `npm run build && npm start`

---

## Supercharge with Writebolt ⚡

Love the blog template? **[Writebolt](https://writebolt.com)** takes your blog to the next level.

| | This Template (BYOK) | Writebolt |
|---|---|---|
| **Article quality** | Basic drafts | Researched, SEO-optimised, 2,000 words |
| **Internal links** | None | Auto-discovered from your site |
| **External citations** | None | Perplexity-powered research |
| **Images** | Manual prompt, one at a time | Auto-generated from content |
| **Publishing** | Write in admin panel | Pull request via GitHub App |
| **Backlinks** | None | Link Pro placement network |
| **Bulk article creation** | Limited | 10 at a time |

Writebolt reads the `writebolt.config.json` in your repo and publishes directly — zero configuration.

**[Try Writebolt Free →](https://writebolt.com)**

---

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) if present.

## License

MIT — use it for anything.

---

<p align="center">
  Built by <a href="https://appystudios.com">Appy Studios</a> · Powered by <a href="https://writebolt.com">Writebolt</a>
</p>
