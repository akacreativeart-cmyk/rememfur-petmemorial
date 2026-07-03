
-- 1. is_hidden columns
ALTER TABLE public.candles ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false;
ALTER TABLE public.post_comments ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false;

-- 2. is_admin on profiles + seed earliest profile
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;
UPDATE public.profiles SET is_admin = true
WHERE id = (SELECT id FROM public.profiles ORDER BY created_at ASC LIMIT 1);

-- Admin check helper
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = _user_id AND is_admin = true) $$;

-- 3. Update SELECT policies to hide hidden rows from non-owner/non-admin
DROP POLICY IF EXISTS "Candles viewable with memorial" ON public.candles;
CREATE POLICY "Candles viewable with memorial" ON public.candles FOR SELECT
USING (
  (is_hidden = false OR public.is_admin(auth.uid()) OR EXISTS (
    SELECT 1 FROM public.memorials m WHERE m.id = candles.memorial_id AND m.owner_id = auth.uid()
  ))
  AND EXISTS (
    SELECT 1 FROM public.memorials m
    WHERE m.id = candles.memorial_id AND (m.is_public = true OR m.owner_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Messages viewable with memorial" ON public.messages;
CREATE POLICY "Messages viewable with memorial" ON public.messages FOR SELECT
USING (
  (is_hidden = false OR public.is_admin(auth.uid()) OR author_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.memorials m WHERE m.id = messages.memorial_id AND m.owner_id = auth.uid()
  ))
  AND EXISTS (
    SELECT 1 FROM public.memorials m
    WHERE m.id = messages.memorial_id AND (m.is_public = true OR m.owner_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Comments viewable when parent memorial is accessible" ON public.post_comments;
CREATE POLICY "Comments viewable when parent memorial is accessible" ON public.post_comments FOR SELECT
USING (
  (is_hidden = false OR public.is_admin(auth.uid()) OR author_id = auth.uid())
  AND (
    author_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.posts p LEFT JOIN public.memorials m ON m.id = p.memorial_id
      WHERE p.id = post_comments.post_id
        AND (p.memorial_id IS NULL OR m.is_public = true OR m.owner_id = auth.uid())
    )
  )
);

-- 4. Tighten anon candle insert (add length limits + is_hidden=false)
DROP POLICY IF EXISTS "Anyone can light a candle on a public memorial" ON public.candles;
CREATE POLICY "Anyone can light a candle on a public memorial" ON public.candles FOR INSERT TO anon
WITH CHECK (
  lit_by IS NULL
  AND is_hidden = false
  AND (message IS NULL OR length(message) <= 180)
  AND (lit_by_name IS NULL OR length(lit_by_name) <= 40)
  AND EXISTS (SELECT 1 FROM public.memorials m WHERE m.id = candles.memorial_id AND m.is_public = true)
);

-- 5. reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL CHECK (content_type IN ('candle','message','post','comment')),
  content_id uuid NOT NULL,
  reason text,
  reporter_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.reports TO authenticated;
GRANT SELECT, INSERT ON public.reports TO anon;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can file a report" ON public.reports FOR INSERT TO anon, authenticated
WITH CHECK (reason IS NULL OR length(reason) <= 500);
CREATE POLICY "Admins read reports" ON public.reports FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

-- 6. rate_limits (server-only)
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id bigserial PRIMARY KEY,
  bucket text NOT NULL,
  client_hash text NOT NULL,
  scope_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup ON public.rate_limits (bucket, client_hash, created_at DESC);
GRANT ALL ON public.rate_limits TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.rate_limits_id_seq TO service_role;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
-- No policies for anon/authenticated → locked by default.

-- 7. Comment notification trigger
CREATE OR REPLACE FUNCTION public.notify_on_comment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE post_author uuid; mem_owner uuid; actor_display text;
BEGIN
  SELECT author_id, memorial_id INTO post_author, mem_owner FROM public.posts WHERE id = NEW.post_id;
  SELECT display_name INTO actor_display FROM public.profiles WHERE id = NEW.author_id;
  IF post_author IS NOT NULL AND post_author <> NEW.author_id THEN
    INSERT INTO public.notifications(recipient_id, actor_id, actor_name, type, memorial_id, post_id, preview)
    VALUES (post_author, NEW.author_id, actor_display, 'comment', mem_owner, NEW.post_id, LEFT(NEW.body, 140));
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_notify_on_comment ON public.post_comments;
CREATE TRIGGER trg_notify_on_comment AFTER INSERT ON public.post_comments
FOR EACH ROW EXECUTE FUNCTION public.notify_on_comment();
