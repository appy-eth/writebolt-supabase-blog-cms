-- Upgrade a database created from the old Next.js schema
-- (blog_settings, articles.category text, scheduled_date, categories.display_order)
-- to the shared schema in 001_writebolt_blog_schema.sql.
-- Safe to re-run. New projects that only ran 001 can skip this.

-- Settings table name
do $$ begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'blog_settings'
  ) and not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'site_settings'
  ) then
    alter table public.blog_settings rename to site_settings;
  end if;
end $$;

do $$ begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'site_settings' and column_name = 'blog_name'
  ) then
    alter table public.site_settings rename column blog_name to site_name;
  end if;
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'site_settings' and column_name = 'blog_description'
  ) then
    alter table public.site_settings rename column blog_description to site_description;
  end if;
end $$;

alter table public.site_settings add column if not exists blog_page_heading text;
alter table public.site_settings add column if not exists show_featured_categories boolean not null default false;
alter table public.site_settings add column if not exists writebolt_ads_site_id text;

-- Authors
alter table public.authors add column if not exists user_id uuid references auth.users (id) on delete set null;
alter table public.authors add column if not exists is_default boolean not null default false;

-- Categories: display_order -> sort_order, plus nav flag
do $$ begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'categories' and column_name = 'display_order'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'categories' and column_name = 'sort_order'
  ) then
    alter table public.categories rename column display_order to sort_order;
  end if;
end $$;

alter table public.categories add column if not exists sort_order integer not null default 0;
alter table public.categories add column if not exists show_in_nav boolean not null default true;

-- Articles: scheduled_date -> scheduled_for, category text -> category_id
do $$ begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'articles' and column_name = 'scheduled_date'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'articles' and column_name = 'scheduled_for'
  ) then
    alter table public.articles rename column scheduled_date to scheduled_for;
  end if;
end $$;

alter table public.articles add column if not exists content_html text;
alter table public.articles add column if not exists category_id uuid references public.categories(id) on delete set null;

do $$ begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'articles' and column_name = 'category'
  ) then
    update public.articles a
    set category_id = c.id
    from public.categories c
    where a.category_id is null
      and a.category is not null
      and (c.slug = a.category or c.name = a.category);
    alter table public.articles drop column category;
  end if;
end $$;

create index if not exists idx_articles_category_id on public.articles(category_id);

-- Nav, which the Next.js admin already queries
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

create table if not exists public.writebolt_pro_ideas (
  id text primary key,
  headline text not null,
  description text,
  story_type text,
  delivered_on date,
  raw jsonb default '{}',
  updated_at timestamptz not null default now()
);

alter table public.nav_items enable row level security;
alter table public.authors enable row level security;
alter table public.categories enable row level security;
alter table public.articles enable row level security;
alter table public.site_settings enable row level security;
alter table public.ai_settings enable row level security;

drop policy if exists "allow_all" on public.authors;
drop policy if exists "allow_all" on public.articles;
drop policy if exists "allow_all" on public.categories;
drop policy if exists "allow_all" on public.blog_settings;
drop policy if exists "allow_all" on public.site_settings;
drop policy if exists "allow_all" on public.ai_settings;
drop policy if exists "anon_select_published_articles" on public.articles;
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
