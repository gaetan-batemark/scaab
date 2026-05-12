-- V2: Tables for scraped data (FBref + Transfermarkt)

-- Player advanced stats from FBref (per season)
create table if not exists public.player_advanced_stats (
  id bigserial primary key,
  player_id uuid not null references public.players(id) on delete cascade,
  season text not null,
  competition text,
  team text,

  -- Shooting
  goals_per90 numeric(5,2),
  xg numeric(6,2),
  xg_per90 numeric(5,3),
  npxg numeric(6,2),
  shots_per90 numeric(5,2),
  shots_on_target_pct numeric(5,1),

  -- Passing
  xa numeric(6,2),
  xa_per90 numeric(5,3),
  key_passes_per90 numeric(5,2),
  pass_completion_pct numeric(5,1),
  progressive_passes_per90 numeric(5,2),
  through_balls_per90 numeric(5,2),

  -- Possession
  touches_per90 numeric(6,1),
  progressive_carries_per90 numeric(5,2),
  successful_dribbles_per90 numeric(5,2),
  dribble_success_pct numeric(5,1),

  -- Defense
  tackles_per90 numeric(5,2),
  interceptions_per90 numeric(5,2),
  blocks_per90 numeric(5,2),
  clearances_per90 numeric(5,2),
  aerials_won_pct numeric(5,1),

  -- Misc
  progressive_passes_received_per90 numeric(5,2),
  fouls_drawn_per90 numeric(5,2),
  fouls_committed_per90 numeric(5,2),
  minutes_played int,

  -- Meta
  source text not null default 'fbref',
  fbref_player_id text,
  raw_data jsonb,
  scraped_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique(player_id, season, competition, source)
);

create index idx_advanced_stats_player on public.player_advanced_stats (player_id);
create index idx_advanced_stats_season on public.player_advanced_stats (season);
create index idx_advanced_stats_fbref_id on public.player_advanced_stats (fbref_player_id);

-- Player market data from Transfermarkt
create table if not exists public.player_market_data (
  id bigserial primary key,
  player_id uuid not null references public.players(id) on delete cascade,

  -- Current valuation
  market_value_eur bigint,
  market_value_date date,
  highest_value_eur bigint,
  highest_value_date date,

  -- Contract
  contract_until date,
  agent text,
  outfitter text,

  -- Transfer history (JSON array of {date, from, to, fee, type})
  transfer_history jsonb default '[]'::jsonb,

  -- Injury history (JSON array of {injury, from, until, days, games_missed})
  injury_history jsonb default '[]'::jsonb,

  -- Meta
  source text not null default 'transfermarkt',
  transfermarkt_id text,
  raw_data jsonb,
  scraped_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique(player_id, source)
);

create index idx_market_data_player on public.player_market_data (player_id);
create index idx_market_data_tm_id on public.player_market_data (transfermarkt_id);
create index idx_market_data_value on public.player_market_data (market_value_eur);

-- RLS
alter table public.player_advanced_stats enable row level security;
alter table public.player_market_data enable row level security;

-- Readable by authenticated, writable by service_role (scrapers)
create policy "advanced_stats_select_authenticated" on public.player_advanced_stats
  for select to authenticated using (true);
create policy "advanced_stats_insert_service" on public.player_advanced_stats
  for insert to service_role with check (true);
create policy "advanced_stats_update_service" on public.player_advanced_stats
  for update to service_role using (true);
create policy "advanced_stats_delete_service" on public.player_advanced_stats
  for delete to service_role using (true);

create policy "market_data_select_authenticated" on public.player_market_data
  for select to authenticated using (true);
create policy "market_data_insert_service" on public.player_market_data
  for insert to service_role with check (true);
create policy "market_data_update_service" on public.player_market_data
  for update to service_role using (true);
create policy "market_data_delete_service" on public.player_market_data
  for delete to service_role using (true);
