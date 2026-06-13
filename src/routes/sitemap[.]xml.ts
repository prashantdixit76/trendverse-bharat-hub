import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

const BASE_URL = "";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const [news, blogs, cats] = await Promise.all([
          supabase.from("news").select("slug,updated_at").eq("status", "published"),
          supabase.from("blogs").select("slug,updated_at").eq("status", "published"),
          supabase.from("categories").select("slug,updated_at"),
        ]);
        const entries: { path: string; lastmod?: string }[] = [
          { path: "/" }, { path: "/news" }, { path: "/blogs" }, { path: "/faqs" },
          { path: "/about" }, { path: "/contact" }, { path: "/privacy-policy" }, { path: "/disclaimer" },
        ];
        news.data?.forEach((n) => entries.push({ path: `/news/${n.slug}`, lastmod: n.updated_at }));
        blogs.data?.forEach((b) => entries.push({ path: `/blog/${b.slug}`, lastmod: b.updated_at }));
        cats.data?.forEach((c) => entries.push({ path: `/category/${c.slug}`, lastmod: c.updated_at }));
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.map((e) => `  <url><loc>${BASE_URL}${e.path}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ""}</url>`).join("\n")}\n</urlset>`;
        return new Response(xml, { headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" } });
      },
    },
  },
});
