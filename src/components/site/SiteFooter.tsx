import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function SiteFooter() {
  const { data: settings } = useQuery({
    queryKey: ["site-settings", "footer"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("key,value").in("key", ["general", "social"]);
      const map: Record<string, any> = {};
      data?.forEach((r) => (map[r.key] = r.value));
      return map;
    },
  });
  const g = settings?.general ?? {};
  const s = settings?.social ?? {};
  return (
    <footer className="border-t border-border bg-card mt-16">
      <div className="container mx-auto px-4 py-12 grid gap-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <h3 className="display text-2xl font-bold">{g.site_name || "Trend Verse Bharat"}</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">{g.tagline || "Trending News, Blogs & Insights"}</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/news" className="hover:text-brand">News</Link></li>
            <li><Link to="/blogs" className="hover:text-brand">Blogs</Link></li>
            <li><Link to="/faqs" className="hover:text-brand">FAQs</Link></li>
            <li><Link to="/about" className="hover:text-brand">About</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/privacy-policy" className="hover:text-brand">Privacy Policy</Link></li>
            <li><Link to="/disclaimer" className="hover:text-brand">Disclaimer</Link></li>
            <li><Link to="/contact" className="hover:text-brand">Contact</Link></li>
            <li><Link to="/admin" className="hover:text-brand text-muted-foreground">Admin</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-4 text-xs text-muted-foreground flex flex-wrap justify-between gap-2">
          <span>{g.footer_text || "© Trend Verse Bharat. All rights reserved."}</span>
          <span className="flex gap-3">
            {s.twitter && <a href={s.twitter} className="hover:text-brand">Twitter</a>}
            {s.facebook && <a href={s.facebook} className="hover:text-brand">Facebook</a>}
            {s.instagram && <a href={s.instagram} className="hover:text-brand">Instagram</a>}
            {s.youtube && <a href={s.youtube} className="hover:text-brand">YouTube</a>}
          </span>
        </div>
      </div>
    </footer>
  );
}
