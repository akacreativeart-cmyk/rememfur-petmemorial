import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImagePlus, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { createPost } from "@/lib/feed.functions";
import { listMyMemorials } from "@/lib/memorials.functions";
import { assistCaption } from "@/lib/ai-assist.functions";
import { toast } from "sonner";
import { MultiPhotoUpload } from "@/components/site/MultiPhotoUpload";

export function ComposePost() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [caption, setCaption] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [memorialId, setMemorialId] = useState<string>("");

  const createFn = useServerFn(createPost);
  const myMemorialsFn = useServerFn(listMyMemorials);
  const assistFn = useServerFn(assistCaption);

  const { data: memorials } = useQuery({
    queryKey: ["my-memorials-mini"],
    queryFn: () => myMemorialsFn(),
    enabled: !!user && open,
  });

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
          image_urls: images,
          caption: caption.trim() || null,
          memorial_id: memorialId || null,
        },
      }),
    onSuccess: () => {
      toast.success("Posted.");
      setCaption(""); setImages([]); setMemorialId(""); setOpen(false);
      qc.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!user) return null;
  const canSubmit = (!!caption.trim() || images.length > 0) && !submit.isPending;

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
          <MultiPhotoUpload value={images} onChange={setImages} bucket="gallery" max={6} label="Add photos" />

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
