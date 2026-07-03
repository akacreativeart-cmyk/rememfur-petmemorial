
INSERT INTO public.memorial_photos (memorial_id, image_url, caption)
SELECT m.id, m.hero_image_url, 'Original photo'
FROM public.memorials m
WHERE m.hero_image_url IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.memorial_photos p
    WHERE p.memorial_id = m.id AND p.image_url = m.hero_image_url
  );

INSERT INTO public.memorial_photos (memorial_id, image_url, caption)
SELECT m.id, m.transformed_image_url, 'Painted portrait'
FROM public.memorials m
WHERE m.transformed_image_url IS NOT NULL
  AND m.transformed_image_url <> COALESCE(m.hero_image_url, '')
  AND NOT EXISTS (
    SELECT 1 FROM public.memorial_photos p
    WHERE p.memorial_id = m.id AND p.image_url = m.transformed_image_url
  );
