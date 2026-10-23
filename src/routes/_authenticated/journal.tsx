import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { listJournal, createJournalEntry, deleteJournalEntry } from "@/lib/journal.functions";
import { toast } from "sonner";
import { format } from "date-fns";
import { Trash2, BookOpen } from "lucide-react";

export const Route = createFileRoute("/_authenticated/journal")({
  component: JournalPage,
  head: () => ({ meta: [{ title: "Memory journal — Rememfur" }] }),
});

function JournalPage() {
  const qc = useQueryClient();
  const fetchList = useServerFn(listJournal);
  const fetchCreate = useServerFn(createJournalEntry);
  const fetchDelete = useServerFn(deleteJournalEntry);
  const { data } = useQuery({ queryKey: ["journal"], queryFn: () => fetchList() });

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const create = useMutation({
    mutationFn: () => fetchCreate({ data: { title: title || null, body } }),
    onSuccess: () => {
      setTitle(""); setBody("");
      toast.success("Entry saved.");
      qc.invalidateQueries({ queryKey: ["journal"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: (id: string) => fetchDelete({ data: { id } }),
    onSuccess: () => {
      toast.success("Entry removed.");
      qc.invalidateQueries({ queryKey: ["journal"] });
    },
  });

  return (
    <div>
      <h1 className="font-display text-4xl text-foreground">Memory journal</h1>
      <p className="mt-1 text-sm text-muted-foreground">A private space for your thoughts and memories. Only you can see this.</p>

      <div className="mt-7 rounded-3xl border border-border/60 bg-card p-6 soft-shadow">
        <div className="flex items-center gap-2 text-sage-deep">
          <BookOpen className="h-4 w-4" /> <span className="text-xs uppercase tracking-wider">New entry</span>
        </div>
        <Input className="mt-3" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (optional)" />
        <Textarea className="mt-3" rows={5} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Today I remembered…" />
        <div className="mt-3 flex justify-end">
          <Button disabled={!body.trim() || create.isPending} onClick={() => create.mutate()} className="rounded-full bg-sage-deep text-primary-foreground hover:bg-sage-deep/90">
            Save entry
          </Button>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {(data ?? []).length === 0 && (
          <p className="rounded-3xl border border-dashed border-border bg-card/60 p-10 text-center text-sm text-muted-foreground">
            No entries yet. When you're ready, write a sentence — that's enough.
          </p>
        )}
        {(data ?? []).map((e: any) => (
          <article key={e.id} className="rounded-3xl border border-border/60 bg-card p-6 soft-shadow">
            <div className="flex items-start justify-between gap-3">
              <div>
                {e.title && <h3 className="font-display text-xl text-foreground">{e.title}</h3>}
                <div className="text-xs text-muted-foreground">{format(new Date(e.created_at), "MMMM d, yyyy · h:mm a")}</div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => del.mutate(e.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-foreground/90">{e.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
