
-- 1. Delete-account helper: preserve or purge user's memorials
CREATE OR REPLACE FUNCTION public.delete_my_account(_purge_memorials BOOLEAN DEFAULT FALSE)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF _purge_memorials THEN
    DELETE FROM public.memorials WHERE owner_id = uid;
  ELSE
    -- Preserve memorials: detach ownership so the memorial page continues to exist
    UPDATE public.memorials SET owner_id = NULL WHERE owner_id = uid;
  END IF;

  -- Best-effort clean of the user's own author-owned content
  DELETE FROM public.journal_entries WHERE author_id = uid;
  DELETE FROM public.notifications WHERE recipient_id = uid;
  DELETE FROM public.profiles WHERE id = uid;

  -- Finally remove the auth user (cascades sessions/identities)
  DELETE FROM auth.users WHERE id = uid;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_my_account(BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_my_account(BOOLEAN) TO authenticated;

-- 2. Allow owner_id to be NULL so preserved memorials can be re-parented to nobody.
ALTER TABLE public.memorials ALTER COLUMN owner_id DROP NOT NULL;

-- 3. Allow owner-side photo deletes explicitly (already granted, but ensure SELECT for owner listing on private too)
DROP POLICY IF EXISTS "Owners view their own memorial photos" ON public.memorial_photos;
CREATE POLICY "Owners view their own memorial photos"
ON public.memorial_photos FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.memorials m
    WHERE m.id = memorial_photos.memorial_id AND m.owner_id = auth.uid()
  )
);
