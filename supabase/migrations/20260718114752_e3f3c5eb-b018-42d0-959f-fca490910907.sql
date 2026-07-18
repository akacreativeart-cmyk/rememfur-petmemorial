ALTER TABLE public.memorials
  ADD COLUMN IF NOT EXISTS breed text,
  ADD COLUMN IF NOT EXISTS pronouns text,
  ADD COLUMN IF NOT EXISTS nickname text,
  ADD COLUMN IF NOT EXISTS approx_age text,
  ADD COLUMN IF NOT EXISTS location text;