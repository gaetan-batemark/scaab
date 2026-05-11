-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.players enable row level security;
alter table public.player_stats enable row level security;
alter table public.shortlists enable row level security;
alter table public.shortlist_players enable row level security;
alter table public.scouting_reports enable row level security;
alter table public.tags enable row level security;
alter table public.player_tags enable row level security;
alter table public.saved_searches enable row level security;
alter table public.api_cache enable row level security;
alter table public.api_usage_log enable row level security;

-- Helper function to check admin role
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- PROFILES
create policy "profiles_select_authenticated" on public.profiles
  for select to authenticated using (true);

create policy "profiles_update_own" on public.profiles
  for update to authenticated using (id = auth.uid() or public.is_admin());

create policy "profiles_insert_admin" on public.profiles
  for insert to authenticated with check (public.is_admin() or id = auth.uid());

create policy "profiles_delete_admin" on public.profiles
  for delete to authenticated using (public.is_admin());

-- PLAYERS (readable by all auth, writable by service_role via Edge Functions)
create policy "players_select_authenticated" on public.players
  for select to authenticated using (true);

create policy "players_insert_service" on public.players
  for insert to service_role with check (true);

create policy "players_update_service" on public.players
  for update to service_role using (true);

create policy "players_delete_admin" on public.players
  for delete to authenticated using (public.is_admin());

-- PLAYER_STATS
create policy "player_stats_select_authenticated" on public.player_stats
  for select to authenticated using (true);

create policy "player_stats_insert_service" on public.player_stats
  for insert to service_role with check (true);

create policy "player_stats_update_service" on public.player_stats
  for update to service_role using (true);

-- SHORTLISTS
create policy "shortlists_select_own_or_shared" on public.shortlists
  for select to authenticated using (user_id = auth.uid() or is_shared = true);

create policy "shortlists_insert_own" on public.shortlists
  for insert to authenticated with check (user_id = auth.uid());

create policy "shortlists_update_own" on public.shortlists
  for update to authenticated using (user_id = auth.uid());

create policy "shortlists_delete_own" on public.shortlists
  for delete to authenticated using (user_id = auth.uid());

-- SHORTLIST_PLAYERS
create policy "shortlist_players_select" on public.shortlist_players
  for select to authenticated using (
    exists (
      select 1 from public.shortlists s
      where s.id = shortlist_id and (s.user_id = auth.uid() or s.is_shared = true)
    )
  );

create policy "shortlist_players_insert_owner" on public.shortlist_players
  for insert to authenticated with check (
    exists (
      select 1 from public.shortlists s where s.id = shortlist_id and s.user_id = auth.uid()
    )
  );

create policy "shortlist_players_update_owner" on public.shortlist_players
  for update to authenticated using (
    exists (
      select 1 from public.shortlists s where s.id = shortlist_id and s.user_id = auth.uid()
    )
  );

create policy "shortlist_players_delete_owner" on public.shortlist_players
  for delete to authenticated using (
    exists (
      select 1 from public.shortlists s where s.id = shortlist_id and s.user_id = auth.uid()
    )
  );

-- SCOUTING_REPORTS
create policy "scouting_reports_select_authenticated" on public.scouting_reports
  for select to authenticated using (true);

create policy "scouting_reports_insert_own" on public.scouting_reports
  for insert to authenticated with check (scout_id = auth.uid());

create policy "scouting_reports_update_own_or_admin" on public.scouting_reports
  for update to authenticated using (scout_id = auth.uid() or public.is_admin());

create policy "scouting_reports_delete_own_or_admin" on public.scouting_reports
  for delete to authenticated using (scout_id = auth.uid() or public.is_admin());

-- TAGS
create policy "tags_select_all" on public.tags
  for select to authenticated using (true);

create policy "tags_insert_authenticated" on public.tags
  for insert to authenticated with check (true);

create policy "tags_update_own_or_admin" on public.tags
  for update to authenticated using (created_by = auth.uid() or public.is_admin());

create policy "tags_delete_own_or_admin" on public.tags
  for delete to authenticated using (created_by = auth.uid() or public.is_admin());

-- PLAYER_TAGS
create policy "player_tags_select_all" on public.player_tags
  for select to authenticated using (true);

create policy "player_tags_insert_service" on public.player_tags
  for insert to service_role with check (true);

create policy "player_tags_delete_service" on public.player_tags
  for delete to service_role using (true);

-- SAVED_SEARCHES
create policy "saved_searches_select_own" on public.saved_searches
  for select to authenticated using (user_id = auth.uid());

create policy "saved_searches_insert_own" on public.saved_searches
  for insert to authenticated with check (user_id = auth.uid());

create policy "saved_searches_update_own" on public.saved_searches
  for update to authenticated using (user_id = auth.uid());

create policy "saved_searches_delete_own" on public.saved_searches
  for delete to authenticated using (user_id = auth.uid());

-- API_CACHE (readable by authenticated, writable by service_role)
create policy "api_cache_select_authenticated" on public.api_cache
  for select to authenticated using (true);

create policy "api_cache_insert_service" on public.api_cache
  for insert to service_role with check (true);

create policy "api_cache_update_service" on public.api_cache
  for update to service_role using (true);

create policy "api_cache_delete_admin" on public.api_cache
  for delete to authenticated using (public.is_admin());

-- API_USAGE_LOG (admin only read, service_role write)
create policy "api_usage_log_select_admin" on public.api_usage_log
  for select to authenticated using (public.is_admin());

create policy "api_usage_log_insert_service" on public.api_usage_log
  for insert to service_role with check (true);
