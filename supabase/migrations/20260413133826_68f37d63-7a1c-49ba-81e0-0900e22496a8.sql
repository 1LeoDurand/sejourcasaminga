-- Add video_url to places and listings
ALTER TABLE public.places ADD COLUMN IF NOT EXISTS video_url text;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS video_url text;

-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('place-photos', 'place-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access
CREATE POLICY "Public can view place photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'place-photos');

-- Authenticated users can upload to their folder
CREATE POLICY "Authenticated users can upload place photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'place-photos' AND auth.uid() IS NOT NULL);

-- Users can update their uploads
CREATE POLICY "Users can update their place photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'place-photos' AND auth.uid() IS NOT NULL);

-- Users can delete their uploads
CREATE POLICY "Users can delete their place photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'place-photos' AND auth.uid() IS NOT NULL);