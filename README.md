# Writebolt — Supabase + Next.js blog

A production-ready blog template: App Router, Supabase, MDX-style content, admin UI, SEO, and optional BYOK AI helpers.

## Quick start (four commands)

From an empty folder:

```bash
git clone https://github.com/YOUR_ORG/writebolt-supabase-blog-cms.git my-blog
cd my-blog
npm install
npm run setup
```

Then:

1. Open **Supabase → SQL Editor**, create a new query, and paste the full contents of  
   `supabase/migrations/001_writebolt_blog_schema.sql`, then **Run**.
2. Back in the project:

```bash
npm run seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### After `npm run setup` you should have

- A `.env.local` file with Supabase URL, anon key, service role key, and a generated `SETTINGS_ENCRYPTION_KEY`.

### Verify your clone is complete

If `npm install` fails with **ENOENT / package.json not found**, the Git repository you cloned does **not** contain the application — only something like a README was pushed.

**Check:** On GitHub, the repository root must show `package.json`, `app/`, `components/`, `next.config.mjs`, etc.

**Fix:** Push the full project from your machine (see [Publishing the full repo](#publishing-the-full-repo-to-github) below).

---

## Scripts

| Command        | Purpose |
|----------------|---------|
| `npm run dev`  | Start Next.js locally |
| `npm run build`| Production build |
| `npm run setup`| Interactive wizard → writes `.env.local` |
| `npm run seed` | Default author + blog settings + nav (needs SQL migration applied first) |

---

## Publishing the full repo to GitHub

If the remote repo is empty or README-only:

```bash
cd /path/to/your/local/writebolt-blog
git init
git add .
git commit -m "Add Writebolt blog application"
git branch -M main
git remote add origin https://github.com/YOUR_ORG/writebolt-supabase-blog-cms.git
git push -u origin main
```

Confirm on github.com that `package.json` appears at the repository root.

---

## Environment variables

Copy `.env.example` to `.env.local` or use `npm run setup`.

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Used by `npm run seed` and server tasks |
| `SETTINGS_ENCRYPTION_KEY` | Yes | 64-char hex; encrypts BYOK keys in admin |
| `OPENAI_API_KEY` | No | Optional global AI key (or use Admin → AI Config) |

---

## Security note

The included SQL migration uses **permissive RLS** so the admin UI works with the anon key without Supabase Auth wired to `/admin`. For a public site, add authentication and tighten policies, or protect `/admin` at the edge (e.g. Vercel deployment protection).

---

## License

MIT (adjust as needed for your fork.)
