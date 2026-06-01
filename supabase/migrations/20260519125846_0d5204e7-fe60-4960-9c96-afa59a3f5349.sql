CREATE TABLE public.blog_post_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  block_type text NOT NULL CHECK (block_type IN ('text','image','video_embed','podcast_embed','quote')),
  sort_order integer NOT NULL DEFAULT 0,
  content_text text,
  media_url text,
  embed_url text,
  caption text,
  metadata_json jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_blog_post_blocks_post_sort ON public.blog_post_blocks(post_id, sort_order);

ALTER TABLE public.blog_post_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Blocks of published posts viewable by everyone"
ON public.blog_post_blocks
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.blog_posts p
    WHERE p.id = blog_post_blocks.post_id
      AND p.is_published = true
      AND p.published_at IS NOT NULL
  )
);

CREATE POLICY "Admins can view all blocks"
ON public.blog_post_blocks
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert blocks"
ON public.blog_post_blocks
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update blocks"
ON public.blog_post_blocks
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete blocks"
ON public.blog_post_blocks
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));