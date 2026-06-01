
CREATE TABLE public.stay_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  place_id uuid NOT NULL,
  listing_id uuid,
  stay_request_id uuid,
  photos_urls text[] NOT NULL DEFAULT '{}',
  text text,
  rating integer CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  is_public boolean NOT NULL DEFAULT true,
  approved_by_habitat boolean NOT NULL DEFAULT false,
  approved_at timestamp with time zone,
  moderation_note text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_stay_reviews_place ON public.stay_reviews(place_id);
CREATE INDEX idx_stay_reviews_user ON public.stay_reviews(user_id);

ALTER TABLE public.stay_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved public reviews are viewable by everyone"
ON public.stay_reviews FOR SELECT
USING (is_public = true AND approved_by_habitat = true);

CREATE POLICY "Authors can view their own reviews"
ON public.stay_reviews FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Place managers can view reviews of their place"
ON public.stay_reviews FOR SELECT
USING (public.is_place_manager(auth.uid(), place_id));

CREATE POLICY "Authenticated users can create reviews"
ON public.stay_reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authors can update their own pending reviews"
ON public.stay_reviews FOR UPDATE
USING (auth.uid() = user_id AND approved_by_habitat = false);

CREATE POLICY "Place managers can moderate reviews"
ON public.stay_reviews FOR UPDATE
USING (public.is_place_manager(auth.uid(), place_id));

CREATE POLICY "Authors can delete their own pending reviews"
ON public.stay_reviews FOR DELETE
USING (auth.uid() = user_id AND approved_by_habitat = false);

CREATE TRIGGER update_stay_reviews_updated_at
BEFORE UPDATE ON public.stay_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
