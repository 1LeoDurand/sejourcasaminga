
ALTER TABLE public.place_claim_requests
  ADD COLUMN IF NOT EXISTS verification_token TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_place_claim_requests_token
  ON public.place_claim_requests(verification_token);

CREATE OR REPLACE FUNCTION public.verify_claim_token(_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_req RECORD;
BEGIN
  IF _token IS NULL OR length(_token) < 16 THEN
    RETURN jsonb_build_object('error', 'invalid_token');
  END IF;

  SELECT * INTO v_req
  FROM public.place_claim_requests
  WHERE verification_token = _token
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'not_found');
  END IF;

  IF v_req.email_verified THEN
    RETURN jsonb_build_object('ok', true, 'already_verified', true, 'place_id', v_req.place_id);
  END IF;

  IF v_req.token_expires_at IS NOT NULL AND v_req.token_expires_at < now() THEN
    RETURN jsonb_build_object('error', 'expired');
  END IF;

  UPDATE public.place_claim_requests
  SET email_verified = true,
      email_verified_at = now()
  WHERE id = v_req.id;

  RETURN jsonb_build_object('ok', true, 'place_id', v_req.place_id);
END;
$$;
