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

## Add-on installation

Use this when the blog should live at `/blog` on an Astro site you already have.

The blog is not a second app. `writebolt()` adds its routes to the site you already run, so `npm run dev` and the existing Vercel (or Node) project serve `/blog`. There is no second dev server, no proxy, and no `WRITEBOLT_ORIGIN`.

The site's layout supplies the header and footer. It needs a `<slot />` for the page body. A `<slot name="head" />` is optional and receives the blog's RSS and JSON-LD tags.

**Copy this prompt**

```
Install Writebolt Blog inside this Astro site. Repo: https://github.com/appy-eth/writebolt-supabase-blog-cms — use writebolt-astro/, not the repo root. The blog must run in this site's Astro server at /blog. Do not create a second Astro app, a second dev server, a proxy, a Vite plugin, or a second deployment. Do not set WRITEBOLT_ORIGIN.

Copy writebolt-astro/ into this repo and npm install inside it. Add this to astro.config.mjs, using this site's layout if it is not at that path:

import { writebolt } from './writebolt-astro/integration/astro.mjs';
integrations: [writebolt({ layout: './src/layouts/Layout.astro' })],

Remove src/pages/blog.astro or src/pages/blog/ if either exists. If this site has a sitemap filter, exclude /blog/admin and /blog/api.

Schema: writebolt-astro/supabase/001_initial_schema.sql. If this repo has supabase/migrations, setup copies the schema there. If you can apply SQL, do that. Otherwise tell me to run that file in the Supabase SQL editor.

From writebolt-astro/, run npm run setup -- --addon --host <path to this site> --site-url <public origin> --site-name "<site name>". Finish setup. Do not leave it for later. The wizard reads Supabase from this site, writes the blog admin login into this site's .env, and sets the blog name and embedded layout. If the service role key is missing, ask me for that one key. Do not point setup at a different app.

Then run this site's npm run dev. Give me /blog and /blog/admin/login, and the admin password the wizard printed.
```

### 1. Add the blog to the site

```bash
# from the existing Astro site
git clone https://github.com/appy-eth/writebolt-supabase-blog-cms.git /tmp/writebolt
cp -R /tmp/writebolt/writebolt-astro ./writebolt-astro
cd writebolt-astro
npm install
```

`package.json` is inside `writebolt-astro/`. Running `npm install` at the Writebolt repository root installs the Next.js app instead.

In the site's `astro.config.mjs`:

```js
import { writebolt } from './writebolt-astro/integration/astro.mjs';

export default defineConfig({
  integrations: [
    writebolt({ layout: './src/layouts/Layout.astro' }),
  ],
});
```

Use the layout this site already wraps pages in. Delete a `src/pages/blog.astro` file or `src/pages/blog/` directory if the site has one, so it does not override `/blog`.

### 2. Create the database

1. Open the Supabase project this site already uses.
2. Open **SQL Editor → New query**.
3. Paste and run `writebolt-astro/supabase/001_initial_schema.sql`. The same file is `supabase/migrations/001_writebolt_blog_schema.sql`.
4. If this database already has an older Astro schema, also run `writebolt-astro/supabase/002_feature_parity.sql`.

If the site has a `supabase/migrations` folder, setup copies that schema in for you. The tables still have to be applied once. The Supabase client cannot create tables.

### 3. Run the setup wizard

From `writebolt-astro/`:

```bash
npm run setup -- --addon --host /path/to/your-site --site-url https://yoursite.com --site-name "Your Site"
```

The wizard reads `SUPABASE_URL` or `PUBLIC_SUPABASE_URL`, the anon key, and `SUPABASE_SERVICE_ROLE_KEY` from that site. If the URL and anon key are present and the service role key is not, it asks for the service role key only. It reads the public origin from `--site-url`, then `astro.config` `site`, then `SITE_URL` / `PUBLIC_MARKETING_URL`. It does not use `NEXT_PUBLIC_APP_URL` while a real site URL is available, and it will not save `http://localhost` for an add-on unless you type that yourself.

It writes the admin username and password to the site's `.env` as `WRITEBOLT_ADMIN_USERNAME` and `WRITEBOLT_ADMIN_PASSWORD`, sets the blog name, and sets layout to **embedded** even when the schema SQL already inserted a settings row. Uploads go to the `blog-images` Supabase bucket. When `public/robots.txt` exists, the news sitemap lines are added there.

### 4. Run the site you already have

```bash
npm run dev
```

- Blog: `http://localhost:4321/blog`
- Admin: `http://localhost:4321/blog/admin/login`

Deploy the same project you already deploy. The blog uses that project's adapter and environment. Set a homepage heading under **Admin → Settings** if you want one that differs from the site name. More notes are in [`writebolt-astro/AGENTS.md`](writebolt-astro/AGENTS.md).

Google only reads `https://yoursite.com/robots.txt`. Setup adds the news rules when that file exists (see [Google News](#google-news) below).

## Standalone installation

Use this when you are launching a blog or news site on its own domain.

**Copy this prompt**

```
Install Writebolt Blog as a standalone site. Repo: https://github.com/appy-eth/writebolt-supabase-blog-cms — use writebolt-astro/, not the repo root. Leave BLOG_BASE_PATH empty so articles are at /{slug}. Schema: writebolt-astro/supabase/001_initial_schema.sql. If you have Supabase access, add the tables. Otherwise tell me to copy and paste that SQL into the Supabase SQL editor. Then npm install inside writebolt-astro/. After install, open a terminal there and run npm run setup so I can complete the setup wizard myself. Do not answer the wizard. It asks for the Supabase project and the admin username and password. When the wizard finishes, run npm run dev. Then give me the link to the blog admin and how to write the first article.
```

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

### 3. Run the setup wizard

Open a terminal in `writebolt-astro/` and run:

```bash
npm run setup
```

The wizard asks for the Supabase project URL, anon key, and service role key (Supabase → Project Settings → API), the site URL, and the admin username and password. It writes `.env`, leaves `BLOG_BASE_PATH` empty, generates `SETTINGS_ENCRYPTION_KEY`, and seeds the database. Newsletter is configured later in **Admin → Settings**.

### 4. Run

```bash
npm run dev
```

- Site: [http://localhost:4321](http://localhost:4321)
- Admin: [http://localhost:4321/admin/login](http://localhost:4321/admin/login)

The wizard creates the default author, site settings, and AI settings row. Articles are published at `/{slug}`.

### 5. Deploy

```bash
npm run build
node dist/server/entry.mjs
```

The default adapter is `@astrojs/node`. For a standalone blog on Vercel, switch the adapter to `@astrojs/vercel` in `writebolt-astro/astro.config.mjs`. An add-on on an existing Astro site uses that site's adapter and that site's deployment. Do not deploy `writebolt-astro` as its own project.

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
