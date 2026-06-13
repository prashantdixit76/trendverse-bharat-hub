import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export const Route = createFileRoute("/faqs")({
  head: () => ({
    meta: [
      { title: "FAQs — Trend Verse Bharat" },
      { name: "description", content: "Answers to the most common questions on Trend Verse Bharat." },
    ],
  }),
  component: FaqsPage,
});

function FaqsPage() {
  const { data } = useQuery({
    queryKey: ["faqs-all"],
    queryFn: async () => {
      const { data } = await supabase.from("faqs").select("*, categories(name,slug)").eq("is_published", true).order("sort_order");
      return data ?? [];
    },
  });
  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <h1 className="display text-4xl font-bold mb-2">Frequently Asked Questions</h1>
        <p className="text-muted-foreground mb-8">Quick answers to popular questions.</p>
        {data && data.length === 0 && <p className="text-muted-foreground">No FAQs yet.</p>}
        <Accordion type="multiple" className="space-y-2">
          {data?.map((f: any) => (
            <AccordionItem key={f.id} value={f.id} className="bg-card border border-border rounded-lg px-4">
              <AccordionTrigger className="text-left font-semibold">{f.question}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground whitespace-pre-wrap">{f.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        {data && data.length > 0 && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org", "@type": "FAQPage",
              mainEntity: data.map((f: any) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
            }),
          }} />
        )}
      </div>
    </SiteLayout>
  );
}
