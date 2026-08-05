-- 1) Prevent self-escalation to admin via profiles UPDATE
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND is_admin = public.is_admin(auth.uid()));

-- 2) Soft-deleted memorials must not be readable by non-owners
DROP POLICY IF EXISTS "Public memorials viewable by everyone" ON public.memorials;
CREATE POLICY "Public memorials viewable by everyone"
ON public.memorials FOR SELECT
USING (
  (is_public = true AND deleted_at IS NULL)
  OR (auth.uid() IS NOT NULL AND auth.uid() = owner_id)
);

DROP POLICY IF EXISTS "Photos viewable when memorial is" ON public.memorial_photos;
CREATE POLICY "Photos viewable when memorial is"
ON public.memorial_photos FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.memorials m
  WHERE m.id = memorial_photos.memorial_id
    AND ((m.is_public = true AND m.deleted_at IS NULL) OR m.owner_id = auth.uid())
));

DROP POLICY IF EXISTS "Candles viewable with memorial" ON public.candles;
CREATE POLICY "Candles viewable with memorial"
ON public.candles FOR SELECT
USING (
  (
    is_hidden = false
    OR public.is_admin(auth.uid())
    OR EXISTS (SELECT 1 FROM public.memorials m WHERE m.id = candles.memorial_id AND m.owner_id = auth.uid())
  )
  AND EXISTS (
    SELECT 1 FROM public.memorials m
    WHERE m.id = candles.memorial_id
      AND ((m.is_public = true AND m.deleted_at IS NULL) OR m.owner_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Messages viewable with memorial" ON public.messages;
CREATE POLICY "Messages viewable with memorial"
ON public.messages FOR SELECT
USING (
  (
    is_hidden = false
    OR public.is_admin(auth.uid())
    OR author_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.memorials m WHERE m.id = messages.memorial_id AND m.owner_id = auth.uid())
  )
  AND EXISTS (
    SELECT 1 FROM public.memorials m
    WHERE m.id = messages.memorial_id
      AND ((m.is_public = true AND m.deleted_at IS NULL) OR m.owner_id = auth.uid())
  )
);

-- 3) Replace always-true INSERT policies with validated ones
DROP POLICY IF EXISTS "Anyone can submit beta feedback" ON public.beta_feedback;
CREATE POLICY "Anyone can submit beta feedback"
ON public.beta_feedback FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(btrim(message)) BETWEEN 1 AND 2000
  AND (email IS NULL OR (length(email) <= 254 AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'))
  AND (page_path IS NULL OR length(page_path) <= 300)
  AND (user_id IS NULL OR user_id = auth.uid())
);

DROP POLICY IF EXISTS "Anyone can request an invite" ON public.beta_invites;
CREATE POLICY "Anyone can request an invite"
ON public.beta_invites FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(email) <= 254
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND (note IS NULL OR length(note) <= 1000)
  AND (source IS NULL OR length(source) <= 80)
);

-- 4) Lock down SECURITY DEFINER function execution
REVOKE ALL ON FUNCTION public.notify_on_comment() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_on_candle() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_on_message() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.delete_my_account(boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_my_account(boolean) TO authenticated;