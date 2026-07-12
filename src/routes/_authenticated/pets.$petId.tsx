import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Trash2, PlusCircle, PawPrint, Heart, Syringe, Scissors, Shield, Cake, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { getMyPet, addPetRecord, deletePetRecord, deletePet } from "@/lib/pets.functions";

export const Route = createFileRoute("/_authenticated/pets/$petId")({
  component: PetDetailPage,
  head: () => ({ meta: [{ title: "Pet — Rememfur" }] }),
});

const KINDS = [
  { key: "health", label: "Health", icon: Heart },
  { key: "vaccination", label: "Vaccination", icon: Syringe },
  { key: "grooming", label: "Grooming", icon: Scissors },
  { key: "insurance", label: "Insurance", icon: Shield },
  { key: "birthday", label: "Birthday", icon: Cake },
  { key: "other", label: "Other", icon: FileText },
] as const;

type KindKey = (typeof KINDS)[number]["key"];

function iconFor(kind: string) {
  const found = KINDS.find((k) => k.key === kind);
  return found?.icon ?? FileText;
}

function PetDetailPage() {
  const { petId } = Route.useParams();
  const qc = useQueryClient();
  const getFn = useServerFn(getMyPet);
  const addFn = useServerFn(addPetRecord);
  const delRecFn = useServerFn(deletePetRecord);
  const delPetFn = useServerFn(deletePet);

  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<KindKey>("health");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [nextDue, setNextDue] = useState("");

  const q = useQuery({
    queryKey: ["pet", petId],
    queryFn: () => getFn({ data: { pet_id: petId } }),
  });

  const add = useMutation({
    mutationFn: () =>
      addFn({
        data: {
          pet_id: petId,
          kind,
          title: title.trim(),
          notes: notes.trim() || null,
          date,
          next_due_date: nextDue || null,
        },
      }),
    onSuccess: () => {
      toast.success("Record added.");
      setOpen(false);
      setTitle(""); setNotes(""); setNextDue("");
      qc.invalidateQueries({ queryKey: ["pet", petId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const delRec = useMutation({
    mutationFn: (id: string) => delRecFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pet", petId] }),
  });

  const delPet = useMutation({
    mutationFn: () => delPetFn({ data: { id: petId } }),
    onSuccess: () => {
      toast.success("Pet removed.");
      window.location.href = "/pets";
    },
  });

  if (q.isLoading) return <div className="text-center text-muted-foreground">Loading…</div>;
  if (!q.data?.pet) {
    return (
      <div className="mx-auto max-w-md text-center">
        <p className="font-display text-2xl text-foreground">Pet not found.</p>
        <Link to="/pets" className="mt-3 inline-block text-sage-deep underline">Back to My pets</Link>
      </div>
    );
  }

  const { pet, records } = q.data;
  const nextDue7 = records.filter((r) => r.next_due_date && new Date(r.next_due_date).getTime() < Date.now() + 30 * 86400_000);

  return (
    <div>
      <Link to="/pets" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> My pets
      </Link>

      <header className="mt-4 flex items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-sage/15 text-sage-deep">
          {pet.avatar_url ? <img src={pet.avatar_url} alt="" className="h-full w-full rounded-full object-cover" /> : <PawPrint className="h-7 w-7" />}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-3xl text-foreground">{pet.name}</h1>
          <p className="text-sm text-muted-foreground">
            {pet.species}{pet.breed ? ` · ${pet.breed}` : ""}
            {pet.birthdate ? ` · born ${new Date(pet.birthdate).toLocaleDateString()}` : ""}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => confirm("Remove this pet and all its records?") && delPet.mutate()}>
          <Trash2 className="h-4 w-4 text-muted-foreground" />
        </Button>
      </header>

      {pet.notes && (
        <p className="mt-4 whitespace-pre-wrap rounded-2xl bg-muted/50 p-4 text-sm text-foreground">{pet.notes}</p>
      )}

      {nextDue7.length > 0 && (
        <div className="mt-6 rounded-2xl border border-amber-400/40 bg-amber-400/5 p-4">
          <p className="text-xs uppercase tracking-wider text-amber-200/80">Coming up</p>
          <ul className="mt-2 space-y-1 text-sm text-foreground">
            {nextDue7.map((r) => (
              <li key={r.id}>· {r.title} — due {new Date(r.next_due_date!).toLocaleDateString()}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-display text-2xl text-foreground">Records</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-full bg-sage-deep text-primary-foreground hover:bg-sage-deep/90">
              <PlusCircle className="mr-2 h-4 w-4" /> Add record
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Add a record</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Kind</Label>
                <select
                  value={kind}
                  onChange={(e) => setKind(e.target.value as KindKey)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {KINDS.map((k) => <option key={k.key} value={k.key}>{k.label}</option>)}
                </select>
              </div>
              <div>
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Rabies booster" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div>
                  <Label>Next due</Label>
                  <Input type="date" value={nextDue} onChange={(e) => setNextDue(e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
              <Button
                onClick={() => add.mutate()}
                disabled={!title.trim() || add.isPending}
                className="w-full bg-sage-deep text-primary-foreground hover:bg-sage-deep/90"
              >
                {add.isPending ? "Saving…" : "Save record"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-4 space-y-2">
        {records.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No records yet. Add their first vet visit, vaccination or grooming appointment.
          </div>
        )}
        {records.map((r) => {
          const Icon = iconFor(r.kind);
          return (
            <div key={r.id} className="group flex items-start gap-3 rounded-2xl border border-border/60 bg-card p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage/15 text-sage-deep">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{r.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.date).toLocaleDateString()}
                      {r.next_due_date ? ` · next ${new Date(r.next_due_date).toLocaleDateString()}` : ""}
                    </p>
                  </div>
                  <button onClick={() => delRec.mutate(r.id)} aria-label="Delete record" className="opacity-0 transition group-hover:opacity-100">
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
                {r.notes && <p className="mt-1 whitespace-pre-wrap text-sm text-foreground/85">{r.notes}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
