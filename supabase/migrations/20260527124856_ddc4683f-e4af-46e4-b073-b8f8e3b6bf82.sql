-- Replace overly permissive SELECT policy on post_comments
DROP POLICY IF EXISTS "Comments viewable by everyone" ON public.post_comments;

CREATE POLICY "Comments viewable when parent memorial is accessible"
ON public.post_comments
FOR SELECT
USING (
  author_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.posts p
    LEFT JOIN public.memorials m ON m.id = p.memorial_id
    WHERE p.id = post_comments.post_id
      AND (
        p.memorial_id IS NULL
        OR m.is_public = true
        OR m.owner_id = auth.uid()
      )
  )
);