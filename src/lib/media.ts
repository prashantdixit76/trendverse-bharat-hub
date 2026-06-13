import { supabase } from "@/integrations/supabase/client";

const SIGN_TTL = 60 * 60 * 24 * 365 * 5; // 5 years

export async function uploadMedia(file: File, userId: string) {
  const ext = file.name.split(".").pop() || "bin";
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error: upErr } = await supabase.storage.from("media").upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type,
  });
  if (upErr) throw upErr;
  const { data: signed, error: sErr } = await supabase.storage
    .from("media")
    .createSignedUrl(path, SIGN_TTL);
  if (sErr) throw sErr;
  const publicUrl = signed.signedUrl;
  const { data: row, error: dbErr } = await supabase
    .from("media")
    .insert({
      file_name: file.name,
      storage_path: path,
      public_url: publicUrl,
      mime_type: file.type,
      size_bytes: file.size,
      uploaded_by: userId,
    })
    .select()
    .single();
  if (dbErr) throw dbErr;
  return row;
}

export async function deleteMedia(id: string, path: string) {
  await supabase.storage.from("media").remove([path]);
  await supabase.from("media").delete().eq("id", id);
}
