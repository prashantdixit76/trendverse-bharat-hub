import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function AdSlot({ location }: { location: "header" | "sidebar" | "in_content" | "footer" | "mobile" }) {
  const { data } = useQuery({
    queryKey: ["ad", location],
    queryFn: async () => {
      const { data } = await supabase.from("ad_settings").select("*").eq("location", location).maybeSingle();
      return data;
    },
  });
  if (!data?.is_enabled || !data.ad_code) return null;
  return (
    <div className="my-6 border border-dashed border-border rounded p-2 bg-muted/30">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Advertisement</div>
      <div dangerouslySetInnerHTML={{ __html: data.ad_code }} />
    </div>
  );
}
