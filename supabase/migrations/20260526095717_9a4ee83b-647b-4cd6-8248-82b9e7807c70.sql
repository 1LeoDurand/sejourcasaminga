
-- Extend referrals
ALTER TABLE public.referrals
  ADD COLUMN IF NOT EXISTS referred_email TEXT,
  ADD COLUMN IF NOT EXISTS email_sent BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_referrals_referred_email ON public.referrals(referred_email);

-- Rewards table
CREATE TABLE IF NOT EXISTS public.referral_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reward_type TEXT NOT NULL,
  referral_count INTEGER NOT NULL,
  metadata JSONB,
  claimed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, reward_type, referral_count)
);

ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rewards"
  ON public.referral_rewards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view ambassador badges"
  ON public.referral_rewards FOR SELECT
  USING (reward_type = 'ambassador_badge');

-- Claim referral on signup
CREATE OR REPLACE FUNCTION public.claim_referral(_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_referral RECORD;
  v_new_referral_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'not_authenticated');
  END IF;

  -- Find the referrer by code
  SELECT * INTO v_referral
  FROM public.referrals
  WHERE code = _code
    AND referrer_user_id <> v_user_id
  ORDER BY created_at ASC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'invalid_code');
  END IF;

  -- Prevent double claim
  IF EXISTS (
    SELECT 1 FROM public.referrals
    WHERE referred_user_id = v_user_id AND status = 'completed'
  ) THEN
    RETURN jsonb_build_object('error', 'already_claimed');
  END IF;

  -- Create a new "completed" referral row linking the two
  INSERT INTO public.referrals (referrer_user_id, referred_user_id, code, status, completed_at)
  VALUES (v_referral.referrer_user_id, v_user_id, _code, 'completed', now())
  RETURNING id INTO v_new_referral_id;

  RETURN jsonb_build_object('ok', true, 'referrer_id', v_referral.referrer_user_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_referral(TEXT) TO authenticated;

-- Trigger: when a referral is completed, award referrer points + check thresholds
CREATE OR REPLACE FUNCTION public.on_referral_completed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed')
     AND NEW.referrer_user_id IS NOT NULL AND NEW.referred_user_id IS NOT NULL THEN

    -- Points: referrer + referee
    PERFORM public.add_points(NEW.referrer_user_id, 50, 'referral_bonus', 'Filleul inscrit', NEW.id);
    PERFORM public.add_points(NEW.referred_user_id, 50, 'referral_welcome', 'Bonus de bienvenue (parrainage)', NEW.id);

    -- Count successful referrals for this referrer
    SELECT COUNT(*) INTO v_count
    FROM public.referrals
    WHERE referrer_user_id = NEW.referrer_user_id AND status = 'completed';

    -- Thresholds
    IF v_count >= 3 THEN
      INSERT INTO public.referral_rewards (user_id, reward_type, referral_count, expires_at)
      VALUES (NEW.referrer_user_id, 'featured_listing', 3, now() + interval '30 days')
      ON CONFLICT DO NOTHING;
    END IF;

    IF v_count >= 5 THEN
      INSERT INTO public.referral_rewards (user_id, reward_type, referral_count)
      VALUES (NEW.referrer_user_id, 'ambassador_badge', 5)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_on_referral_completed ON public.referrals;
CREATE TRIGGER trg_on_referral_completed
AFTER UPDATE OR INSERT ON public.referrals
FOR EACH ROW
EXECUTE FUNCTION public.on_referral_completed();
