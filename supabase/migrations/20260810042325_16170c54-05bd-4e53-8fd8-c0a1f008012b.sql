REVOKE SELECT, UPDATE, INSERT ON public.profiles FROM anon, authenticated;
GRANT SELECT (id, display_name, avatar_url, created_at, updated_at) ON public.profiles TO anon, authenticated;
GRANT INSERT (id, display_name, avatar_url) ON public.profiles TO authenticated;
GRANT UPDATE (display_name, avatar_url, updated_at) ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

CREATE OR REPLACE FUNCTION public.prevent_is_admin_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_admin IS DISTINCT FROM OLD.is_admin AND auth.uid() IS NOT NULL THEN
    RAISE EXCEPTION 'is_admin cannot be changed by users';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.prevent_is_admin_change() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_prevent_is_admin_change ON public.profiles;
CREATE TRIGGER trg_prevent_is_admin_change
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_is_admin_change();

DROP POLICY IF EXISTS "Follows viewable by everyone" ON public.follows;
CREATE POLICY "Users can view their own follow relationships"
ON public.follows FOR SELECT TO authenticated
USING (follower_id = auth.uid() OR following_id = auth.uid());

DROP POLICY IF EXISTS "Posts viewable when memorial public, owned, or orphan author" ON public.posts;
CREATE POLICY "Posts viewable when memorial public, owned, or orphan author"
ON public.posts FOR SELECT
USING (
  ((memorial_id IS NULL) AND (author_id = auth.uid()))
  OR ((memorial_id IS NOT NULL) AND EXISTS (
    SELECT 1 FROM public.memorials m
    WHERE m.id = posts.memorial_id
      AND (((m.is_public = true) AND (m.deleted_at IS NULL)) OR (m.owner_id = auth.uid()))
  ))
);

DROP FUNCTION IF EXISTS public.delete_my_account(boolean);
CREATE OR REPLACE FUNCTION public.delete_user_account(_user_id uuid, _purge_memorials boolean DEFAULT false)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Missing user id';
  END IF;
  IF _purge_memorials THEN
    DELETE FROM public.memorials WHERE owner_id = _user_id;
  ELSE
    UPDATE public.memorials SET owner_id = NULL WHERE owner_id = _user_id;
  END IF;
  DELETE FROM public.journal_entries WHERE author_id = _user_id;
  DELETE FROM public.notifications WHERE recipient_id = _user_id;
  DELETE FROM public.profiles WHERE id = _user_id;
  DELETE FROM auth.users WHERE id = _user_id;
END;
$$;
REVOKE ALL ON FUNCTION public.delete_user_account(uuid, boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user_account(uuid, boolean) TO service_role;