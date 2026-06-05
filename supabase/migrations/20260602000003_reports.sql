-- Migration: reports
-- Système de signalement (listings, places, profiles)

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  -- Qui signale
  reporter_user_id uuid not null references auth.users(id) on delete cascade,
  -- Ce qui est signalé
  target_type text not null check (target_type in ('listing', 'place', 'profile', 'review')),
  target_id uuid not null,
  -- Raison
  reason text not null check (reason in (
    'inappropriate_content',
    'fake_listing',
    'harassment',
    'spam',
    'misleading_info',
    'other'
  )),
  details text,
  -- Statut de modération
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz
);

-- RLS
alter table public.reports enable row level security;

-- Création : tout utilisateur connecté
create policy "reports_insert_authenticated"
  on public.reports for insert
  with check (auth.uid() = reporter_user_id);

-- Lecture : seulement l'auteur ou les admins (géré côté app)
create policy "reports_select_own"
  on public.reports for select
  using (auth.uid() = reporter_user_id);

-- Index
create index if not exists reports_target_idx on public.reports(target_type, target_id);
create index if not exists reports_status_idx on public.reports(status);
create index if not exists reports_reporter_idx on public.reports(reporter_user_id);
