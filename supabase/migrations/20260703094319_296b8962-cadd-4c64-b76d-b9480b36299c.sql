
CREATE TABLE IF NOT EXISTS public.marketplace_waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  item_name TEXT NOT NULL,
  section TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (email, item_name)
);

GRANT SELECT, INSERT ON public.marketplace_waitlist TO authenticated;
GRANT ALL ON public.marketplace_waitlist TO service_role;

ALTER TABLE public.marketplace_waitlist ENABLE ROW LEVEL SECURITY;

-- No direct client access; writes go through service_role in a server fn.
CREATE POLICY "Admins can read waitlist"
  ON public.marketplace_waitlist FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));
