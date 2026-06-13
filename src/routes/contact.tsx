import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — Trend Verse Bharat" }] }),
  component: Contact,
});

function Contact() {
  const { data } = useQuery({
    queryKey: ["page", "contact-info"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("key,value").in("key", ["general", "pages"]);
      const map: Record<string, any> = {};
      data?.forEach((r) => (map[r.key] = r.value));
      return map;
    },
  });
  const g = data?.general ?? {};
  const body = data?.pages?.contact || "";
  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <h1 className="display text-4xl font-bold mb-4">Contact Us</h1>
        {g.contact_email && <p className="mb-4">Email: <a className="text-brand" href={`mailto:${g.contact_email}`}>{g.contact_email}</a></p>}
        <div className="prose max-w-none whitespace-pre-wrap text-foreground">{body || "Reach out to us via email — set your contact details in the admin panel."}</div>
      </div>
    </SiteLayout>
  );
}
