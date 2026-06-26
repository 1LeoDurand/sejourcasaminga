-- Points valuation engine (item 21 — "Prix points") — Phase 1.
-- Single source of truth in SQL: used for the suggested price, the one-time
-- re-pricing backfill, and an RPC the UI can call to verify parity.
--
-- Model (GP ≈ €):
--   suggested = round5( (BASE + beds_bonus + amenities_bonus)
--                        * type_mult * attraction_mult )
--   BASE=50 (entire home, 2 sleeps, standard location)
--   beds_bonus      = max(min(capacity,8)-2,0) * 12
--   amenities_bonus = min(n_shared_amenities*3, 30)
--   type_mult       : home_exchange 1.0 · immersion_stay 0.8 · hosted_stay 0.7
--                     · private_room/guest_room 0.6 · default 0.8
--   attraction_mult : standard 1.0 · near_site 1.15 · prime 1.3  (manual tag)
-- Host may then set the final price within ±30% of the suggestion (enforced
-- client-side in the listing form; see Phase 6 directive).

alter table public.places   add column if not exists attraction_level text not null default 'standard'
  check (attraction_level in ('standard', 'near_site', 'prime'));
alter table public.listings add column if not exists points_suggested int;

create or replace function public.suggest_points_per_night(_listing_id uuid)
returns int
language sql
stable
security definer
set search_path = public
as $$
  with l as (
    select li.capacity,
           li.listing_type::text as ltype,
           coalesce(pl.attraction_level, 'standard') as attraction_level,
           coalesce(array_length(pl.shared_amenities, 1), 0) as n_amenities
    from public.listings li
    join public.places pl on pl.id = li.place_id
    where li.id = _listing_id
  )
  select greatest(10, (round(
      ( 50
        + greatest(least(coalesce(capacity, 2), 8) - 2, 0) * 12
        + least(n_amenities * 3, 30)
      )
      * case ltype
          when 'home_exchange'  then 1.0
          when 'immersion_stay' then 0.8
          when 'hosted_stay'    then 0.7
          when 'private_room'   then 0.6
          when 'guest_room'     then 0.6
          else 0.8 end
      * case attraction_level
          when 'prime'     then 1.3
          when 'near_site' then 1.15
          else 1.0 end
      / 5.0) * 5))::int
  from l;
$$;

grant execute on function public.suggest_points_per_night(uuid) to authenticated;

-- One-time re-pricing of seed listings that were all flat at 10 GP.
-- Snapshot first; only rows with a valid host (2 orphaned seed listings skipped).
create table if not exists public.listings_points_backup_20260626 as
  select id, points_per_night, points_suggested, now() as backed_up_at from public.listings;

update public.listings l set points_suggested = public.suggest_points_per_night(l.id)
 where exists (select 1 from auth.users u where u.id = l.host_id);

update public.listings l set points_per_night = points_suggested
 where points_per_night = 10 and points_suggested is not null
   and exists (select 1 from auth.users u where u.id = l.host_id);
