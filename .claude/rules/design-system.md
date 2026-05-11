# Design System SCAAB

## Couleurs (Tailwind tokens)
- `scaab-blue` : #003DA5 — primaire, CTA, liens
- `scaab-yellow` : #FFD100 — accent, badges actifs, hover
- `scaab-blue-dark` : #001F4D — sidebar, header
- `scaab-blue-light` : #1E5BC6 — hover sur primaire
- `success` : #059669 — statut signé, OK
- `danger` : #DC2626 — blessé, rouge, écarté
- `warning` : #F59E0B — alerte contrat

## Typographie
- Titres (h1-h3) : `font-montserrat font-bold` (700)
- Sous-titres : `font-montserrat font-semibold` (600)
- Corps : `font-inter` (400)
- Chiffres / data : `font-inter tabular-nums` (toujours)

## Composants critiques

### Sidebar
- Largeur 240px, fond `bg-scaab-blue-dark`
- Logo SCAAB en haut (h-16)
- Liens : `text-white/70 hover:text-white hover:bg-white/10 px-4 py-2 rounded`
- Item actif : `bg-white/15 text-white border-l-4 border-scaab-yellow`

### Header
- Hauteur 64px, fond `bg-white shadow-sm border-b`
- Search globale au centre (Cmd+K trigger)

### Cards joueur
- `bg-white rounded-lg shadow-sm border border-gray-200 p-4`
- Photo 56x56 ronde, badge poste bleu, hover shadow-md

### Tableaux
- Header sticky, lignes alternées (`even:bg-gray-50`), hover bleu léger, tri visible

### Boutons (shadcn overrides)
- `primary` : `bg-scaab-blue text-white hover:bg-scaab-blue-light`
- `accent` : `bg-scaab-yellow text-scaab-blue-dark hover:bg-yellow-400`
- `outline` : `border-scaab-blue text-scaab-blue hover:bg-scaab-blue/5`

### Logo
- `public/scaab-logo-placeholder.svg` — blason bouclier bleu/jaune

## Mobile breakpoints
- Sidebar -> drawer Sheet en < md
- Tableau -> cards en < lg
- Filtres -> modal en < md
