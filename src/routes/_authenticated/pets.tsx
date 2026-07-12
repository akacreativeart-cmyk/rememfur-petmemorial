import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PlusCircle, PawPrint, Cake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { listMyPets, createPet } from "@/lib/pets.functions";

export const Route = createFileRoute("/_authenticated/pets")({
  component: PetsPage,
  head: () => ({ meta: [{ title: "My pets — Rememfur" }] }),
});

const SPECIES = ["dog", "cat", "bird", "rabbit", "reptile", "fish", "other"] as const;

function PetsPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listMyPets);
  const createFn = useServerFn(createPet);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [species, setSpecies] = useState<(typeof SPECIES)[number]>("dog");
  const [breed, setBreed] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [notes, setNotes] = useState("");

  const pets = useQuery({ queryKey: ["my-pets"], queryFn: () => listFn() });

  const create = useMutation({
    mutationFn: () =>
      createFn({
        data: {
          name: name.trim(),
          species,
          breed: breed.trim() || null,
          birthdate: birthdate || null,
          notes: notes.trim() || null,
        },
      }),
    onSuccess: () => {
      toast.success("Pet added.");
      setOpen(false);
      setName(""); setBreed(""); setBirthdate(""); setNotes(""); setSpecies("dog");
      qc.invalidateQueries({ queryKey: ["my-pets"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-foreground">My pets</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep their records — health, grooming, insurance, birthdays — all in one place.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-sage-deep text-primary-foreground hover:bg-sage-deep/90">
              <PlusCircle className="mr-2 h-4 w-4" /> Add pet
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Add a pet</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Their name" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Species</Label>
                  <select
                    value={species}
                    onChange={(e) => setSpecies(e.target.value as typeof species)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {SPECIES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Breed</Label>
                  <Input value={breed} onChange={(e) => setBreed(e.target.value)} placeholder="Optional" />
                </div>
              </div>
              <div>
                <Label>Birthdate</Label>
                <Input type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything worth remembering" />
              </div>
              <Button
                onClick={() => create.mutate()}
                disabled={!name.trim() || create.isPending}
                className="w-full bg-sage-deep text-primary-foreground hover:bg-sage-deep/90"
              >
                {create.isPending ? "Adding…" : "Add pet"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pets.isLoading && (
          <div className="col-span-full text-center text-muted-foreground">Loading…</div>
        )}
        {pets.data && pets.data.length === 0 && (
          <div className="col-span-full rounded-3xl border border-dashed border-border p-10 text-center">
            <PawPrint className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 font-display text-xl text-foreground">No pets yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Add your first companion to start keeping their records.</p>
          </div>
        )}
        {(pets.data ?? []).map((p) => (
          <Link
            key={p.id}
            to="/pets/$petId"
            params={{ petId: p.id }}
            className="group flex flex-col rounded-2xl border border-border/60 bg-card p-5 transition hover:border-sage/50 soft-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sage/15 text-sage-deep">
                {p.avatar_url ? (
                  <img src={p.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                ) : (
                  <PawPrint className="h-5 w-5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-display text-xl text-foreground">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.species}{p.breed ? ` · ${p.breed}` : ""}</div>
              </div>
            </div>
            {p.birthdate && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Cake className="h-3.5 w-3.5" /> {new Date(p.birthdate).toLocaleDateString()}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
