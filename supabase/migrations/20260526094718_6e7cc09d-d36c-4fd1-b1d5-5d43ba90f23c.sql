
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email_settings jsonb NOT NULL DEFAULT
    '{"weekly_digest": true, "frequency": "weekly", "preferred_day": 1}'::jsonb,
  ADD COLUMN IF NOT EXISTS weekly_digest_last_sent_at timestamptz;

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove prior schedule if exists
DO $$
BEGIN
  PERFORM cron.unschedule('weekly-digest-monday-10');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'weekly-digest-monday-10',
  '0 10 * * 1',
  $$
  select net.http_post(
    url := 'https://ahqbmqqgsqkorwttkona.supabase.co/functions/v1/send-weekly-digest',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFocWJtcXFnc3Frb3J3dHRrb25hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMTA4MDMsImV4cCI6MjA5MTU4NjgwM30.eM8ytKhWOO0_TmfQLlAsn4XmI9k6UnJWh3-3dEZfPgg'
    ),
    body := jsonb_build_object('triggered_at', now())
  );
  $$
);
