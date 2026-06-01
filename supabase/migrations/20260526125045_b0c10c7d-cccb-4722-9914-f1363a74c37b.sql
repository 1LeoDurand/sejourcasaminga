
CREATE TABLE public.link_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  started_by UUID,
  status TEXT NOT NULL DEFAULT 'running',
  total_links INT NOT NULL DEFAULT 0,
  critical_count INT NOT NULL DEFAULT 0,
  warning_count INT NOT NULL DEFAULT 0,
  info_count INT NOT NULL DEFAULT 0,
  ok_count INT NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ
);

CREATE TABLE public.link_scan_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES public.link_scans(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  source_page TEXT,
  status_code INT,
  type TEXT NOT NULL,
  severity TEXT NOT NULL,
  redirect_to TEXT,
  error_message TEXT,
  suggestion TEXT,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_link_scan_results_scan ON public.link_scan_results(scan_id);
CREATE INDEX idx_link_scan_results_severity ON public.link_scan_results(severity);

ALTER TABLE public.link_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_scan_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view scans" ON public.link_scans
FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins create scans" ON public.link_scans
FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update scans" ON public.link_scans
FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins view scan results" ON public.link_scan_results
FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins insert scan results" ON public.link_scan_results
FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
