<p align="center">
  <img src="public/images/writebolt-blog-logo.svg" alt="Writebolt Blog" width="280" />
</p>

<h1 align="center">Writebolt Blog</h1>

<p align="center">
  <a href="https://github.com/appy-eth/writebolt-supabase-blog-cms/stargazers"><img src="https://img.shields.io/github/stars/appy-eth/writebolt-supabase-blog-cms?style=flat&color=22C55E" alt="Stars" /></a>
  <a href="https://github.com/appy-eth/writebolt-supabase-blog-cms/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="License" /></a>
  <img src="https://img.shields.io/badge/Astro-5-BC52EE?logo=astro&logoColor=white" alt="Astro 5" />
  <img src="https://img.shields.io/badge/Supabase-ready-3ECF8E" alt="Supabase" />
</p>

Writebolt Blog is an open-source blog CMS. Articles, authors, categories, and settings live in [Supabase](https://supabase.com). You get a public site, an admin, SEO (including Google News), and optional AI writing assist.

The app to install is **Astro**, in the `writebolt-astro/` folder. The repository root is an optional Next.js edition of the same CMS. Start with Astro unless you already have a Next.js app.

---

Writebolt blog can be installed in two ways: **Add-on** and **Standalone**. Use **Add-on** if you want to add a Supabase-powered blog to your website. Use **Standalone** if you want to create a standalone blog or news website.

| | Add-on | Standalone |
|---|---|---|
| Use it when | The blog is a section of a site you already have | This blog is the whole website |
| Public URLs | `https://yoursite.com/blog/your-article` | `https://yoursite.com/your-article` |
| How it runs | Inside the Astro site you already have, at `/blog` | This app is the whole site |

Both installs use the same Astro app. On an add-on, article links, sitemaps, and RSS are under `/blog` on the host site.

### How to install (recommended)

1. Connect **[Supabase MCP](https://supabase.com/docs/guides/ai-tools/mcp)** in Cursor (Project Settings → MCP, or `.cursor/mcp.json`).
2. Open the **Astro site** where you want the blog (add-on) or a new folder (standalone).
3. Copy the **agent prompt** below into that project's chat. The agent copies the code, creates the Supabase tables via MCP, and wires `/blog` into your site.
4. When the agent is done, it opens **Cursor's integrated terminal** in `writebolt-astro/` for **you** to run `npm run setup`. You enter the blog title, admin username, and admin password. The agent must not run setup in its own non-interactive shell or answer the wizard for you.
5. If your site env is missing **`SUPABASE_SERVICE_ROLE_KEY`**, add it before or during setup (Supabase → Project Settings → API). Writebolt's admin CMS uses it on the **server only** (see below). MCP cannot put it in your env for you. Do not paste it into chat.

**Why the service role key?** Many Astro sites use only the anon key because their RLS policies allow the inserts/updates they need (often with Supabase Auth). Writebolt's schema is different: the anon key can **read** published posts on the public blog, but RLS has **no write policies** for the anon key. Admin login is a site env password and cookie, not Supabase Auth. The CMS saves drafts, settings, and uploads through a **server-side** Supabase client that uses the service role key so those writes are allowed without exposing admin power to the browser. The key stays in `.env` / Vercel env — never in client JavaScript.

The blog uses your site's existing `.env` / `.env.local` on an add-on. There is no second env file and no second deployment.

## Add-on installation

Use this when the blog should live at `/blog` on an Astro site you already have. One dev server, one Vercel project.

**Copy this prompt into your site agent** (requires Supabase MCP):

```
Install Writebolt Blog on this Astro site as an add-on at /blog.

Repo: https://github.com/appy-eth/writebolt-supabase-blog-cms — use writebolt-astro/ only, not the repo root.

Requires Supabase MCP. Do not paste secrets into chat. Do not create a second dev server, proxy, WRITEBOLT_ORIGIN, or second deployment.

Do this:
1. Copy writebolt-astro/ into this repo. npm install inside writebolt-astro/.
2. Supabase MCP: on the same project as this site's PUBLIC_SUPABASE_URL (or SUPABASE_URL), apply_migration with writebolt-astro/supabase/001_initial_schema.sql, then 002_feature_parity.sql. Confirm site_settings exists (list_tables).
3. Remove src/pages/blog.astro or src/pages/blog/ if present. Add writebolt() from writebolt-astro/integration/astro.mjs to astro.config using this site's layout (<slot /> required). See writebolt-astro/AGENTS.md.
4. If .env / .env.local lacks SUPABASE_SERVICE_ROLE_KEY, tell me to add it from Supabase → Project Settings → API before setup. Do not ask for a database password — MCP created the tables.
5. Open Cursor's integrated terminal (View → Terminal) with working directory writebolt-astro/ in this workspace. Tell me to run: npm run setup
   Do NOT run setup in the agent shell. Do NOT answer the setup wizard. I will enter blog title, admin username, and admin password in the integrated terminal.
6. After I finish, I run npm run dev from the site root. Remind me: /blog and /blog/admin/login.
```

**You finish in the terminal**

```bash
cd writebolt-astro
npm run setup
```

Then from the **site root** (not `writebolt-astro/`):

```bash
npm run dev
```

- Blog: `http://localhost:4321/blog`
- Admin: `http://localhost:4321/blog/admin/login`

Login is stored in the site's env as `WRITEBOLT_ADMIN_USERNAME` and `WRITEBOLT_ADMIN_PASSWORD`. On Vercel, add the same keys plus `SUPABASE_SERVICE_ROLE_KEY` to the site project. Static Astro sites need a server adapter (`npx astro add vercel`) because `/blog` is server-rendered.

## Standalone installation

Use this when the blog **is** the whole website on its own domain.

**Copy this prompt into your agent** (requires Supabase MCP):

```
Install Writebolt Blog as a standalone Astro site.

Repo: https://github.com/appy-eth/writebolt-supabase-blog-cms — use writebolt-astro/ only.

Requires Supabase MCP. Do not paste secrets into chat. Articles at /{slug} (BLOG_BASE_PATH empty).

Do this:
1. Use writebolt-astro/ as the app. npm install there.
2. Supabase MCP: apply_migration with supabase/001_initial_schema.sql, then 002_feature_parity.sql. Confirm site_settings exists.
3. Open Cursor's integrated terminal (View → Terminal) with working directory writebolt-astro/. Tell me to run: npm run setup -- --standalone
   Do NOT run setup in the agent shell. Do NOT answer the wizard. I will enter Supabase URL and keys if needed, blog title, admin username, admin password, and service role key when prompted.
4. After I finish, tell me to run npm run dev. Admin: /admin/login.
```

**You finish in the terminal**

```bash
cd writebolt-astro   # or your clone path
npm run setup -- --standalone
npm run dev
```

- Site: [http://localhost:4321](http://localhost:4321)
- Admin: [http://localhost:4321/admin/login](http://localhost:4321/admin/login)

Deploy with the adapter in `astro.config.mjs` (default Node; use `@astrojs/vercel` on Vercel). Do not deploy an add-on as a separate project.

## Manual install (no MCP)

If Supabase MCP is not available, run `npm run setup` from `writebolt-astro/`. It can create the tables when the site env has `DATABASE_URL` / `POSTGRES_URL`, or when you enter the database password once. See [`writebolt-astro/AGENTS.md`](writebolt-astro/AGENTS.md).

---

## Google News

Both install types can be submitted to Google News.

- `robots.txt` allows `Googlebot-News`.
- Each article includes [NewsArticle](https://schema.org/NewsArticle) structured data: `headline`, `datePublished`, `dateModified` (ISO 8601), `author`, and an absolute image URL.
- A dedicated news sitemap is served at `/news-sitemap.xml` (add-on: `/blog/news-sitemap.xml`). It lists articles published in the last 48 hours.
- The regular sitemap remains at `/sitemap.xml`.

Submit the news sitemap in [Google Search Console](https://search.google.com/search-console). Optional: set `NEWS_LANGUAGE` (default `en`) to the publication language.

**Add-on:** setup writes these lines into the existing site’s `public/robots.txt` when that file is already there. Google reads that file, using your domain:

```
User-agent: Googlebot-News
Allow: /blog/

Sitemap: https://yoursite.com/blog/sitemap.xml
Sitemap: https://yoursite.com/blog/news-sitemap.xml
```

**Standalone:** `/robots.txt` on this app is the file Google reads. It already allows `Googlebot-News` and lists both sitemaps.

## Other features

- Article grid with search, categories, tags, pagination, and a sidebar
- Article pages with reading progress, table of contents, related posts, and an author card
- Author profiles, RSS, and Open Graph images
- Newsletter signup, inline email CTA, and sidebar CTA
- Layout modes: standalone, embedded, and custom (header and footer visibility)
- Admin for articles, categories, authors, media, navigation, and image storage (local `public/images` or Supabase Storage)
- Optional [Writebolt ads](https://writebolt.com). Set a site ID under **Admin → Settings**. Revenue share is 60% site owner / 40% Writebolt when a site ID is set
- BYOK AI writing assist in **Admin → AI Config**: drafts, rewrite, expand, headlines, excerpt, and images. Keys are encrypted with `SETTINGS_ENCRYPTION_KEY`

In-article Markdown blocks: `<CTAInline />`, `<LeadMagnet />`, `<NewsletterSignup />`, `<CTASidebar />`.

### Scheduled publishing

Scheduled articles use `scheduled_for`. The workflow at `writebolt-astro/.github/workflows/publish-scheduled.yml` runs every 15 minutes. Add repository secrets:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Astro project layout

```
writebolt-astro/
├── src/pages/          # home, [slug], category, tag, authors, admin, api
├── src/components/
├── src/layouts/
├── src/lib/            # data, AI, storage, SEO
├── supabase/
│   ├── 001_initial_schema.sql
│   └── 002_feature_parity.sql
└── scripts/setup.mjs
```

---

## Next.js edition

The repository root is the same CMS in Next.js 14. Use it when you need React and MDX, or when the site you are adding the blog to is already Next.js. Public articles are always at `/blog/{slug}`.

Astro and Next.js use the same Supabase tables. Run `supabase/migrations/001_writebolt_blog_schema.sql` once.

### Standalone Next.js blog

**Copy this prompt**

```
Install the Next.js Writebolt Blog from the repo root (not writebolt-astro/). Repo: https://github.com/appy-eth/writebolt-supabase-blog-cms. Articles are at /blog/{slug}. Schema: supabase/migrations/001_writebolt_blog_schema.sql. If you have Supabase access, add the tables. Otherwise tell me to copy and paste that SQL into the Supabase SQL editor. Then npm install, npm run setup, and npm run dev.
```

From the repository root (not `writebolt-astro/`):

```bash
npm install
```

1. In the Supabase SQL Editor, run `supabase/migrations/001_writebolt_blog_schema.sql`.
2. Run the setup wizard. It writes `.env.local`.

```bash
npm run setup
npm run dev
```

If the database was not ready during setup, run `npm run setup -- --seed` after the migration succeeds.

- Admin: [http://localhost:3000/admin](http://localhost:3000/admin)
- Blog: [http://localhost:3000/blog](http://localhost:3000/blog)

Set `NEXT_PUBLIC_SITE_URL` in `.env.local` so sitemaps and JSON-LD use the public origin. Google News is included: `app/robots.ts` allows `Googlebot-News`, articles use `NewsArticle` markup, and the news sitemap is `/news-sitemap.xml`.

### Add the blog to an existing Next.js app

**Copy this prompt**

```
Add Writebolt Blog to this Next.js app. Repo: https://github.com/appy-eth/writebolt-supabase-blog-cms (repo root, not writebolt-astro/). Copy the blog, admin, and API files in. Do not overwrite my Supabase client. layout_mode: embedded. Articles stay at /blog/{slug}. Schema: supabase/migrations/001_writebolt_blog_schema.sql. If you have Supabase access, add the tables. Otherwise tell me to copy and paste that SQL into the Supabase SQL editor. Add SETTINGS_ENCRYPTION_KEY to .env.local. Check that /blog loads.
```

```bash
npx writebolt-blog init
```

Requires Node.js 18+ and an existing Next.js project with Supabase configured in `.env.local`.

| Layout mode | What renders | Best for |
|---|---|---|
| Standalone (default) | Full header, blog title, nav, and footer | A dedicated blog |
| Embedded | Blog content only — your app provides the layout | A `/blog` section in your app |
| Custom | Blog header with your branding and nav links | A blog subdomain |

Switch layout in **Admin → Settings**. The admin article path is `/blog/{slug}` in every mode.

Scheduled posts use `scheduled_for` on `articles`. `.github/workflows/publish-drafts.yml` runs every 6 hours when `site_settings.scheduled_publishing_enabled` is on. It needs the same `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` secrets.

Next.js environment variables live in `.env.local`. See `.env.example`.

Deploy with `npm run build && npm start`, or on Vercel.

---

## Contributing

Issues and pull requests are welcome for either template. Say whether the change is for `writebolt-astro/` or the Next.js app at the repository root.

## License

MIT

<p align="center">
  Built by <a href="https://appystudios.com">Appy Studios</a> · Powered by <a href="https://writebolt.com">Writebolt</a>
</p>
