-- Migration: place_unavailable_dates
-- Calendrier d'indisponibilité des lieux (bloquer des périodes)

create table if not exists public.place_unavailable_dates (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  place_id uuid not null references public.places(id) on delete cascade,
  -- Période bloquée
  start_date date not null,
  end_date date not null,
  -- Raison (optionnel, ex: "Rénovation", "Famille", "Fermé l'hiver")
  reason text,
  -- Créé par
  created_by uuid not null references auth.users(id) on delete cascade,
  constraint valid_date_range check (end_date >= start_date)
);

-- RLS
alter table public.place_unavailable_dates enable row level security;

-- Lecture publique (pour savoir si un lieu est disponible)
create policy "unavailable_dates_select_public"
  on public.place_unavailable_dates for select
  using (true);

-- Création : seulement les membres du lieu
create policy "unavailable_dates_insert_member"
  on public.place_unavailable_dates for insert
  with check (
    auth.uid() = created_by
    and exists (
      select 1 from public.place_members
      where place_id = public.place_unavailable_dates.place_id
        and user_id = auth.uid()
    )
  );

-- Suppression : seulement le créateur
create policy "unavailable_dates_delete_own"
  on public.place_unavailable_dates for delete
  using (auth.uid() = created_by);

-- Index
create index if not exists unavailable_dates_place_id_idx on public.place_unavailable_dates(place_id);
create index if not exists unavailable_dates_dates_idx on public.place_unavailable_dates(start_date, end_date);
