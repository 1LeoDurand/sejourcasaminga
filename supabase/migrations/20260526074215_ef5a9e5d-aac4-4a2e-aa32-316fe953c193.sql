-- Habitat events table
CREATE TABLE public.habitat_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  place_id UUID NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL DEFAULT 'autre' CHECK (event_type IN ('atelier','repas','reunion','autre')),
  date_start TIMESTAMPTZ NOT NULL,
  date_end TIMESTAMPTZ,
  max_participants INTEGER,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_habitat_events_place ON public.habitat_events(place_id);
CREATE INDEX idx_habitat_events_date ON public.habitat_events(date_start);

ALTER TABLE public.habitat_events ENABLE ROW LEVEL SECURITY;

-- Helper: is user manager of place?
CREATE OR REPLACE FUNCTION public.is_place_manager(_user_id uuid, _place_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.places
    WHERE id = _place_id
      AND (created_by = _user_id OR claimed_by_user_id = _user_id)
  );
$$;

-- Public events visible to everyone; private events visible to place managers
CREATE POLICY "Public events viewable by everyone"
ON public.habitat_events FOR SELECT
USING (is_public = true OR public.is_place_manager(auth.uid(), place_id));

-- Place managers can create events for their place
CREATE POLICY "Place managers can create events"
ON public.habitat_events FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by AND public.is_place_manager(auth.uid(), place_id));

-- Place managers can update events for their place
CREATE POLICY "Place managers can update events"
ON public.habitat_events FOR UPDATE
TO authenticated
USING (public.is_place_manager(auth.uid(), place_id));

-- Place managers can delete events for their place
CREATE POLICY "Place managers can delete events"
ON public.habitat_events FOR DELETE
TO authenticated
USING (public.is_place_manager(auth.uid(), place_id));

CREATE TRIGGER update_habitat_events_updated_at
BEFORE UPDATE ON public.habitat_events
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Interest table (lightweight join list)
CREATE TABLE public.habitat_event_interests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.habitat_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);

CREATE INDEX idx_habitat_event_interests_event ON public.habitat_event_interests(event_id);

ALTER TABLE public.habitat_event_interests ENABLE ROW LEVEL SECURITY;

-- Anyone can see interest counts on visible events
CREATE POLICY "Interests viewable by everyone"
ON public.habitat_event_interests FOR SELECT
USING (true);

CREATE POLICY "Users can register their own interest"
ON public.habitat_event_interests FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can withdraw their own interest"
ON public.habitat_event_interests FOR DELETE
TO authenticated
USING (auth.uid() = user_id);