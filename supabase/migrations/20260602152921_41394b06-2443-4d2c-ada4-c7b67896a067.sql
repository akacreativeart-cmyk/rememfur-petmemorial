-- Allow anonymous visitors to light candles on public memorials
GRANT INSERT ON public.candles TO anon;

CREATE POLICY "Anyone can light a candle on a public memorial"
ON public.candles
FOR INSERT
TO anon
WITH CHECK (
  lit_by IS NULL
  AND EXISTS (
    SELECT 1 FROM public.memorials m
    WHERE m.id = candles.memorial_id AND m.is_public = true
  )
);
