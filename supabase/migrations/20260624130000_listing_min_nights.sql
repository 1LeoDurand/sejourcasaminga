-- Item [21] (back slice) · Minimum stay length per listing.
-- Adds listings.min_nights (default 1 = no change for existing listings) and
-- enforces it server-side in accept_stay_request, alongside the existing
-- double-booking guard, before any points movement. The host-facing form
-- wiring is a separate front task.

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS min_nights integer NOT NULL DEFAULT 1;

COMMENT ON COLUMN public.listings.min_nights IS
  'Minimum number of nights the host requires for a stay (default 1). '
  'Enforced server-side in accept_stay_request.';

CREATE OR REPLACE FUNCTION public.accept_stay_request(_request_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _req              public.exchange_requests%ROWTYPE;
  _points_per_night integer;
  _min_nights       integer;
  _nights           integer;
  _cost             integer;
  _guest_balance    integer;
BEGIN
  PERFORM set_config('app.exchange_guard_bypass', 'on', true);

  SELECT * INTO _req FROM public.exchange_requests
    WHERE id = _request_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'REQUEST_NOT_FOUND';
  END IF;

  IF _req.to_member_id <> auth.uid() THEN
    RAISE EXCEPTION 'NOT_AUTHORIZED';
  END IF;

  IF _req.status <> 'pending' THEN
    RAISE EXCEPTION 'NOT_PENDING';
  END IF;

  -- Double-booking guard (half-open interval; adjacent stays allowed).
  IF EXISTS (
    SELECT 1 FROM public.exchange_requests r
    WHERE r.listing_id = _req.listing_id
      AND r.id         <> _req.id
      AND r.status      = 'accepted'
      AND r.start_date  < _req.end_date
      AND r.end_date    > _req.start_date
  ) THEN
    RAISE EXCEPTION 'DATES_UNAVAILABLE';
  END IF;

  -- Minimum stay length required by the host.
  _nights := _req.end_date - _req.start_date;
  SELECT points_per_night, min_nights INTO _points_per_night, _min_nights
    FROM public.listings WHERE id = _req.listing_id;
  IF _nights < COALESCE(_min_nights, 1) THEN
    RAISE EXCEPTION 'BELOW_MIN_NIGHTS';
  END IF;

  -- Non-points exchanges (free / reciprocal / other): accept with no points movement.
  IF _req.exchange_type IS DISTINCT FROM 'points' THEN
    UPDATE public.exchange_requests
      SET status = 'accepted', updated_at = now()
      WHERE id = _request_id;
    RETURN 0;
  END IF;

  -- cost = nights * per-night price (at least one night).
  _points_per_night := COALESCE(_points_per_night, 0);
  _nights := GREATEST(_nights, 1);
  _cost := _points_per_night * _nights;

  SELECT balance INTO _guest_balance
    FROM public.point_balances
    WHERE user_id = _req.from_user_id FOR UPDATE;
  _guest_balance := COALESCE(_guest_balance, 0);
  IF _guest_balance < _cost THEN
    RAISE EXCEPTION 'INSUFFICIENT_POINTS';
  END IF;

  PERFORM public.add_points(_req.from_user_id, -_cost, 'stay_redeemed',
    'Séjour réglé en points', _request_id);
  PERFORM public.add_points(_req.to_member_id, _cost, 'stay_earned',
    'Séjour accueilli', _request_id);

  UPDATE public.exchange_requests
    SET status = 'accepted', points_spent = _cost, updated_at = now()
    WHERE id = _request_id;

  RETURN _cost;
END;
$$;

-- Keep the function callable only by authenticated members (anon stays revoked).
REVOKE EXECUTE ON FUNCTION public.accept_stay_request(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.accept_stay_request(uuid) TO authenticated;
