DROP POLICY IF EXISTS "Staff manage ads" ON public.ad_settings;
DROP POLICY IF EXISTS "Staff manage blogs" ON public.blogs;
DROP POLICY IF EXISTS "Staff manage categories" ON public.categories;
DROP POLICY IF EXISTS "Staff manage faqs" ON public.faqs;
DROP POLICY IF EXISTS "Staff manage media" ON public.media;
DROP POLICY IF EXISTS "Staff manage news" ON public.news;
DROP POLICY IF EXISTS "Staff manage site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Staff manage tags" ON public.tags;
DROP POLICY IF EXISTS "Staff can read views" ON public.page_views;
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;

CREATE POLICY "Staff manage ads" ON public.ad_settings FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role IN ('admin','editor')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role IN ('admin','editor')));
CREATE POLICY "Staff manage blogs" ON public.blogs FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role IN ('admin','editor')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role IN ('admin','editor')));
CREATE POLICY "Staff manage categories" ON public.categories FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role IN ('admin','editor')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role IN ('admin','editor')));
CREATE POLICY "Staff manage faqs" ON public.faqs FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role IN ('admin','editor')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role IN ('admin','editor')));
CREATE POLICY "Staff manage media" ON public.media FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role IN ('admin','editor')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role IN ('admin','editor')));
CREATE POLICY "Staff manage news" ON public.news FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role IN ('admin','editor')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role IN ('admin','editor')));
CREATE POLICY "Staff manage site settings" ON public.site_settings FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role IN ('admin','editor')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role IN ('admin','editor')));
CREATE POLICY "Staff manage tags" ON public.tags FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role IN ('admin','editor')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role IN ('admin','editor')));
CREATE POLICY "Staff can read views" ON public.page_views FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role IN ('admin','editor')));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin'));

REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;