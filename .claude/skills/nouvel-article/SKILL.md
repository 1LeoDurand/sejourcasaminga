---
name: nouvel-article
description: Produire et publier un article de la bibliothèque Ressources de sejour.casaminga.com en mode sobre - brief à une promesse validé par Léo, un chercheur, un rédacteur, un relecteur Opus, contrôle, mise en base. À utiliser quand Léo demande un ou des articles, un contenu SEO, ou « le prochain article du tableau ».
---

# Nouvel article, mode sobre (règle depuis le 2026-09-28)

Décisions de Léo : publication complète (l'agent va jusqu'à la base ; `git push` seulement s'il dit « push ») ; signature Léo Durand sans « je » ; FR seulement ; photos de vrais lieux ; **une promesse par article, la longueur suit**. Le mode lourd (3 brouillons + jury, 3 vérificateurs) a coûté 3,5 M de tokens et 3 h pour le premier article : il ne sert plus que sur demande explicite, pour un pilier.

Cibles : satellite 15 à 20 min et moins de 600 k tokens ; pilier 30 min et moins de 1 M. Chaque sous-agent est lancé avec `model` explicite (haiku / sonnet / opus). Si le type d'agent n'est pas reconnu, lancer `general-purpose` avec le même modèle, en lui faisant lire `.claude/agents/<nom>.md`.

Fichiers : les idées vivent dans `07 Espace éditorial/ARTICLES-POTENTIELS.md` ; le dossier d'un article est `0.1 Contexte sejour-casaminga/SEO/articles/<slug>/` (`<dir>`) ; le suivi d'un lot dans `SEO/lots/<lot>/SUIVI.md`. Règles pour tous les agents : `.claude/skills/nouvel-article/REGLES-ARTICLE.md` (40 lignes ; personne ne relit le plan éditorial complet). Outils, depuis la racine du repo : `node .claude/skills/nouvel-article/article-tool.mjs <check|seed|sitemap> "<dir>"`, `node .claude/skills/nouvel-article/images.mjs "<dir>"`.

## Les 5 étapes

| # | Étape | Qui | Modèle | Plafond |
|---|---|---|---|---|
| 0 | Brief : promesse + plan en H2 + questions FAQ | session | — | validé par Léo (V1) avant toute recherche |
| 1 | Recherche (faits, voix, structures) ‖ photos | `chercheur` ‖ `iconographe` | sonnet | 25 appels d'outils chacun, 30 min |
| 2 | Rédaction | `redacteur` (mode RÉDACTION ; le plan est dans le brief) | sonnet | un seul jet |
| 3 | Relecture | `relecteur` | opus | une passe ; corrige lui-même ; À REPRENDRE → un seul retour au rédacteur |
| 4 | Contrôle, aperçu, mise en ligne | session | — | Léo lit l'aperçu (V2) avant la mise en base |

### 0. Brief (session, 10 min)
Dump si besoin : `select slug, lang, type, title, description, tags, is_published from public.resources order by slug` → `<dir>/slugs.json`. Écris `<dir>/brief.json` :
```json
{ "slug": "", "titre": "", "promesse": "une phrase : ce que le lecteur saura ou saura faire",
  "lecteur": "qui tape quoi", "regard": "R1|R2|R3", "cluster": 1, "format": "satellite|pilier", "type": "article|guide",
  "plan": [ { "h2": "question ou titre net", "sert": "ce que la section apporte", "matiere": "ce qu'il faut trouver : chiffre, définition, voix, structure" } ],
  "faq": ["3 questions que le corps ne traite pas"], "liens_internes": ["/ressources/..."], "hors_champ": ["ce qu'on renvoie ailleurs"],
  "voix_video": false, "gabarit": { "mots": [1200, 1700], "h2": [4, 6], "faq": [3, 3], "external": 4, "internal": 4 }, "update": false, "lot": "" }
```
Regard par cluster : C1, C6 → R1 · C2, C5 → R2 · C3, C4 → R3. Présente à Léo : promesse, H2, FAQ, en 10 lignes. Plusieurs briefs d'une vague tiennent dans un seul message.

### 1. Recherche (parallèle)
`chercheur` (sonnet) et `iconographe` (sonnet), chacun avec `<dir>`. Seuils : satellite 5 faits et 2 voix, pilier 8 et 3. En dessous : une relance ciblée, puis on écrit avec ce qu'on a, en le disant à Léo. Photos : l'iconographe livre des vignettes ; la session montre la planche à Léo **avec l'aperçu de l'étape 4**, pas avant ; téléchargement après accord.

### 2. Rédaction
`redacteur` (sonnet) en mode RÉDACTION : brief + faits + voix + structures, rien d'autre. Il rend `fr.json` et `notes.md` (backlinks proposés, matière non utilisée, faits utilisés avec leur F#).

### 3. Relecture
`relecteur` (opus) : faits contre sources, citations contre extraits, charte, signature, ligne (chaque H2 sert la promesse, pas de redite, pas de coulisses), puis `check` à zéro erreur. Il corrige directement. Verdict PUBLIABLE ou À REPRENDRE.

### 4. Mise en ligne (session)
1. `check` à zéro ERREUR. Aperçu HTML pour Léo (`apercu.cjs` du scratchpad, à recréer au besoin : le HTML de `fr.json` avec les images en base64) plus la planche photos : **V2**.
2. Après son accord : `images.mjs`, commit des images (et de `sitemap.xml` après `sitemap`) par nom, **push seulement si Léo dit « push »**. Le push lance la GitHub Action (build + FTPS, environ 2 min) : suivre `https://api.github.com/repos/1LeoDurand/sejourcasaminga/actions/runs?per_page=1` jusqu'à `completed success`, puis vérifier que la couverture répond en `image/webp` (un `text/html` = pas en ligne).
3. Backlinks : pour chaque article existant proposé dans `notes.md` (et pour les articles du lot déjà publiés qui l'attendaient), un `<p>` existant copié à l'identique dans `<dir>/backlinks.json` `[{"slug","find","replace"}]`.
4. `seed`, puis `execute_sql` avec le contenu de `seed.sql` (une transaction ; un backlink introuvable annule tout). **Ne pas relire le SQL une seconde fois** : contrôler ensuite `md5(content)` en base contre le md5 de `fr.json`.
5. Ouvrir la page en ligne et vérifier titre, « L'essentiel », images, citations, FAQ. Ligne dans `SUIVI.md`, statut `publié` dans `ARTICLES-POTENTIELS.md`.
6. Après la publication : proposer `/contacter-lieux` (brouillons de premier contact vers les lieux cités, déposés dans l'admin à valider ; rien n'est envoyé).

## Pièges
- Une ligne par langue dans `resources`, aucune ressource EN/ES publiée : une traduction publiée seule masquerait toute la bibliothèque FR aux anglophones (`use-resources.ts`). L'outil insère EN/ES non publiées.
- Le déploiement passe par la GitHub Action depuis le 2026-09-28 ; avant, rien ne se déployait au push. Toujours vérifier le content-type en prod avant de publier une ligne.
- FAQ reconnue seulement si le `<h2>` est exactement « Questions fréquentes ». Temps de lecture, encadré auteur et couverture sont affichés par le site : rien de cela dans `content`.
- Un « ©Nom » sous une phrase est un crédit photo, pas une signature : vérifier qui parle avant d'attribuer (erreur faite le 2026-09-28).
- Les articles du lot non publiés ne reçoivent pas de lien ; `notes.md` garde la phrase à insérer pour le jour de leur publication.

## Mode lourd (sur demande de Léo, piliers)
Jury de 3 brouillons (sonnet) jugés par 3 juges (opus), synthèse, 3 vérificateurs à charge : script conservé dans le dossier `workflows/scripts/` de la session du 2026-09-28 (`reecriture-article-ecolieux-*.js`). Coût : environ 2 M de tokens et 50 min.
