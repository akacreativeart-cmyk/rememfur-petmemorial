DROP POLICY IF EXISTS "Profiles viewable by everyone" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Named profiles are publicly viewable" ON public.profiles FOR SELECT TO anon, authenticated USING (display_name IS NOT NULL AND length(btrim(display_name)) > 0);