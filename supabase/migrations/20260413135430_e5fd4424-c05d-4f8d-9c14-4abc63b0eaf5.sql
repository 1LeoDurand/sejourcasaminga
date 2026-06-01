
-- Point balances table
CREATE TABLE public.point_balances (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  balance integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.point_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own balance" ON public.point_balances FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own balance" ON public.point_balances FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own balance" ON public.point_balances FOR UPDATE USING (auth.uid() = user_id);

-- Point transactions table
CREATE TABLE public.point_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  amount integer NOT NULL,
  type text NOT NULL,
  description text,
  related_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions" ON public.point_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own transactions" ON public.point_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Referrals table
CREATE TABLE public.referrals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_user_id uuid NOT NULL,
  referred_user_id uuid,
  code text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own referrals" ON public.referrals FOR SELECT USING (auth.uid() = referrer_user_id OR auth.uid() = referred_user_id);
CREATE POLICY "Anyone can read referral codes" ON public.referrals FOR SELECT USING (true);
CREATE POLICY "Users can create referral codes" ON public.referrals FOR INSERT WITH CHECK (auth.uid() = referrer_user_id);
CREATE POLICY "Users can update their referrals" ON public.referrals FOR UPDATE USING (auth.uid() = referrer_user_id OR auth.uid() = referred_user_id);

-- Function to initialize points for new user
CREATE OR REPLACE FUNCTION public.initialize_user_points()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.point_balances (user_id, balance)
  VALUES (NEW.user_id, 50)
  ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO public.point_transactions (user_id, amount, type, description)
  VALUES (NEW.user_id, 50, 'signup_bonus', 'Bonus de bienvenue');
  
  -- Generate referral code
  INSERT INTO public.referrals (referrer_user_id, code)
  VALUES (NEW.user_id, 'CM-' || substr(md5(random()::text), 1, 8))
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger on profile creation
CREATE TRIGGER on_profile_created_init_points
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_user_points();

-- Function to add points
CREATE OR REPLACE FUNCTION public.add_points(
  _user_id uuid,
  _amount integer,
  _type text,
  _description text DEFAULT NULL,
  _related_id uuid DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  UPDATE public.point_balances
  SET balance = balance + _amount, updated_at = now()
  WHERE user_id = _user_id;
  
  IF NOT FOUND THEN
    INSERT INTO public.point_balances (user_id, balance)
    VALUES (_user_id, _amount);
  END IF;
  
  INSERT INTO public.point_transactions (user_id, amount, type, description, related_id)
  VALUES (_user_id, _amount, _type, _description, _related_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Auto-points when place is created
CREATE OR REPLACE FUNCTION public.on_place_created_points()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.add_points(NEW.created_by, 30, 'place_created', 'Lieu ajouté : ' || NEW.name, NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_place_created_add_points
  AFTER INSERT ON public.places
  FOR EACH ROW
  EXECUTE FUNCTION public.on_place_created_points();

-- Auto-points when listing is created
CREATE OR REPLACE FUNCTION public.on_listing_created_points()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.add_points(NEW.host_id, 20, 'listing_created', 'Séjour publié : ' || NEW.title, NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_listing_created_add_points
  AFTER INSERT ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.on_listing_created_points();

-- Auto-points when availability is added
CREATE OR REPLACE FUNCTION public.on_availability_created_points()
RETURNS TRIGGER AS $$
DECLARE
  _host_id uuid;
BEGIN
  SELECT host_id INTO _host_id FROM public.listings WHERE id = NEW.listing_id;
  IF _host_id IS NOT NULL THEN
    PERFORM public.add_points(_host_id, 10, 'availability_added', 'Disponibilité ajoutée', NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_availability_created_add_points
  AFTER INSERT ON public.availabilities
  FOR EACH ROW
  EXECUTE FUNCTION public.on_availability_created_points();
