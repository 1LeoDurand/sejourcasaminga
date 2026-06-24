-- Item 8 follow-up: address the security advisor findings introduced by the
-- stay RPCs / guard trigger.
--   1. Pin a stable search_path on the trigger guard function.
--   2. Stop exposing the points RPCs to the anon role. PostgREST grants EXECUTE
--      to PUBLIC by default, so a GRANT TO authenticated alone still leaves the
--      function callable anonymously; for SECURITY DEFINER functions where
--      auth.uid() drives authorization, anon access must be revoked explicitly.

CREATE OR REPLACE FUNCTION public.guard_exchange_request_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
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

REVOKE EXECUTE ON FUNCTION public.accept_stay_request(uuid)    FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.revert_stay_acceptance(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.accept_stay_request(uuid)    TO authenticated;
GRANT  EXECUTE ON FUNCTION public.revert_stay_acceptance(uuid) TO authenticated;
