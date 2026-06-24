-- Item [7] · Calendar ↔ bookings reliability
-- Adds a server-side double-booking guard to accept_stay_request:
-- if an already-accepted request overlaps the incoming request's dates
-- for the same listing, the function raises DATES_UNAVAILABLE before
-- any points logic is attempted.

CREATE OR REPLACE FUNCTION public.accept_stay_request(_request_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _req              public.exchange_requests%ROWTYPE;
  _points_per_night integer;
  _nights           integer;
  _cost             integer;
  _guest_balance    integer;
BEGIN
  -- Lock the request row for the whole transaction.
  SELECT * INTO _req FROM public.exchange_requests
    WHERE id = _request_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'REQUEST_NOT_FOUND';
  END IF;

  -- Only the recipient host may accept.
  IF _req.to_member_id <> auth.uid() THEN
    RAISE EXCEPTION 'NOT_AUTHORIZED';
  END IF;

  IF _req.status <> 'pending' THEN
    RAISE EXCEPTION 'NOT_PENDING';
  END IF;

  -- Double-booking guard: reject if another accepted request overlaps
  -- the same listing on overlapping dates (half-open interval model:
  -- adjacent stays sharing a boundary are allowed).
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

  -- Non-points exchanges (free / reciprocal / other): accept without any points movement.
  IF _req.exchange_type IS DISTINCT FROM 'points' THEN
    UPDATE public.exchange_requests
      SET status = 'accepted', updated_at = now()
      WHERE id = _request_id;
    RETURN 0;
  END IF;

  -- cost = nights * per-night price (at least one night).
  SELECT points_per_night INTO _points_per_night
    FROM public.listings WHERE id = _req.listing_id;
  _points_per_night := COALESCE(_points_per_night, 0);
  _nights := GREATEST((_req.end_date - _req.start_date), 1);
  _cost := _points_per_night * _nights;

  -- Lock the guest balance and enforce the >= 0 guard.
  SELECT balance INTO _guest_balance
    FROM public.point_balances
    WHERE user_id = _req.from_user_id FOR UPDATE;
  _guest_balance := COALESCE(_guest_balance, 0);
  IF _guest_balance < _cost THEN
    RAISE EXCEPTION 'INSUFFICIENT_POINTS';
  END IF;

  -- Atomic debit guest / credit host (both rows touched in this transaction).
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

GRANT EXECUTE ON FUNCTION public.accept_stay_request(uuid) TO authenticated;
