
-- Add missing columns to places
ALTER TABLE public.places ADD COLUMN IF NOT EXISTS slug text UNIQUE;
ALTER TABLE public.places ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE public.places ADD COLUMN IF NOT EXISTS address_text text;

-- Add slug to listings
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- listing_photos
CREATE TABLE public.listing_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.listing_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view listing photos" ON public.listing_photos FOR SELECT USING (true);
CREATE POLICY "Hosts can manage their listing photos" ON public.listing_photos FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND host_id = auth.uid()));
CREATE POLICY "Hosts can update their listing photos" ON public.listing_photos FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND host_id = auth.uid()));
CREATE POLICY "Hosts can delete their listing photos" ON public.listing_photos FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND host_id = auth.uid()));

-- availabilities
CREATE TABLE public.availabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'available',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.availabilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view availabilities" ON public.availabilities FOR SELECT USING (true);
CREATE POLICY "Hosts can manage availabilities" ON public.availabilities FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND host_id = auth.uid()));
CREATE POLICY "Hosts can update availabilities" ON public.availabilities FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND host_id = auth.uid()));
CREATE POLICY "Hosts can delete availabilities" ON public.availabilities FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND host_id = auth.uid()));

-- exchange_requests
CREATE TABLE public.exchange_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  from_user_id uuid NOT NULL,
  to_member_id uuid NOT NULL,
  message text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  number_of_guests integer DEFAULT 1,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.exchange_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own requests" ON public.exchange_requests FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_member_id);
CREATE POLICY "Authenticated users can create requests" ON public.exchange_requests FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);
CREATE POLICY "Request participants can update" ON public.exchange_requests FOR UPDATE
  USING (auth.uid() = from_user_id OR auth.uid() = to_member_id);

-- conversations
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES public.listings(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- conversation_participants
CREATE TABLE public.conversation_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

-- Security definer function to check conversation membership
CREATE OR REPLACE FUNCTION public.is_conversation_participant(_user_id uuid, _conversation_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE user_id = _user_id AND conversation_id = _conversation_id
  )
$$;

CREATE POLICY "Participants can view conversations" ON public.conversations FOR SELECT
  USING (public.is_conversation_participant(auth.uid(), id));
CREATE POLICY "Authenticated users can create conversations" ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Participants can view participants" ON public.conversation_participants FOR SELECT
  USING (public.is_conversation_participant(auth.uid(), conversation_id));
CREATE POLICY "Authenticated users can add participants" ON public.conversation_participants FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- messages
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can view messages" ON public.messages FOR SELECT
  USING (public.is_conversation_participant(auth.uid(), conversation_id));
CREATE POLICY "Participants can send messages" ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_user_id AND public.is_conversation_participant(auth.uid(), conversation_id));

-- favorites
CREATE TABLE public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, listing_id)
);
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own favorites" ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can add favorites" ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove favorites" ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

-- reviews
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  author_user_id uuid NOT NULL,
  target_member_id uuid NOT NULL,
  review_text text,
  hospitality_rating integer CHECK (hospitality_rating BETWEEN 1 AND 5),
  clarity_rating integer CHECK (clarity_rating BETWEEN 1 AND 5),
  collective_experience_rating integer CHECK (collective_experience_rating BETWEEN 1 AND 5),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reviews" ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = author_user_id);
CREATE POLICY "Authors can update their reviews" ON public.reviews FOR UPDATE
  USING (auth.uid() = author_user_id);
CREATE POLICY "Authors can delete their reviews" ON public.reviews FOR DELETE
  USING (auth.uid() = author_user_id);

-- Add foreign keys to existing tables that are missing them
-- (listings already references places via place_id from previous migration)

-- Indexes for performance
CREATE INDEX idx_listings_place_id ON public.listings(place_id);
CREATE INDEX idx_listings_host_id ON public.listings(host_id);
CREATE INDEX idx_place_members_place_id ON public.place_members(place_id);
CREATE INDEX idx_place_members_user_id ON public.place_members(user_id);
CREATE INDEX idx_listing_photos_listing_id ON public.listing_photos(listing_id);
CREATE INDEX idx_availabilities_listing_id ON public.availabilities(listing_id);
CREATE INDEX idx_exchange_requests_listing_id ON public.exchange_requests(listing_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX idx_reviews_listing_id ON public.reviews(listing_id);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
