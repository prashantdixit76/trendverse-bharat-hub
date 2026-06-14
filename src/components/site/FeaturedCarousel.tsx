import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/slug";

interface Item {
  id: string;
  slug: string;
  title: string;
  short_description?: string | null;
  featured_image?: string | null;
  published_at?: string | null;
}

export function FeaturedCarousel({ items }: { items: Item[] }) {
  const [i, setI] = useState(0);
  if (!items.length) return null;
  const n = items.length;
  const item = items[i];
  const go = (d: number) => setI((p) => (p + d + n) % n);

  return (
    <div className="relative group block overflow-hidden rounded-lg bg-card border border-border h-[420px]">
      <Link to="/news/$slug" params={{ slug: item.slug }} className="absolute inset-0">
        {item.featured_image && (
          <img
            src={item.featured_image}
            alt={item.title}
            className="absolute inset-0 h-full w-full object-cover transition duration-700"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h2 className="display text-2xl md:text-3xl font-bold leading-tight">{item.title}</h2>
          {item.short_description && (
            <p className="mt-2 text-sm opacity-90 line-clamp-2">{item.short_description}</p>
          )}
          <p className="mt-2 text-xs opacity-75">{formatDate(item.published_at)}</p>
        </div>
      </Link>
      {n > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            aria-label="Previous"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 grid place-items-center rounded-full bg-black/50 text-white hover:bg-brand transition"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Next"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 grid place-items-center rounded-full bg-black/50 text-white hover:bg-brand transition"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-3 right-4 z-10 flex gap-1.5">
            {items.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setI(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all ${
                  idx === i ? "w-6 bg-brand" : "w-2 bg-white/60 hover:bg-white"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
