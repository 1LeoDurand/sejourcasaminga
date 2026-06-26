-- Security hardening following Supabase advisors after the friendships / points
-- / groups DDL.
--   1. group_member_counts → security_invoker (no definer-view bypass).
--   2. SECURITY DEFINER functions: revoke anon/public, keep authenticated only.
--   3. Temporary backup tables: enable RLS (no policy) so they are not exposed
--      through the public API. Kept as snapshots; not readable via PostgREST.

alter view public.group_member_counts set (security_invoker = on);

revoke execute on function public.friendship_status(uuid)             from anon, public;
revoke execute on function public.send_friend_request(uuid)            from anon, public;
revoke execute on function public.respond_friend_request(uuid, boolean) from anon, public;
revoke execute on function public.remove_friend(uuid)                  from anon, public;
revoke execute on function public.join_group(uuid)                     from anon, public;
revoke execute on function public.leave_group(uuid)                    from anon, public;
revoke execute on function public.suggest_points_per_night(uuid)       from anon, public;
grant execute on function public.friendship_status(uuid)              to authenticated;
grant execute on function public.send_friend_request(uuid)            to authenticated;
grant execute on function public.respond_friend_request(uuid, boolean) to authenticated;
grant execute on function public.remove_friend(uuid)                  to authenticated;
grant execute on function public.join_group(uuid)                     to authenticated;
grant execute on function public.leave_group(uuid)                    to authenticated;
grant execute on function public.suggest_points_per_night(uuid)       to authenticated;

alter table public.exchange_requests_orphan_backup_20260626 enable row level security;
alter table public.places_images_backup_20260626           enable row level security;
alter table public.listings_images_backup_20260626b        enable row level security;
alter table public.listings_points_backup_20260626         enable row level security;
alter table public.resources_backup_20260625               enable row level security;
alter table public.listings_orphan_backup_20260626         enable row level security;
alter table public.availabilities_orphan_backup_20260626   enable row level security;
