-- Phase 5B — Community groups / clubs (item 33). Back contract for the builder.
-- Public groups readable by all; group_members readable for public groups or own
-- rows; all writes go through SECURITY DEFINER RPCs (join_group / leave_group).

create table if not exists public.community_groups (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  description text,
  cover_image text,
  theme       text,
  is_public   boolean not null default true,
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

create table if not exists public.group_members (
  group_id  uuid not null references public.community_groups(id) on delete cascade,
  user_id   uuid not null references auth.users(id) on delete cascade,
  role      text not null default 'member' check (role in ('member', 'admin')),
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);
create index if not exists idx_group_members_user on public.group_members (user_id);

alter table public.community_groups enable row level security;
alter table public.group_members   enable row level security;

drop policy if exists groups_select on public.community_groups;
create policy groups_select on public.community_groups
  for select using (is_public or created_by = auth.uid());

drop policy if exists group_members_select on public.group_members;
create policy group_members_select on public.group_members
  for select using (
    exists (select 1 from public.community_groups g where g.id = group_id and g.is_public)
    or user_id = auth.uid()
  );
-- no insert/update/delete policies → direct writes denied; use the RPCs.

-- Member counts: view runs with owner privileges (counts are non-sensitive,
-- accurate for everyone, including anonymous visitors of public groups).
create or replace view public.group_member_counts as
  select group_id, count(*)::int as count
  from public.group_members
  group by group_id;
grant select on public.group_member_counts to anon, authenticated;

create or replace function public.join_group(_group uuid)
returns void language plpgsql security definer set search_path = public as $$
declare _me uuid := auth.uid();
begin
  if _me is null then raise exception 'not authenticated'; end if;
  insert into public.group_members (group_id, user_id)
  values (_group, _me)
  on conflict (group_id, user_id) do nothing;
end;
$$;

create or replace function public.leave_group(_group uuid)
returns void language plpgsql security definer set search_path = public as $$
declare _me uuid := auth.uid();
begin
  if _me is null then raise exception 'not authenticated'; end if;
  delete from public.group_members where group_id = _group and user_id = _me;
end;
$$;

grant execute on function public.join_group(uuid)  to authenticated;
grant execute on function public.leave_group(uuid) to authenticated;

-- Seed a few themed groups (director-provided).
insert into public.community_groups (slug, name, description, theme) values
  ('permaculture',     'Permaculture & jardins',     'Échanges autour de la permaculture, des jardins-forêts et de l''autonomie alimentaire.', 'Permaculture'),
  ('sociocratie',      'Gouvernance & sociocratie',  'Pour celles et ceux qui pratiquent la décision partagée, la sociocratie et la gestion par consentement.', 'Gouvernance'),
  ('autoconstruction', 'Autoconstruction',           'Chantiers participatifs, matériaux biosourcés et retours d''expérience de construction collective.', 'Construction'),
  ('slow-travel',      'Slow travel',                'Voyager lentement, d''un lieu de vie à l''autre, en privilégiant la rencontre.', 'Voyage')
on conflict (slug) do nothing;
