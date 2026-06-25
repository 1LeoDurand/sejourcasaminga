-- Item [22] Phase A · Member verification foundation (ID document + paid membership -> "Verified" badge).
-- PII-safe by design: identity documents live in a PRIVATE storage bucket; this table stores only a
-- path, never document content. All writes go through controlled SECURITY DEFINER RPCs (a member may
-- submit their own doc; only admins mark payment and approve), mirroring the hardened-RPC pattern used
-- for stays. A member becomes 'verified' only when BOTH the fee is paid AND an admin approves the doc.

-- 1. One verification row per member.
CREATE TABLE IF NOT EXISTS public.member_verification (
  user_id        uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  status         text NOT NULL DEFAULT 'none'
                   CHECK (status IN ('none','pending','verified','rejected')),
  id_doc_path    text,
  submitted_at   timestamptz,
  payment_method text CHECK (payment_method IN ('stripe','transfer')),
  paid_at        timestamptz,
  reviewed_by    uuid REFERENCES auth.users(id),
  reviewed_at    timestamptz,
  review_note    text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_member_verification_status
  ON public.member_verification(status);

ALTER TABLE public.member_verification ENABLE ROW LEVEL SECURITY;

-- Read: a member sees their own row; admins see all. No public read (the row references PII).
DROP POLICY IF EXISTS member_verification_select_own ON public.member_verification;
CREATE POLICY member_verification_select_own
  ON public.member_verification FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));
-- No INSERT/UPDATE/DELETE policies: every write flows through the RPCs below.

-- 2. Member submits an uploaded ID document (path in the private bucket) -> status 'pending'.
CREATE OR REPLACE FUNCTION public.submit_identity_document(_doc_path text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'NOT_AUTHENTICATED';
  END IF;
  INSERT INTO public.member_verification (user_id, id_doc_path, submitted_at, status, updated_at)
  VALUES (auth.uid(), _doc_path, now(), 'pending', now())
  ON CONFLICT (user_id) DO UPDATE
    SET id_doc_path  = EXCLUDED.id_doc_path,
        submitted_at = now(),
        -- never downgrade an already-verified member; otherwise (re)open review
        status       = CASE WHEN public.member_verification.status = 'verified'
                            THEN 'verified' ELSE 'pending' END,
        updated_at   = now();
END;
$$;

-- 3. Admin records the membership fee (manual transfer now; the Stripe webhook will call this in Phase B).
CREATE OR REPLACE FUNCTION public.mark_member_paid(_user_id uuid, _method text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'NOT_ADMIN';
  END IF;
  IF _method NOT IN ('stripe','transfer') THEN
    RAISE EXCEPTION 'INVALID_METHOD';
  END IF;
  INSERT INTO public.member_verification (user_id, payment_method, paid_at, updated_at)
  VALUES (_user_id, _method, now(), now())
  ON CONFLICT (user_id) DO UPDATE
    SET payment_method = EXCLUDED.payment_method,
        paid_at        = now(),
        updated_at     = now();
END;
$$;

-- 4. Admin reviews the document. Approval requires the fee to already be paid.
CREATE OR REPLACE FUNCTION public.review_member_verification(_user_id uuid, _approve boolean, _note text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_paid timestamptz;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'NOT_ADMIN';
  END IF;
  SELECT paid_at INTO v_paid FROM public.member_verification WHERE user_id = _user_id;
  IF _approve AND v_paid IS NULL THEN
    RAISE EXCEPTION 'NOT_PAID';  -- "verified" requires a paid membership
  END IF;
  UPDATE public.member_verification
    SET status      = CASE WHEN _approve THEN 'verified' ELSE 'rejected' END,
        review_note = _note,
        reviewed_by = auth.uid(),
        reviewed_at = now(),
        updated_at  = now()
  WHERE user_id = _user_id;
END;
$$;

-- 5. Public badge check: exposes ONLY the verified boolean (no PII), for profile pages.
--    SECURITY DEFINER is required here so anon can read the badge without a public read policy.
CREATE OR REPLACE FUNCTION public.is_member_verified(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.member_verification
    WHERE user_id = _user_id AND status = 'verified'
  );
$$;

-- Grants. Explicitly revoke from anon as well (defense in depth: these are member/admin-only).
REVOKE EXECUTE ON FUNCTION public.submit_identity_document(text)                  FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.mark_member_paid(uuid, text)                    FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.review_member_verification(uuid, boolean, text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.submit_identity_document(text)                  TO authenticated;
GRANT  EXECUTE ON FUNCTION public.mark_member_paid(uuid, text)                    TO authenticated;
GRANT  EXECUTE ON FUNCTION public.review_member_verification(uuid, boolean, text) TO authenticated;
GRANT  EXECUTE ON FUNCTION public.is_member_verified(uuid)                        TO anon, authenticated;

-- 6. Private bucket for identity documents (never public).
INSERT INTO storage.buckets (id, name, public)
VALUES ('identity-docs', 'identity-docs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: a member reads/writes ONLY their own folder (named by their uid); admins read all.
DROP POLICY IF EXISTS identity_docs_member_insert ON storage.objects;
CREATE POLICY identity_docs_member_insert
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'identity-docs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS identity_docs_member_select ON storage.objects;
CREATE POLICY identity_docs_member_select
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'identity-docs'
    AND ((storage.foldername(name))[1] = auth.uid()::text
         OR public.has_role(auth.uid(), 'admin'::app_role))
  );

DROP POLICY IF EXISTS identity_docs_member_update ON storage.objects;
CREATE POLICY identity_docs_member_update
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'identity-docs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS identity_docs_member_delete ON storage.objects;
CREATE POLICY identity_docs_member_delete
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'identity-docs'
    AND ((storage.foldername(name))[1] = auth.uid()::text
         OR public.has_role(auth.uid(), 'admin'::app_role))
  );
