-- RLS policies on profiles, candles, messages and memorial_claims call public.is_admin(auth.uid()).
-- Policy expressions run as the calling role, so anon/authenticated need EXECUTE.
-- The function is SECURITY DEFINER, STABLE, and returns only a boolean -- safe to expose.
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO anon, authenticated;