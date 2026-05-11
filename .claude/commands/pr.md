---
name: pr
description: Génère une PR sur la branche courante
---

1. Vérifier qu'on n'est PAS sur main
2. Vérifier que tout est commité
3. `git push -u origin <current-branch>`
4. Générer titre + corps de PR (Conventional Commits, anglais)
5. Utiliser `gh pr create`

Aucune mention Co-Authored-By.
