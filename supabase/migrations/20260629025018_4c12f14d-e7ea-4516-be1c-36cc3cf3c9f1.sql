
-- posts INSERT: require memorial be public or owned by author
DROP POLICY IF EXISTS "Users can create their own posts" ON public.posts;
DROP POLICY IF EXISTS "posts_insert_own" ON public.posts;
DROP POLICY IF EXISTS "Authors can insert posts" ON public.posts;

CREATE POLICY "posts_insert_author_and_memorial_visible"
ON public.posts
FOR INSERT
TO authenticated
WITH CHECK (
  author_id = auth.uid()
  AND (
    memorial_id IS NULL
    OR EXISTS (
      SELECT 1 FROM public.memorials m
      WHERE m.id = posts.memorial_id
        AND (m.is_public = true OR m.owner_id = auth.uid())
    )
  )
);

-- post_comments INSERT: parent memorial must be public or owned
DROP POLICY IF EXISTS "Users can create their own comments" ON public.post_comments;
DROP POLICY IF EXISTS "post_comments_insert_own" ON public.post_comments;
DROP POLICY IF EXISTS "Authors can insert comments" ON public.post_comments;

CREATE POLICY "post_comments_insert_author_and_memorial_visible"
ON public.post_comments
FOR INSERT
TO authenticated
WITH CHECK (
  author_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.posts p
    LEFT JOIN public.memorials m ON m.id = p.memorial_id
    WHERE p.id = post_comments.post_id
      AND (
        p.memorial_id IS NULL
        OR m.is_public = true
        OR m.owner_id = auth.uid()
      )
  )
);

-- post_likes SELECT: scope to visible memorials
DROP POLICY IF EXISTS "Likes are viewable by everyone" ON public.post_likes;
DROP POLICY IF EXISTS "post_likes_select_all" ON public.post_likes;
DROP POLICY IF EXISTS "Anyone can view likes" ON public.post_likes;

CREATE POLICY "post_likes_select_visible_memorial"
ON public.post_likes
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.posts p
    LEFT JOIN public.memorials m ON m.id = p.memorial_id
    WHERE p.id = post_likes.post_id
      AND (
        p.memorial_id IS NULL
        OR m.is_public = true
        OR m.owner_id = auth.uid()
      )
  )
);
