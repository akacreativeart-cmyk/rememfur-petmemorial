ALTER TABLE public.memorials
  ADD COLUMN IF NOT EXISTS breed text NULL,
  ADD COLUMN IF NOT EXISTS nickname text NULL,
  ADD COLUMN IF NOT EXISTS pronouns text NULL,
  ADD COLUMN IF NOT EXISTS approx_age text NULL,
  ADD COLUMN IF NOT EXISTS location_city text NULL;