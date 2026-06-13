import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIsStaff } from "@/lib/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { slugify, formatDate } from "@/lib/slug";
import { uploadMedia, deleteMedia } from "@/lib/media";
import { Trash2, Edit, Plus, LogOut, Image as ImageIcon, Copy } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — TVB" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { user, isStaff, loading } = useIsStaff();
  const navigate = useNavigate();

  if (loading) return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;
  if (!isStaff) {
    return (
      <div className="min-h-screen grid place-items-center px-4">
        <div className="max-w-md text-center">
          <h1 className="display text-3xl font-bold">Not Authorized</h1>
          <p className="text-muted-foreground mt-2">Your account does not have admin or editor permissions.</p>
          <Button onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/auth" }); }} className="mt-4">Sign out</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="display text-xl font-bold">Trend Verse <span className="text-brand">Bharat</span> · Admin</Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground hidden sm:inline">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/auth" }); }}>
              <LogOut className="h-4 w-4 mr-1" /> Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="news">News</TabsTrigger>
            <TabsTrigger value="blogs">Blogs</TabsTrigger>
            <TabsTrigger value="faqs">FAQs</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="ads">Ads</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard" className="mt-6"><Dashboard /></TabsContent>
          <TabsContent value="news" className="mt-6"><ContentManager kind="news" /></TabsContent>
          <TabsContent value="blogs" className="mt-6"><ContentManager kind="blogs" /></TabsContent>
          <TabsContent value="faqs" className="mt-6"><FaqManager /></TabsContent>
          <TabsContent value="categories" className="mt-6"><CategoryManager /></TabsContent>
          <TabsContent value="media" className="mt-6"><MediaManager userId={user!.id} /></TabsContent>
          <TabsContent value="ads" className="mt-6"><AdsManager /></TabsContent>
          <TabsContent value="settings" className="mt-6"><SettingsManager /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function Dashboard() {
  const { data } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [n, b, f, c, v, np, bp, nd, bd] = await Promise.all([
        supabase.from("news").select("id", { count: "exact", head: true }),
        supabase.from("blogs").select("id", { count: "exact", head: true }),
        supabase.from("faqs").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("page_views").select("id", { count: "exact", head: true }),
        supabase.from("news").select("id", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("blogs").select("id", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("news").select("id", { count: "exact", head: true }).eq("status", "draft"),
        supabase.from("blogs").select("id", { count: "exact", head: true }).eq("status", "draft"),
      ]);
      return { news: n.count ?? 0, blogs: b.count ?? 0, faqs: f.count ?? 0, categories: c.count ?? 0, views: v.count ?? 0, publishedNews: np.count ?? 0, publishedBlogs: bp.count ?? 0, draftNews: nd.count ?? 0, draftBlogs: bd.count ?? 0 };
    },
  });
  const cards = [
    { label: "Total News", value: data?.news ?? 0 },
    { label: "Total Blogs", value: data?.blogs ?? 0 },
    { label: "Total FAQs", value: data?.faqs ?? 0 },
    { label: "Categories", value: data?.categories ?? 0 },
    { label: "Total Views", value: data?.views ?? 0 },
    { label: "Published (News+Blogs)", value: (data?.publishedNews ?? 0) + (data?.publishedBlogs ?? 0) },
    { label: "Drafts (News+Blogs)", value: (data?.draftNews ?? 0) + (data?.draftBlogs ?? 0) },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="bg-card border border-border rounded-lg p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{c.label}</p>
          <p className="display text-3xl font-bold mt-2">{c.value}</p>
        </div>
      ))}
    </div>
  );
}

