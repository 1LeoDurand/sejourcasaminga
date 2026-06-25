-- Item [22] · Membership price as a server-side source of truth (decided: 89 EUR).
-- Read publicly for display; the future Stripe charge (phase B) must read it server-side
-- and convert to cents (8900). Change the literal here to update the price in one place.
CREATE OR REPLACE FUNCTION public.get_membership_price()
RETURNS integer
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $$ SELECT 89; $$;  -- EUR

GRANT EXECUTE ON FUNCTION public.get_membership_price() TO anon, authenticated;
