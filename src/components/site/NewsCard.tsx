import { Link } from "@tanstack/react-router";
import { formatDate } from "@/lib/slug";

export interface NewsCardItem {
  slug: string;
  title: string;
  short_description?: string | null;
  featured_image?: string | null;
  cover_image?: string | null;
  published_at?: string | null;
  author_name?: string | null;
}

export function NewsCard({ item, variant = "default", type = "news" }: { item: NewsCardItem; variant?: "default" | "hero" | "compact"; type?: "news" | "blog" }) {
  const img = item.featured_image || item.cover_image;
  const href = type === "news" ? `/news/${item.slug}` : `/blog/${item.slug}`;
  if (variant === "hero") {
    return (
      <Link to={href as any} className="group block relative overflow-hidden rounded-lg bg-card border border-border h-[420px]">
        {img && <img src={img} alt={item.title} className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition duration-700" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h2 className="display text-2xl md:text-3xl font-bold leading-tight">{item.title}</h2>
          {item.short_description && <p className="mt-2 text-sm opacity-90 line-clamp-2">{item.short_description}</p>}
          <p className="mt-2 text-xs opacity-75">{formatDate(item.published_at)}</p>
        </div>
      </Link>
    );
  }
  if (variant === "compact") {
    return (
      <Link to={href as any} className="group flex gap-3 py-3 border-b border-border">
        {img && <img src={img} alt={item.title} className="h-16 w-20 object-cover rounded shrink-0" />}
        <div className="min-w-0">
          <h4 className="text-sm font-semibold leading-snug group-hover:text-brand line-clamp-2">{item.title}</h4>
          <p className="text-xs text-muted-foreground mt-1">{formatDate(item.published_at)}</p>
        </div>
      </Link>
    );
  }
  return (
    <Link to={href as any} className="group block bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition">
      {img && <div className="aspect-video overflow-hidden"><img src={img} alt={item.title} className="h-full w-full object-cover group-hover:scale-105 transition duration-500" /></div>}
      <div className="p-4">
        <h3 className="display text-lg font-bold leading-tight group-hover:text-brand">{item.title}</h3>
        {item.short_description && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{item.short_description}</p>}
        <p className="mt-3 text-xs text-muted-foreground">{formatDate(item.published_at)}{item.author_name ? ` · ${item.author_name}` : ""}</p>
      </div>
    </Link>
  );
}
