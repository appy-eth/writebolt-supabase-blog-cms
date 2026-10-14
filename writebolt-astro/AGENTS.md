# Installing Writebolt Blog into an existing Astro site

This file is for the agent or developer doing the install. Apply these settings in **Admin → Settings** after `npm run setup`, before calling the job done.

## Layout

- An add-on must look like part of the existing site. When `BLOG_BASE_PATH` is set, public pages load that site’s header, footer, stylesheets, and fonts (`src/lib/host-chrome.ts`). Do not ship a bare blog page, and do not add Writebolt’s header on top.
- The site origin comes from the `x-writebolt-host` request header, then `HOST_ORIGIN`, then `SITE_URL`. Proxy `/blog` with [`integration/proxy-blog.mjs`](integration/proxy-blog.mjs) so that header is set. In local dev, set `HOST_ORIGIN` when `SITE_URL` is the production domain.
- The setup wizard sets **Layout mode** to **embedded** for an add-on so Writebolt’s own header and footer stay off. If the host chrome cannot be loaded, fix the origin instead of turning the Writebolt header back on.
- Keep **Show blog heading above articles when header is hidden** on, then set a real **Homepage heading** (not “Blog”). Example: `Kids eat free: deals, tips, and restaurant guides`.
- Leave **Show featured category sections under the homepage listing** **off** unless the site wants a magazine-style homepage. When it is on, a featured category repeats posts that already appear in the main listing.

## Identity

- **Blog name** is used in the document title, RSS, and JSON-LD. It does not have to match the homepage H1 — use **Homepage heading** for that.
- Upload logo/favicon into the host brand if this is an add-on blog.

## Calls to action

- Enable **either** the in-article email CTA **or** put a `<CTAInline />` in the article body — not both. Writebolt will skip the settings CTA when the Markdown already contains `CTAInline`, `LeadMagnet`, or `NewsletterSignup`.
- Sidebar CTA is separate and optional. One conversion block in the article body is enough.

## Routes

- Standalone: the blog is served at `/`, articles at `/{slug}`, categories at `/category/{slug}`. Leave `BLOG_BASE_PATH` empty.
- Add-on: set `BLOG_BASE_PATH=/blog` in `.env`. Admin article links, sitemaps, RSS, and on-site links then use `/blog/...`. Proxy `/blog` to this app with the `/blog` prefix removed and `x-writebolt-host` set to the site origin (`integration/proxy-blog.mjs`). The blog page itself then shows the existing site’s header, footer, and fonts.
- Google reads only the domain-root `robots.txt`. On an add-on install, add `User-agent: Googlebot-News` / `Allow: /blog/` and `Sitemap: https://yoursite.com/blog/news-sitemap.xml` to the host site's robots file. The app serves that news sitemap, plus `NewsArticle` JSON-LD on each article.

## After install

1. Run `supabase/001_initial_schema.sql` (or `002_feature_parity.sql` on an older Astro schema).
2. Open a terminal in `writebolt-astro/` and run the setup wizard. Do not answer it. The user sets the admin username and password.
   - Add-on: `npm run setup -- --addon --host <path to the existing site>`. The wizard copies Supabase from that site. It asks for the keys only when the site does not already have them.
   - Standalone: `npm run setup`. The wizard asks for the Supabase project, then the admin username and password.
3. When the wizard exits, start the app (`npm run dev`, or `npm run dev -- --port 4322` when the existing site is already on 4321).
4. Sign in at `/admin` and set layout, homepage heading, CTAs, and categories. Newsletter stays in **Admin → Settings**.
5. Do not mark a category “Feature on homepage” unless the featured-sections setting is on and you want that magazine layout.
6. Give the user the admin link from the wizard output, and how to write the first article. Add-on admin is on the existing site at `/blog/admin/login` (new article at `/blog/admin/new`). Standalone admin is `/admin/login` (new article at `/admin/new`). They sign in with the username and password they just chose.
