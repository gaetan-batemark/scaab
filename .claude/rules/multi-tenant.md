# Préparation multi-tenant

## État V2
- Un seul club : SCAAB (club_id = 'scaab')
- Mono-tenant en pratique, multi-tenant en architecture

## Règles DÈS V2

1. Toute nouvelle table avec données club :
   `club_id TEXT NOT NULL DEFAULT 'scaab' REFERENCES clubs(id) ON DELETE CASCADE`

2. Toute RLS policy filtre par club_id :
   `USING (club_id = current_user_club())`

3. Fonction helper SQL :
   `current_user_club() RETURNS TEXT -> 'scaab'` (TODO V3: lire profiles.club_id)

4. Constante TypeScript :
   `CURRENT_CLUB_ID = 'scaab'` dans `src/lib/constants.ts`

5. Tout composant passe club_id dans les queries.

6. Branding depuis table clubs (couleurs, logo). En V2 = toujours SCAAB.

## Anti-patterns interdits
- Hardcoder "SCAAB" dans le code
- Tables sans club_id
- Policies RLS sans filtre club_id
