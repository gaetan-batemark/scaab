# Conventions de code

## TypeScript
- Mode strict obligatoire (`strict: true`, `noUncheckedIndexedAccess: true`)
- Aucun `any`, jamais. Préférer `unknown` puis narrow avec Zod.
- Aucun `// @ts-ignore` ni `// @ts-expect-error` sans commentaire JIRA-style expliquant pourquoi
- Préférer les types aux interfaces sauf pour l'extensibilité publique
- Tous les exports sont nommés (pas de `export default` sauf pour les pages Next.js)

## Imports
- Ordre : externes -> `@/lib` -> `@/components` -> `@/features` -> relatifs
- Toujours utiliser l'alias `@/*` jamais des `../../../`
- Imports types séparés : `import type { Foo } from 'bar'`

## Naming
- Fichiers : `kebab-case.ts` (sauf composants React : `PascalCase.tsx`)
- Components : `PascalCase`
- Hooks : `useCamelCase`
- Stores Zustand : `use<Domain>Store`
- Types : `PascalCase`, suffixe selon usage (`UserDTO`, `UserEntity`, `UserVM`)

## React
- Composants serveur par défaut (RSC). `"use client"` uniquement quand nécessaire (state, hooks, events).
- Pas de prop drilling > 2 niveaux : remonter dans Zustand ou Context.
- Aucun composant > 300 lignes : découper en sous-composants ou hooks.

## Tailwind
- Utiliser `cn()` (clsx + tailwind-merge) pour la composition de classes
- Ordre des classes : layout -> spacing -> sizing -> typography -> colors -> effects -> states
- Préférer les tokens Tailwind aux valeurs arbitraires (`text-scaab-blue` plutôt que `text-[#003DA5]`)

## Forms
- React Hook Form + Zod systématique pour tout form
- Schéma Zod dans `src/lib/schemas/` réutilisable côté serveur (Edge Functions)

## Tests
- Unit Vitest pour la logique pure (utils, normalizers, formatters)
- Component testing pour les composants à forte logique (filtres complexes, comparateur)
- E2E Playwright pour les flows critiques (login, recherche, ajout shortlist, import CSV)
- Coverage cible : 70% sur `src/lib/`, 50% global

## Git
- Branches : `feat/`, `fix/`, `chore/`, `refactor/`, `test/`, `docs/`
- Commits Conventional Commits en anglais
- Pas de Co-Authored-By (déjà off dans settings.json)
- Une feature = une PR atomique

## Logs et erreurs
- Aucun `console.log` en prod (ESLint rule). Utiliser un logger structuré.
- Toutes les erreurs API serveur ont un code + message FR exposable à l'utilisateur
- Côté frontend : Error Boundaries sur les sections critiques + toast Sonner
