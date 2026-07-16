CREATE TABLE public.beta_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  note TEXT,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX beta_invites_email_lower_idx ON public.beta_invites (lower(email));

GRANT SELECT, INSERT ON public.beta_invites TO anon;
GRANT SELECT, INSERT ON public.beta_invites TO authenticated;
GRANT ALL ON public.beta_invites TO service_role;

ALTER TABLE public.beta_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can request an invite"
  ON public.beta_invites FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view invites"
  ON public.beta_invites FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));