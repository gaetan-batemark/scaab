# ScaabScout

Plateforme de scouting football professionnelle pour le **Sporting Club Aubagne Air Bel** (SCAAB, National 1).

## Setup

### 1. Installer les dépendances

```bash
pnpm install
```

### 2. Configurer Supabase

1. Va sur [supabase.com](https://supabase.com) > ton projet > **Settings > API**
2. Copie l'URL du projet et colle-la dans `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`)
3. L'anon key est déjà configurée

### 3. Configurer les clés API sport (secrets Edge Functions)

Les clés API ne doivent **JAMAIS** être dans le code ou dans `.env.local`. Configure-les via :

```bash
supabase secrets set API_FOOTBALL_KEY=xxx
supabase secrets set FOOTBALL_DATA_KEY=xxx
supabase secrets set ANYSPORT_KEY=xxx
supabase secrets set SPORTDB_KEY=xxx
supabase secrets set THESPORTSDB_KEY=xxx
```

Ou via le dashboard Supabase : **Settings > Edge Functions > Secrets**.

> **Ces clés ont été partagées en clair lors de la conception ; régénérez-les sur chaque dashboard fournisseur avant tout déploiement public.**

### 4. Appliquer les migrations

```bash
supabase link --project-ref <ton-ref>
supabase db push
```

### 5. Déployer les Edge Functions

```bash
supabase functions deploy api-proxy
```

### 6. Lancer le dev

```bash
pnpm dev
```

## Scripts

| Commande | Description |
|---|---|
| `pnpm dev` | Serveur dev Next.js |
| `pnpm build` | Build production |
| `pnpm test` | Tests Vitest |
| `pnpm test:e2e` | Tests Playwright |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript check |
