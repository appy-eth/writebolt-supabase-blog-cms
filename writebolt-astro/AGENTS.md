# Writebolt Blog — agent install guide

You are installing Writebolt into an **Astro** site. The human copies the prompt from the repository README into this chat. **Supabase MCP must be connected.** Follow this file end to end, then hand off to the human for `npm run setup`.

## Rules

- Do **not** paste API keys, service role keys, or database passwords into chat.
- Do **not** answer `npm run setup` prompts. Do **not** run `npm run setup` in the agent's background shell (it is not interactive).
- **Hand off in Cursor's integrated terminal:** View → Terminal (or the user's Terminal shortcut), `cd` to `writebolt-astro/` in this workspace, then the human runs `npm run setup` (or `npm run setup -- --standalone`) themselves.
- Do **not** add a second dev server, proxy, `WRITEBOLT_ORIGIN`, or separate Vercel project for the blog.
- Add-on: use **this site's** `.env` / `.env.local`. Do not create `writebolt-astro/.env`.

## Add-on checklist

1. **Copy code** — `writebolt-astro/` into the site repo. `npm install` inside `writebolt-astro/`.
2. **Tables (Supabase MCP)** — Same project as `PUBLIC_SUPABASE_URL` / `SUPABASE_URL` in the site env. If `site_settings` is missing, `apply_migration` with `writebolt-astro/supabase/001_initial_schema.sql`, then `002_feature_parity.sql`. `list_tables` to confirm.
3. **Wire Astro** — Remove `src/pages/blog.astro` or `src/pages/blog/`. Add `writebolt({ layout })` from `writebolt-astro/integration/astro.mjs` to `astro.config`. Layout must render `<slot />` (optional `<slot name="head" />`). Use `./src/layouts/Layout.astro` or whatever this site uses.
4. **Service role** — If the site env lacks `SUPABASE_SERVICE_ROLE_KEY`, tell the human to add it from Supabase → Project Settings → API before setup. Required for the CMS (server-side writes; anon key is read-only for published content under RLS). MCP cannot inject this key. Never put it in chat or client code.
5. **Hand off** — Open the **integrated terminal** in `writebolt-astro/`. Human runs `npm run setup`. Human enters blog title, admin username, admin password. Wizard writes login to site env, sets embedded layout, seeds rows.
6. **Verify** — Human runs `npm run dev` from site root. `/blog`, `/blog/admin/login`.

If `astro.config` has no server adapter, warn: `/blog` needs SSR (e.g. `npx astro add vercel` on Vercel).

## Standalone checklist

1. **App** — `writebolt-astro/` is the project. `npm install`.
2. **Tables (MCP)** — `apply_migration` with `001_initial_schema.sql` then `002_feature_parity.sql`.
3. **Hand off** — Integrated terminal in `writebolt-astro/`. Human runs `npm run setup -- --standalone` (Supabase keys if needed, title, admin login).
4. **Verify** — `npm run dev`. `/`, `/admin/login`.

## Layout and content (add-on)

- Wizard sets **embedded** layout so Writebolt's header stays off; host layout wraps pages.
- Set a real **Homepage heading** in Admin → Settings (not generic “Blog”).
- Add-on uploads: **Supabase** bucket `blog-images` (wizard configures).
- Google News: setup patches `public/robots.txt` when it exists (`Allow: /blog/`, news sitemap URL).
- Sitemap on host site: exclude `/blog/admin` and `/blog/api`.

## CTAs

- Use **either** settings in-article CTA **or** `<CTAInline />` in Markdown, not both.

## MCP unavailable

Tell the human to use **Manual install** in the README, or run setup and supply `DATABASE_URL` / database password when prompted.
