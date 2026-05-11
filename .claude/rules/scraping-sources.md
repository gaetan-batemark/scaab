# Sources de scraping V2

## Principes généraux
- Tous les scrapers sont des Edge Functions Deno
- Tous utilisent service_role pour écrire en DB
- Rate limiter strict (1 req / 3-5s minimum)
- User-Agent réaliste rotatif
- Cache en DB, aucun scraping déclenché par le frontend
- Respect robots.txt

## 1. FBref.com — STATS AVANCÉES

### Couverture
- Top 5 ligues : stats complètes (xG, xA, progressive carries, etc.)
- National français : stats basiques
- Ligue 2 : stats intermédiaires

### URL patterns
- Liste ligue : `https://fbref.com/en/comps/{league_id}/{slug}-Stats`
- Équipe : `https://fbref.com/en/squads/{team_id}/{slug}-Stats`
- Joueur : `https://fbref.com/en/players/{player_id}/{slug}`
- Scouting : `https://fbref.com/en/players/{id}/scout/365_m1/{slug}-Scouting-Report`

### IDs utiles
PL:9, LaLiga:12, SerieA:11, Bundesliga:20, L1:13, L2:60, National:192

### Stratégie
- Cron 1x/jour à 4h. Parse tableaux stats. Fuzzy match joueurs. Upsert player_advanced_stats.

### Anti-fails
- Commentaires HTML autour des tableaux à supprimer avant parse
- Try/catch + alerte si > 3 exceptions

## 2. Transfermarkt — VALEURS & TRANSFERTS

### Couverture
- Quasi tous les clubs pro (incluant National 1)
- Valeurs marchandes, transferts, contrats, agents

### URL patterns
- Club : `.../startseite/verein/{id}`
- Joueur profil : `.../profil/spieler/{id}`
- Valeur : `.../marktwertverlauf/spieler/{id}`
- Transferts : `.../transfers/spieler/{id}`

### Stratégie
- Cron 2x/semaine (lundi+jeudi 4h). Scrape joueurs en shortlist monitoring/contacted/negotiating.

### Anti-fails
- Rate limit 5s + headers réalistes. 429/403 = pause 1h + alerte. `?language=en` partout.

## 3. Sofascore — V2.5 (optionnel)
## 4. ClubElo — V2.5 (pondération qualité ligue)
## 5. Capology — V3 (salaires)

## Matching joueur multi-niveau
1. external_id exact -> 2. transfermarkt_id -> 3. (full_name, birth_date) exact -> 4. fuzzy -> 5. insert nouveau
