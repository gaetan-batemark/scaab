---
name: api-football
description: Connaissance détaillée API-FOOTBALL (api-sports.io).
---

# API-FOOTBALL — playbook détaillé

## Authentification
- Header `x-apisports-key: <KEY>`
- Base : `https://v3.football.api-sports.io`

## Workflow recherche joueurs
1. GET /leagues?country=France&current=true -> trouver ID ligue avec coverage.players=true
2. GET /players?league=61&season=2024&page=1 -> 20/page, itérer
3. GET /players?id=276&season=2024 -> détail
4. GET /transfers?player=276 -> transferts

## Gotchas
- search sur /players : min 4 caractères, matche nom complet
- coverage est par saison ET par ligue
- free plan : 2 dernières saisons seulement
- National 1 : stats agrégées saison oui, par match non
