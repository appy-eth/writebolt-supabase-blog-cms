-- Writebolt Blog — initial schema
-- Run this in Supabase → SQL Editor after `npm run setup` creates your .env.local.
-- Safe to run once on a new project.

create extension if not exists "pgcrypto";

-- ── Authors ─────────────────────────────────────────────────
create table if not exists public.authors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  name text not null,
  slug text not null unique,
  bio text,
  avatar_url text,
  website_url text,
  twitter_handle text,
  linkedin_url text,
  github_url text,
  role text not null default 'contributor' check (role in ('contributor', 'editor', 'admin')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ── Articles ────────────────────────────────────────────────
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.authors (id) on delete set null,
  slug text not null,
  headline text not null,
  excerpt text,
  content_markdown text,
  content_html text,
  featured_image text,
  featured_image_alt text,
  category text,
  tags text[] not null default '{}',
  word_count integer,
  reading_time_minutes integer,
  seo_title text,
  seo_description text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  fts tsvector generated always as (
    to_tsvector(
      'english',
      coalesce(headline, '') || ' ' || coalesce(excerpt, '') || ' ' || coalesce(content_markdown, '')
    )
  ) stored,
  unique (slug)
);

create index if not exists articles_fts_idx on public.articles using gin (fts);
create index if not exists articles_status_published_at_idx on public.articles (status, published_at desc);

-- ── Categories ──────────────────────────────────────────────
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  display_order integer not null default 0,
  article_count integer not null default 0,
  created_at timestamptz not null default now()
);

-- ── Blog settings (single row) ─────────────────────────────
create table if not exists public.blog_settings (
  id uuid primary key default gen_random_uuid(),
  blog_name text not null default 'My Blog',
  blog_description text not null default 'A blog powered by Writebolt',
  logo_url text,
  favicon_url text,
  layout_mode text not null default 'standalone' check (layout_mode in ('standalone', 'embedded', 'custom')),
  show_header boolean not null default true,
  show_footer boolean not null default true,
  show_blog_title boolean not null default true,
  default_author_id uuid references public.authors (id) on delete set null,
  posts_per_page integer not null default 10,
  show_reading_time boolean not null default true,
  show_table_of_contents boolean not null default true,
  show_related_articles boolean not null default true,
  show_author_card boolean not null default true,
  inline_cta_enabled boolean not null default false,
  inline_cta_title text,
  inline_cta_description text,
  inline_cta_button_text text,
  inline_cta_button_url text,
  sidebar_cta_enabled boolean not null default false,
  sidebar_cta_title text,
  sidebar_cta_description text,
  sidebar_cta_button_text text,
  sidebar_cta_button_url text,
  sidebar_cta_image_url text,
  newsletter_enabled boolean not null default false,
  newsletter_provider text,
  newsletter_form_action text,
  newsletter_success_message text not null default 'Thanks for subscribing!',
  site_title_template text not null default '{title} | {blog_name}',
  default_og_image text,
  google_analytics_id text,
  social_twitter text,
  social_linkedin text,
  social_github text,
  social_youtube text,
  social_website text,
  image_storage_provider text not null default 'local' check (image_storage_provider in ('local', 'supabase')),
  supabase_storage_bucket text not null default 'blog-images',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Nav items ───────────────────────────────────────────────
create table if not exists public.nav_items (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  url text not null,
  open_in_new_tab boolean not null default false,
  display_order integer not null default 0,
  is_visible boolean not null default true,
  icon text,
  created_at timestamptz not null default now()
);

-- ── AI settings (BYOK in admin) ─────────────────────────────
create table if not exists public.ai_settings (
  id uuid primary key default gen_random_uuid(),
  openai_api_key_encrypted text,
  replicate_api_key_encrypted text,
  image_provider text not null default 'openai',
  default_tone text not null default 'professional',
  default_image_style text not null default 'photorealistic'
);

-- ── RLS: permissive for self-hosted blog (anon key in browser)
-- Tighten this when you add Supabase Auth to /admin.
drop policy if exists "allow_all" on public.authors;
drop policy if exists "allow_all" on public.articles;
drop policy if exists "allow_all" on public.categories;
drop policy if exists "allow_all" on public.blog_settings;
drop policy if exists "allow_all" on public.nav_items;
drop policy if exists "allow_all" on public.ai_settings;

alter table public.authors enable row level security;
alter table public.articles enable row level security;
alter table public.categories enable row level security;
alter table public.blog_settings enable row level security;
alter table public.nav_items enable row level security;
alter table public.ai_settings enable row level security;

-- One permissive policy per table (self-hosted; add auth + stricter policies for production)
create policy "allow_all" on public.authors for all using (true) with check (true);
create policy "allow_all" on public.articles for all using (true) with check (true);
create policy "allow_all" on public.categories for all using (true) with check (true);
create policy "allow_all" on public.blog_settings for all using (true) with check (true);
create policy "allow_all" on public.nav_items for all using (true) with check (true);
create policy "allow_all" on public.ai_settings for all using (true) with check (true);
