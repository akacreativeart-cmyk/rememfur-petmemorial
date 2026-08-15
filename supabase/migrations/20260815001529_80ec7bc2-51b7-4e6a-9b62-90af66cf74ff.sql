CREATE TABLE public.memorial_flowers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  memorial_id uuid NOT NULL REFERENCES public.memorials(id) ON DELETE CASCADE,
  left_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  left_by_name text,
  flower text NOT NULL DEFAULT 'rose',
  message text,
  is_hidden boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX memorial_flowers_memorial_idx ON public.memorial_flowers (memorial_id, created_at DESC);

GRANT SELECT, INSERT, DELETE ON public.memorial_flowers TO authenticated;
GRANT SELECT ON public.memorial_flowers TO anon;
GRANT ALL ON public.memorial_flowers TO service_role;

ALTER TABLE public.memorial_flowers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Flowers on public memorials are viewable"
ON public.memorial_flowers FOR SELECT
USING (
  is_hidden = false
  AND EXISTS (
    SELECT 1 FROM public.memorials m
    WHERE m.id = memorial_id
      AND m.deleted_at IS NULL
      AND (m.is_public = true OR m.owner_id = auth.uid())
  )
);

CREATE POLICY "Signed-in users can leave flowers"
ON public.memorial_flowers FOR INSERT TO authenticated
WITH CHECK (
  left_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.memorials m
    WHERE m.id = memorial_id AND m.deleted_at IS NULL AND (m.is_public = true OR m.owner_id = auth.uid())
  )
);

CREATE POLICY "Users can remove their own flowers"
ON public.memorial_flowers FOR DELETE TO authenticated
USING (left_by = auth.uid());