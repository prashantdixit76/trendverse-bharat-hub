import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { NewsCard } from "@/components/site/NewsCard";
import { formatDate } from "@/lib/slug";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const { data } = await supabase.from("blogs").select("*").eq("slug", params.slug).eq("status", "published").maybeSingle();
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: loaderData.meta_title || `${loaderData.title} — TVB` },
      { name: "description", content: loaderData.meta_description || loaderData.short_description || "" },
      { property: "og:title", content: loaderData.title },
      { property: "og:description", content: loaderData.meta_description || loaderData.short_description || "" },
      ...(loaderData.og_image || loaderData.cover_image ? [{ property: "og:image", content: loaderData.og_image || loaderData.cover_image }] : []),
    ] : [],
  }),
  errorComponent: ({ error }) => <SiteLayout><div className="container mx-auto px-4 py-20 text-center"><p>{error.message}</p></div></SiteLayout>,
  notFoundComponent: () => <SiteLayout><div className="container mx-auto px-4 py-20 text-center"><h1 className="display text-3xl">Blog not found</h1><Link to="/blogs" className="text-brand underline mt-4 inline-block">Back to Blogs</Link></div></SiteLayout>,
  component: BlogSingle,
});

function BlogSingle() {
  const b = Route.useLoaderData() as any;
  const { data: related } = useQuery({
    queryKey: ["related-blogs", b.id],
    queryFn: async () => {
      const { data } = await supabase.from("blogs").select("*").eq("status", "published").neq("id", b.id).order("published_at", { ascending: false }).limit(3);
      return data ?? [];
    },
  });
  const faqs: any[] = Array.isArray(b.faqs) ? b.faqs : [];

  return (
    <SiteLayout>
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <Link to="/blogs" className="text-xs uppercase tracking-widest text-brand">← All Blogs</Link>
        <h1 className="display text-4xl md:text-5xl font-bold mt-3 leading-tight">{b.title}</h1>
        {b.short_description && <p className="text-lg text-muted-foreground mt-4">{b.short_description}</p>}
        <div className="text-sm text-muted-foreground mt-4 border-y border-border py-3">
          {b.author_name && <>By {b.author_name} · </>}{formatDate(b.published_at)}
        </div>
        {b.cover_image && <img src={b.cover_image} alt={b.title} className="w-full rounded-lg my-6" />}
        <div className="prose prose-neutral max-w-none mt-6" dangerouslySetInnerHTML={{ __html: (b.content || "").replace(/\n/g, "<br/>") }} />
        {b.tags?.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {b.tags.map((t: string) => <span key={t} className="text-xs px-3 py-1 bg-secondary rounded-full">#{t}</span>)}
          </div>
        )}
        {faqs.length > 0 && (
          <section className="mt-10 border-t border-border pt-6">
            <h2 className="display text-2xl font-bold mb-4">FAQs</h2>
            <div className="space-y-4">
              {faqs.map((f, i) => (
                <div key={i} className="bg-card border border-border rounded-lg p-4">
                  <h4 className="font-semibold">{f.question}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{f.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}
        {related && related.length > 0 && (
          <section className="mt-10 border-t border-border pt-6">
            <h2 className="display text-2xl font-bold mb-4">Related Blogs</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {related.map((r: any) => <NewsCard key={r.id} item={r} type="blog" />)}
            </div>
          </section>
        )}
      </article>
    </SiteLayout>
  );
}
