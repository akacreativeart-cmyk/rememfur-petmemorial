DROP POLICY IF EXISTS "Posts viewable when memorial is public or owned" ON public.posts;
CREATE POLICY "Posts viewable when memorial public, owned, or orphan author"
ON public.posts FOR SELECT
USING (
  (memorial_id IS NULL AND author_id = auth.uid())
  OR (memorial_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.memorials m
    WHERE m.id = posts.memorial_id
      AND (m.is_public = true OR m.owner_id = auth.uid())
  ))
);