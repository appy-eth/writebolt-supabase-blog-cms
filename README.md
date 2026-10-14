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
| Env | `BLOG_BASE_PATH=/blog` | Leave `BLOG_BASE_PATH` empty |

Both installs use the same Astro app. The admin **View** links, sitemaps, RSS, and on-site article links follow `BLOG_BASE_PATH`, so an add-on no longer points at `/{slug}` on the existing site.

## Add-on installation

Use this when the blog should live at `/blog` on a website that already has its own pages.

### 1. Clone the Astro app

```bash
git clone https://github.com/appy-eth/writebolt-supabase-blog-cms.git my-blog
cd my-blog/writebolt-astro
npm install
```

`package.json` is inside `writebolt-astro/`. Running `npm install` at the repository root installs the Next.js app instead.

### 2. Create the database

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor → New query**.
3. Paste and run `writebolt-astro/supabase/001_initial_schema.sql`. The same file is `supabase/migrations/001_writebolt_blog_schema.sql`. Either copy is the shared schema.
4. If this database already has an older Astro schema, also run `writebolt-astro/supabase/002_feature_parity.sql`. If it was created from the old Next.js schema (`blog_settings`), run `supabase/migrations/002_align_astro_schema.sql` instead.

### 3. Configure environment

```bash
cp .env.example .env
```

Set your Supabase URL, anon key, service role key, admin username, and admin password. Then set the public site and the `/blog` prefix:

```env
SITE_URL=https://yoursite.com
BLOG_BASE_PATH=/blog
```

`SITE_URL` is the existing website, with no path. `BLOG_BASE_PATH=/blog` is what the admin uses when it builds article links.

### 4. Seed and run

```bash
npm run setup
npm run dev
```

- Admin: [http://localhost:4321/admin/login](http://localhost:4321/admin/login)

In **Admin → Settings**, set **Layout** to **embedded** so this blog does not draw a second header and footer over the existing site. Set a real homepage heading. More layout notes are in [`writebolt-astro/AGENTS.md`](writebolt-astro/AGENTS.md).

### 5. Mount it on the existing site

This app still serves its own routes at `/` (`/your-article`, `/admin`, `/category/news`). The existing website should forward `/blog/*` to this server and **remove** the `/blog` prefix before the request arrives.

Nginx:

```nginx
location /blog/ {
  proxy_pass http://127.0.0.1:4321/;
}
```

After that, an article in the admin opens at `https://yoursite.com/blog/your-article`.

Google only reads `https://yoursite.com/robots.txt`. Add the blog’s news rules to that file (see [Google News](#google-news) below). This app’s own `/robots.txt` is not the file Google uses when the blog is mounted under `/blog`.

## Standalone installation

Use this when you are launching a blog or news site on its own domain.

### 1. Clone the Astro app

```bash
git clone https://github.com/appy-eth/writebolt-supabase-blog-cms.git my-blog
cd my-blog/writebolt-astro
npm install
```

### 2. Create the database

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run `writebolt-astro/supabase/001_initial_schema.sql` (the same SQL as `supabase/migrations/001_writebolt_blog_schema.sql`).
3. If you already applied an older Astro schema, also run `writebolt-astro/supabase/002_feature_parity.sql`.

### 3. Configure environment

```bash
cp .env.example .env
```

Fill in Supabase URL, anon key, service role key, admin username, and admin password. Point `SITE_URL` at this site and leave the base path empty:

```env
SITE_URL=https://yoursite.com
```

Do not set `BLOG_BASE_PATH`. Articles are published at `/{slug}`.

### 4. Seed and run

```bash
npm run setup
npm run dev
```

- Site: [http://localhost:4321](http://localhost:4321)
- Admin: [http://localhost:4321/admin/login](http://localhost:4321/admin/login)

`npm run setup` creates the default author, site settings, and AI settings row, and generates `SETTINGS_ENCRYPTION_KEY` if it is missing.

### 5. Deploy

```bash
npm run build
node dist/server/entry.mjs
```

The default adapter is `@astrojs/node`. For Vercel, switch the adapter to `@astrojs/vercel` in `writebolt-astro/astro.config.mjs`.

---

## Google News

Both install types can be submitted to Google News.

- `robots.txt` allows `Googlebot-News`.
- Each article includes [NewsArticle](https://schema.org/NewsArticle) structured data: `headline`, `datePublished`, `dateModified` (ISO 8601), `author`, and an absolute image URL.
- A dedicated news sitemap is served at `/news-sitemap.xml` (add-on: `/blog/news-sitemap.xml`). It lists articles published in the last 48 hours.
- The regular sitemap remains at `/sitemap.xml`.

Submit the news sitemap in [Google Search Console](https://search.google.com/search-console). Optional: set `NEWS_LANGUAGE` (default `en`) to the publication language.

**Add-on:** put these lines in the existing site’s root `robots.txt`, using your domain:

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

Astro and Next.js use the same Supabase tables. Run `supabase/migrations/001_writebolt_blog_schema.sql` once. If this database was created from the older Next.js migration, run `supabase/migrations/002_align_astro_schema.sql` as well.

### Standalone Next.js blog

From the repository root (not `writebolt-astro/`):

```bash
npm install
```

1. In the Supabase SQL Editor, run `supabase/migrations/001_writebolt_blog_schema.sql`. If you already ran an older copy of that file, also run `supabase/migrations/002_align_astro_schema.sql`.
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

<details>
<summary><strong>Copy prompt for an AI coding agent (Next.js embed)</strong></summary>

```
Add the Writebolt Blog CMS to my existing Next.js + Supabase project.

Source repo: https://github.com/appy-eth/writebolt-supabase-blog-cms

Steps:
1. Clone the repo to a temp directory.
2. Copy these into my project (don't overwrite my existing supabase client/server files):
   - app/blog/, app/authors/, app/admin/
   - app/api/ai/, app/api/upload/, app/api/og/
   - app/rss.xml/, app/sitemap.xml/, app/news-sitemap.xml/, app/robots.ts
   - components/blog/, components/admin/, components/callouts/,
     components/author/, components/seo/
   - components/layout/blog-header.tsx, blog-nav.tsx, blog-footer.tsx,
     blog-layout-provider.tsx, sidebar.tsx
   - lib/ai/, lib/storage/, lib/mdx/
   - lib/supabase/queries.ts (merge with existing if present)
   - lib/utils/ and types/ (merge with existing if present)
3. Run the SQL migrations from supabase/migrations/ against my Supabase
   database using my SUPABASE_SERVICE_ROLE_KEY from .env.local.
4. Set layout_mode to 'embedded' in the site_settings table.
5. Add SETTINGS_ENCRYPTION_KEY to .env.local (generate: openssl rand -hex 32).
6. Delete the temp directory.
7. Verify /blog loads correctly.
```

</details>

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
