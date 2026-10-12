ALTER POLICY "Users can update own profile" ON public.profiles
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
-- The existing trg_prevent_is_admin_change trigger still rejects every
-- authenticated attempt to change is_admin. Do not expose the admin helper.
