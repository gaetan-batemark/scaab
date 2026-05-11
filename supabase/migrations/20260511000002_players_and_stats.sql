-- Players table
create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  external_id text,
  source text not null check (source in ('api-football', 'football-data', 'anysport', 'sportdb', 'manual', 'csv-import')),
  full_name text not null,
  first_name text,
  last_name text,
  birth_date date,
  age int,
  nationality text,
  second_nationality text,
  height_cm int,
  weight_kg int,
  preferred_foot text check (preferred_foot in ('left', 'right', 'both')),
  position text check (position in ('GK', 'CB', 'LB', 'RB', 'DM', 'CM', 'AM', 'LW', 'RW', 'ST')),
  secondary_positions text[],
  current_club text,
  current_club_id text,
  current_league text,
  contract_until date,
  market_value_eur int,
  agent text,
  photo_url text,
  injured boolean not null default false,
  raw_data jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Unique constraint on source + external_id when external_id is not null
create unique index idx_players_source_external_id on public.players (source, external_id) where external_id is not null;

-- Indexes
create index idx_players_external_id on public.players (external_id);
create index idx_players_source on public.players (source);
create index idx_players_current_club on public.players (current_club);
create index idx_players_position on public.players (position);
create index idx_players_nationality on public.players (nationality);

-- Updated_at trigger
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_players_updated_at
  before update on public.players
  for each row execute procedure public.update_updated_at();

-- Player stats table
create table if not exists public.player_stats (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  season text not null,
  competition text,
  team text,
  appearances int default 0,
  starts int default 0,
  minutes int default 0,
  goals int default 0,
  assists int default 0,
  shots int default 0,
  shots_on_target int default 0,
  pass_accuracy numeric,
  key_passes int default 0,
  tackles int default 0,
  interceptions int default 0,
  duels_won_pct numeric,
  dribbles_success int default 0,
  yellow_cards int default 0,
  red_cards int default 0,
  rating numeric,
  raw_data jsonb,
  created_at timestamptz not null default now()
);

create index idx_player_stats_player_season on public.player_stats (player_id, season);
