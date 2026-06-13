import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/news", label: "News" },
  { to: "/blogs", label: "Blogs" },
  { to: "/faqs", label: "FAQs" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-paper/95 backdrop-blur">
      <div className="bg-brand text-brand-foreground text-xs">
        <div className="container mx-auto px-4 py-1.5 flex items-center justify-between">
          <span className="font-medium tracking-wide uppercase">Trending Now · India</span>
          <span className="hidden sm:inline opacity-90">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
        </div>
      </div>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="display text-2xl md:text-3xl font-bold text-ink">Trend Verse <span className="text-brand">Bharat</span></span>
          <span className="hidden md:inline text-xs uppercase tracking-widest text-muted-foreground">TVB</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="text-sm font-medium hover:text-brand transition" activeProps={{ className: "text-brand" }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/search" className="hidden sm:inline-flex"><Button variant="ghost" size="icon" aria-label="Search"><Search className="h-4 w-4" /></Button></Link>
          <button onClick={() => setOpen((o) => !o)} className="md:hidden p-2" aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-paper">
          <div className="container mx-auto px-4 py-3 flex flex-col gap-2">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="py-2 text-sm font-medium">{n.label}</Link>
            ))}
            <Link to="/search" onClick={() => setOpen(false)} className="py-2 text-sm">Search</Link>
          </div>
        </div>
      )}
    </header>
  );
}
