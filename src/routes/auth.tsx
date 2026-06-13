import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Admin Sign in — Trend Verse Bharat" }, { name: "robots", content: "noindex" }] }),
  component: AuthPage,
});

function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Welcome back, Admin");
      navigate({ to: "/admin" });
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-background px-4">
      <div className="w-full max-w-md bg-card border border-border rounded-xl p-8 shadow-sm">
        <Link to="/" className="display text-2xl font-bold block text-center mb-1">
          Trend Verse <span className="text-brand">Bharat</span>
        </Link>
        <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-6">
          Admin Portal
        </p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="email">Admin Email</Label>
            <Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" disabled={busy} className="w-full bg-brand text-brand-foreground hover:opacity-90">
            {busy ? "Signing in…" : "Sign in to Admin Panel"}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-6 text-center">
          Restricted area. Only authorised administrators may sign in.
        </p>
      </div>
    </div>
  );
}
