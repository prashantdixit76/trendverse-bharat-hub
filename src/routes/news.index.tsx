import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { NewsCard } from "@/components/site/NewsCard";

export const Route = createFileRoute("/news/")({
  head: () => ({
    meta: [
      { title: "Latest News — Trend Verse Bharat" },
      { name: "description", content: "Latest news and trending stories from across India and the world." },
      { property: "og:title", content: "Latest News — TVB" },
    ],
  }),
  component: NewsList,
});

function NewsList() {
  const { data, isLoading } = useQuery({
    queryKey: ["news-list"],
    queryFn: async () => {
      const { data } = await supabase.from("news").select("*").eq("status", "published").order("published_at", { ascending: false });
      return data ?? [];
    },
  });
  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-10">
        <h1 className="display text-4xl font-bold mb-2">Latest News</h1>
        <p className="text-muted-foreground mb-8">Stay informed with TVB's trending coverage.</p>
        {isLoading && <p className="text-muted-foreground">Loading…</p>}
        {data && data.length === 0 && <p className="text-muted-foreground">No news published yet. Check back soon.</p>}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data?.map((n: any) => <NewsCard key={n.id} item={n} />)}
        </div>
      </div>
    </SiteLayout>
  );
}
