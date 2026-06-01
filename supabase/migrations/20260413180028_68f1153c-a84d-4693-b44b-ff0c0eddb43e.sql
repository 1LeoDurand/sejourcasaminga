
CREATE TABLE public.place_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  place_id UUID NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  proof_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(place_id, user_id)
);

ALTER TABLE public.place_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own claims"
ON public.place_claims
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own claims"
ON public.place_claims
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their pending claims"
ON public.place_claims
FOR DELETE
USING (auth.uid() = user_id AND status = 'pending');

CREATE TRIGGER update_place_claims_updated_at
BEFORE UPDATE ON public.place_claims
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
