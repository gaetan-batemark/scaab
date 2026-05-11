-- Shortlists
create table if not exists public.shortlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  position_target text,
  budget_max_eur int,
  is_shared boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_shortlists_updated_at
  before update on public.shortlists
  for each row execute procedure public.update_updated_at();

-- Shortlist players (pivot)
create table if not exists public.shortlist_players (
  id uuid primary key default gen_random_uuid(),
  shortlist_id uuid not null references public.shortlists(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  status text not null default 'to_observe' check (status in ('to_observe', 'monitoring', 'contacted', 'negotiating', 'signed', 'rejected')),
  priority int not null default 3 check (priority between 1 and 5),
  internal_rating numeric,
  notes text,
  added_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(shortlist_id, player_id)
);

create index idx_shortlist_players_shortlist on public.shortlist_players (shortlist_id);
create index idx_shortlist_players_player on public.shortlist_players (player_id);
create index idx_shortlist_players_status on public.shortlist_players (status);

create trigger set_shortlist_players_updated_at
  before update on public.shortlist_players
  for each row execute procedure public.update_updated_at();
