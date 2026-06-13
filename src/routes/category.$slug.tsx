import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { NewsCard } from "@/components/site/NewsCard";

export const Route = createFileRoute("/category/$slug")({
  loader: async ({ params }) => {
    const { data } = await supabase.from("categories").select("*").eq("slug", params.slug).maybeSingle();
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [] };
    const meta: any[] = [
      { title: `${loaderData.name} — Trend Verse Bharat` },
      { name: "description", content: loaderData.description || `${loaderData.name} news and blogs on TVB.` },
    ];
    return { meta };
  },
  notFoundComponent: () => <SiteLayout><div className="container mx-auto px-4 py-20 text-center"><h1 className="display text-3xl">Category not found</h1></div></SiteLayout>,
  component: CategoryPage,
});

function CategoryPage() {
  const cat = Route.useLoaderData() as any;
  const { data } = useQuery({
    queryKey: ["category-content", cat.id],
    queryFn: async () => {
      const [news, blogs] = await Promise.all([
        supabase.from("news").select("*").eq("status", "published").eq("category_id", cat.id).order("published_at", { ascending: false }),
        supabase.from("blogs").select("*").eq("status", "published").eq("category_id", cat.id).order("published_at", { ascending: false }),
      ]);
      return { news: news.data ?? [], blogs: blogs.data ?? [] };
    },
  });
  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-10">
        <h1 className="display text-4xl font-bold">{cat.name}</h1>
        {cat.description && <p className="text-muted-foreground mt-2">{cat.description}</p>}
        {data?.news.length === 0 && data?.blogs.length === 0 && <p className="text-muted-foreground mt-8">No content in this category yet.</p>}
        {data && data.news.length > 0 && (
          <section className="mt-8">
            <h2 className="display text-2xl font-bold mb-4 border-b-2 border-brand pb-2">News</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{data.news.map((n: any) => <NewsCard key={n.id} item={n} />)}</div>
          </section>
        )}
        {data && data.blogs.length > 0 && (
          <section className="mt-10">
            <h2 className="display text-2xl font-bold mb-4 border-b-2 border-brand pb-2">Blogs</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{data.blogs.map((b: any) => <NewsCard key={b.id} item={b} type="blog" />)}</div>
          </section>
        )}
      </div>
    </SiteLayout>
  );
}
