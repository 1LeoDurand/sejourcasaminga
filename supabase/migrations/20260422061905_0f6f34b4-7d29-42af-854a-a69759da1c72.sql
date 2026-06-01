ALTER TABLE public.places
  ADD COLUMN IF NOT EXISTS family_friendly boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS solo_friendly boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS vibe text,
  ADD COLUMN IF NOT EXISTS hospitality_types text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS hospitality_managed_by text,
  ADD COLUMN IF NOT EXISTS offerings text[] DEFAULT '{}'::text[];