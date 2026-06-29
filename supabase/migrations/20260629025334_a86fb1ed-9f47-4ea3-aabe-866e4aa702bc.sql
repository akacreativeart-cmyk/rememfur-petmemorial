
DROP POLICY IF EXISTS "Authenticated users insert own posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can comment" ON public.post_comments;
DROP POLICY IF EXISTS "Likes viewable by everyone" ON public.post_likes;