function ContentManager({ kind }: { kind: "news" | "blogs" }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const { data, refetch } = useQuery({
    queryKey: ["admin", kind],
    queryFn: async () => {
      const { data } = await supabase.from(kind).select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  async function remove(id: string) {
    if (!confirm("Delete this item?")) return;
    const { error } = await supabase.from(kind).delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    refetch();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="display text-2xl font-bold capitalize">{kind} Management</h2>
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="bg-brand text-brand-foreground"><Plus className="h-4 w-4 mr-1" /> New {kind === "news" ? "Article" : "Blog"}</Button>
      </div>
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left"><tr><th className="p-3">Title</th><th className="p-3">Status</th><th className="p-3">Date</th><th className="p-3"></th></tr></thead>
          <tbody>
            {data?.map((row: any) => (
              <tr key={row.id} className="border-t border-border">
                <td className="p-3 font-medium">{row.title}<div className="text-xs text-muted-foreground">/{row.slug}</div></td>
                <td className="p-3"><Badge variant={row.status === "published" ? "default" : "secondary"}>{row.status}</Badge></td>
                <td className="p-3 text-muted-foreground">{formatDate(row.published_at || row.created_at)}</td>
                <td className="p-3 text-right space-x-1">
                  <Button size="sm" variant="ghost" onClick={() => { setEditing(row); setOpen(true); }}><Edit className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(row.id)}><Trash2 className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
            {data?.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No {kind} yet.</td></tr>}
          </tbody>
        </table>
      </div>
      <ContentForm kind={kind} open={open} onOpenChange={setOpen} editing={editing} onSaved={() => { refetch(); qc.invalidateQueries(); }} />
    </div>
  );
}

function ContentForm({ kind, open, onOpenChange, editing, onSaved }: { kind: "news" | "blogs"; open: boolean; onOpenChange: (v: boolean) => void; editing: any; onSaved: () => void }) {
  const isNews = kind === "news";
  const [form, setForm] = useState<any>({});
  const { data: cats } = useQuery({ queryKey: ["cats"], queryFn: async () => (await supabase.from("categories").select("*").order("name")).data ?? [] });

  useEffect(() => {
    if (editing) setForm({ ...editing, tags: (editing.tags || []).join(", "), faqs: JSON.stringify(editing.faqs || [], null, 2), source_references: JSON.stringify(editing.source_references || [], null, 2) });
    else setForm({ status: "draft", is_featured: false, is_trending: false, tags: "", faqs: "[]", source_references: "[]" });
  }, [editing, open]);

  async function save(publish?: boolean) {
    const payload: any = {
      title: form.title,
      slug: form.slug || slugify(form.title || ""),
      category_id: form.category_id || null,
      short_description: form.short_description,
      content: form.content,
      author_name: form.author_name,
      meta_title: form.meta_title,
      meta_description: form.meta_description,
      canonical_url: form.canonical_url,
      og_image: form.og_image,
      tags: form.tags ? String(form.tags).split(",").map((t: string) => t.trim()).filter(Boolean) : [],
      faqs: safeJson(form.faqs, []),
      status: publish ? "published" : form.status || "draft",
    };
    if (isNews) {
      payload.featured_image = form.featured_image;
      payload.source_references = safeJson(form.source_references, []);
      payload.is_featured = !!form.is_featured;
      payload.is_trending = !!form.is_trending;
    } else {
      payload.cover_image = form.cover_image;
    }
    if (publish && !editing?.published_at) payload.published_at = new Date().toISOString();
    if (!payload.title) return toast.error("Title required");
    const op = editing
      ? supabase.from(kind).update(payload).eq("id", editing.id)
      : supabase.from(kind).insert(payload);
    const { error } = await op;
    if (error) return toast.error(error.message);
    toast.success("Saved");
    onSaved(); onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{editing ? "Edit" : "New"} {isNews ? "News" : "Blog"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Title</Label><Input value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) })} /></div>
          <div><Label>Slug</Label><Input value={form.slug || ""} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Category</Label>
              <Select value={form.category_id || ""} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>{cats?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Author</Label><Input value={form.author_name || ""} onChange={(e) => setForm({ ...form, author_name: e.target.value })} /></div>
          </div>
          <div><Label>{isNews ? "Featured Image URL" : "Cover Image URL"}</Label><Input value={(isNews ? form.featured_image : form.cover_image) || ""} onChange={(e) => setForm({ ...form, [isNews ? "featured_image" : "cover_image"]: e.target.value })} placeholder="Paste a URL or upload from Media tab" /></div>
          <div><Label>Short Description</Label><Textarea rows={2} value={form.short_description || ""} onChange={(e) => setForm({ ...form, short_description: e.target.value })} /></div>
          <div><Label>Content (HTML or text)</Label><Textarea rows={10} value={form.content || ""} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
          <div><Label>Tags (comma separated)</Label><Input value={form.tags || ""} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></div>
          {isNews && (
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2"><Switch checked={!!form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} /> Featured</label>
              <label className="flex items-center gap-2"><Switch checked={!!form.is_trending} onCheckedChange={(v) => setForm({ ...form, is_trending: v })} /> Trending</label>
            </div>
          )}
          <details className="border border-border rounded p-3">
            <summary className="cursor-pointer font-medium text-sm">SEO</summary>
            <div className="space-y-2 mt-2">
              <div><Label>Meta Title</Label><Input value={form.meta_title || ""} onChange={(e) => setForm({ ...form, meta_title: e.target.value })} /></div>
              <div><Label>Meta Description</Label><Textarea rows={2} value={form.meta_description || ""} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} /></div>
              <div><Label>Canonical URL</Label><Input value={form.canonical_url || ""} onChange={(e) => setForm({ ...form, canonical_url: e.target.value })} /></div>
              <div><Label>OG Image URL</Label><Input value={form.og_image || ""} onChange={(e) => setForm({ ...form, og_image: e.target.value })} /></div>
            </div>
          </details>
          <details className="border border-border rounded p-3">
            <summary className="cursor-pointer font-medium text-sm">FAQs (JSON: [{`{"question":"…","answer":"…"}`}])</summary>
            <Textarea rows={5} className="mt-2 font-mono text-xs" value={form.faqs || "[]"} onChange={(e) => setForm({ ...form, faqs: e.target.value })} />
          </details>
          {isNews && (
            <details className="border border-border rounded p-3">
              <summary className="cursor-pointer font-medium text-sm">Source References (JSON: [{`{"name":"…","url":"…","description":"…"}`}])</summary>
              <Textarea rows={4} className="mt-2 font-mono text-xs" value={form.source_references || "[]"} onChange={(e) => setForm({ ...form, source_references: e.target.value })} />
            </details>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => save(false)}>Save Draft</Button>
          <Button className="bg-brand text-brand-foreground" onClick={() => save(true)}>Publish</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function safeJson(s: string, fb: any) { try { return JSON.parse(s || "null") ?? fb; } catch { return fb; } }

function FaqManager() {
  const [form, setForm] = useState<any>({ question: "", answer: "", is_published: true });
  const [editingId, setEditingId] = useState<string | null>(null);
  const { data, refetch } = useQuery({ queryKey: ["admin-faqs"], queryFn: async () => (await supabase.from("faqs").select("*, categories(name)").order("sort_order")).data ?? [] });
  const { data: cats } = useQuery({ queryKey: ["cats"], queryFn: async () => (await supabase.from("categories").select("*").order("name")).data ?? [] });

  async function save() {
    if (!form.question || !form.answer) return toast.error("Question and answer required");
    const payload = { question: form.question, answer: form.answer, category_id: form.category_id || null, is_published: form.is_published, sort_order: form.sort_order || 0 };
    const op = editingId ? supabase.from("faqs").update(payload).eq("id", editingId) : supabase.from("faqs").insert(payload);
    const { error } = await op;
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setForm({ question: "", answer: "", is_published: true }); setEditingId(null); refetch();
  }
  async function remove(id: string) { if (!confirm("Delete?")) return; await supabase.from("faqs").delete().eq("id", id); refetch(); }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="bg-card border border-border rounded-lg p-5 space-y-3">
        <h3 className="font-bold">{editingId ? "Edit FAQ" : "Add FAQ"}</h3>
        <div><Label>Question</Label><Input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} /></div>
        <div><Label>Answer</Label><Textarea rows={4} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} /></div>
        <div><Label>Category</Label>
          <Select value={form.category_id || ""} onValueChange={(v) => setForm({ ...form, category_id: v })}>
            <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
            <SelectContent>{cats?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <label className="flex items-center gap-2"><Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} /> Published</label>
        <div className="flex gap-2">
          <Button onClick={save} className="bg-brand text-brand-foreground">{editingId ? "Update" : "Add"}</Button>
          {editingId && <Button variant="outline" onClick={() => { setEditingId(null); setForm({ question: "", answer: "", is_published: true }); }}>Cancel</Button>}
        </div>
      </div>
      <div className="space-y-2">
        {data?.map((f: any) => (
          <div key={f.id} className="bg-card border border-border rounded p-3">
            <div className="flex justify-between gap-2"><h4 className="font-semibold text-sm">{f.question}</h4>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => { setForm(f); setEditingId(f.id); }}><Edit className="h-3 w-3" /></Button>
                <Button size="sm" variant="ghost" onClick={() => remove(f.id)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{f.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryManager() {
  const [form, setForm] = useState<any>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const { data, refetch } = useQuery({ queryKey: ["admin-cats"], queryFn: async () => (await supabase.from("categories").select("*").order("sort_order")).data ?? [] });

  async function save() {
    if (!form.name) return toast.error("Name required");
    const payload = { name: form.name, slug: form.slug || slugify(form.name), description: form.description, image_url: form.image_url, sort_order: form.sort_order || 0 };
    const op = editingId ? supabase.from("categories").update(payload).eq("id", editingId) : supabase.from("categories").insert(payload);
    const { error } = await op;
    if (error) return toast.error(error.message);
    toast.success("Saved"); setForm({}); setEditingId(null); refetch();
  }
  async function remove(id: string) { if (!confirm("Delete?")) return; await supabase.from("categories").delete().eq("id", id); refetch(); }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="bg-card border border-border rounded-lg p-5 space-y-3">
        <h3 className="font-bold">{editingId ? "Edit Category" : "Add Category"}</h3>
        <div><Label>Name</Label><Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })} /></div>
        <div><Label>Slug</Label><Input value={form.slug || ""} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} /></div>
        <div><Label>Description</Label><Textarea rows={2} value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div><Label>Image URL</Label><Input value={form.image_url || ""} onChange={(e) => setForm({ ...form, image_url: e.target.value })} /></div>
        <div className="flex gap-2"><Button onClick={save} className="bg-brand text-brand-foreground">{editingId ? "Update" : "Add"}</Button>
          {editingId && <Button variant="outline" onClick={() => { setEditingId(null); setForm({}); }}>Cancel</Button>}
        </div>
      </div>
      <div className="space-y-2">
        {data?.map((c: any) => (
          <div key={c.id} className="bg-card border border-border rounded p-3 flex justify-between items-center">
            <div><div className="font-semibold">{c.name}</div><div className="text-xs text-muted-foreground">/{c.slug}</div></div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => { setForm(c); setEditingId(c.id); }}><Edit className="h-3 w-3" /></Button>
              <Button size="sm" variant="ghost" onClick={() => remove(c.id)}><Trash2 className="h-3 w-3" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MediaManager({ userId }: { userId: string }) {
  const [busy, setBusy] = useState(false);
  const { data, refetch } = useQuery({ queryKey: ["media"], queryFn: async () => (await supabase.from("media").select("*").order("created_at", { ascending: false })).data ?? [] });

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    setBusy(true);
    try { await uploadMedia(f, userId); toast.success("Uploaded"); refetch(); }
    catch (err: any) { toast.error(err.message); }
    finally { setBusy(false); e.target.value = ""; }
  }
  async function remove(id: string, path: string) { if (!confirm("Delete file?")) return; await deleteMedia(id, path); refetch(); }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="display text-2xl font-bold">Media Library</h2>
        <label className="inline-flex items-center gap-2 cursor-pointer bg-brand text-brand-foreground px-3 py-2 rounded-md text-sm font-medium hover:opacity-90">
          <ImageIcon className="h-4 w-4" /> {busy ? "Uploading…" : "Upload"}
          <input type="file" accept="image/*" className="hidden" onChange={onFile} disabled={busy} />
        </label>
      </div>
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {data?.map((m: any) => (
          <div key={m.id} className="bg-card border border-border rounded-lg overflow-hidden group">
            <img src={m.public_url} alt={m.file_name} className="aspect-square w-full object-cover" />
            <div className="p-2 text-xs">
              <div className="truncate font-medium">{m.file_name}</div>
              <div className="flex gap-1 mt-1">
                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => { navigator.clipboard.writeText(m.public_url); toast.success("URL copied"); }}><Copy className="h-3 w-3" /></Button>
                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => remove(m.id, m.storage_path)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </div>
          </div>
        ))}
        {data?.length === 0 && <p className="text-muted-foreground col-span-full">No media uploaded yet.</p>}
      </div>
    </div>
  );
}

function AdsManager() {
  const { data, refetch } = useQuery({ queryKey: ["admin-ads"], queryFn: async () => (await supabase.from("ad_settings").select("*").order("location")).data ?? [] });
  const [drafts, setDrafts] = useState<Record<string, any>>({});
  useEffect(() => { if (data) { const d: any = {}; data.forEach((r: any) => d[r.id] = { ad_code: r.ad_code, is_enabled: r.is_enabled }); setDrafts(d); } }, [data]);

  async function save(id: string) {
    const { error } = await supabase.from("ad_settings").update(drafts[id]).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Saved"); refetch();
  }
  return (
    <div className="space-y-4">
      <h2 className="display text-2xl font-bold">Advertisements</h2>
      <p className="text-sm text-muted-foreground">Paste Google AdSense or any HTML ad code per location.</p>
      {data?.map((a: any) => (
        <div key={a.id} className="bg-card border border-border rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold capitalize">{a.location.replace("_", " ")}</h3>
            <label className="flex items-center gap-2 text-sm"><Switch checked={drafts[a.id]?.is_enabled ?? false} onCheckedChange={(v) => setDrafts({ ...drafts, [a.id]: { ...drafts[a.id], is_enabled: v } })} /> Enabled</label>
          </div>
          <Textarea rows={3} className="font-mono text-xs" value={drafts[a.id]?.ad_code ?? ""} onChange={(e) => setDrafts({ ...drafts, [a.id]: { ...drafts[a.id], ad_code: e.target.value } })} />
          <Button className="mt-2 bg-brand text-brand-foreground" size="sm" onClick={() => save(a.id)}>Save</Button>
        </div>
      ))}
    </div>
  );
}

function SettingsManager() {
  const { data, refetch } = useQuery({ queryKey: ["admin-settings"], queryFn: async () => {
    const { data } = await supabase.from("site_settings").select("*");
    const map: Record<string, any> = {};
    data?.forEach((r: any) => map[r.key] = r.value);
    return map;
  } });
  const [g, setG] = useState<any>({}); const [s, setS] = useState<any>({}); const [seo, setSeo] = useState<any>({}); const [p, setP] = useState<any>({});
  useEffect(() => { if (data) { setG(data.general || {}); setS(data.social || {}); setSeo(data.seo || {}); setP(data.pages || {}); } }, [data]);

  async function save(key: string, value: any) {
    const { error } = await supabase.from("site_settings").update({ value }).eq("key", key);
    if (error) return toast.error(error.message);
    toast.success("Saved"); refetch();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Section title="General">
        <Field label="Site Name" v={g.site_name} on={(v) => setG({ ...g, site_name: v })} />
        <Field label="Tagline" v={g.tagline} on={(v) => setG({ ...g, tagline: v })} />
        <Field label="Contact Email" v={g.contact_email} on={(v) => setG({ ...g, contact_email: v })} />
        <Field label="Logo URL" v={g.logo_url} on={(v) => setG({ ...g, logo_url: v })} />
        <Field label="Favicon URL" v={g.favicon_url} on={(v) => setG({ ...g, favicon_url: v })} />
        <Field label="Footer Text" v={g.footer_text} on={(v) => setG({ ...g, footer_text: v })} />
        <Button onClick={() => save("general", g)} className="bg-brand text-brand-foreground">Save</Button>
      </Section>
      <Section title="Social Links">
        {(["twitter", "facebook", "instagram", "youtube", "linkedin"] as const).map((k) => <Field key={k} label={k} v={s[k]} on={(v) => setS({ ...s, [k]: v })} />)}
        <Button onClick={() => save("social", s)} className="bg-brand text-brand-foreground">Save</Button>
      </Section>
      <Section title="SEO Defaults">
        <Field label="Default Meta Title" v={seo.default_meta_title} on={(v) => setSeo({ ...seo, default_meta_title: v })} />
        <Field label="Default Meta Description" v={seo.default_meta_description} on={(v) => setSeo({ ...seo, default_meta_description: v })} textarea />
        <Field label="Google Analytics ID" v={seo.ga_id} on={(v) => setSeo({ ...seo, ga_id: v })} />
        <Field label="Google Search Console Verification" v={seo.gsc_verification} on={(v) => setSeo({ ...seo, gsc_verification: v })} />
        <Button onClick={() => save("seo", seo)} className="bg-brand text-brand-foreground">Save</Button>
      </Section>
      <Section title="Static Pages">
        <Field label="About" v={p.about} on={(v) => setP({ ...p, about: v })} textarea />
        <Field label="Contact" v={p.contact} on={(v) => setP({ ...p, contact: v })} textarea />
        <Field label="Privacy Policy" v={p.privacy} on={(v) => setP({ ...p, privacy: v })} textarea />
        <Field label="Disclaimer" v={p.disclaimer} on={(v) => setP({ ...p, disclaimer: v })} textarea />
        <Button onClick={() => save("pages", p)} className="bg-brand text-brand-foreground">Save</Button>
      </Section>
    </div>
  );
}

function Section({ title, children }: any) { return <div className="bg-card border border-border rounded-lg p-5 space-y-3"><h3 className="font-bold">{title}</h3>{children}</div>; }
function Field({ label, v, on, textarea }: any) {
  return <div><Label>{label}</Label>{textarea ? <Textarea rows={3} value={v || ""} onChange={(e) => on(e.target.value)} /> : <Input value={v || ""} onChange={(e) => on(e.target.value)} />}</div>;
}
