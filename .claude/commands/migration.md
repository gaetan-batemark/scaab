---
name: migration
description: Crée et applique une nouvelle migration Supabase
---

1. Invoque le subagent `db-architect` avec la description (`{{args}}`)
2. Crée le fichier `supabase/migrations/<timestamp>_<nom>.sql`
3. Vérifie le SQL (RLS, indexes, triggers)
4. `supabase db push` (ou demande confirmation)
5. Met à jour `.claude/rules/database.md`

Usage : `/migration add_player_video_links Description...`
