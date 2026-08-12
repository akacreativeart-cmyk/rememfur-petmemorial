import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Pending = { name: string; error?: string };

/**
 * Multi-photo picker used by post, memorial and memory forms.
 * Uploads run in parallel into the caller's bucket under the signed-in
 * user's folder; each file reports its own failure without losing the others.
 */
export function MultiPhotoUpload({
  value,
  onChange,
  bucket = "gallery",
  max = 6,
  label = "Add photos",
  className = "",
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  bucket?: "gallery" | "pet-photos";
  max?: number;
  label?: string;
  className?: string;
}) {
  const [pending, setPending] = useState<Pending[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const remaining = Math.max(0, max - value.length);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return toast.error("Please sign in to upload photos.");

    const list = Array.from(files).slice(0, remaining);
    if (files.length > remaining) toast.info(`Only ${max} photos allowed — extra files were skipped.`);
    setPending(list.map((f) => ({ name: f.name })));

    const results = await Promise.all(
      list.map(async (file) => {
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
        const path = `${uid}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage
          .from(bucket)
          .upload(path, file, { contentType: file.type || "image/jpeg", cacheControl: "3600" });
        if (error) return { name: file.name, error: error.message };
        return { name: file.name, url: supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl };
      }),
    );

    setPending([]);
    const ok = results.filter((r) => "url" in r && r.url).map((r) => (r as { url: string }).url);
    results.filter((r) => (r as Pending).error).forEach((r) => toast.error(`${r.name}: ${(r as Pending).error}`));
    if (ok.length) onChange([...value, ...ok].slice(0, max));
    if (inputRef.current) inputRef.current.value = "";
  }

  const move = (i: number, dir: -1 | 1) => {
    const next = [...value];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2">
        {value.map((url, i) => (
          <div key={url + i} className="group relative h-24 w-24 overflow-hidden rounded-xl border border-border/60 bg-muted">
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              aria-label="Remove photo"
              onClick={() => onChange(value.filter((_, k) => k !== i))}
              className="absolute right-1 top-1 rounded-full bg-black/55 p-1 text-white"
            >
              <X className="h-3 w-3" />
            </button>
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/40 opacity-0 transition group-hover:opacity-100">
              <button type="button" aria-label="Move left" onClick={() => move(i, -1)} className="p-1 text-white">
                <ArrowLeft className="h-3 w-3" />
              </button>
              <span className="py-1 text-[10px] text-white">{i + 1}</span>
              <button type="button" aria-label="Move right" onClick={() => move(i, 1)} className="p-1 text-white">
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}

        {pending.map((p) => (
          <div key={p.name} className="flex h-24 w-24 items-center justify-center rounded-xl border border-dashed border-border bg-muted/40">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ))}

        {remaining > 0 && (
          <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border bg-muted/30 text-muted-foreground hover:bg-muted/50">
            <ImagePlus className="h-5 w-5" />
            <span className="px-1 text-center text-[10px] leading-tight">{label}</span>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        )}
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">
        {value.length}/{max} photos{value.length > 1 ? " — they’ll play as a slideshow." : ""}
      </p>
    </div>
  );
}

export default MultiPhotoUpload;
