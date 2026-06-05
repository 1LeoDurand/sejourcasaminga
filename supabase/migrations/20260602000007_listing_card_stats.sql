-- Aggregated stats for listing cards: average rating, review count, next available period.
-- Exposed as an RPC so the front-end fetches it once (React Query dedupes across all cards).

create or replace function get_listing_card_stats()
returns table (listing_id uuid, rating numeric, review_count bigint, next_start date, next_end date)
language sql stable security definer set search_path = public as $$
  select l.id,
    round(avg(r.rating)::numeric, 1),
    count(r.id) filter (where r.rating is not null),
    na.next_start, na.next_end
  from listings l
  left join stay_reviews r
    on (r.listing_id = l.id or (r.listing_id is null and r.place_id = l.place_id))
    and r.is_public = true
  left join lateral (
    select a.start_date as next_start, a.end_date as next_end
    from availabilities a
    where a.listing_id = l.id and a.status = 'available' and a.end_date >= current_date
    order by a.start_date asc limit 1
  ) na on true
  group by l.id, na.next_start, na.next_end;
$$;

grant execute on function get_listing_card_stats() to anon, authenticated;
