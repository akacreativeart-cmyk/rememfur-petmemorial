import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PlusCircle, Pencil, Trash2, BookHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { listMemories, createMemory, updateMemory, deleteMemory } from "@/lib/memories.functions";
import { MultiPhotoUpload } from "@/components/site/MultiPhotoUpload";
import { PhotoCarousel } from "@/components/site/PhotoCarousel";

type Memory = {
  id: string;
  title: string;
  content: string | null;
  memory_date: string;
  photo_url: string | null;
  photos?: string[];
};

const today = () => new Date().toISOString().slice(0, 10);

export function MemoryTimeline({ petId, petName }: { petId: string; petName: string }) {
  const qc = useQueryClient();
  const listFn = useServerFn(listMemories);
  const createFn = useServerFn(createMemory);
  const updateFn = useServerFn(updateMemory);
  const deleteFn = useServerFn(deleteMemory);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Memory | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState(today());
  const [photos, setPhotos] = useState<string[]>([]);

  const q = useQuery({ queryKey: ["memories", petId], queryFn: () => listFn({ data: { pet_id: petId } }) });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["memories", petId] });
    qc.invalidateQueries({ queryKey: ["memory-keeper"] });
  };

  const openNew = () => {
    setEditing(null);
    setTitle(""); setContent(""); setDate(today()); setPhotos([]);
    setOpen(true);
  };

  const openEdit = (m: Memory) => {
    setEditing(m);
    setTitle(m.title);
    setContent(m.content ?? "");
    setDate(m.memory_date);
    setPhotos(m.photos?.length ? m.photos : m.photo_url ? [m.photo_url] : []);
    setOpen(true);
  };

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        title: title.trim(),
        content: content.trim() || null,
        memory_date: date,
        photo_url: photos[0] ?? null,
        photo_urls: photos,
      };
      if (editing) return updateFn({ data: { id: editing.id, ...payload } });
      return createFn({ data: { pet_id: petId, ...payload } });
    },
    onSuccess: () => {
      toast.success(editing ? "Memory updated." : "Memory saved.");
      setOpen(false);
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Memory removed.");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const memories = (q.data ?? []) as Memory[];

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-foreground">Memories</h2>
          <p className="text-sm text-muted-foreground">The moments with {petName} you never want to lose.</p>
        </div>
        <Button size="sm" className="btn-gold-sm" onClick={openNew}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add memory
        </Button>
      </div>

      <div className="mt-4 space-y-3">
        {q.isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
        {!q.isLoading && memories.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <BookHeart className="mx-auto h-7 w-7 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              No memories yet. Start with the first day you met, or a small everyday thing they did.
            </p>
          </div>
        )}
        {memories.map((m) => (
          <article key={m.id} className="rounded-2xl border border-border/60 bg-card p-4 soft-shadow">
            <div className="flex items-start gap-3">
              {(m.photos?.length ? m.photos : m.photo_url ? [m.photo_url] : []).length > 0 && (
                <div className="w-28 shrink-0 sm:w-36">
                  <PhotoCarousel
                    images={m.photos?.length ? m.photos : [m.photo_url as string]}
                    imgClassName="aspect-square w-full object-cover"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  {new Date(m.memory_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                </p>
                <h3 className="font-display text-xl text-foreground">{m.title}</h3>
                {m.content && <p className="mt-1 whitespace-pre-wrap text-sm text-foreground/85">{m.content}</p>}
              </div>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="sm" aria-label="Edit memory" onClick={() => openEdit(m)}>
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Delete memory"
                  onClick={() => confirm("Delete this memory?") && remove.mutate(m.id)}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">{editing ? "Edit memory" : "Add a memory"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="The day at the lake" />
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <Label>Story</Label>
              <Textarea rows={5} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write it as you remember it…" />
            </div>
            <div>
              <Label>Photos</Label>
              <MultiPhotoUpload className="mt-1" value={photos} onChange={setPhotos} bucket="pet-photos" max={6} />
            </div>
            <Button className="btn-gold w-full" disabled={!title.trim() || save.isPending} onClick={() => save.mutate()}>
              {save.isPending ? "Saving…" : editing ? "Save changes" : "Save memory"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
