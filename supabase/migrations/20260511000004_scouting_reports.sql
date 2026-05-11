-- Scouting reports
create table if not exists public.scouting_reports (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  scout_id uuid not null references public.profiles(id) on delete cascade,
  match_observed text,
  match_date date,
  position_played text,
  minutes_observed int,
  technical_score int check (technical_score between 1 and 10),
  physical_score int check (physical_score between 1 and 10),
  mental_score int check (mental_score between 1 and 10),
  tactical_score int check (tactical_score between 1 and 10),
  overall_score numeric generated always as (
    (coalesce(technical_score, 0) + coalesce(physical_score, 0) + coalesce(mental_score, 0) + coalesce(tactical_score, 0))::numeric / 4.0
  ) stored,
  strengths text,
  weaknesses text,
  recommendation text check (recommendation in ('recommend', 'monitor', 'reject')),
  free_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_scouting_reports_player on public.scouting_reports (player_id);
create index idx_scouting_reports_scout on public.scouting_reports (scout_id);
create index idx_scouting_reports_date on public.scouting_reports (match_date);

create trigger set_scouting_reports_updated_at
  before update on public.scouting_reports
  for each row execute procedure public.update_updated_at();
