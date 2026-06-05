# Plan de test — Casa Minga Séjours

Stratégie de test manuelle avec les 10 personas, pour synthétiser l'usage réel de l'outil.
Ancrée sur le code réel (audité 2026-06-05). Cocher au fur et à mesure.

## Comptes de test

- **Login** : `1leodurand+<prenom>@gmail.com` · mot de passe **`CasaTest2026!`** · emails pré-confirmés
- **Astuce monitoring e-mails** : l'alias Gmail `+prenom` route tout vers la boîte unique
  `1leodurand@gmail.com`. → filtre `from:noreply@sejour.casaminga.com` pour voir TOUS les flux.
- **Admin** : `claire` est promue admin (table `user_roles`). Accès via `/admin`.
  (Autre admin existant = compte réel de Léo `ddc83e7f…`.)

| Persona | Lieu | Type | UUID user |
|---|---|---|---|
| claire | Coopérative de la Jonction → coop Lyon | coopérative urbaine | …01 (**admin**) |
| thomas | Écolieu des Sources (Ariège) | écolieu / yourte | …02 |
| yael | Kibboutz Lotan (Israël) | kibboutz | …03 |
| ananda | Auroville – Aspiration (Inde) | communauté intentionnelle | …04 |
| maelle | La Kerterre de la Pointe (Crozon) | habitat léger | …05 |
| lars | Sættedammen Cohousing (Copenhague) | cohousing | …06 |
| sophie | La Cabane des Cantons (Québec) | cabane bois | …07 |
| marc | Coopérative de la Jonction (Genève) | coopérative | …08 |
| awa | Écovillage de Mbackombel (Sénégal) | case terre | …09 |
| joao | Aldeia da Terra (Portugal) | roulotte / écovillage | …10 |

## Mécaniques réelles (référence)

| Brique | Mécanique | Tables / fonctions |
|---|---|---|
| Auth | Supabase email/password | `Auth.tsx`, `ResetPassword.tsx` |
| Échange | `pending → accepted/declined → cancelled/completed` | `exchange_requests`, edge `notify-exchange` |
| Points | 8 types crédités par événement | `point_balances`, `point_transactions` |
| Messagerie | conversations temps réel | `conversations`, edge `notify-new-message` |
| Signalement | report user/listing/place/review | `reports` |
| Anti-doublon lieu | warning fuzzy + claim | `DuplicatePlaceWarning`, `place_claim_requests` |
| Admin | intégré `/admin/*`, gated `user_roles.role='admin'` | 8 pages |
| Agenda | dispos + dates bloquées | `availabilities`, `place_unavailable_dates` |

---

## Préparation (5 min)

- [ ] Claire = admin (FAIT en base)
- [ ] Gmail ouvert sur `1leodurand@gmail.com`, filtre expéditeur en place
- [ ] 2 navigateurs/profils : Claire dans l'un, Thomas dans l'autre

---

## ① Connexion

- [ ] Login des 10 comptes avec `CasaTest2026!`
- [ ] Session persiste après refresh
- [ ] Logout fonctionne
- [ ] Reset password depuis Claire → e-mail reçu, lien fonctionne, nouveau mdp OK
- [ ] Tentative mauvais mot de passe → message d'erreur clair

## ② Échange de A à Z (Claire → yourte de Thomas) — cœur du test

- [ ] Claire ouvre la fiche de Thomas, choisit des dates dans une dispo réelle (juin–nov 2026)
- [ ] Demande envoyée (statut `pending`)
- [ ] Thomas reçoit notif in-app + e-mail (`notify-exchange` / `created`)
- [ ] Thomas **accepte** → statut `accepted`, e-mail `accepted` à Claire
- [ ] Passage en `completed` (manuel ou via PostStayReview)
- [ ] Chaque transition déclenche : crédit point (④) + e-mail (⑥) + trace messagerie (③)
- [ ] **Branche refus** : Lars → Sophie, Sophie **décline** → e-mail `declined`
- [ ] **Branche annulation** : une demande passée en `cancelled`
- [ ] Vérifier qu'on ne peut PAS demander des dates hors dispo / sur dates bloquées

## ③ Messagerie

- [ ] Échange de messages Claire ↔ Thomas dans la conversation
- [ ] Temps réel (message apparaît sans refresh)
- [ ] E-mail `notify-new-message` reçu
- [ ] Statut lu / non-lu correct
- [ ] Ordre chronologique respecté
- [ ] Impossible de s'écrire à soi-même

## ④ Comptabilisation de points

Relire `point_transactions` (Dashboard) avant/après chaque action. Les 8 déclencheurs :

- [ ] `signup_bonus` (à la création — déjà passé pour les personas)
- [ ] `profile_completed`
- [ ] `place_created`
- [ ] `listing_created`
- [ ] `availability_added`
- [ ] `referral_bonus` + `referral_welcome` (via ⑦)
- [ ] `exchange_completed`
- [ ] **Solde `point_balances` = somme des transactions** (pas de double-crédit)
- [ ] Réédition d'une fiche ne re-crédite PAS

## ⑤ Signalement d'un compte

