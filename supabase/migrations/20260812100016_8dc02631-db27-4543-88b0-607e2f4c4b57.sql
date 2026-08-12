-- post_images
CREATE TABLE public.post_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  url text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX post_images_post_id_idx ON public.post_images(post_id, position);
GRANT SELECT ON public.post_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.post_images TO authenticated;
GRANT ALL ON public.post_images TO service_role;
ALTER TABLE public.post_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "post images viewable when post viewable"
ON public.post_images FOR SELECT
USING (EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND p.is_hidden = false));

CREATE POLICY "authors manage their post images"
ON public.post_images FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND p.author_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND p.author_id = auth.uid()));

INSERT INTO public.post_images (post_id, url, position)
SELECT id, image_url, 0 FROM public.posts WHERE image_url IS NOT NULL;

-- memory_photos
CREATE TABLE public.memory_photos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  memory_id uuid NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
  url text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX memory_photos_memory_id_idx ON public.memory_photos(memory_id, position);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.memory_photos TO authenticated;
GRANT ALL ON public.memory_photos TO service_role;
ALTER TABLE public.memory_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owners manage their memory photos"
ON public.memory_photos FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.memories m WHERE m.id = memory_id AND m.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.memories m WHERE m.id = memory_id AND m.user_id = auth.uid()));

INSERT INTO public.memory_photos (memory_id, url, position)
SELECT id, photo_url, 0 FROM public.memories WHERE photo_url IS NOT NULL;

-- memorial_claims
CREATE TABLE public.memorial_claims (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  memorial_id uuid NOT NULL REFERENCES public.memorials(id) ON DELETE CASCADE,
  claimant_id uuid NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX memorial_claims_one_pending
  ON public.memorial_claims(memorial_id, claimant_id)
  WHERE status = 'pending';
GRANT SELECT, INSERT ON public.memorial_claims TO authenticated;
GRANT ALL ON public.memorial_claims TO service_role;
ALTER TABLE public.memorial_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users create their own claims"
ON public.memorial_claims FOR INSERT TO authenticated
WITH CHECK (
  claimant_id = auth.uid()
  AND status = 'pending'
  AND EXISTS (SELECT 1 FROM public.memorials m WHERE m.id = memorial_id AND m.owner_id IS NULL AND m.deleted_at IS NULL)
);

CREATE POLICY "users read their own claims"
ON public.memorial_claims FOR SELECT TO authenticated
USING (claimant_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE TRIGGER memorial_claims_set_updated_at
BEFORE UPDATE ON public.memorial_claims
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.review_memorial_claim(_claim_id uuid, _approve boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE c public.memorial_claims;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  SELECT * INTO c FROM public.memorial_claims WHERE id = _claim_id AND status = 'pending';
  IF c.id IS NULL THEN
    RAISE EXCEPTION 'Claim not found or already reviewed';
  END IF;

  UPDATE public.memorial_claims
     SET status = CASE WHEN _approve THEN 'approved' ELSE 'rejected' END,
         reviewed_by = auth.uid(),
         reviewed_at = now()
   WHERE id = _claim_id;

  IF _approve THEN
    UPDATE public.memorials SET owner_id = c.claimant_id WHERE id = c.memorial_id AND owner_id IS NULL;
  END IF;

  INSERT INTO public.notifications (recipient_id, type, memorial_id, preview)
  VALUES (
    c.claimant_id,
    'claim',
    c.memorial_id,
    CASE WHEN _approve THEN 'Your claim was approved — this memorial is now yours to keep.'
         ELSE 'Your claim was not approved.' END
  );
END;
$$;

REVOKE ALL ON FUNCTION public.review_memorial_claim(uuid, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.review_memorial_claim(uuid, boolean) TO authenticated;