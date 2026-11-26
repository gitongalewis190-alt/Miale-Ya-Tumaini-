-- Miale ya Tumaini · database schema
-- Run once in Supabase > SQL Editor (or apply as a migration). Safe to re-run.

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('img','audio','video')),
  cat text,
  consent boolean not null default false,
  title text not null default '',
  speaker text not null default '',
  lang text not null default '',
  descr text not null default '',
  path text not null,
  orig_path text,
  mime text,
  size_bytes integer not null default 0,
  dur numeric not null default 0,
  plays integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  name text check (char_length(name) <= 40),
  message text not null check (char_length(message) between 1 and 800),
  signature text check (char_length(signature) <= 200000),
  consent boolean not null default false check (consent),
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  approved_at timestamptz
);

create table if not exists public.events (
  id bigint generated always as identity primary key,
  kind text not null check (char_length(kind) <= 30),
  detail text check (char_length(detail) <= 200),
  device_hash text,
  created_at timestamptz not null default now()
);

create table if not exists public.visits (
  id bigint generated always as identity primary key,
  device_hash text,
  device_kind text check (device_kind in ('m','d')),
  lang text,
  created_at timestamptz not null default now()
);

create table if not exists public.visitor_prefs (
  id bigint generated always as identity primary key,
  device_hash text,
  prefs jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- helper functions
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

create or replace function public.admin_exists() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins);
$$;

-- the first signed-in account becomes the admin. Works only while no admin exists.
create or replace function public.claim_admin() returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Create the account first'; end if;
  if exists (select 1 from public.admins) then return false; end if;
  insert into public.admins (user_id, email)
  select u.id, u.email from auth.users u where u.id = auth.uid();
  return true;
end $$;

create or replace function public.increment_plays(p_id uuid) returns void
language sql security definer set search_path = public as $$
  update public.media set plays = plays + 1 where id = p_id and kind = 'audio';
$$;

-- row level security
alter table public.admins enable row level security;          -- no policies: only the functions read it
alter table public.site_settings enable row level security;
alter table public.media enable row level security;
alter table public.comments enable row level security;
alter table public.events enable row level security;
alter table public.visits enable row level security;
alter table public.visitor_prefs enable row level security;

drop policy if exists "settings public read" on public.site_settings;
create policy "settings public read" on public.site_settings for select using (true);
drop policy if exists "settings admin write" on public.site_settings;
create policy "settings admin write" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

-- photos without consent are hidden from the public by this policy
drop policy if exists "media public read consented" on public.media;
create policy "media public read consented" on public.media for select using (consent = true or public.is_admin());
drop policy if exists "media admin write" on public.media;
create policy "media admin write" on public.media for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "comments visitor insert" on public.
