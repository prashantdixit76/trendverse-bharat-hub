import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/disclaimer")({
  head: () => ({ meta: [{ title: "Disclaimer — Trend Verse Bharat" }] }),
  component: Page,
});

function Page() {
  const { data } = useQuery({
    queryKey: ["page", "disclaimer"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("value").eq("key", "pages").maybeSingle();
      return (data?.value as any)?.disclaimer || "";
    },
  });
  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <h1 className="display text-4xl font-bold mb-6">Disclaimer</h1>
        <div className="prose max-w-none whitespace-pre-wrap text-foreground">{data || "Add your disclaimer from the admin panel → Settings → Pages."}</div>
      </div>
    </SiteLayout>
  );
}