- [ ] Awa signale le compte/fiche de Marc (raison + détails)
- [ ] Le report atterrit en base (`reports`)
- [ ] ⚠️ **AUDIT : aucune alerte e-mail n'est envoyée à l'admin** (cf. Manques)
- [ ] ⚠️ **AUDIT : aucune page admin pour trier les signalements** (cf. Manques)

## ⑥ Flux e-mails (depuis la boîte unique)

Vérifier réception + rendu (FR, accents, liens, FROM `noreply@sejour.casaminga.com`) :

- [ ] `auth-email-hook` — confirmation signup
- [ ] `auth-email-hook` — reset password
- [ ] `notify-exchange` — created / accepted / declined
- [ ] `notify-new-message`
- [ ] `send-transactional-email` via `process-email-queue` (pgmq)
- [ ] `send-engagement-reminders` (déclencher manuellement)
- [ ] `send-weekly-digest` (déclencher manuellement)
- [ ] `handle-email-unsubscribe` — clic lien désinscription → bien retiré (`Unsubscribe.tsx`)
- [ ] Pas d'e-mails en double ; pas d'envoi bloqué dans la queue

## ⑦ Modification de fiches

- [ ] Thomas édite sa fiche (highlights, FAQ, règles, dispos) — persistance OK
- [ ] Claire édite son lieu (`EditPlace`)
- [ ] Édition profil (`EditProfile`)
- [ ] i18n FR/EN/ES sans clé manquante
- [ ] Calendrier reflète les nouvelles dispos
- [ ] L'édition ne re-crédite pas de points

## ⑧ Logique de lieux — pas de doublons

État audité : `DuplicatePlaceWarning` détecte par fuzzy match (normalisation, stopwords,
overlap de tokens, bonus même-ville/exact) et propose **Revendiquer**. **MAIS non bloquant.**

- [ ] Avec un 2ᵉ persona, taper "Écolieu des Sources" / même ville → l'avertissement apparaît
- [ ] Le bouton "Revendiquer" mène à `/habitat/:id?claim=1`
- [ ] Le claim arrive dans `/admin/claims` → Claire (admin) le valide
- [ ] ⚠️ Vérifier : peut-on ignorer l'avertissement et créer quand même un doublon ? (oui, à ce jour)
- [ ] Déclenchement uniquement si nom ≥ 4 caractères

## ⑨ Agenda

- [ ] Thomas ajoute une dispo + bloque des dates (`place_unavailable_dates`)
- [ ] `AvailabilityCalendar` colore : dispo / réciproque / indispo / passé
- [ ] Dates bloquées non réservables
- [ ] Demande d'échange sur date bloquée refusée/impossible
- [ ] Vue multi-mois "voir les mois suivants" OK

## ⑩ UI/UX

- [ ] Parcours mobile + desktop : Index, Discover, fiche, Dashboard, messagerie, calendrier
- [ ] Favicon transparent (pas de cadre blanc)
- [ ] ListingCard : avatar, note, dates dispo
- [ ] Bloc AlsoViewed pleine largeur (desktop)
- [ ] Boutons CTA visibles (pas de blanc sur blanc / terracotta)
- [ ] Photos personas chargées (Auroville Matrimandir, yourte de Thomas)
- [ ] FR / EN / ES sans clé manquante visible

## ⑪ Monitoring admin — existant vs besoins

**Existe** (`/admin/*`) : Dashboard · Lieux · Séjours · Revendications · Ressources ·
Utilisateurs · Statistiques · Liens cassés.

Manques identifiés (à prioriser) :

- [ ] **Signalements** — `reports` insérés mais AUCUNE page admin pour les trier + aucune alerte e-mail
- [ ] **Échanges** — aucune vue admin de `exchange_requests` (suivi statuts / litiges)
- [ ] **Points** — aucune vue pour auditer / corriger un solde
- [ ] **E-mails** — aucune vue de la queue pgmq, échecs, suppressions
- [ ] Centraliser santé : Supabase logs + Edge Function logs

## ⑫ Résolution de problèmes — playbook de triage

Ordre de diagnostic quand un test échoue :

1. Console navigateur + onglet Network (erreur front / RLS 401-403 ?)
2. Supabase → Logs (Postgres) et Edge Functions → Logs (la fonction `notify-*` a-t-elle tourné ?)
3. E-mail : `process-email-queue` — message dans la pgmq ? en échec ?
4. Données : requête directe via API Management pour voir l'état réel (statut échange, transactions points)
5. RLS : 90% des "ça ne s'enregistre pas" = policy manquante
6. Reproduire isolément avec un 2ᵉ persona (bug global vs donnée corrompue)

---

## Synthèse audit (2026-06-05)

**Solide** : dedup de lieux (fuzzy + claim), admin intégré riche, 9 edge functions e-mail,
calendrier dispos, parcours échange complet avec notifications.

**Points faibles confirmés à corriger** :
1. Signalement = insert seul, **pas d'alerte e-mail** ni **page admin de tri**.
2. Pas de **vue admin des échanges** (litiges invisibles).
3. Pas de **vue admin des points** (impossible d'auditer/corriger un solde).
4. Pas de **vue admin des e-mails** (queue/échecs/suppressions aveugles).
5. Dedup **non bloquant** : on peut créer un doublon en ignorant l'avertissement.
