import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";

function makeStaticPage(slug: "about" | "contact" | "privacy" | "disclaimer", title: string, fallback: string) {
  return function Page() {
    const { data } = useQuery({
      queryKey: ["page", slug],
      queryFn: async () => {
        const { data } = await supabase.from("site_settings").select("value").eq("key", "pages").maybeSingle();
        return (data?.value as any)?.[slug] || "";
      },
    });
    return (
      <SiteLayout>
        <div className="container mx-auto px-4 py-10 max-w-3xl">
          <h1 className="display text-4xl font-bold mb-6">{title}</h1>
          <div className="prose max-w-none whitespace-pre-wrap text-foreground">{data || fallback}</div>
        </div>
      </SiteLayout>
    );
  };
}

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About Us — Trend Verse Bharat" }, { name: "description", content: "About Trend Verse Bharat (TVB)." }] }),
  component: makeStaticPage("about", "About Us", "Trend Verse Bharat (TVB) is India's home for trending news, blogs and insights. Edit this page from the admin panel."),
});
