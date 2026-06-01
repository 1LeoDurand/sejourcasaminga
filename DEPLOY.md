# Déploiement sejour.casaminga.com

## 1. GitHub — pousser le repo

```bash
# Créer un repo privé sur github.com/new → "casa-minga-sejour"
cd "D:\0 - Sync cloud Kdrive\01 Casaminga\01 Dev\casa-minga-sejour"
git remote add origin https://github.com/<TON-COMPTE>/casa-minga-sejour.git
git push -u origin master
```

## 2. Vercel — connecter et déployer

1. https://vercel.com → Add New Project → Import `casa-minga-sejour`
2. Framework : **Vite** (auto-détecté)
3. Build command : `npm run build`
4. Output directory : `dist`
5. **Environment Variables** → ajouter :
   ```
   VITE_SUPABASE_URL         = https://giekhaohqksirsadkfnt.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY = sb_publishable_4_7gK7EZzjmxd2bmxx7vsQ_pW444z8W
   VITE_SUPABASE_PROJECT_ID  = giekhaohqksirsadkfnt
   ```
6. Deploy → récupérer l'URL `xxx.vercel.app`

## 3. DNS — subdomain sejour.casaminga.com

Chez ton registrar, ajouter :
```
sejour.casaminga.com  CNAME  cname.vercel-dns.com
```
Vercel génère HTTPS automatiquement.

## 4. Supabase Auth — URLs de redirection

Dashboard → https://supabase.com/dashboard/project/giekhaohqksirsadkfnt/auth/url-configuration

```
Site URL       : https://sejour.casaminga.com
Redirect URLs  : https://sejour.casaminga.com/**
                 http://localhost:8080/**
```

## 5. Supabase Auth — Hook "Send Email"

Dashboard → Authentication → Hooks → Enable "Send Email Hook"
```
URL : https://giekhaohqksirsadkfnt.supabase.co/functions/v1/auth-email-hook
```

## 6. Edge Functions — déploiement Supabase CLI

```bash
# Installer Supabase CLI
npm install -g supabase

# Authentification (ouvre le navigateur)
supabase login

# Lier le projet
cd "D:\0 - Sync cloud Kdrive\01 Casaminga\01 Dev\casa-minga-sejour"
supabase link --project-ref giekhaohqksirsadkfnt

# Configurer les secrets
supabase secrets set RESEND_API_KEY=re_xxxxxxxx   # ta clé Resend
# Les autres (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) sont auto-injectés

# Déployer toutes les fonctions
supabase functions deploy
```

## 7. Resend — configurer le domaine expéditeur

1. https://resend.com → Domains → Add Domain → `sejour.casaminga.com`
2. Ajouter les enregistrements DNS fournis par Resend (TXT SPF/DKIM)
3. Vérifier → les emails partiront de `noreply@sejour.casaminga.com`

## 8. Supabase — cron job emails (process-email-queue)

Une fois les edge functions déployées, le cron `weekly-digest-monday-10` tourne déjà
(configuré en migration). Pour le cron process-email-queue (toutes les 5s) :

Dashboard → SQL Editor → exécuter :
```sql
SELECT cron.schedule(
  'process-email-queue',
  '*/5 * * * * *',  -- toutes les 5s (pg_cron syntax)
  $$
  select net.http_post(
    url := 'https://giekhaohqksirsadkfnt.supabase.co/functions/v1/process-email-queue',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key' LIMIT 1)
    ),
    body := '{}'::jsonb
  );
  $$
);
```

> Ou configurer le service_role_key dans vault et utiliser dans le cron.
