DROP POLICY IF EXISTS "Staff upload media" ON storage.objects;
DROP POLICY IF EXISTS "Staff update media" ON storage.objects;
DROP POLICY IF EXISTS "Staff delete media" ON storage.objects;

CREATE POLICY "Staff upload media" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'media'
    AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role IN ('admin','editor'))
  );
CREATE POLICY "Staff update media" ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'media'
    AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role IN ('admin','editor'))
  )
  WITH CHECK (
    bucket_id = 'media'
    AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role IN ('admin','editor'))
  );
CREATE POLICY "Staff delete media" ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'media'
    AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role IN ('admin','editor'))
  );