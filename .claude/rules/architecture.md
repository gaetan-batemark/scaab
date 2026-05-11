# Architecture cible

## Vue d'ensemble

Frontend Next.js 15 (RSC + Client Components)
- App Router, server-first
- TanStack Query pour caches client
- Zustand pour UI state global (sidebar, etc.)

Auth via supabase-js SSR

Supabase
- Postgres + Auth + RLS
- Edge Functions (Deno) = proxy API + cron
- Storage = futurs uploads (logos perso, etc.)

Fetch avec secrets vers APIs externes (5 sources) :
API-FOOTBALL, football-data, AnySport, SportDB.dev, TheSportsDB

## Flux de données type (recherche d'un joueur)
1. User submit filtres dans `/players`
2. Hook `usePlayersSearch` (TanStack Query) -> POST `/api/players/search` (route handler Next)
3. Route handler valide les filtres (Zod), appelle Edge Function `api-proxy` avec JWT user
4. Edge Function : Check `api_cache` -> si hit, return. Sinon fetch, cache, log.
5. Edge Function retourne data normalisée (interface `PlayerSearchResult`)
6. Frontend fusionne avec joueurs locaux (CSV imports) côté Supabase via RLS
7. Affichage tableau/cards

## Stratégie de sources API (failover)
- **Source primaire** : API-FOOTBALL (la plus complète, vérifier `coverage.players === true`)
- **Source secondaire** : football-data.org (compétitions européennes top tier)
- **Source tertiaire** : AnySport (livescore, fallback search)
- **Source spéciale transferts** : SportDB.dev (`/players/:id/transfers`)
- **Source médias** : TheSportsDB (logos HD, photos stade)

Toujours stocker le `source` et `external_id` dans la table `players` pour traçabilité.

## Cache strategy
- `api_cache` table : key = hash(source + endpoint + params), value = JSON, ttl_expires_at
- TTL par type :
  - Profil joueur statique : 7 jours
  - Stats saison en cours : 6h
  - Listes de compétitions : 24h
- Invalidation manuelle via slash command `/cache-clear`

## RLS pattern
- Tout le monde peut lire la table `players` (catalogue partagé)
- Chaque user lit/écrit ses propres `shortlists`, `scouting_reports`, `saved_searches`
- Les shortlists `is_shared = true` sont visibles par tous les membres SCAAB
- L'admin a un policy override (rôle dans `profiles.role`)
