DROP POLICY IF EXISTS "Authors update own posts" ON public.posts;
CREATE POLICY "Authors update own posts" ON public.posts
FOR UPDATE
USING (author_id = auth.uid())
WITH CHECK (
  author_id = auth.uid()
  AND (
    memorial_id IS NULL
    OR EXISTS (
      SELECT 1 FROM public.memorials m
      WHERE m.id = memorial_id
        AND (m.is_public = true OR m.owner_id = auth.uid())
    )
  )
);