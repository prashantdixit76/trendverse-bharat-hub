REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

ALTER POLICY "Staff manage ads" ON public.ad_settings TO authenticated;
ALTER POLICY "Staff manage blogs" ON public.blogs TO authenticated;
ALTER POLICY "Staff manage categories" ON public.categories TO authenticated;
ALTER POLICY "Staff manage faqs" ON public.faqs TO authenticated;
ALTER POLICY "Staff manage media" ON public.media TO authenticated;
ALTER POLICY "Staff manage news" ON public.news TO authenticated;
ALTER POLICY "Staff manage site settings" ON public.site_settings TO authenticated;
ALTER POLICY "Staff manage tags" ON public.tags TO authenticated;

ALTER POLICY "News published public read" ON public.news
  USING (status = 'published'::public.content_status);

ALTER POLICY "Blogs published public read" ON public.blogs
  USING (status = 'published'::public.content_status);

ALTER POLICY "FAQs public read" ON public.faqs
  USING (is_published);