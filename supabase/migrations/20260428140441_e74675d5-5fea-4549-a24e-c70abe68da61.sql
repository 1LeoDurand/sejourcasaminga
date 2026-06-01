-- Add category column to blog_posts
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS category text;

-- Create resources table
CREATE TABLE IF NOT EXISTS public.resources (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  type text NOT NULL,
  author_or_director text,
  year integer,
  cover_image text,
  external_link text,
  tags text[] DEFAULT '{}'::text[],
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_resources_published ON public.resources (is_published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_resources_slug ON public.resources (slug);
CREATE INDEX IF NOT EXISTS idx_resources_type ON public.resources (type);

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published resources are viewable by everyone"
ON public.resources FOR SELECT
USING (is_published = true);

CREATE POLICY "Admins can view all resources"
ON public.resources FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert resources"
ON public.resources FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update resources"
ON public.resources FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete resources"
ON public.resources FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));