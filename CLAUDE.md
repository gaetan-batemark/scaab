# ScaabScout — Project Constitution

## Mission
Plateforme de scouting football professionnelle pour le Sporting Club Aubagne Air Bel (SCAAB, National 1).
Agréger 5 API sport, permettre filtrage fin, shortlists, comparaison, import CSV, rapports terrain.
Utilisateurs : directeur sportif, recruteurs (mobile au bord du terrain), entraîneur.

## Stack
- Frontend : Next.js 15 (App Router) + TypeScript strict + Tailwind CSS + shadcn/ui
- State : Zustand (UI state) + TanStack Query v5 (server state)
- Backend : Supabase (Postgres + Auth + Edge Functions Deno)
- Charts : Recharts | Tables : TanStack Table v8 | Forms : React Hook Form + Zod
- CSV : PapaParse | PDF : @react-pdf/renderer
- Tests : Vitest + Testing Library + Playwright (e2e)
- Package manager : pnpm

## Routing & memory
- Plan actif : `.claude/plans/active-plan.md` (créé/mis à jour avant chaque feature)
- Décisions techniques : `.claude/memory/decisions.md` (ADR léger)
- Conventions détaillées : @.claude/rules/conventions.md
- Architecture : @.claude/rules/architecture.md
- API externes : @.claude/rules/external-apis.md
- Schéma DB : @.claude/rules/database.md
- Charte graphique : @.claude/rules/design-system.md

## Core directives
1. **Plan first** : pour toute feature > 1 fichier, créer/mettre à jour `.claude/plans/active-plan.md` avant d'écrire du code. Liste les fichiers touchés, fonctions modifiées, ordre d'exécution.
2. **Verify everything** : aucune feature n'est "done" tant que test (unit ou e2e) ne passe pas. Pas de "ça doit marcher".
3. **Subagents for research** : dès qu'une investigation nécessite > 5 lectures de fichiers, utiliser un subagent pour préserver le contexte principal.
4. **TypeScript strict** : aucun `any`, aucun `// @ts-ignore` sans commentaire justifiant.
5. **Aucune clé API côté client** : toutes les requêtes vers API-FOOTBALL / football-data.org / AnySport / SportDB / TheSportsDB passent par Supabase Edge Functions (`supabase/functions/api-proxy/`). Le service_role key n'existe QUE dans les variables d'env Supabase, jamais commité.
6. **Cache obligatoire** : les Edge Functions cachent toute réponse externe 1h minimum (table `api_cache`). Sans ça, les quotas free explosent en heures.
7. **RLS partout** : toute table Supabase a Row Level Security activée. Tester l'isolation entre utilisateurs.
8. **Mobile-first** : le recruteur prend des notes en tribune. Tailwind breakpoints utilisés systématiquement.

## Workflow obligatoire par feature
Research → Plan → Approve → Execute → Verify → Document.
Si execution diverge du plan approuvé : STOP, mise à jour du plan, re-approval.

## Quand pousser sur git
- Branche par feature : `feat/<scope>-<short-desc>` (ex: `feat/players-search`)
- Commits atomiques, message en anglais, sans Co-Authored-By (géré par settings).
- PR auto-générée via `/pr` une fois la feature verified.

## Commandes utiles
- `pnpm dev` : lance le frontend Next.js
- `pnpm test` : Vitest watch
- `pnpm test:e2e` : Playwright
- `pnpm lint` et `pnpm typecheck` : à passer avant tout commit
- `supabase start` : DB locale
- `supabase functions serve` : Edge functions locales
- `supabase db push` : push migrations sur le projet distant

## Anti-patterns à proscrire
- ❌ Hardcoder des clés API n'importe où dans le code
- ❌ Appeler les API externes directement depuis le frontend
- ❌ Stocker des données utilisateur sans RLS
- ❌ Component React > 300 lignes : à découper
- ❌ Edge Function sans cache ni try/catch
- ❌ Modifier le schéma DB sans créer une migration (`supabase migration new`)

## V2 — Contexte commercial (mise à jour)

### Positionnement
ScaabScout est désormais proposé au SCAAB par un prestataire externe (Gaëtan / Batemark). Pas d'accès aux données internes du club (GPS, médical, fiches staff). Toutes les data viennent de sources publiques + saisie manuelle dans l'outil.

### Architecture multi-tenant préparée
- Toute nouvelle table inclut une colonne `club_id TEXT NOT NULL DEFAULT 'scaab'`
- RLS doit filtrer par `club_id` (préparation, valeur unique pour l'instant)
- Constante `SCAAB_CLUB_ID = 'scaab'` exportée depuis `src/lib/constants.ts`

### Nouvelles règles V2
1. **AI calls = budget contrôlé** : tout appel Claude API passe par `supabase/functions/ai-proxy/`, avec cache, log de tokens consommés (`api_usage_log.tokens_input/tokens_output`), et hard limit mensuel par utilisateur (`profiles.ai_quota_monthly`)
2. **Scrapers = workers séparés** : les scrapers FBref/Transfermarkt sont des Edge Functions Deno **planifiées** (`supabase/functions/scraper-fbref/`, `supabase/functions/scraper-transfermarkt/`), JAMAIS appelées à la volée par le frontend. Ils remplissent les tables via service_role. Le frontend lit uniquement la DB.
3. **Démo-readiness** : à la fin de chaque feature V2, vérifier qu'elle s'intègre dans le scénario de démo (voir `.claude/rules/demo-script.md`)
4. **Wow effect first** : pour chaque feature, demander "qu'est-ce qui va impressionner en démo dans les 10 premières secondes ?". Si la réponse est faible, repenser l'UX.

### Routing V2 ajouts
- Script démo : @.claude/rules/demo-script.md
- Sources scraping : @.claude/rules/scraping-sources.md
- AI prompts : @.claude/rules/ai-prompts.md
- Multi-tenant prep : @.claude/rules/multi-tenant.md

### Nouveaux subagents V2
- `scraper-engineer` (FBref + Transfermarkt + autres sources HTML)
- `ai-prompt-designer` (calibrage prompts Claude pour scouting reports)
- `demo-curator` (prépare le dataset de démo avant chaque répétition)
