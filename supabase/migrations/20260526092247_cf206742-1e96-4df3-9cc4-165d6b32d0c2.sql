-- 1) Add notes + updated_at to favorites
ALTER TABLE public.favorites
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Allow owners to update their own favorites (notes)
DROP POLICY IF EXISTS "Users can update their favorites" ON public.favorites;
CREATE POLICY "Users can update their favorites"
  ON public.favorites FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS trg_favorites_updated_at ON public.favorites;
CREATE TRIGGER trg_favorites_updated_at
  BEFORE UPDATE ON public.favorites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Shared wishlists (public read-only via token)
CREATE TABLE IF NOT EXISTS public.shared_wishlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  token TEXT NOT NULL UNIQUE DEFAULT ('wl-' || substr(md5(random()::text || clock_timestamp()::text), 1, 16)),
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.shared_wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view shared wishlists by token"
  ON public.shared_wishlists FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own wishlists"
  ON public.shared_wishlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wishlists"
  ON public.shared_wishlists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlists"
  ON public.shared_wishlists FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_shared_wishlists_updated_at
  BEFORE UPDATE ON public.shared_wishlists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_shared_wishlists_user ON public.shared_wishlists(user_id);