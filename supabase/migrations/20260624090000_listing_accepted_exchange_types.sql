-- Add accepted_exchange_types to listings table.
--
-- This column stores the list of exchange modes the host accepts.
-- A guest can only request a mode that is present in this array.
-- Default is all four modes so existing listings are not broken.
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS accepted_exchange_types text[]
    NOT NULL DEFAULT '{free,reciprocal,points,other}'::text[];

COMMENT ON COLUMN public.listings.accepted_exchange_types IS
  'Exchange modes the host accepts for this listing. '
  'The requesting guest must choose one of these modes. '
  'Defaults to all modes so existing listings remain functional.';
