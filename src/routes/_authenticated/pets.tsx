import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PlusCircle, PawPrint, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { listMyPets, createPet } from "@/lib/pets.functions";
import { uploadPetPhoto } from "@/lib/upload-photo";

export const Route = createFileRoute("/_authenticated/pets")({
  component: PetsPage,
  head: () => ({
    meta: [
      { title: "Your pets — Rememfur" },
      { name: "description", content: "Every companion you're keeping memories for, in one gentle place." },
    ],
  }),
});

const SPECIES = ["dog", "cat", "bird", "rabbit", "reptile", "fish", "other"] as const;

export function lifeDates(p: { birthdate?: string | null; passing_date?: string | null }) {
  const b = p.birthdate ? new Date(p.birthdate).getFullYear() : null;
  const d = p.passing_date ? new Date(p.passing_date).getFullYear() : null;
  if (b && d) return `${b} – ${d}`;
  if (b) return `Born ${b}`;
  if (d) return `Until ${d}`;
  return "";
}

function PetsPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const listFn = useServerFn(listMyPets);
  const createFn = useServerFn(createPet);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [species, setSpecies] = useState<(typeof SPECIES)[number]>("dog");
  const [breed, setBreed] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [passing, setPassing] = useState("");
  const [story, setStory] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const pets = useQuery({ queryKey: ["my-pets"], queryFn: () => listFn() });

  const create = useMutation({
    mutationFn: () =>
      createFn({
        data: {
          name: name.trim(),
          species,
          breed: breed.trim() || null,
          birthdate: birthdate || null,
          passing_date: passing || null,
          story: story.trim() || null,
          avatar_url: photo,
        },
      }),
    onSuccess: (row: { id: string }) => {
      toast.success(`${name.trim()} is safe with us.`);
      setOpen(false);
      setName(""); setBreed(""); setBirthdate(""); setPassing(""); setStory(""); setPhoto(null); setSpecies("dog");
      qc.invalidateQueries({ queryKey: ["my-pets"] });
      qc.invalidateQueries({ queryKey: ["memory-keeper"] });
      navigate({ to: "/pets/$petId", params: { petId: row.id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const pickPhoto = async (file?: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      setPhoto(await uploadPetPhoto(file));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-foreground">Your pets</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Each one has a page of their own, and a timeline of the memories you keep for them.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="btn-gold-sm">
              <PlusCircle className="mr-2 h-4 w-4" /> Add pet
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Add a pet</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Photo</Label>
                <div className="mt-1 flex items-center gap-3">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-muted">
                    {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="h-5 w-5 text-muted-foreground" />}
                  </div>
                  <Input type="file" accept="image/*" onChange={(e) => pickPhoto(e.target.files?.[0])} disabled={uploading} />
                </div>
              </div>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Birthday</Label>
                  <Input type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} />
                </div>
                <div>
                  <Label>Passing date</Label>
                  <Input type="date" value={passing} onChange={(e) => setPassing(e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Their story</Label>
                <Textarea rows={3} value={story} onChange={(e) => setStory(e.target.value)} placeholder="How they came into your life…" />
              </div>
              <Button onClick={() => create.mutate()} disabled={!name.trim() || create.isPending || uploading} className="btn-gold w-full">
                {create.isPending ? "Saving…" : "Save pet"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pets.isLoading && <div className="col-span-full text-center text-muted-foreground">Loading…</div>}
        {pets.data && pets.data.length === 0 && (
          <div className="col-span-full rounded-3xl border border-dashed border-border p-10 text-center">
            <PawPrint className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 font-display text-xl text-foreground">No pets yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Add your first companion to begin keeping their memories.</p>
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
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-sage/15 text-sage-deep">
                {p.avatar_url ? <img src={p.avatar_url} alt={p.name} className="h-full w-full object-cover" /> : <PawPrint className="h-5 w-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-display text-xl text-foreground">{p.name}</div>
                <div className="text-xs capitalize text-muted-foreground">
                  {p.species}{p.breed ? ` · ${p.breed}` : ""}
                </div>
              </div>
            </div>
            {lifeDates(p) && <div className="mt-3 text-xs text-muted-foreground">{lifeDates(p)}</div>}
          </Link>
        ))}
      </div>
    </div>
  );
}
