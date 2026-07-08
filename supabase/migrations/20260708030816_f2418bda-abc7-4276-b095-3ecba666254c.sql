CREATE TABLE public.beta_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  message text NOT NULL,
  email text,
  page_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.beta_feedback TO anon, authenticated;
GRANT SELECT, DELETE ON public.beta_feedback TO authenticated;
GRANT ALL ON public.beta_feedback TO service_role;

ALTER TABLE public.beta_feedback ENABLE ROW LEVEL SECURITY;

-- Anyone (including guests) can submit feedback
CREATE POLICY "Anyone can submit beta feedback"
ON public.beta_feedback FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admins can read feedback
CREATE POLICY "Admins can read beta feedback"
ON public.beta_feedback FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete beta feedback"
ON public.beta_feedback FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE INDEX beta_feedback_created_at_idx ON public.beta_feedback (created_at DESC);