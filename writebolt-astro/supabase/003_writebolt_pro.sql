-- Optional local cache for Writebolt Pro.
-- Ideas and Link Pro pages live on the Writebolt Pro database.
-- This table only keeps a copy of today's desk inside the blog database.

create table if not exists public.writebolt_pro_ideas (
  id text primary key,
  headline text not null,
  description text,
  story_type text,
  delivered_on date,
  raw jsonb default '{}',
  updated_at timestamptz not null default now()
);
