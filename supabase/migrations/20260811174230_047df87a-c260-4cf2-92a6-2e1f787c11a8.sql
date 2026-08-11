-- 1. reports: prevent reporter_id spoofing
DROP POLICY IF EXISTS "Anyone can file a report" ON public.reports;

CREATE POLICY "Anon can file a report"
ON public.reports
FOR INSERT
TO anon
WITH CHECK (
  reporter_id IS NULL
  AND (reason IS NULL OR length(reason) <= 500)
);

CREATE POLICY "Users can file a report as themselves"
ON public.reports
FOR INSERT
TO authenticated
WITH CHECK (
  (reporter_id IS NULL OR reporter_id = auth.uid())
  AND (reason IS NULL OR length(reason) <= 500)
);

-- 2. storage: stop anonymous enumeration/listing of every object in the photo buckets.
-- Public CDN delivery of already-known URLs is unaffected (public buckets bypass RLS there),
-- but the Data API can no longer be used to discover other people's files.
DROP POLICY IF EXISTS "Public read gallery" ON storage.objects;
DROP POLICY IF EXISTS "Public read pet-photos" ON storage.objects;
DROP POLICY IF EXISTS "Public read transformed" ON storage.objects;

CREATE POLICY "Owners read own gallery objects"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'gallery' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Owners read own pet-photos objects"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'pet-photos' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Owners read own transformed objects"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'transformed' AND (auth.uid())::text = (storage.foldername(name))[1]);