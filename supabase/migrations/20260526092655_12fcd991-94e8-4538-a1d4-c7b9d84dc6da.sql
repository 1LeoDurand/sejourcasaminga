
ALTER TABLE public.exchange_requests
  ADD COLUMN IF NOT EXISTS exchange_type TEXT NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS accepted_terms BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS update_exchange_requests_updated_at ON public.exchange_requests;
CREATE TRIGGER update_exchange_requests_updated_at
BEFORE UPDATE ON public.exchange_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
