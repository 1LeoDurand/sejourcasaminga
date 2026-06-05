-- Migration: host_reviews
-- Avis laissés par les hôtes sur les voyageurs après un séjour

create table if not exists public.host_reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  -- L'hôte qui écrit l'avis
  host_user_id uuid not null references auth.users(id) on delete cascade,
  -- Le voyageur qui reçoit l'avis
  guest_user_id uuid not null references auth.users(id) on delete cascade,
  -- La demande de séjour associée (optionnel)
  stay_request_id uuid references public.exchange_requests(id) on delete set null,
  -- Note globale 1-5
  rating integer check (rating between 1 and 5),
  -- Texte de l'avis
  text text,
  -- Sous-notes
  communication_rating integer check (communication_rating between 1 and 5),
  respect_rating integer check (respect_rating between 1 and 5),
  -- Visible publiquement ou non
  is_public boolean not null default true
);

-- RLS
alter table public.host_reviews enable row level security;

-- Lecture : tout le monde peut lire les avis publics
create policy "host_reviews_select_public"
  on public.host_reviews for select
  using (is_public = true);

-- Création : seulement par l'hôte authentifié
create policy "host_reviews_insert_own"
  on public.host_reviews for insert
  with check (auth.uid() = host_user_id);

-- Mise à jour / suppression : seulement par l'auteur
create policy "host_reviews_update_own"
  on public.host_reviews for update
  using (auth.uid() = host_user_id);

create policy "host_reviews_delete_own"
  on public.host_reviews for delete
  using (auth.uid() = host_user_id);

-- Index pour les requêtes fréquentes
create index if not exists host_reviews_guest_user_id_idx on public.host_reviews(guest_user_id);
create index if not exists host_reviews_host_user_id_idx on public.host_reviews(host_user_id);
