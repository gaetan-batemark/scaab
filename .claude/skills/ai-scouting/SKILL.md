---
name: ai-scouting
description: Architecture ai-proxy et prompts Claude pour scouting football.
---

# AI Scouting — playbook

## Architecture ai-proxy
Frontend -> POST /ai-proxy { type, payload } -> Edge Function -> cache check -> quota check -> build prompt -> POST Anthropic /v1/messages -> cache + log -> response

## Endpoint Anthropic
POST https://api.anthropic.com/v1/messages
Headers: x-api-key, anthropic-version: 2023-06-01

## Types de prompts
1. scout_report (Sonnet, 1500 tk) — rapport joueur
2. opponent_briefing (Opus, 3000 tk) — briefing pré-match
3. comparison_note (Sonnet, 2000 tk) — comparaison SCAAB vs cibles
4. squad_analysis (Sonnet, 1500 tk) — analyse effectif

## Coût estimé
- Rapport scouting : ~0.02 EUR
- Briefing Opus : ~0.25 EUR

## Côté frontend
Hook useAIReport(playerId) avec TanStack Query, staleTime 30 jours.
Affichage via react-markdown + remark-gfm avec composants stylés SCAAB.
