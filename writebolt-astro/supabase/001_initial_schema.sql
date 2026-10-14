-- Writebolt Blog — Astro edition (full feature schema)
-- Run this in your Supabase SQL editor. Safe to re-run: uses IF NOT EXISTS.

create extension if not exists "pgcrypto";

-- ── Authors ─────────────────────────────────────────────────
create table if not exists public.authors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  bio text default '',
  avatar_url text default '',
  website_url text,
  twitter_handle text,
  linkedin_url text,
  github_url text,
  role text not null default 'contributor' check (role in ('contributor', 'editor', 'admin')),
  is_active boolean not null default true,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- ── Categories ──────────────────────────────────────────────
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  show_in_nav boolean not null default true,
  sort_order integer not null default 0,
  article_count integer not null default 0,
  home_page_featured boolean not null default false,
  created_at timestamptz not null default now()
);

-- ── Articles ────────────────────────────────────────────────
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  headline text not null,
  slug text not null unique,
  content_markdown text default '',
  excerpt text default '',
  featured_image text default '',
  featured_image_alt text,
  author_id uuid references public.authors(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  tags text[] not null default '{}',
  word_count integer,
  reading_time_minutes integer,
  seo_title text,
  seo_description text,
  status text not null default 'draft' check (status in ('draft', 'published', 'scheduled', 'archived')),
  published_at timestamptz,
  scheduled_for timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Full-text search (generated). Ignore if column already exists from an older schema.
do $$ begin
  alter table public.articles add column fts tsvector generated always as (
    to_tsvector(
      'english',
      coalesce(headline, '') || ' ' || coalesce(excerpt, '') || ' ' || coalesce(content_markdown, '')
    )
  ) stored;
exception when duplicate_column then null;
end $$;

-- ── Site settings (single row) ──────────────────────────────
create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  site_name text not null default 'My Blog',
  site_description text not null default 'A short tagline for your blog. Shown in the header and default meta description.',
  logo_url text default '',
  favicon_url text,
  layout_mode text not null default 'standalone' check (layout_mode in ('standalone', 'embedded', 'custom')),
  show_header boolean not null default true,
  show_footer boolean not null default true,
  show_blog_title boolean not null default true,
  blog_page_heading text,
  show_featured_categories boolean not null default false,
  default_author_id uuid references public.authors(id) on delete set null,
  posts_per_page integer not null default 10,
  show_reading_time boolean not null default true,
  show_table_of_contents boolean not null default true,
  show_related_articles boolean not null default true,
  show_author_card boolean not null default true,
  inline_cta_enabled boolean not null default false,
  inline_cta_heading text,
  inline_cta_subheading text,
  inline_cta_email_placeholder text default 'Enter your email',
  inline_cta_button_text text,
  inline_cta_success_redirect_url text,
  inline_cta_list_id text,
  sidebar_cta_enabled boolean not null default false,
  sidebar_cta_title text,
  sidebar_cta_description text,
  sidebar_cta_button_text text,
  sidebar_cta_button_url text,
  sidebar_cta_image_url text,
  newsletter_enabled boolean not null default false,
  newsletter_provider text,
  newsletter_list_id text,
  newsletter_success_message text not null default 'Thanks for subscribing!',
  newsletter_success_redirect_url text,
  newsletter_embed_url text,
  site_title_template text not null default '{title} | {site_name}',
  default_og_image text,
  google_analytics_id text,
  social_twitter text,
  social_linkedin text,
  social_github text,
  social_youtube text,
  social_website text,
  image_storage_provider text not null default 'local' check (image_storage_provider in ('local', 'supabase')),
  supabase_storage_bucket text not null default 'blog-images',
  scheduled_publishing_enabled boolean not null default true,
  writebolt_ads_site_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Custom nav items ────────────────────────────────────────
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

-- ── AI settings (BYOK) ──────────────────────────────────────
create table if not exists public.ai_settings (
  id uuid primary key default gen_random_uuid(),
  openai_api_key_encrypted text,
  replicate_api_key_encrypted text,
  image_provider text not null default 'openai',
  default_tone text not null default 'professional',
  default_image_style text not null default 'photorealistic'
);

-- ── Indexes ─────────────────────────────────────────────────
create index if not exists idx_articles_status on public.articles(status);
create index if not exists idx_articles_slug on public.articles(slug);
create index if not exists idx_articles_published_at on public.articles(published_at desc);
create index if not exists idx_articles_status_published_at on public.articles(status, published_at desc);
create index if not exists idx_articles_category_id on public.articles(category_id);
create index if not exists idx_articles_author_id on public.articles(author_id);
create index if not exists idx_categories_slug on public.categories(slug);
create index if not exists idx_authors_slug on public.authors(slug);
create index if not exists articles_fts_idx on public.articles using gin (fts);

-- ── Seed defaults ───────────────────────────────────────────
insert into public.authors (name, slug, role, is_default, is_active)
values ('Admin', 'admin', 'admin', true, true)
on conflict (slug) do nothing;

insert into public.site_settings (site_name, site_description)
select 'My Blog', 'A blog powered by Writebolt'
where not exists (select 1 from public.site_settings);

insert into public.ai_settings (image_provider)
select 'openai'
where not exists (select 1 from public.ai_settings);

-- ── RLS ─────────────────────────────────────────────────────
alter table public.authors enable row level security;
alter table public.categories enable row level security;
alter table public.articles enable row level security;
alter table public.site_settings enable row level security;
alter table public.nav_items enable row level security;
alter table public.ai_settings enable row level security;

drop policy if exists "Public read authors" on public.authors;
drop policy if exists "Public read categories" on public.categories;
drop policy if exists "Public read published articles" on public.articles;
drop policy if exists "Public read site_settings" on public.site_settings;
drop policy if exists "Public read nav_items" on public.nav_items;

create policy "Public read authors" on public.authors for select using (is_active = true);
create policy "Public read categories" on public.categories for select using (true);
create policy "Public read published articles" on public.articles for select using (status = 'published');
create policy "Public read site_settings" on public.site_settings for select using (true);
create policy "Public read nav_items" on public.nav_items for select using (is_visible = true);

-- Writes use the service-role client, which bypasses RLS. ai_settings has no public policy.
