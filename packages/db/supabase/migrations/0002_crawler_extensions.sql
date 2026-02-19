-- Migration 0002: Crawler extensions
-- Adds support for titi.co.il and other external sources

-- Add crawler fields to advertisements
alter table public.advertisements 
add column if not exists source text,
add column if not exists source_id text,
add column if not exists rating_avg float,
add column if not exists rating_count int,
add column if not exists views_count int,
add column if not exists raw_data jsonb;

-- Unique constraint for crawler sync
create unique index if not exists advertisements_source_source_id_idx on public.advertisements (source, source_id) where source is not null;

-- Profile Changes table (Diff Engine)
create table if not exists public.profile_changes (
  id uuid primary key default uuid_generate_v4(),
  ad_id uuid not null references public.advertisements(id) on delete cascade,
  change_type text not null, -- 'new', 'updated', 'removed'
  changed_fields text[],
  before_json jsonb,
  after_json jsonb,
  created_at timestamptz not null default now()
);

-- Enable RLS for profile_changes
alter table public.profile_changes enable row level security;

-- Only admins/system can read changes
create policy "profile_changes_select_admin" on public.profile_changes
  for select using (
    exists (
      select 1 from public.users 
      where id = auth.uid() and role = 'admin'
    )
  );

-- Comments 
create table if not exists public.ad_comments (
  id uuid primary key default uuid_generate_v4(),
  ad_id uuid not null references public.advertisements(id) on delete cascade,
  comment_key text, -- unique ID from source
  author_name text,
  rating int,
  text text,
  created_at timestamptz not null default now(),
  raw_json jsonb,
  unique (ad_id, comment_key)
);

alter table public.ad_comments enable row level security;
create policy "ad_comments_select_all" on public.ad_comments for select using (true);

-- Indices for performance
create index if not exists profile_changes_ad_id_idx on public.profile_changes(ad_id);
create index if not exists ad_comments_ad_id_idx on public.ad_comments(ad_id);