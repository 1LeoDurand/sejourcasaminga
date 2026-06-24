-- Item 8: lock point tables to SECURITY DEFINER functions only,
-- prevent direct acceptance bypass on exchange_requests.

-- 1. Points tables: remove self-write. Balances/transactions are only ever
--    mutated by SECURITY DEFINER functions (add_points, initialize_user_points,
--    accept_stay_request, revert_stay_acceptance), which bypass RLS. Members keep
--    read access to their own rows; admins keep their existing policies.
DROP POLICY IF EXISTS "Users can insert their own balance" ON public.point_balances;
DROP POLICY IF EXISTS "Users can update their own balance" ON public.point_balances;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.point_transactions;

-- 2. exchange_requests: add WITH CHECK so a participant cannot reassign a request
--    to someone else on update.
DROP POLICY IF EXISTS "Request participants can update" ON public.exchange_requests;
CREATE POLICY "Request participants can update" ON public.exchange_requests FOR UPDATE
  USING (auth.uid() = from_user_id OR auth.uid() = to_member_id)
  WITH CHECK (auth.uid() = from_user_id OR auth.uid() = to_member_id);

-- 3. Guard trigger: a direct UPDATE must not move a request INTO 'accepted'
--    (that bypasses points + the double-booking guard), nor tamper with the
--    protected fields. The two RPCs set a transaction-local flag to pass through.
CREATE OR REPLACE FUNCTION public.guard_exchange_request_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF current_setting('app.exchange_guard_bypass', true) IS DISTINCT FROM 'on' THEN
    IF NEW.status = 'accepted' AND OLD.status IS DISTINCT FROM 'accepted' THEN
      RAISE EXCEPTION 'ACCEPT_VIA_RPC_ONLY';
    END IF;
    IF NEW.points_spent IS DISTINCT FROM OLD.points_spent
       OR NEW.from_user_id <> OLD.from_user_id
       OR NEW.to_member_id <> OLD.to_member_id
       OR NEW.listing_id   <> OLD.listing_id THEN
      RAISE EXCEPTION 'PROTECTED_FIELD';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_exchange_request_update ON public.exchange_requests;
CREATE TRIGGER trg_guard_exchange_request_update
  BEFORE UPDATE ON public.exchange_requests
  FOR EACH ROW EXECUTE FUNCTION public.guard_exchange_request_update();

-- 4. Re-sign both RPCs to set the bypass flag (transaction-local) before they
--    touch the row. Bodies are identical to migration 20260624100000 / 20260623120000
--    except for the leading set_config call.
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

  IF _req.exchange_type IS DISTINCT FROM 'points' THEN
    UPDATE public.exchange_requests
      SET status = 'accepted', updated_at = now()
      WHERE id = _request_id;
    RETURN 0;
  END IF;

  SELECT points_per_night INTO _points_per_night
    FROM public.listings WHERE id = _req.listing_id;
  _points_per_night := COALESCE(_points_per_night, 0);
  _nights := GREATEST((_req.end_date - _req.start_date), 1);
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

CREATE OR REPLACE FUNCTION public.revert_stay_acceptance(_request_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _req public.exchange_requests%ROWTYPE;
BEGIN
  PERFORM set_config('app.exchange_guard_bypass', 'on', true);

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
