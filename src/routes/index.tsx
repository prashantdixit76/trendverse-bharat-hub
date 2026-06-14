import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { NewsCard } from "@/components/site/NewsCard";
import { AdSlot } from "@/components/site/AdSlot";
import { TrendingTicker } from "@/components/site/TrendingTicker";
import { FeaturedCarousel } from "@/components/site/FeaturedCarousel";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Trend Verse Bharat — Trending News, Blogs & Insights" },
      { name: "description", content: "Stay updated with India's trending news, technology, AI, business, education and in-depth blogs at Trend Verse Bharat." },
      { property: "og:title", content: "Trend Verse Bharat — Trending News" },
      { property: "og:description", content: "India's home for trending news, blogs, and insights." },
    ],
  }),
  component: Home,
});

function useHomeData() {
  return useQuery({
    queryKey: ["home"],
    queryFn: async () => {
      const [featured, latest, trending, blogs, faqs, cats] = await Promise.all([
        supabase.from("news").select("*").eq("status", "published").eq("is_featured", true).order("published_at", { ascending: false }).limit(5),
        supabase.from("news").select("*").eq("status", "published").order("published_at", { ascending: false }).limit(8),
        supabase.from("news").select("*").eq("status", "published").eq("is_trending", true).order("published_at", { ascending: false }).limit(5),
        supabase.from("blogs").select("*").eq("status", "published").order("published_at", { ascending: false }).limit(4),
        supabase.from("faqs").select("*").eq("is_published", true).order("sort_order").limit(6),
        supabase.from("categories").select("*").order("sort_order").limit(8),
      ]);
      return {
        featured: featured.data ?? [],
        latest: latest.data ?? [],
        trending: trending.data ?? [],
        blogs: blogs.data ?? [],
        faqs: faqs.data ?? [],
        categories: cats.data ?? [],
      };
    },
  });
}

function Home() {
  const { data, isLoading } = useHomeData();
  const empty = !isLoading && data && data.latest.length === 0 && data.featured.length === 0;

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-8">
        <AdSlot location="header" />

        {empty && (
          <div className="border border-dashed border-border rounded-xl p-10 text-center bg-card">
            <h2 className="display text-2xl font-bold">Welcome to Trend Verse Bharat</h2>
            <p className="text-muted-foreground mt-2">Fresh stories are on the way. Please check back shortly.</p>
          </div>
        )}

        {data && data.featured.length > 0 && (
          <section className="grid gap-6 lg:grid-cols-3 mb-8">
            <div className="lg:col-span-2">
              <FeaturedCarousel items={data.featured} />
            </div>
            <div className="space-y-1">
              <h3 className="display text-xl font-bold mb-2 border-b-2 border-brand pb-2">Trending</h3>
              {(data.trending.length ? data.trending : data.featured.slice(1)).slice(0, 5).map((n: any) => (
                <NewsCard key={n.id} item={n} variant="compact" />
              ))}
            </div>
          </section>
        )}

        {data && (data.trending.length > 0 || data.latest.length > 0) && (
          <TrendingTicker items={(data.trending.length ? data.trending : data.latest).slice(0, 10)} />
        )}

        {data && data.latest.length > 0 && (
          <section className="mb-12">
            <h2 className="display text-2xl font-bold mb-4 border-b-2 border-brand pb-2">Latest News</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {data.latest.map((n: any) => <NewsCard key={n.id} item={n} />)}
            </div>
          </section>
        )}

        <AdSlot location="in_content" />

        {data && data.categories.length > 0 && (
          <section className="mb-12">
            <h2 className="display text-2xl font-bold mb-4">Browse Categories</h2>
            <div className="flex flex-wrap gap-2">
              {data.categories.map((c: any) => (
                <Link key={c.id} to="/category/$slug" params={{ slug: c.slug }} className="px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium hover:bg-brand hover:text-brand-foreground transition">{c.name}</Link>
              ))}
            </div>
          </section>
        )}

        {data && data.blogs.length > 0 && (
          <section className="mb-12">
            <h2 className="display text-2xl font-bold mb-4 border-b-2 border-brand pb-2">Latest Blogs</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {data.blogs.map((b: any) => <NewsCard key={b.id} item={b} type="blog" />)}
            </div>
          </section>
        )}

        {data && data.faqs.length > 0 && (
          <section className="mb-12">
            <h2 className="display text-2xl font-bold mb-4">Frequently Asked</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {data.faqs.map((f: any) => (
                <div key={f.id} className="bg-card border border-border rounded-lg p-5">
                  <h4 className="font-semibold">{f.question}</h4>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{f.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <AdSlot location="footer" />
      </div>
    </SiteLayout>
  );
}
