
ALTER TABLE public.places ADD COLUMN IF NOT EXISTS year_founded integer;
ALTER TABLE public.places ADD COLUMN IF NOT EXISTS environment_type text;
ALTER TABLE public.places ADD COLUMN IF NOT EXISTS hosting_status text DEFAULT 'no';
ALTER TABLE public.places ADD COLUMN IF NOT EXISTS hosting_style text;
ALTER TABLE public.places ADD COLUMN IF NOT EXISTS hospitality_manager text;
ALTER TABLE public.places ADD COLUMN IF NOT EXISTS participatory_stay boolean DEFAULT false;
