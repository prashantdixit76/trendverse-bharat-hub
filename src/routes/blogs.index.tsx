import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { NewsCard } from "@/components/site/NewsCard";

export const Route = createFileRoute("/blogs/")({
  head: () => ({
    meta: [
      { title: "Blogs — Trend Verse Bharat" },
      { name: "description", content: "In-depth blogs, opinions, and analysis from Trend Verse Bharat." },
    ],
  }),
  component: BlogsList,
});

function BlogsList() {
  const { data, isLoading } = useQuery({
    queryKey: ["blogs-list"],
    queryFn: async () => {
      const { data } = await supabase.from("blogs").select("*").eq("status", "published").order("published_at", { ascending: false });
      return data ?? [];
    },
  });
  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-10">
        <h1 className="display text-4xl font-bold mb-2">Blogs</h1>
        <p className="text-muted-foreground mb-8">Deep dives, opinions, and stories worth reading.</p>
        {isLoading && <p className="text-muted-foreground">Loading…</p>}
        {data && data.length === 0 && <p className="text-muted-foreground">No blogs published yet.</p>}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data?.map((b: any) => <NewsCard key={b.id} item={b} type="blog" />)}
        </div>
      </div>
    </SiteLayout>
  );
}
