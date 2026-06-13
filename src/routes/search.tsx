import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NewsCard } from "@/components/site/NewsCard";

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "Search — Trend Verse Bharat" }] }),
  component: SearchPage,
});

function SearchPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<{ news: any[]; blogs: any[]; faqs: any[] } | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setBusy(true);
    const term = `%${q}%`;
    const [news, blogs, faqs] = await Promise.all([
      supabase.from("news").select("*").eq("status", "published").or(`title.ilike.${term},short_description.ilike.${term}`).limit(20),
      supabase.from("blogs").select("*").eq("status", "published").or(`title.ilike.${term},short_description.ilike.${term}`).limit(20),
      supabase.from("faqs").select("*").eq("is_published", true).or(`question.ilike.${term},answer.ilike.${term}`).limit(20),
    ]);
    setResults({ news: news.data ?? [], blogs: blogs.data ?? [], faqs: faqs.data ?? [] });
    setBusy(false);
  }

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <h1 className="display text-4xl font-bold mb-6">Search</h1>
        <form onSubmit={run} className="flex gap-2 mb-8">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search news, blogs, FAQs…" />
          <Button type="submit" disabled={busy} className="bg-brand text-brand-foreground">{busy ? "…" : "Search"}</Button>
        </form>
        {results && (
          <div className="space-y-10">
            <section>
              <h2 className="font-bold display text-xl mb-3">News ({results.news.length})</h2>
              <div className="grid gap-4 sm:grid-cols-2">{results.news.map((n) => <NewsCard key={n.id} item={n} />)}</div>
            </section>
            <section>
              <h2 className="font-bold display text-xl mb-3">Blogs ({results.blogs.length})</h2>
              <div className="grid gap-4 sm:grid-cols-2">{results.blogs.map((b) => <NewsCard key={b.id} item={b} type="blog" />)}</div>
            </section>
            <section>
              <h2 className="font-bold display text-xl mb-3">FAQs ({results.faqs.length})</h2>
              <div className="space-y-2">
                {results.faqs.map((f) => (
                  <div key={f.id} className="bg-card border border-border rounded p-4">
                    <h4 className="font-semibold">{f.question}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{f.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
