DROP POLICY IF EXISTS "Anyone can record a view" ON public.page_views;

CREATE POLICY "Anyone can record a content view" ON public.page_views FOR INSERT TO anon, authenticated
  WITH CHECK (
    content_type IN ('news', 'blog', 'blogs', 'article', 'page')
    AND content_id IS NOT NULL
    AND viewed_at <= (now() + interval '5 minutes')
  );