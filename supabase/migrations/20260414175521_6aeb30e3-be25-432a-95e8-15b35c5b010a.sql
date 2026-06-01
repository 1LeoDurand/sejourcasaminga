
-- 1. Add claim fields to places
ALTER TABLE public.places
  ADD COLUMN IF NOT EXISTS is_imported boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS claim_status text NOT NULL DEFAULT 'claimed',
  ADD COLUMN IF NOT EXISTS claimed_by_user_id uuid,
  ADD COLUMN IF NOT EXISTS claimed_at timestamptz,
  ADD COLUMN IF NOT EXISTS contact_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT true;

-- 2. Create app_role enum if not exists
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- user_roles RLS
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- 4. Create place_claim_requests table
CREATE TABLE public.place_claim_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id uuid NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  role_in_place text NOT NULL,
  message text,
  proof_url text,
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.place_claim_requests ENABLE ROW LEVEL SECURITY;

-- RLS for place_claim_requests
CREATE POLICY "Users can create claim requests"
  ON public.place_claim_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own claim requests"
  ON public.place_claim_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all claim requests"
  ON public.place_claim_requests FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update claim requests"
  ON public.place_claim_requests FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- 5. Update places RLS: allow claimed manager to edit
DROP POLICY IF EXISTS "Creators can update their places" ON public.places;
CREATE POLICY "Creators or managers can update their places"
  ON public.places FOR UPDATE
  USING (auth.uid() = created_by OR auth.uid() = claimed_by_user_id);

-- 6. Update places SELECT to respect is_visible
DROP POLICY IF EXISTS "Published places are viewable by everyone" ON public.places;
CREATE POLICY "Visible published places are viewable by everyone"
  ON public.places FOR SELECT
  USING (
    (published = true AND is_visible = true)
    OR auth.uid() = created_by
    OR auth.uid() = claimed_by_user_id
    OR public.has_role(auth.uid(), 'admin')
  );
