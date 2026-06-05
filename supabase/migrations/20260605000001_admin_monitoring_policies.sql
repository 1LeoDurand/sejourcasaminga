-- Admin monitoring: grant admins read access (and the writes they need) on
-- moderation / operational tables. Uses the existing has_role() helper.
-- Idempotent: safe to replay via the Management API.

-- ── reports ───────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can view all reports" ON public.reports;
CREATE POLICY "Admins can view all reports" ON public.reports
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update reports" ON public.reports;
CREATE POLICY "Admins can update reports" ON public.reports
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

-- ── exchange_requests ───────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can view all exchange requests" ON public.exchange_requests;
CREATE POLICY "Admins can view all exchange requests" ON public.exchange_requests
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- ── point_balances ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can view all balances" ON public.point_balances;
CREATE POLICY "Admins can view all balances" ON public.point_balances
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can insert balances" ON public.point_balances;
CREATE POLICY "Admins can insert balances" ON public.point_balances
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update balances" ON public.point_balances;
CREATE POLICY "Admins can update balances" ON public.point_balances
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

-- ── point_transactions ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.point_transactions;
CREATE POLICY "Admins can view all transactions" ON public.point_transactions
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can insert transactions" ON public.point_transactions;
CREATE POLICY "Admins can insert transactions" ON public.point_transactions
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ── email_send_log ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can view send log" ON public.email_send_log;
CREATE POLICY "Admins can view send log" ON public.email_send_log
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- ── suppressed_emails ───────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can view suppressed emails" ON public.suppressed_emails;
CREATE POLICY "Admins can view suppressed emails" ON public.suppressed_emails
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
