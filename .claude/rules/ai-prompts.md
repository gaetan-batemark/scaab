# Prompts Claude API — Bibliothèque ScaabScout

> Tous les prompts en français. Modèle défaut : claude-sonnet-4-6. Premium : claude-opus-4-7.

## Configuration
- ANTHROPIC_API_URL = https://api.anthropic.com/v1/messages
- DEFAULT_MODEL = claude-sonnet-4-6
- PREMIUM_MODEL = claude-opus-4-7
- MAX_TOKENS_REPORT = 1500
- MAX_TOKENS_BRIEFING = 3000

## Prompt 1 — Rapport scouting joueur
Modèle : Sonnet | 1500 tk | Cache 30 jours | Key : scout_report:{player_id}:{stats_hash}

Sections output : Profil / Points forts / Points de vigilance / Verdict SCAAB (A CIBLER / A OBSERVER / A ECARTER)

## Prompt 2 — Briefing pré-match
Modèle : Opus | 3000 tk | Cache 7 jours | Key : opponent_briefing:{opponent_id}:{match_date}

Sections : Synthèse / Système de jeu / Joueurs à surveiller / Failles / Pièges / Recommandations tactiques

## Prompt 3 — Comparaison SCAAB vs cibles
Modèle : Sonnet | 2000 tk | Key : comparison:{scaab_id}:{candidates_hash}

Sections : État des lieux / Comparatif / Recommandation / Plan B

## Prompt 4 — Similarity Engine (pas de Claude API)
Vecteur 64D mathématique pur : stats off/def /90, avancées FBref, physiques, poste one-hot, pondérations contextuelles.

## Prompt 5 — Analyse effectif
Modèle : Sonnet | 1500 tk | Cache 24h

Sections : Forces / Faiblesses / Postes prioritaires / Profil-type recherché

## Quota & budget AI
- 100 générations/mois Sonnet + 20 Opus par user
- Coût : ~15 EUR/user/mois
- Cache 30 jours min
- Log obligatoire api_usage_log avec tokens + cost
