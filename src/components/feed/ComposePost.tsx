import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, ImagePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { createPost } from "@/lib/feed.functions";
import { listMyMemorials } from "@/lib/memorials.functions";
import { toast } from "sonner";

export function ComposePost() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [memorialId, setMemorialId] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const createFn = useServerFn(createPost);
  const myMemorialsFn = useServerFn(listMyMemorials);

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
      setCaption(""); setImageUrl(null); setMemorialId(""); setOpen(false);
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Share a memory</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {imageUrl ? (
            <div className="relative overflow-hidden rounded-xl bg-muted">
              <img src={imageUrl} alt="" className="aspect-square w-full object-cover" />
              <Button variant="secondary" size="sm" className="absolute right-2 top-2" onClick={() => setImageUrl(null)}>
                Remove
              </Button>
            </div>
          ) : (
            <label className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 text-muted-foreground hover:bg-muted/50">
              <Upload className="h-6 w-6" />
              <span className="text-sm">{uploading ? "Uploading…" : "Add a photo (optional)"}</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </label>
          )}

          <div>
            <Label htmlFor="cap">Caption</Label>
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
