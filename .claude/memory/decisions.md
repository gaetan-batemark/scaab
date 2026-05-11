# Decisions log (ADR léger)

## 2026-05-11 — Stack Next.js 15 App Router
**Contexte** : Choix entre SPA Vite et fullstack Next.js
**Décision** : Next.js App Router avec RSC
**Pourquoi** : auth Supabase SSR, routes API natives, SEO possible, Vercel one-click
**Conséquences** : plus complexe à debug que Vite, mais gain à terme

## 2026-05-11 — Edge Functions Supabase pour proxy API
**Contexte** : Comment cacher les clés API ?
**Décision** : Edge Functions Deno côté Supabase
**Pourquoi** : pas de serveur séparé, secrets centralisés, cache via Postgres
**Conséquences** : runtime Deno, certaines libs npm pas compatibles

## 2026-05-11 — V2 : repositionnement commercial SCAAB
**Contexte** : Passer de l'outil perso au produit de démo commerciale
**Décision** : Architecture multi-tenant préparée (club_id partout) + modules IA + scrapers
**Pourquoi** : présentation au SCAAB comme prestataire externe, besoin de wow effect en démo
**Conséquences** : ajout de 7 modules V2, scrapers planifiés, prompts Claude API
