---
name: feature
description: Démarre une nouvelle feature avec Plan Mode obligatoire
---

Workflow :
1. Lis le nom/description donné en argument (`{{args}}`)
2. Crée branche : `git checkout -b feat/<scope>-<short-desc>`
3. PASSE EN PLAN MODE et produis dans `.claude/plans/active-plan.md` le plan détaillé
4. Demande approbation explicite
5. Si divergence pendant l'exécution -> STOP, update plan, re-approval
6. À la fin : invoque `qa-reviewer` puis `test-runner`
7. Si tout vert : propose `/pr`

Usage : `/feature recherche-joueurs Construire la page /players avec tous les filtres`
