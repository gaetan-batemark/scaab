-- V2: Multi-tenant preparation
-- Table clubs + helper function + club_id on all relevant tables

-- Clubs table
create table if not exists public.clubs (
  id text primary key,
  name text not null,
  short_name text,
  logo_url text,
  primary_color text default '#1e3a5f',
  secondary_color text default '#ffffff',
  league text,
  country text default 'FR',
  created_at timestamptz not null default now()
);

-- Seed SCAAB
insert into public.clubs (id, name, short_name, league, country)
values ('scaab', 'Sporting Club Aubagne Air Bel', 'SCAAB', 'National 1', 'FR')
on conflict (id) do nothing;

-- Helper: returns current user's club_id (V2 = always 'scaab', V3 = read from profiles)
create or replace function public.current_user_club()
returns text as $$
  select 'scaab'::text;
$$ language sql stable;

-- Add club_id to profiles
alter table public.profiles
  add column if not exists club_id text not null default 'scaab' references public.clubs(id) on delete cascade;

-- Add club_id to shortlists
alter table public.shortlists
  add column if not exists club_id text not null default 'scaab' references public.clubs(id) on delete cascade;

-- Add club_id to scouting_reports
alter table public.scouting_reports
  add column if not exists club_id text not null default 'scaab' references public.clubs(id) on delete cascade;

-- Add club_id to tags
alter table public.tags
  add column if not exists club_id text not null default 'scaab' references public.clubs(id) on delete cascade;

-- Add club_id to saved_searches
alter table public.saved_searches
  add column if not exists club_id text not null default 'scaab' references public.clubs(id) on delete cascade;

-- RLS on clubs
alter table public.clubs enable row level security;

create policy "clubs_select_authenticated" on public.clubs
  for select to authenticated using (true);

create policy "clubs_manage_admin" on public.clubs
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
