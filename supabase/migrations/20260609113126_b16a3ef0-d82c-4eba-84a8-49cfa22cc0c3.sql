
DROP POLICY IF EXISTS "Posts viewable by everyone" ON public.posts;
CREATE POLICY "Posts viewable when memorial is public or owned"
ON public.posts FOR SELECT
USING (
  memorial_id IS NULL
  OR EXISTS (
    SELECT 1 FROM public.memorials m
    WHERE m.id = posts.memorial_id
      AND (m.is_public = true OR m.owner_id = auth.uid())
  )
);

CREATE POLICY "Owner delete transformed"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'transformed' AND (auth.uid())::text = (storage.foldername(name))[1]);
