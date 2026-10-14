-- Upgrade path for Astro DBs created from the original slim schema.
-- Safe to run after 001_initial_schema.sql. New installs can skip this.

alter table public.authors add column if not exists user_id uuid references auth.users (id) on delete set null;
alter table public.authors add column if not exists website_url text;
alter table public.authors add column if not exists twitter_handle text;
alter table public.authors add column if not exists linkedin_url text;
alter table public.authors add column if not exists github_url text;
alter table public.authors add column if not exists role text not null default 'contributor';
alter table public.authors add column if not exists is_active boolean not null default true;

alter table public.categories add column if not exists description text;
alter table public.categories add column if not exists article_count integer not null default 0;
alter table public.categories add column if not exists home_page_featured boolean not null default false;

alter table public.articles add column if not exists content_html text;
alter table public.articles add column if not exists featured_image_alt text;
alter table public.articles add column if not exists tags text[] not null default '{}';
alter table public.articles add column if not exists word_count integer;
alter table public.articles add column if not exists reading_time_minutes integer;
alter table public.articles add column if not exists seo_title text;
alter table public.articles add column if not exists seo_description text;

alter table public.site_settings add column if not exists favicon_url text;
alter table public.site_settings add column if not exists layout_mode text not null default 'standalone';
alter table public.site_settings add column if not exists show_header boolean not null default true;
alter table public.site_settings add column if not exists show_footer boolean not null default true;
alter table public.site_settings add column if not exists show_blog_title boolean not null default true;
alter table public.site_settings add column if not exists default_author_id uuid references public.authors(id) on delete set null;
alter table public.site_settings add column if not exists posts_per_page integer not null default 10;
alter table public.site_settings add column if not exists show_reading_time boolean not null default true;
alter table public.site_settings add column if not exists show_table_of_contents boolean not null default true;
alter table public.site_settings add column if not exists show_related_articles boolean not null default true;
alter table public.site_settings add column if not exists show_author_card boolean not null default true;
alter table public.site_settings add column if not exists inline_cta_enabled boolean not null default false;
alter table public.site_settings add column if not exists inline_cta_heading text;
alter table public.site_settings add column if not exists inline_cta_subheading text;
alter table public.site_settings add column if not exists inline_cta_email_placeholder text default 'Enter your email';
alter table public.site_settings add column if not exists inline_cta_button_text text;
alter table public.site_settings add column if not exists inline_cta_success_redirect_url text;
alter table public.site_settings add column if not exists inline_cta_list_id text;
alter table public.site_settings add column if not exists sidebar_cta_enabled boolean not null default false;
alter table public.site_settings add column if not exists sidebar_cta_title text;
alter table public.site_settings add column if not exists sidebar_cta_description text;
alter table public.site_settings add column if not exists sidebar_cta_button_text text;
alter table public.site_settings add column if not exists sidebar_cta_button_url text;
alter table public.site_settings add column if not exists sidebar_cta_image_url text;
alter table public.site_settings add column if not exists newsletter_enabled boolean not null default false;
alter table public.site_settings add column if not exists newsletter_provider text;
alter table public.site_settings add column if not exists newsletter_list_id text;
alter table public.site_settings add column if not exists newsletter_success_message text not null default 'Thanks for subscribing!';
alter table public.site_settings add column if not exists newsletter_success_redirect_url text;
alter table public.site_settings add column if not exists newsletter_embed_url text;
alter table public.site_settings add column if not exists site_title_template text not null default '{title} | {site_name}';
alter table public.site_settings add column if not exists default_og_image text;
alter table public.site_settings add column if not exists google_analytics_id text;
alter table public.site_settings add column if not exists social_twitter text;
alter table public.site_settings add column if not exists social_linkedin text;
alter table public.site_settings add column if not exists social_github text;
alter table public.site_settings add column if not exists social_youtube text;
alter table public.site_settings add column if not exists social_website text;
alter table public.site_settings add column if not exists image_storage_provider text not null default 'local';
alter table public.site_settings add column if not exists supabase_storage_bucket text not null default 'blog-images';
alter table public.site_settings add column if not exists scheduled_publishing_enabled boolean not null default true;
alter table public.site_settings add column if not exists writebolt_ads_site_id text;
alter table public.site_settings add column if not exists blog_page_heading text;
alter table public.site_settings add column if not exists show_featured_categories boolean not null default false;

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

create table if not exists public.ai_settings (
  id uuid primary key default gen_random_uuid(),
  openai_api_key_encrypted text,
  replicate_api_key_encrypted text,
  image_provider text not null default 'openai',
  default_tone text not null default 'professional',
  default_image_style text not null default 'photorealistic'
);

insert into public.ai_settings (image_provider)
select 'openai'
where not exists (select 1 from public.ai_settings);

do $$ begin
  alter table public.articles add column fts tsvector generated always as (
    to_tsvector(
      'english',
      coalesce(headline, '') || ' ' || coalesce(excerpt, '') || ' ' || coalesce(content_markdown, '')
    )
  ) stored;
exception when duplicate_column then null;
end $$;

create index if not exists articles_fts_idx on public.articles using gin (fts);

alter table public.nav_items enable row level security;
alter table public.ai_settings enable row level security;

drop policy if exists "Public read nav_items" on public.nav_items;
create policy "Public read nav_items" on public.nav_items for select using (is_visible = true);
