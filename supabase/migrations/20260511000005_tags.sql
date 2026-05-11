-- Tags
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text not null default '#003DA5',
  created_by uuid references public.profiles(id) on delete set null
);

-- Player tags (pivot)
create table if not exists public.player_tags (
  player_id uuid not null references public.players(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (player_id, tag_id)
);
