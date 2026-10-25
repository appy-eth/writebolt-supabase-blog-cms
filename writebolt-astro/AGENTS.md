# Installing Writebolt Blog into an existing Astro site

This file is for the agent or developer doing the install. The blog runs inside the Astro site. Do not add a second dev server, a proxy, or a second deployment.

## Layout

- Add `writebolt({ layout })` from `integration/astro.mjs` to the site's `integrations`. The layout must render `<slot />`. `<slot name="head" />` receives RSS and JSON-LD when the layout has that slot.
- Pass the layout the site already uses, usually `./src/layouts/Layout.astro`. The integration uses that file when it exists.
- Do not copy `integration/proxy-blog.mjs` into an Astro site, and do not set `WRITEBOLT_ORIGIN`. That proxy is only for a host that is not Astro.
- Remove `src/pages/blog.astro` or `src/pages/blog/` if either exists. Those files override `/blog`.
- The setup wizard sets **Layout mode** to **embedded** for an add-on, including when the schema SQL already inserted the settings row. Embedded layout keeps Writebolt's own header off. The host layout draws the header and footer.
- Keep **Show blog heading above articles when header is hidden** on, then set a real **Homepage heading** (not “Blog”). Example: `Kids eat free: deals, tips, and restaurant guides`.
- Leave **Show featured category sections under the homepage listing** **off** unless the site wants a magazine-style homepage. When it is on, a featured category repeats posts that already appear in the main listing.

## Identity

- The wizard sets **Blog name** from `--site-name`, or from a `BRAND` / `SITE_NAME` constant, or from the hostname. It replaces **My Blog** and **A blog powered by Writebolt**. It does not overwrite a name that was already changed.
- **Blog name** is used in the document title, RSS, and JSON-LD. It does not have to match the homepage H1 — use **Homepage heading** for that.
- Add-on uploads use the `blog-images` Supabase bucket so images survive the host's deployment.

## Calls to action

- Enable **either** the in-article email CTA **or** put a `<CTAInline />` in the article body — not both. Writebolt will skip the settings CTA when the Markdown already contains `CTAInline`, `LeadMagnet`, or `NewsletterSignup`.
- Sidebar CTA is separate and optional. One conversion block in the article body is enough.

## Routes

- Standalone: the blog is served at `/`, articles at `/{slug}`, categories at `/category/{slug}`. Leave `BLOG_BASE_PATH` empty.
- Add-on: routes are injected at `/blog`. Admin is `/blog/admin/login`. Article links, sitemaps, and RSS use `/blog/...`. Run the site's own `npm run dev`. Do not start Writebolt on another port.
- If the site builds a sitemap, exclude `/blog/admin` and `/blog/api`.
- Google reads only the domain-root `robots.txt`. Setup adds `User-agent: Googlebot-News`, `Allow: /blog/`, and `Sitemap: https://yoursite.com/blog/news-sitemap.xml` when `public/robots.txt` exists. The app serves that news sitemap, plus `NewsArticle` JSON-LD on each article.

## After install

1. Run `supabase/001_initial_schema.sql` (or `002_feature_parity.sql` on an older Astro schema). If the site has `supabase/migrations`, setup copies the schema file there. Apply it. The wizard cannot create tables.
2. From `writebolt-astro/`, run `npm run setup -- --addon --host <path to this site> --site-url <public origin> --site-name "<site name>"`. Finish this step. A non-interactive shell is fine: the wizard generates an admin password and prints it. Do not point `--host` at a different app to find Supabase. If the service role key is missing, ask for that key and add `SUPABASE_SERVICE_ROLE_KEY` to this site's `.env`.
3. Confirm `astro.config.mjs` includes `writebolt({ layout })`. Then start the existing site with `npm run dev`.
4. Sign in at `/blog/admin/login` and set the homepage heading, CTAs, and categories. Newsletter stays in **Admin → Settings**.
5. Do not mark a category “Feature on homepage” unless the featured-sections setting is on and you want that magazine layout.
6. Give the user `/blog`, `/blog/admin/login`, and the password the wizard printed. They sign in with that password. The site's own admin login is a different system.
