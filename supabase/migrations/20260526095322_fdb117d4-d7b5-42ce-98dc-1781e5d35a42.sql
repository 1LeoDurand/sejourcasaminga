
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  event_type TEXT NOT NULL,
  page TEXT,
  reference_id UUID,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON public.analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_ref ON public.analytics_events(reference_id);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert analytics events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all analytics events"
  ON public.analytics_events FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Public stats aggregator
CREATE OR REPLACE FUNCTION public.get_public_stats()
RETURNS JSONB
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_habitats INT;
  v_members INT;
  v_stays INT;
  v_new_year INT;
  v_total_year INT;
  v_growth NUMERIC;
BEGIN
  SELECT COUNT(*) INTO v_habitats FROM public.places WHERE published = true AND is_visible = true;
  SELECT COUNT(*) INTO v_members FROM public.profiles;
  SELECT COUNT(*) INTO v_stays FROM public.exchange_requests WHERE status IN ('completed','accepted','confirmed');
  SELECT COUNT(*) INTO v_new_year FROM public.places WHERE created_at > now() - interval '365 days';
  SELECT GREATEST(COUNT(*),1) INTO v_total_year FROM public.places WHERE created_at <= now() - interval '365 days';
  v_growth := ROUND((v_new_year::numeric / v_total_year::numeric) * 100, 0);

  RETURN jsonb_build_object(
    'habitats', v_habitats,
    'members', v_members,
    'stays', v_stays,
    'growth_pct', v_growth
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_popular_places(_days INT DEFAULT 30, _limit INT DEFAULT 10)
RETURNS TABLE(place_id UUID, name TEXT, region TEXT, image TEXT, view_count BIGINT, favorite_count BIGINT)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  WITH views AS (
    SELECT reference_id AS pid, COUNT(*) AS c
    FROM public.analytics_events
    WHERE event_type = 'page_view'
      AND page = 'habitat_detail'
      AND created_at > now() - (_days || ' days')::interval
      AND reference_id IS NOT NULL
    GROUP BY reference_id
  ),
  favs AS (
    SELECT l.place_id AS pid, COUNT(*) AS c
    FROM public.favorites f
    JOIN public.listings l ON l.id = f.listing_id
    WHERE f.created_at > now() - (_days || ' days')::interval
    GROUP BY l.place_id
  )
  SELECT p.id, p.name, p.region, p.image,
         COALESCE(v.c, 0) AS view_count,
         COALESCE(fa.c, 0) AS favorite_count
  FROM public.places p
  LEFT JOIN views v ON v.pid = p.id
  LEFT JOIN favs fa ON fa.pid = p.id
  WHERE p.published = true AND p.is_visible = true
    AND (COALESCE(v.c,0) + COALESCE(fa.c,0)) > 0
  ORDER BY (COALESCE(v.c,0) + COALESCE(fa.c,0) * 2) DESC
  LIMIT _limit;
$$;

CREATE OR REPLACE FUNCTION public.get_value_search_stats()
RETURNS TABLE(value TEXT, count BIGINT)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT unnest(preferred_values) AS value, COUNT(*) AS count
  FROM public.user_preferences
  GROUP BY value
  ORDER BY count DESC
  LIMIT 10;
$$;

CREATE OR REPLACE FUNCTION public.get_region_distribution()
RETURNS TABLE(region TEXT, count BIGINT)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(region, 'Inconnu') AS region, COUNT(*) AS count
  FROM public.places
  WHERE published = true AND is_visible = true
  GROUP BY region
  ORDER BY count DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_stats() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_popular_places(INT, INT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_value_search_stats() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_region_distribution() TO anon, authenticated;
