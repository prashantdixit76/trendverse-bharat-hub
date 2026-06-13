import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { NewsCard } from "@/components/site/NewsCard";
import { AdSlot } from "@/components/site/AdSlot";
import { formatDate } from "@/lib/slug";

export const Route = createFileRoute("/news/$slug")({
  loader: async ({ params }) => {
    const { data } = await supabase.from("news").select("*").eq("slug", params.slug).eq("status", "published").maybeSingle();
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [] };
    const desc = loaderData.meta_description || loaderData.short_description || "";
    const img = loaderData.og_image || loaderData.featured_image || "";
    const meta: any[] = [
      { title: loaderData.meta_title || `${loaderData.title} — TVB` },
      { name: "description", content: desc },
      { property: "og:title", content: loaderData.meta_title || String(loaderData.title) },
      { property: "og:description", content: desc },
      { property: "og:type", content: "article" },
    ];
    if (img) meta.push({ property: "og:image", content: img });
    const links: any[] = loaderData.canonical_url ? [{ rel: "canonical", href: loaderData.canonical_url }] : [];
    return { meta, links };
  },
  errorComponent: ({ error }) => <SiteLayout><div className="container mx-auto px-4 py-20 text-center"><p>{error.message}</p></div></SiteLayout>,
  notFoundComponent: () => <SiteLayout><div className="container mx-auto px-4 py-20 text-center"><h1 className="display text-3xl">Story not found</h1><Link to="/news" className="text-brand underline mt-4 inline-block">Back to News</Link></div></SiteLayout>,
  component: NewsSingle,
});

function NewsSingle() {
  const n = Route.useLoaderData() as any;
  const { data: related } = useQuery({
    queryKey: ["related-news", n.id, n.category_id],
    queryFn: async () => {
      const { data } = await supabase.from("news").select("*").eq("status", "published").neq("id", n.id).eq("category_id", n.category_id).order("published_at", { ascending: false }).limit(3);
      return data ?? [];
    },
  });
  const refs: any[] = Array.isArray(n.source_references) ? n.source_references : [];
  const faqs: any[] = Array.isArray(n.faqs) ? n.faqs : [];

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: n.title,
    image: n.featured_image ? [n.featured_image] : undefined,
    datePublished: n.published_at,
    dateModified: n.updated_at,
    author: n.author_name ? { "@type": "Person", name: n.author_name } : undefined,
    description: n.short_description,
  };

  return (
    <SiteLayout>
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <Link to="/news" className="text-xs uppercase tracking-widest text-brand">← All News</Link>
        <h1 className="display text-4xl md:text-5xl font-bold mt-3 leading-tight">{n.title}</h1>
        {n.short_description && <p className="text-lg text-muted-foreground mt-4">{n.short_description}</p>}
        <div className="text-sm text-muted-foreground mt-4 flex flex-wrap gap-3 border-y border-border py-3">
          {n.author_name && <span>By {n.author_name}</span>}
          <span>· Published {formatDate(n.published_at)}</span>
          {n.updated_at && n.updated_at !== n.published_at && <span>· Updated {formatDate(n.updated_at)}</span>}
        </div>
        {n.featured_image && <img src={n.featured_image} alt={n.title} className="w-full rounded-lg my-6" />}
        <AdSlot location="in_content" />
        <div className="prose prose-neutral max-w-none mt-6" dangerouslySetInnerHTML={{ __html: (n.content || "").replace(/\n/g, "<br/>") }} />

        {n.tags?.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {n.tags.map((t: string) => <span key={t} className="text-xs px-3 py-1 bg-secondary rounded-full">#{t}</span>)}
          </div>
        )}

        <div className="mt-8 flex gap-3 text-sm">
          <span className="font-semibold">Share:</span>
          <a className="hover:text-brand" target="_blank" rel="noopener noreferrer" href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}&text=${encodeURIComponent(n.title)}`}>Twitter</a>
          <a className="hover:text-brand" target="_blank" rel="noopener noreferrer" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}>Facebook</a>
          <a className="hover:text-brand" target="_blank" rel="noopener noreferrer" href={`https://api.whatsapp.com/send?text=${encodeURIComponent(n.title + " " + (typeof window !== "undefined" ? window.location.href : ""))}`}>WhatsApp</a>
        </div>

        {refs.length > 0 && (
          <section className="mt-10 border-t border-border pt-6">
            <h2 className="display text-2xl font-bold mb-3">Source References</h2>
            <ul className="space-y-2 text-sm">
              {refs.map((r, i) => (
                <li key={i}>
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">{r.name || r.url}</a>
                  {r.description && <span className="text-muted-foreground"> — {r.description}</span>}
                </li>
              ))}
            </ul>
          </section>
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
            <h2 className="display text-2xl font-bold mb-4">Related News</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {related.map((r: any) => <NewsCard key={r.id} item={r} />)}
            </div>
          </section>
        )}

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
        {faqs.length > 0 && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org", "@type": "FAQPage",
              mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
            }),
          }} />
        )}
      </article>
    </SiteLayout>
  );
}
