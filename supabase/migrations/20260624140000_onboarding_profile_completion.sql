-- Item [10] · Onboarding: profile completion helper + one-time completion bonus.
-- The helper also becomes the single source of truth for the future profile
-- completion gauge (front item [27b]). Five host-meaningful fields count.

-- 1. Completion percentage (0..100) from the 5 fillable profile fields.
CREATE OR REPLACE FUNCTION public.profile_completion_pct(_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((
    (CASE WHEN p.avatar_url            IS NOT NULL AND length(trim(p.avatar_url)) > 0            THEN 1 ELSE 0 END) +
    (CASE WHEN p.bio                   IS NOT NULL AND length(trim(p.bio)) > 0                   THEN 1 ELSE 0 END) +
    (CASE WHEN p.languages             IS NOT NULL AND array_length(p.languages, 1) > 0          THEN 1 ELSE 0 END) +
    (CASE WHEN p.hosting_style         IS NOT NULL AND length(trim(p.hosting_style)) > 0         THEN 1 ELSE 0 END) +
    (CASE WHEN p.collective_experience IS NOT NULL AND length(trim(p.collective_experience)) > 0 THEN 1 ELSE 0 END)
  ) * 20, 0)
  FROM public.profiles p
  WHERE p.user_id = _user_id;
$$;

GRANT EXECUTE ON FUNCTION public.profile_completion_pct(uuid) TO authenticated;

-- 2. One-time onboarding bonus when a profile reaches 100% completion.
--    Bonus amount (100 pts) is a product knob — change the literal below to tune.
--    Idempotent: guarded by an existing 'profile_completed' transaction.
CREATE OR REPLACE FUNCTION public.award_profile_completion_bonus()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.profile_completion_pct(NEW.user_id) >= 100
     AND NOT EXISTS (
       SELECT 1 FROM public.point_transactions
       WHERE user_id = NEW.user_id AND type = 'profile_completed'
     ) THEN
    PERFORM public.add_points(NEW.user_id, 100, 'profile_completed',
      'Profil complété à 100%', NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_award_profile_completion ON public.profiles;
CREATE TRIGGER trg_award_profile_completion
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.award_profile_completion_bonus();
