import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ImagePlus, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { createPost } from "@/lib/feed.functions";
import { listMyMemorials } from "@/lib/memorials.functions";
import { assistCaption } from "@/lib/ai-assist.functions";

export const Route = createFileRoute("/create/post")({
  component: CreatePostPage,
  head: () => ({
    meta: [
      { title: "Post to the community — Rememfur" },
      { name: "description", content: "Share a memory, a question, or a hard day with people who understand." },
    ],
  }),
});

function CreatePostPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [memorialId, setMemorialId] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const createFn = useServerFn(createPost);
  const myMemorialsFn = useServerFn(listMyMemorials);
  const assistFn = useServerFn(assistCaption);

  const { data: memorials } = useQuery({
    queryKey: ["my-memorials-mini"],
    queryFn: () => myMemorialsFn(),
    enabled: !!user,
  });

  const handleFile = async (file: File) => {
    if (!user) return;
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/post-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("gallery").upload(path, file, { contentType: file.type });
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
      qc.invalidateQueries({ queryKey: ["feed"] });
      navigate({ to: "/community" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-5 py-16 text-center">
        <p className="font-display text-2xl text-foreground">Sign in to post</p>
        <p className="mt-2 text-sm text-muted-foreground">You need an account to share with the community.</p>
        <div className="mt-6 flex justify-center gap-2">
          <Link to="/login"><Button variant="outline">Log in</Button></Link>
          <Link to="/signup" className="btn-gold-sm">Join</Link>
        </div>
      </div>
    );
  }

  const canSubmit = (!!caption.trim() || !!imageUrl) && !submit.isPending;

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-foreground">Share a memory</h1>
        <Link to="/create" className="text-sm text-muted-foreground hover:text-foreground">Cancel</Link>
      </div>

      <div className="mt-6 space-y-4 rounded-3xl border border-border/60 bg-card p-5 soft-shadow">
        <Textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={6}
          placeholder="What's on your mind? A memory, a photo, a hard day…"
          className="resize-none border-0 bg-transparent text-lg leading-relaxed focus-visible:ring-0"
          autoFocus
        />

        {imageUrl && (
          <div className="relative overflow-hidden rounded-2xl bg-muted">
            <img src={imageUrl} alt="" className="max-h-[420px] w-full object-cover" />
            <button
              onClick={() => setImageUrl(null)}
              className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border/40 pt-4">
          <div className="flex items-center gap-2">
            <label className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-sage-deep hover:bg-sage/10">
              <ImagePlus className="h-4 w-4" />
              {uploading ? "Uploading…" : "Photo"}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </label>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={assist.isPending}
              onClick={() => assist.mutate()}
              className="h-8 text-sage-deep hover:bg-sage/10"
            >
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              {assist.isPending ? "Thinking…" : "AI"}
            </Button>
            <button
              onClick={() => setShowDetails((s) => !s)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {showDetails ? "Hide details" : "Add details"}
            </button>
          </div>
          <Button
            disabled={!canSubmit}
            onClick={() => submit.mutate()}
            className="rounded-full bg-sage-deep px-5 text-primary-foreground hover:bg-sage-deep/90"
          >
            {submit.isPending ? "Posting…" : "Post"}
          </Button>
        </div>

        {showDetails && memorials && memorials.length > 0 && (
          <div className="border-t border-border/40 pt-4">
            <Label htmlFor="mem" className="text-xs uppercase tracking-wider text-muted-foreground">Tag a memorial</Label>
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
      </div>
    </div>
  );
}
