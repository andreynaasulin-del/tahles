-- Migration 0001: Initial schema
-- Identical to schema.sql — versioned for Supabase migrations system
-- Run: supabase migration up

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "postgis";

create type user_role   as enum ('client', 'advertiser', 'admin');
create type service_type as enum ('incall', 'outcall', 'both');
create type gender      as enum ('male', 'female', 'trans', 'other');
create type tx_status   as enum ('pending', 'paid', 'failed');
create type tx_purpose  as enum ('unlock', 'vip', 'boost', 'verification');
create type ai_decision as enum ('approved', 'rejected', 'pending');

create table public.users (
  id         uuid        primary key references auth.users(id) on delete cascade,
  tg_id      bigint      unique,
  email      text,
  role       user_role   not null default 'client',
  created_at timestamptz not null default now()
);

create table public.categories (
  id   uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique
);

create table public.advertisements (
  id              uuid         primary key default uuid_generate_v4(),
  user_id         uuid         not null references public.users(id) on delete cascade,
  nickname        text         not null,
  description     text,
  age             int          check (age >= 18 and age <= 99),
  verified_age    boolean      not null default false,
  verified        boolean      not null default false,
  vip_status      boolean      not null default false,
  service_type    service_type not null default 'incall',
  gender          gender       not null default 'female',
  target_audience text[],
  language        text[],
  price_min       int          check (price_min >= 0),
  price_max       int          check (price_max >= 0),
  geo_point       geography(Point, 4326),
  city            text,
  online_status   boolean      not null default false,
  photos          text[]       not null default '{}',
  created_at      timestamptz  not null default now(),
  updated_at      timestamptz  not null default now()
);

create table public.ad_categories (
  ad_id       uuid not null references public.advertisements(id) on delete cascade,
  category_id uuid not null references public.categories(id)     on delete cascade,
  primary key (ad_id, category_id)
);

create table public.transactions (
  id             uuid        primary key default uuid_generate_v4(),
  user_id        uuid        not null references public.users(id) on delete cascade,
  amount         int         not null,
  currency       text        not null default 'eur',
  status         tx_status   not null default 'pending',
  purpose        tx_purpose  not null,
  provider       text        not null default 'stripe',
  provider_tx_id text,
  created_at     timestamptz not null default now()
);

create table public.contacts (
  ad_id             uuid primary key references public.advertisements(id) on delete cascade,
  phone             text,
  telegram_username text,
  whatsapp          text
);

create table public.unlocks (
  id         uuid        primary key default uuid_generate_v4(),
  client_id  uuid        not null references public.users(id)         on delete cascade,
  ad_id      uuid        not null references public.advertisements(id) on delete cascade,
  tx_id      uuid        references public.transactions(id),
  created_at timestamptz not null default now(),
  unique (client_id, ad_id)
);

create table public.boosts (
  id          uuid        primary key default uuid_generate_v4(),
  ad_id       uuid        not null references public.advertisements(id) on delete cascade,
  city        text,
  category_id uuid        references public.categories(id),
  start_at    timestamptz not null,
  end_at      timestamptz not null
);

create table public.ai_screenings (
  id         uuid        primary key default uuid_generate_v4(),
  ad_id      uuid        not null references public.advertisements(id) on delete cascade,
  decision   ai_decision not null default 'pending',
  score      float,
  notes      text,
  created_at timestamptz not null default now()
);

create index ads_city_idx       on public.advertisements(city);
create index ads_user_id_idx    on public.advertisements(user_id);
create index ads_created_at_idx on public.advertisements(created_at desc);
create index ads_verified_idx   on public.advertisements(verified) where verified = true;
create index ads_vip_idx        on public.advertisements(vip_status) where vip_status = true;
create index ads_geo_idx        on public.advertisements using gist(geo_point);
create index unlocks_lookup_idx on public.unlocks(client_id, ad_id);
create index boosts_active_idx  on public.boosts(ad_id, start_at, end_at);

create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger ads_updated_at
  before update on public.advertisements
  for each row execute function public.update_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.users          enable row level security;
alter table public.advertisements enable row level security;
alter table public.categories     enable row level security;
alter table public.ad_categories  enable row level security;
alter table public.contacts       enable row level security;
alter table public.transactions   enable row level security;
alter table public.unlocks        enable row level security;
alter table public.boosts         enable row level security;
alter table public.ai_screenings  enable row level security;

create policy "users_select_own"  on public.users for select using (auth.uid() = id);
create policy "users_update_own"  on public.users for update using (auth.uid() = id);
create policy "ads_select_all"    on public.advertisements for select using (true);
create policy "ads_insert_own"    on public.advertisements for insert with check (auth.uid() = user_id);
create policy "ads_update_own"    on public.advertisements for update using (auth.uid() = user_id);
create policy "ads_delete_own"    on public.advertisements for delete using (auth.uid() = user_id);

create policy "contacts_select_if_unlocked" on public.contacts for select using (
  exists (
    select 1 from public.unlocks u join public.transactions t on t.id = u.tx_id
    where u.ad_id = contacts.ad_id and u.client_id = auth.uid() and t.status = 'paid'
  )
);
create policy "contacts_select_own_ad" on public.contacts for select using (
  exists (select 1 from public.advertisements a where a.id = contacts.ad_id and a.user_id = auth.uid())
);
create policy "contacts_insert_own_ad" on public.contacts for insert with check (
  exists (select 1 from public.advertisements a where a.id = contacts.ad_id and a.user_id = auth.uid())
);
create policy "contacts_update_own_ad" on public.contacts for update using (
  exists (select 1 from public.advertisements a where a.id = contacts.ad_id and a.user_id = auth.uid())
);

create policy "unlocks_insert_client" on public.unlocks for insert with check (auth.uid() = client_id);
create policy "unlocks_select_own"    on public.unlocks for select using (auth.uid() = client_id);
create policy "tx_select_own"         on public.transactions for select using (auth.uid() = user_id);
create policy "categories_select_all"    on public.categories    for select using (true);
create policy "ad_categories_select_all" on public.ad_categories for select using (true);
create policy "boosts_select_all"        on public.boosts         for select using (true);
create policy "ai_screenings_select_own" on public.ai_screenings for select using (
  exists (select 1 from public.advertisements a where a.id = ai_screenings.ad_id and a.user_id = auth.uid())
);

-- Seed categories
insert into public.categories (name, slug) values
  ('Massage',     'massage'),
  ('Dating Only', 'dating'),
  ('Sugar Baby',  'sugar-baby'),
  ('Domina',      'domina'),
  ('Individual',  'individual'),
  ('Trans',       'trans')
on conflict (slug) do nothing;
