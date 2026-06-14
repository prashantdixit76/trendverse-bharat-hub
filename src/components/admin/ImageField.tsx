import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";
import { uploadMedia } from "@/lib/media";
import { toast } from "sonner";
import { useIsStaff } from "@/lib/use-auth";

interface Props {
  label: string;
  value: string;
  onChange: (url: string) => void;
  accept?: string;
}

export function ImageField({ label, value, onChange, accept = "image/jpeg,image/png,image/webp" }: Props) {
  const { user } = useIsStaff();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      toast.error("Only JPG, PNG, or WEBP allowed");
      return;
    }
    setBusy(true);
    try {
      const row = await uploadMedia(file, user.id);
      onChange(row.public_url);
      toast.success("Image uploaded");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          <span className="ml-2 hidden sm:inline">Upload</span>
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="icon" onClick={() => onChange("")}>
            <X className="h-4 w-4" />
          </Button>
        )}
        <input ref={fileRef} type="file" accept={accept} className="hidden" onChange={onFile} />
      </div>
      {value && (
        <div className="border border-border rounded-md overflow-hidden bg-muted/30">
          <img
            src={value}
            alt="Preview"
            className="max-h-48 w-auto mx-auto object-contain"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}
    </div>
  );
}
