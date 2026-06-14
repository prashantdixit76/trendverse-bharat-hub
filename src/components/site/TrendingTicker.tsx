import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Pause, Play, ArrowLeftRight } from "lucide-react";

export function TrendingTicker({ items }: { items: { id: string; slug: string; title: string }[] }) {
  const [dir, setDir] = useState<"left" | "right">("left");
  const [paused, setPaused] = useState(false);

  if (!items?.length) return null;
  // duplicate for seamless loop
  const loop = [...items, ...items];

  return (
    <div className="my-6 flex items-stretch border-y-2 border-brand bg-card overflow-hidden">
      <div className="bg-brand text-brand-foreground px-4 flex items-center font-bold text-sm uppercase tracking-wider shrink-0 notranslate" translate="no">
        Trending
      </div>
      <div
        className="relative flex-1 overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className="flex gap-10 whitespace-nowrap py-2.5"
          style={{
            animation: `ticker-${dir} 45s linear infinite`,
            animationPlayState: paused ? "paused" : "running",
            width: "max-content",
          }}
        >
          {loop.map((n, i) => (
            <Link
              key={`${n.id}-${i}`}
              to="/news/$slug"
              params={{ slug: n.slug }}
              className="text-sm font-medium hover:text-brand inline-flex items-center gap-2"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-brand shrink-0" />
              {n.title}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1 px-2 border-l border-border shrink-0">
        <button
          onClick={() => setDir(dir === "left" ? "right" : "left")}
          className="p-1.5 hover:text-brand"
          aria-label="Reverse direction"
          title="Reverse direction"
        >
          <ArrowLeftRight className="h-4 w-4" />
        </button>
        <button
          onClick={() => setPaused((p) => !p)}
          className="p-1.5 hover:text-brand"
          aria-label={paused ? "Play" : "Pause"}
        >
          {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
        </button>
      </div>
      <style>{`
        @keyframes ticker-left { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes ticker-right { from { transform: translateX(-50%); } to { transform: translateX(0); } }
      `}</style>
    </div>
  );
}
