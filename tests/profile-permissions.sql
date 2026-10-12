-- Regression: signed-in members can edit only their own public profile,
-- and cannot change the protected administrator flag. All writes roll back.
BEGIN;
SELECT set_config('request.jwt.claim.sub', 'd3ec5ed5-44ce-40c4-a90a-d8d63e8ff1f0', true);
SET LOCAL ROLE authenticated;
DO $$
DECLARE affected integer;
BEGIN
  UPDATE public.profiles SET display_name = display_name WHERE id = auth.uid();
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'Own profile update failed'; END IF;

  UPDATE public.profiles SET display_name = display_name WHERE id <> auth.uid();
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 0 THEN RAISE EXCEPTION 'Another profile was editable'; END IF;

  BEGIN
    UPDATE public.profiles SET is_admin = NOT is_admin WHERE id = auth.uid();
    RAISE EXCEPTION 'Administrator flag was editable';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;
END $$;
ROLLBACK;