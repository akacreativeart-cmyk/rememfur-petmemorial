ALTER TABLE public.memorials ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
CREATE INDEX IF NOT EXISTS memorials_deleted_at_idx ON public.memorials (deleted_at);