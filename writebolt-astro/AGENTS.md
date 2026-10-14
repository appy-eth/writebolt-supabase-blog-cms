# Installing Writebolt Blog into an existing Astro site

This file is for the agent or developer doing the install. Apply these settings in **Admin → Settings** after `npm run setup`, before calling the job done.

## Layout

- If the host site already has a header and footer, set **Layout mode** to **embedded**. That hides Writebolt’s chrome so you do not get a double header.
- Keep **Show blog heading above articles when header is hidden** on for embedded installs, then set a real **Homepage heading** (not “Blog”). Example: `Kids eat free: deals, tips, and restaurant guides`.
- Leave **Show featured category sections under the homepage listing** **off** unless the site wants a magazine-style homepage. When it is on, a featured category repeats posts that already appear in the main listing.

## Identity

- **Blog name** is used in the document title, RSS, and JSON-LD. It does not have to match the homepage H1 — use **Homepage heading** for that.
- Upload logo/favicon into the host brand if this is an add-on blog.

## Calls to action

- Enable **either** the in-article email CTA **or** put a `<CTAInline />` in the article body — not both. Writebolt will skip the settings CTA when the Markdown already contains `CTAInline`, `LeadMagnet`, or `NewsletterSignup`.
- Sidebar CTA is separate and optional. One conversion block in the article body is enough.

## Routes

- Standalone: the blog is served at `/`, articles at `/{slug}`, categories at `/category/{slug}`. Leave `BLOG_BASE_PATH` empty.
- Add-on: set `BLOG_BASE_PATH=/blog` in `.env`. Admin article links, sitemaps, RSS, and on-site links then use `/blog/...`. Proxy the existing site so `https://yoursite.com/blog/*` forwards to this app with the `/blog` prefix removed (the Astro routes stay at `/`).
- Google reads only the domain-root `robots.txt`. On an add-on install, add `User-agent: Googlebot-News` / `Allow: /blog/` and `Sitemap: https://yoursite.com/blog/news-sitemap.xml` to the host site's robots file. The app serves that news sitemap, plus `NewsArticle` JSON-LD on each article.

## After install

1. Run `supabase/001_initial_schema.sql` (or `002_feature_parity.sql` on an older Astro schema).
2. `npm run setup`
3. Sign in at `/admin` and set layout, homepage heading, CTAs, and categories.
4. Do not mark a category “Feature on homepage” unless the featured-sections setting is on and you want that magazine layout.
