# CLAUDE.md — sejour.casaminga.com (Casa Minga Séjours)

## Contexte projet
Plateforme d'échange d'hébergements entre membres. Migré depuis Lovable (export zip) vers infrastructure propre.
Développeur : **Léo** (solo, équipe à venir).

## Stack
- React 18 + Vite 5 + TypeScript + Tailwind v3 + shadcn/ui (SPA 100% statique)
- react-router-dom, TanStack Query, react-leaflet, i18next (FR/EN/ES)
- Supabase : `giekhaohqksirsadkfnt` (projet dédié séjours)
- Dossier : `D:\0 - Sync cloud Kdrive\01 Casaminga\01 Dev\casa-minga-sejour`
- Repo GitHub : https://github.com/1LeoDurand/sejourcasaminga — branche `master`

## Déploiement
**Infomaniak statique** (Apache, pas Node.js). Build : `npm run build` → `dist/` → SFTP vers :
`/home/clients/b72015a608f1e292f74e1add2f0686b1/web/sejour.casaminga.com/`
Le fichier `public/.htaccess` est copié dans `dist/` automatiquement — il gère le routing SPA.

## ⚠️ Règles absolues
- **JAMAIS `git add -A` ou `git add .`** — toujours ajouter les fichiers un par un par nom.
- **JAMAIS committer `.env`** — il contient les clés Supabase.
- **JAMAIS afficher/loguer** le `service_role` key, `RESEND_API_KEY`, ou tout autre secret.
- **JAMAIS accepter un token GitHub** de Léo — Windows Credential Manager gère l'auth.
- **Ne pas modifier** `supabase/config.toml` project_id ni les `.env` sans demander.

## Conventions
- Commits : **anglais**
- Commentaires de code : anglais
- Réponses Claude : **français**, court et direct, sans récapitulatif superflu

## Modèles & rôles (Opus / Sonnet / Haiku)
- **Opus = penser & relire** : architecture, modèle de données, RLS, migrations/atomicité, sécurité, bugs complexes, revue. → sous-agent `architecte` (`.claude/agents/architecte.md`).
- **Sonnet = construire le spécifié** : UI, CRUD, formulaires, i18n, tests, items bien cadrés. → sous-agent `builder` (`.claude/agents/builder.md`).
- **Haiku = mécanique pure** : renommages, ajout de labels, tri de logs.
- **Boucle par item** : `architecte (Opus) planifie → builder (Sonnet) exécute → verify → code-review → commit (sans push)`.
- Bascule de modèle de session : `/model` ; `/fast` = Opus à sortie accélérée.
- Le suivi visuel des items vit dans `0.1 Contexte sejour-casaminga/suivi/` (statuts.json + dashboard.html) et la feuille de route.

## Emails (Resend — remplace Lovable)
- `process-email-queue` : dispatcher via `https://api.resend.com/emails` + `RESEND_API_KEY`
- `auth-email-hook` : hook natif Supabase Auth (format `{ user, email_data }`)
- `send-transactional-email` : templates React Email via pgmq
- FROM : `noreply@sejour.casaminga.com`

## Variables d'environnement (`.env`, non versionné)
```
VITE_SUPABASE_URL=https://giekhaohqksirsadkfnt.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_4_7gK7EZzjmxd2bmxx7vsQ_pW444z8W
VITE_SUPABASE_PROJECT_ID=giekhaohqksirsadkfnt
```

## Checklist déploiement (actions manuelles restantes)
- [ ] Créer sous-domaine `sejour.casaminga.com` sur Infomaniak (statique, pas Node.js)
- [ ] SSL Let's Encrypt activé
- [ ] `npm run build` + upload SFTP `dist/*`
- [ ] Supabase Auth → Redirect URLs + Hook "Send Email"
- [ ] `supabase functions deploy` + `supabase secrets set RESEND_API_KEY=re_xxx`
- [ ] Resend → domaine `sejour.casaminga.com` vérifié (SPF/DKIM)

## Ecosystème Casa Minga
| App | URL | Stack | Supabase |
|---|---|---|---|
| **Admin** | admin.casaminga.com | Next.js 16 | gzijdwrzcuokvfkpcczr |
| **Séjours** (ce projet) | sejour.casaminga.com | Vite SPA | giekhaohqksirsadkfnt |
| **Public** | casaminga.com | À construire | gzijdwrzcuokvfkpcczr |
