-- Item [5] · Spend points to stay (hospitality points redemption)
-- Completes the "currency" half of the hybrid model: a host sets a per-night
-- price on the listing; when a 'points' exchange is accepted, the guest is
-- debited and the host credited atomically, with a balance >= cost guard.

-- 1. Host-defined per-night price (points) on listings.
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS points_per_night integer NOT NULL DEFAULT 10;

-- 2. Snapshot of what was actually charged, so a refund is exact even if the
--    listing price or the request dates change afterwards.
ALTER TABLE public.exchange_requests
  ADD COLUMN IF NOT EXISTS points_spent integer;

-- 3. Atomic acceptance: only the host may accept; for 'points' exchanges the
--    guest is debited and the host credited in a single transaction, guarded
--    by balance >= cost. Returns the points cost (0 for non-points exchanges).
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

-- 4. Reverse an acceptance (e.g. the guest "un-confirms"): refund the exact
--    snapshot and put the request back to pending. Either party may trigger it.
CREATE OR REPLACE FUNCTION public.revert_stay_acceptance(_request_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _req public.exchange_requests%ROWTYPE;
BEGIN
  SELECT * INTO _req FROM public.exchange_requests
    WHERE id = _request_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'REQUEST_NOT_FOUND';
  END IF;

  IF auth.uid() NOT IN (_req.from_user_id, _req.to_member_id) THEN
    RAISE EXCEPTION 'NOT_AUTHORIZED';
  END IF;

  IF _req.status <> 'accepted' THEN
    RAISE EXCEPTION 'NOT_ACCEPTED';
  END IF;

  -- Refund only if this acceptance charged points.
  IF COALESCE(_req.points_spent, 0) > 0 THEN
    PERFORM public.add_points(_req.from_user_id, _req.points_spent, 'stay_refunded',
      'Remboursement séjour', _request_id);
    PERFORM public.add_points(_req.to_member_id, -_req.points_spent, 'stay_reverted',
      'Annulation accueil', _request_id);
  END IF;

  UPDATE public.exchange_requests
    SET status = 'pending', points_spent = NULL, updated_at = now()
    WHERE id = _request_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.accept_stay_request(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.revert_stay_acceptance(uuid) TO authenticated;
