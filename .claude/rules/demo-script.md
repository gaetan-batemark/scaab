# Scénario de démo SCAAB (20 minutes)

> Tout le développement V2 doit servir ce scénario.

## Avant la démo
- Lancer `/demo-prep` pour vérifier le dataset
- Vérifier les 5 fiches joueurs vedettes pré-générées
- Vérifier la fiche adversaire du prochain match
- Câble HDMI (jamais WiFi)

## Script minute par minute

### 0:00 - 2:00 — Effectif SCAAB (`/squad`)
- "Voici tout l'effectif reconstitué via données publiques"
- Pointer 3-4 joueurs avec stats agrégées
- "Imaginez avec vos données internes."

### 2:00 - 7:00 — Recrutement (`/players`)
- Filtres : poste=ST, âge<26, ligue=N1/N2+Belgique+Portugal, contrat<=18mois, valeur<800K
- Cliquer joueur cible -> Onglet "Rapport IA" -> générer LIVE
- Onglet "Similaires" -> 10 joueurs similaires

### 7:00 - 12:00 — Préparation match (`/opponents`)
- Fiche adversaire : compo type, menaces, blessés
- "Télécharger briefing PDF" -> PDF brandé SCAAB

### 12:00 - 14:00 — Carte mondiale (`/world-map`)
- Heatmap par pays, zoom France

### 14:00 - 17:00 — Comparateur (`/compare`)
- Attaquant SCAAB + 3 cibles, radar chart

### 17:00 - 20:00 — Q&A + roadmap

## Joueurs vedettes (5 profils pré-chauffés)
- 1 attaquant français N1/N2 < 23 ans
- 1 milieu défensif portugais ou belge
- 1 défenseur central africain
- 1 latéral gaucher espagnol
- 1 gardien polonais ou tchèque

## Anti-fails
- JAMAIS générer rapport IA en première en démo
- JAMAIS scraping live
- Screencast backup si pas de WiFi
- Rapports en fallback DB si Claude API down
