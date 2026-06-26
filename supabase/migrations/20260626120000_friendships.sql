-- Phase 5A — Community: friendships (social graph)
-- Back contract for the builder (item 33). All writes go through SECURITY DEFINER
-- RPCs; RLS allows reads only to the two parties and blocks direct writes.

create table if not exists public.friendships (
  id           uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  addressee_id uuid not null references auth.users(id) on delete cascade,
  status       text not null default 'pending'
               check (status in ('pending', 'accepted', 'declined', 'blocked')),
  created_at   timestamptz not null default now(),
  responded_at timestamptz,
  constraint friendships_no_self check (requester_id <> addressee_id),
  constraint friendships_unique_pair unique (requester_id, addressee_id)
);

create index if not exists idx_friendships_requester on public.friendships (requester_id);
create index if not exists idx_friendships_addressee on public.friendships (addressee_id);

alter table public.friendships enable row level security;

-- Read: only the two parties. No insert/update/delete policy on purpose —
-- direct client writes are denied; everything goes through the RPCs below.
drop policy if exists friendships_select on public.friendships;
create policy friendships_select on public.friendships
  for select using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- ── RPCs ──────────────────────────────────────────────────────────────────

create or replace function public.send_friend_request(_addressee uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  _me       uuid := auth.uid();
  _existing public.friendships;
  _new_id   uuid;
begin
  if _me is null then raise exception 'not authenticated'; end if;
  if _me = _addressee then raise exception 'cannot friend yourself'; end if;

  select * into _existing from public.friendships
   where (requester_id = _me and addressee_id = _addressee)
      or (requester_id = _addressee and addressee_id = _me)
   limit 1;

  if found then
    -- A previously declined link can be re-opened as a fresh pending request.
    if _existing.status = 'declined' then
      update public.friendships
         set requester_id = _me, addressee_id = _addressee,
             status = 'pending', created_at = now(), responded_at = null
       where id = _existing.id;
    end if;
    return _existing.id; -- pending/accepted/blocked → idempotent
  end if;

  insert into public.friendships (requester_id, addressee_id)
  values (_me, _addressee)
  returning id into _new_id;
  return _new_id;
end;
$$;

create or replace function public.respond_friend_request(_id uuid, _accept boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  _me  uuid := auth.uid();
  _row public.friendships;
begin
  if _me is null then raise exception 'not authenticated'; end if;
  select * into _row from public.friendships where id = _id;
  if not found then raise exception 'request not found'; end if;
  if _row.addressee_id <> _me then raise exception 'not allowed'; end if;
  if _row.status <> 'pending' then raise exception 'not pending'; end if;

  update public.friendships
     set status = case when _accept then 'accepted' else 'declined' end,
         responded_at = now()
   where id = _id;
end;
$$;

create or replace function public.remove_friend(_other uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare _me uuid := auth.uid();
begin
  if _me is null then raise exception 'not authenticated'; end if;
  delete from public.friendships
   where (requester_id = _me and addressee_id = _other)
      or (requester_id = _other and addressee_id = _me);
end;
$$;

create or replace function public.friendship_status(_other uuid)
returns text
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  _me  uuid := auth.uid();
  _row public.friendships;
begin
  if _me is null or _me = _other then return 'none'; end if;

  select * into _row from public.friendships
   where (requester_id = _me and addressee_id = _other)
      or (requester_id = _other and addressee_id = _me)
   limit 1;

  if not found then return 'none'; end if;
  if _row.status = 'accepted' then return 'friends'; end if;
  if _row.status = 'blocked'  then return 'blocked'; end if;
  if _row.status = 'declined' then return 'none'; end if;
  -- pending
  if _row.requester_id = _me then return 'pending_outgoing'; else return 'pending_incoming'; end if;
end;
$$;

grant execute on function public.send_friend_request(uuid)            to authenticated;
grant execute on function public.respond_friend_request(uuid, boolean) to authenticated;
grant execute on function public.remove_friend(uuid)                  to authenticated;
grant execute on function public.friendship_status(uuid)              to authenticated;
