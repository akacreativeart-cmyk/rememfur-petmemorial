import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, ImagePlus, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { createPost } from "@/lib/feed.functions";
import { listMyMemorials } from "@/lib/memorials.functions";
import { assistCaption } from "@/lib/ai-assist.functions";
import { toast } from "sonner";

type FilterKey =
  | "none" | "warm" | "mono" | "sepia" | "fade" | "vintage" | "cool" | "glow";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "none", label: "Original" },
  { key: "warm", label: "Warm" },
  { key: "vintage", label: "Vintage" },
  { key: "sepia", label: "Sepia" },
  { key: "fade", label: "Fade" },
  { key: "mono", label: "Mono" },
  { key: "cool", label: "Cool" },
  { key: "glow", label: "Glow" },
];

export function ComposePost() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [memorialId, setMemorialId] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState<FilterKey>("none");

  const createFn = useServerFn(createPost);
  const myMemorialsFn = useServerFn(listMyMemorials);
  const assistFn = useServerFn(assistCaption);

  const { data: memorials } = useQuery({
    queryKey: ["my-memorials-mini"],
    queryFn: () => myMemorialsFn(),
    enabled: !!user && open,
  });

  const handleFile = async (file: File) => {
    if (!user) return;
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/post-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("gallery").upload(path, file, { contentType: file.type, upsert: false });
    setUploading(false);
    if (error) return toast.error(error.message);
    const { data } = supabase.storage.from("gallery").getPublicUrl(path);
    setImageUrl(data.publicUrl);
  };

  const assist = useMutation({
    mutationFn: () => assistFn({ data: { draft: caption, tone: "tender" } }),
    onSuccess: (res) => {
      if (res?.caption) setCaption(res.caption);
      toast.success("AI suggestion ready — edit freely.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const submit = useMutation({
    mutationFn: () =>
      createFn({
        data: {
          image_url: imageUrl,
          caption: caption.trim() || null,
          memorial_id: memorialId || null,
        },
      }),
    onSuccess: () => {
      toast.success("Posted.");
      setCaption(""); setImageUrl(null); setMemorialId(""); setFilter("none"); setOpen(false);
      qc.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!user) return null;
  const canSubmit = (!!caption.trim() || !!imageUrl) && !submit.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-sage-deep text-primary-foreground hover:bg-sage-deep/90">
          <ImagePlus className="mr-2 h-4 w-4" /> Share a memory
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Share a memory</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {imageUrl ? (
            <>
              <div className="relative overflow-hidden rounded-xl bg-muted">
                <img src={imageUrl} alt="" className={`aspect-square w-full object-cover filt-${filter}`} />
                <Button variant="secondary" size="sm" className="absolute right-2 top-2" onClick={() => { setImageUrl(null); setFilter("none"); }}>
                  Remove
                </Button>
              </div>
              {/* Instagram-style filter strip */}
              <div className="-mx-1 flex gap-2 overflow-x-auto pb-1">
                {FILTERS.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`shrink-0 rounded-xl border p-1.5 text-center transition ${
                      filter === f.key ? "border-sage-deep ring-2 ring-sage-deep/30" : "border-border/60"
                    }`}
                  >
                    <img src={imageUrl} alt="" className={`h-14 w-14 rounded-md object-cover filt-${f.key}`} />
                    <div className="mt-1 text-[10px] text-muted-foreground">{f.label}</div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <label className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 text-muted-foreground hover:bg-muted/50">
              <Upload className="h-6 w-6" />
              <span className="text-sm">{uploading ? "Uploading…" : "Add a photo (optional)"}</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </label>
          )}

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="cap">Caption</Label>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-sage-deep hover:bg-sage/10"
                disabled={assist.isPending}
                onClick={() => assist.mutate()}
              >
                <Sparkles className="mr-1 h-3.5 w-3.5" />
                {assist.isPending ? "Thinking…" : "AI assist (optional)"}
              </Button>
            </div>
            <Textarea id="cap" value={caption} onChange={(e) => setCaption(e.target.value)} rows={4} placeholder="What do you want to remember?" />
          </div>

          {memorials && memorials.length > 0 && (
            <div>
              <Label htmlFor="mem">Tag a memorial (optional)</Label>
              <select
                id="mem"
                value={memorialId}
                onChange={(e) => setMemorialId(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">None</option>
                {memorials.map((m) => (
                  <option key={m.id} value={m.id}>{m.pet_name}</option>
                ))}
              </select>
            </div>
          )}

          <Button disabled={!canSubmit} onClick={() => submit.mutate()} className="w-full bg-sage-deep text-primary-foreground hover:bg-sage-deep/90">
            {submit.isPending ? "Posting…" : "Post"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
