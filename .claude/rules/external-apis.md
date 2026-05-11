# APIs externes — référence

> Les clés sont stockées en secrets Edge Functions, JAMAIS dans le code.

## 1. API-FOOTBALL (api-sports.io) — SOURCE PRINCIPALE
- Base URL : `https://v3.football.api-sports.io`
- Auth : Header `x-apisports-key: <KEY>`
- Méthode : GET only
- Pagination : `?page=N`, 20 résultats sur `/players`
- Rate limit : selon plan (free = 100/jour)

### Endpoints scouting
- `GET /countries` — liste pays
- `GET /leagues` — params : `id`, `country`, `season`, `current`, `search`
- `GET /teams?league=X&season=Y` — équipes d'une ligue
- `GET /players?league=X&season=Y&page=N` — joueurs avec stats détaillées
- `GET /players?id=X&season=Y` — détail joueur
- `GET /players?search=string&league=X` — recherche (min 4 caractères)
- `GET /players/squads?team=X` — effectif complet
- `GET /transfers?player=X` — historique transferts
- `GET /injuries?league=X&season=Y` — blessures
- `GET /trophies?player=X` — trophées
- `GET /players/topscorers?league=X&season=Y` — top buteurs
- `GET /players/topassists?league=X&season=Y` — top passeurs

### Médias
- Logo équipe : `https://media.api-sports.io/football/teams/{id}.png`
- Logo ligue : `https://media.api-sports.io/football/leagues/{id}.png`
- Photo joueur : `https://media.api-sports.io/football/players/{id}.png`

## 2. football-data.org — SOURCE SECONDAIRE
- Base : `https://api.football-data.org/v4`
- Auth : Header `X-Auth-Token: <KEY>`
- Rate limit free : 10 req/min

### Endpoints
- `GET /competitions/{code}`, `/competitions/{code}/standings`, `/competitions/{code}/scorers`, `/competitions/{code}/teams`
- `GET /teams/{id}`, `/teams/{id}/matches?dateFrom=&dateTo=&status=FINISHED`
- `GET /persons/{id}`, `/persons/{id}/matches?lineup=STARTING|BENCH&status=FINISHED`

## 3. AnySport.io
- Base : `https://api.anysport.io/v1`
- Auth : Header `X-API-Key: <KEY>`
- Endpoints : `/v1/players`, `/v1/teams`, `/v1/leagues`, `/v1/standings`, `/v1/topscorers`, `/v1/matches`

## 4. SportDB.dev — TRANSFERTS
- Base : `https://api.sportdb.dev/api`
- Auth : Header `X-API-Key: <KEY>`
- Quota free : 1000 req total
- Endpoints : `/api/players/search/{term}`, `/api/players/{id}/profile`, `/api/players/{id}/transfers`

## 5. TheSportsDB — MÉDIAS
- Base v1 : `https://www.thesportsdb.com/api/v1/json/123` (clé `123` = free)
- Rate limit : 30 req/min
- Endpoints : `/searchteams.php?t={name}`, `/lookupteam.php?id={id}`, `/lookupplayer.php?id={id}`
