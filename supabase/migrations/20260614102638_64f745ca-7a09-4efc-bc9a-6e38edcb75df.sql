
GRANT SELECT ON public.news TO anon, authenticated;
GRANT SELECT ON public.blogs TO anon, authenticated;
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT SELECT ON public.tags TO anon, authenticated;
GRANT SELECT ON public.faqs TO anon, authenticated;
GRANT SELECT ON public.media TO anon, authenticated;
GRANT SELECT ON public.ad_settings TO anon, authenticated;
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT SELECT ON public.profiles TO anon, authenticated;

GRANT INSERT, UPDATE, DELETE ON public.news TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.blogs TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.tags TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.faqs TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.media TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.ad_settings TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT INSERT, UPDATE ON public.profiles TO authenticated;

GRANT INSERT ON public.page_views TO anon, authenticated;
GRANT SELECT ON public.page_views TO authenticated;

GRANT SELECT ON public.user_roles TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
