import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

async function ensureAdmin(userId: string, supabase: any) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error || !data) throw new Error("Forbidden: admin only");
}

export const listAdmins = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.userId, context.supabase);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: roles, error } = await supabaseAdmin
      .from("user_roles")
      .select("user_id, role")
      .in("role", ["admin", "editor"]);
    if (error) throw new Error(error.message);
    const ids = Array.from(new Set((roles ?? []).map((r) => r.user_id)));
    if (ids.length === 0) return [] as Array<{ id: string; email: string; role: string; created_at: string }>;
    const { data: usersRes } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const byId = new Map(usersRes?.users?.map((u) => [u.id, u]) ?? []);
    return ids.map((id) => {
      const u = byId.get(id);
      const role = roles!.find((r) => r.user_id === id)?.role ?? "admin";
      return {
        id,
        email: u?.email ?? "(unknown)",
        role,
        created_at: u?.created_at ?? "",
      };
    });
  });

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["admin", "editor"]).default("admin"),
});

export const createAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => createSchema.parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.userId, context.supabase);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });
    if (error) throw new Error(error.message);
    const uid = created.user!.id;
    const { error: rErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: uid, role: data.role });
    if (rErr) throw new Error(rErr.message);
    return { id: uid, email: data.email, role: data.role };
  });

const deleteSchema = z.object({ userId: z.string().uuid() });

export const deleteAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => deleteSchema.parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.userId, context.supabase);
    if (data.userId === context.userId) throw new Error("You cannot delete your own account.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
