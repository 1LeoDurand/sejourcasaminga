# Déploiement sejour.casaminga.com — Infomaniak

## Architecture

```
sejour.casaminga.com
  │
  ├── Front : SPA Vite → dist/ uploadé sur Infomaniak (SFTP)
  └── Back  : Supabase giekhaohqksirsadkfnt (EU)
               ├── 35 tables + RLS
               ├── Edge functions (Deno)
               └── Auth + Storage
```

---

## Infos hébergement Infomaniak

| | |
|---|---|
| **Chemin racine** | `/home/clients/b72015a608f1e292f74e1add2f0686b1/` |
| **IPv4** | `83.166.133.30` |
| **IPv6** | `2001:1600:4:11::75` |
| **SFTP** | `sftp.infomaniak.com` port 22 |
| **Chemin sejour** | `/home/clients/b72015a608f1e292f74e1add2f0686b1/web/sejour.casaminga.com/` |

---

## Étape 1 — Créer le sous-domaine dans Infomaniak (5 min)

1. **manager.infomaniak.com** → Hébergement Web → Sous-domaines
2. Créer `sejour.casaminga.com`
3. Activer **SSL Let's Encrypt** (gratuit, 1 clic)
4. Le dossier web sera créé automatiquement :
   ```
   /home/clients/b72015a608f1e292f74e1add2f0686b1/web/sejour.casaminga.com/
   ```

### DNS (si pas créé automatiquement par le sous-domaine)
Dans manager → Zone DNS :
```
sejour.casaminga.com  A     83.166.133.30
sejour.casaminga.com  AAAA  2001:1600:4:11::75
```

---

## Étape 2 — Créer le .htaccess (SPA routing obligatoire)

Créer le fichier `public/.htaccess` dans le projet :

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/* "access plus 1 month"
</IfModule>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json
</IfModule>
```

> Vite copie automatiquement `public/` dans `dist/` au build.

---

## Étape 3 — Build local (1 min)

```bash
cd "D:\0 - Sync cloud Kdrive\01 Casaminga\01 Dev\casa-minga-sejour"
npm run build
# → génère dist/ (index.html + assets/ + .htaccess)
```

---

## Étape 4 — Upload SFTP vers Infomaniak (5 min)

**Option A : FileZilla (recommandé)**
- Hôte : `ftp.infomaniak.com` ou `sftp.infomaniak.com` (SFTP port 22)
- Identifiants : dans manager.infomaniak.com → FTP/SFTP
- Source : tout le contenu de `dist/` (pas le dossier dist lui-même)
- Destination : `/sites/sejour.casaminga.com/` (dossier racine du sous-domaine)

**Option B : script PowerShell (à adapter)**
```powershell
# Installer WinSCP CLI ou utiliser la lib SFTP PowerShell
# Ou déposer via manager.infomaniak.com → Gestionnaire de fichiers
```

---

## Étape 5 — Supabase Auth — URLs de redirection (2 min)

Dashboard → https://supabase.com/dashboard/project/giekhaohqksirsadkfnt/auth/url-configuration

```
Site URL       : https://sejour.casaminga.com
Redirect URLs  :
  https://sejour.casaminga.com/**
  http://localhost:8080/**
```

---

## Étape 6 — Supabase Auth Hook "Send Email" (2 min)

Dashboard → Authentication → Hooks → Enable "Send Email Hook"

```
URL : https://giekhaohqksirsadkfnt.supabase.co/functions/v1/auth-email-hook
```

---

## Étape 7 — Edge Functions (Supabase CLI)

```bash
# Installer Supabase CLI
npm install -g supabase

# Authentification
supabase login

# Lier le projet
supabase link --project-ref giekhaohqksirsadkfnt

# Configurer les secrets (RESEND_API_KEY obligatoire pour les emails)
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxxxxx

# Déployer toutes les fonctions
supabase functions deploy
```

---

## Étape 8 — Resend — domaine expéditeur (10 min)

1. Créer un compte sur [resend.com](https://resend.com) (gratuit jusqu'à 3 000 emails/mois)
2. **Domains** → Add Domain → `sejour.casaminga.com`
3. Resend fournit des enregistrements DNS à ajouter dans Infomaniak :
   - TXT `@` → SPF : `v=spf1 include:amazonses.com ~all`
   - TXT `resend._domainkey` → DKIM
   - TXT `_dmarc` → DMARC (optionnel mais recommandé)
4. Cliquer "Verify" → statut passe en "Verified"
5. Les emails partiront de `noreply@sejour.casaminga.com`

---

## Checklist de mise en ligne

- [x] Code source clean (zéro dépendance Lovable)
- [x] Supabase `giekhaohqksirsadkfnt` — 35 tables + RLS
- [x] Données migrées (13 lieux, 8 profils, 2 listings...)
- [x] Emails → Resend (process-email-queue réécrit)
- [x] Repo GitHub : https://github.com/1LeoDurand/sejourcasaminga
- [ ] Sous-domaine `sejour.casaminga.com` créé dans Infomaniak
- [ ] SSL activé
- [ ] `public/.htaccess` créé + `npm run build`
- [ ] Upload SFTP `dist/*` vers Infomaniak
- [ ] Test : https://sejour.casaminga.com charge, navigation SPA fonctionne
- [ ] Supabase Auth → Redirect URLs mis à jour
- [ ] Supabase Auth → Hook "Send Email" configuré
- [ ] `supabase functions deploy` exécuté
- [ ] Resend → domaine `sejour.casaminga.com` vérifié (SPF/DKIM)
- [ ] Test email : inscription → email de confirmation reçu

---

## Mise à jour du site (workflow continu)

```bash
# Après chaque modification :
npm run build
# Puis re-upload dist/* sur Infomaniak via SFTP
```

> 💡 À terme : automatiser avec un script PowerShell + WinSCP CLI
> pour éviter le drag & drop manuel à chaque mise à jour.
