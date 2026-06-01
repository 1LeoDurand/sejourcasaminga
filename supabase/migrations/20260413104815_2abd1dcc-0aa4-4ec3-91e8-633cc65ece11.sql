
-- Enum for listing types
CREATE TYPE public.listing_type AS ENUM (
  'home_exchange',
  'private_room',
  'guest_room',
  'immersion_stay',
  'hosted_stay'
);

-- Enum for collective relationship
CREATE TYPE public.collective_relationship AS ENUM (
  'personal',
  'known_by_collective',
  'collective_supported',
  'collective_run'
);

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  languages TEXT[] DEFAULT '{}',
  hosting_style TEXT,
  collective_experience TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own profile" ON public.profiles FOR DELETE USING (auth.uid() = user_id);

-- Places table
CREATE TABLE public.places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  short_desc TEXT,
  region TEXT,
  country TEXT DEFAULT 'France',
  values TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  governance TEXT,
  ambiance TEXT,
  inhabitants INTEGER DEFAULT 0,
  shared_amenities TEXT[] DEFAULT '{}',
  house_rules TEXT[] DEFAULT '{}',
  image TEXT,
  images TEXT[] DEFAULT '{}',
  children_friendly BOOLEAN DEFAULT false,
  animals_allowed BOOLEAN DEFAULT false,
  accessible BOOLEAN DEFAULT false,
  diet TEXT,
  website TEXT,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published places are viewable by everyone" ON public.places FOR SELECT USING (published = true OR auth.uid() = created_by);
CREATE POLICY "Users can create places" ON public.places FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Creators can update their places" ON public.places FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Creators can delete their places" ON public.places FOR DELETE USING (auth.uid() = created_by);

-- Place members (link between profiles and places)
CREATE TABLE public.place_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  relationship_to_place TEXT,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(place_id, user_id)
);

ALTER TABLE public.place_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Place members are viewable by everyone" ON public.place_members FOR SELECT USING (true);
CREATE POLICY "Users can join places" ON public.place_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their membership" ON public.place_members FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can leave places" ON public.place_members FOR DELETE USING (auth.uid() = user_id);

-- Listings table
CREATE TABLE public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  place_id UUID NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  listing_type listing_type NOT NULL DEFAULT 'private_room',
  collective_relationship collective_relationship NOT NULL DEFAULT 'personal',
  capacity INTEGER DEFAULT 2,
  autonomy_level TEXT,
  collective_access TEXT,
  interaction_level TEXT,
  practical_rules TEXT[] DEFAULT '{}',
  conditions TEXT,
  image TEXT,
  images TEXT[] DEFAULT '{}',
  available BOOLEAN DEFAULT true,
  availability_notes TEXT,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published listings are viewable by everyone" ON public.listings FOR SELECT USING (published = true OR auth.uid() = host_id);
CREATE POLICY "Hosts can create listings" ON public.listings FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Hosts can update their listings" ON public.listings FOR UPDATE USING (auth.uid() = host_id);
CREATE POLICY "Hosts can delete their listings" ON public.listings FOR DELETE USING (auth.uid() = host_id);

-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_places_updated_at BEFORE UPDATE ON public.places FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON public.listings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
