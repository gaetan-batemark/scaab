# Schéma DB Supabase

## Tables

### profiles (extension auth.users)
- id (uuid, FK auth.users), full_name, role ('admin'|'sporting_director'|'scout'|'coach'), avatar_url, created_at

### players (cache local + créations manuelles)
- id, external_id, source, full_name, first_name, last_name, birth_date, age
- nationality, second_nationality, height_cm, weight_kg, preferred_foot
- position ('GK'|'CB'|'LB'|'RB'|'DM'|'CM'|'AM'|'LW'|'RW'|'ST'), secondary_positions
- current_club, current_club_id, current_league, contract_until, market_value_eur
- agent, photo_url, injured, raw_data, created_at, updated_at
- UNIQUE(source, external_id) where external_id is not null

### player_stats (joueur x saison x competition)
- id, player_id FK, season, competition, team
- appearances, starts, minutes, goals, assists, shots, shots_on_target
- pass_accuracy, key_passes, tackles, interceptions, duels_won_pct, dribbles_success
- yellow_cards, red_cards, rating, raw_data, created_at

### shortlists
- id, user_id FK, name, description, position_target, budget_max_eur, is_shared, created_at, updated_at

### shortlist_players (pivot)
- id, shortlist_id FK, player_id FK, status, priority (1-5), internal_rating, notes, added_at, updated_at
- UNIQUE(shortlist_id, player_id)

### scouting_reports
- id, player_id FK, scout_id FK, match_observed, match_date, position_played, minutes_observed
- technical/physical/mental/tactical_score (/10), overall_score (computed)
- strengths, weaknesses, recommendation, free_notes, created_at, updated_at

### tags, player_tags, saved_searches, api_cache, api_usage_log
See migration files for full schema.

## RLS Policies — see migration 0008_rls_policies.sql
## Indexes — see migration files
