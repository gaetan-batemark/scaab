---
name: sprint
description: Démarre un sprint V2 (groupe de features liées)
---

Sprints V2 :
1. 1-scrapers-foundation — FBref + Transfermarkt + player-matcher
2. 2-ai-scouting-reports — ai-proxy + prompt rapport + UI
3. 3-similarity-engine — pgvector + embeddings + UI similaires
4. 4-opponent-briefing — fiche adversaire + PDF
5. 5-scaab-squad-dashboard — /squad + sync + analyse IA
6. 6-comparator-scaab-targets — /compare étendu + note président
7. 7-world-map — /world-map + Leaflet + heatmap
8. 8-demo-readiness — polish + demo-curator + fallback

Workflow :
1. Vérifie état du repo (main à jour, pas de WIP)
2. Crée branche sprint/<num>-<slug>
3. PASSE EN PLAN MODE
4. Produis le plan global dans `.claude/plans/active-plan.md`
5. Attends approbation
6. Exécute (subagents, commit par feature, tests à chaque étape)
7. Review qa-reviewer + demo-curator partiel
8. Génère PR via `/pr`

Usage : `/sprint 1-scrapers-foundation`
