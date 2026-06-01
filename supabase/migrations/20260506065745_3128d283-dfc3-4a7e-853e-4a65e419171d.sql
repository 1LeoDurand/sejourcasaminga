
CREATE OR REPLACE FUNCTION public.admin_merge_places(_source_id uuid, _target_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can merge places';
  END IF;

  IF _source_id = _target_id THEN
    RAISE EXCEPTION 'Source and target must be different';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.places WHERE id = _source_id) THEN
    RAISE EXCEPTION 'Source place not found';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.places WHERE id = _target_id) THEN
    RAISE EXCEPTION 'Target place not found';
  END IF;

  -- Move listings
  UPDATE public.listings SET place_id = _target_id WHERE place_id = _source_id;

  -- Move place_members, avoiding duplicate (place_id, user_id)
  DELETE FROM public.place_members pm_src
  WHERE pm_src.place_id = _source_id
    AND EXISTS (
      SELECT 1 FROM public.place_members pm_tgt
      WHERE pm_tgt.place_id = _target_id AND pm_tgt.user_id = pm_src.user_id
    );
  UPDATE public.place_members SET place_id = _target_id WHERE place_id = _source_id;

  -- Move claim records
  UPDATE public.place_claims SET place_id = _target_id WHERE place_id = _source_id;
  UPDATE public.place_claim_requests SET place_id = _target_id WHERE place_id = _source_id;

  -- Delete the source place
  DELETE FROM public.places WHERE id = _source_id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_merge_places(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_merge_places(uuid, uuid) TO authenticated;
