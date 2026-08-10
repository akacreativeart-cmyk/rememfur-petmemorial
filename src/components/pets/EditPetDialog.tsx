import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Pencil, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { updatePet } from "@/lib/pets.functions";
import { uploadPetPhoto } from "@/lib/upload-photo";

const SPECIES = ["dog", "cat", "bird", "rabbit", "reptile", "fish", "other"] as const;

type Pet = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  birthdate: string | null;
  passing_date: string | null;
  story: string | null;
  avatar_url: string | null;
};

export function EditPetDialog({ pet }: { pet: Pet }) {
  const qc = useQueryClient();
  const updateFn = useServerFn(updatePet);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(pet.name);
  const [species, setSpecies] = useState<(typeof SPECIES)[number]>(
    (SPECIES as readonly string[]).includes(pet.species) ? (pet.species as (typeof SPECIES)[number]) : "other",
  );
  const [breed, setBreed] = useState(pet.breed ?? "");
  const [birthdate, setBirthdate] = useState(pet.birthdate ?? "");
  const [passing, setPassing] = useState(pet.passing_date ?? "");
  const [story, setStory] = useState(pet.story ?? "");
  const [photo, setPhoto] = useState<string | null>(pet.avatar_url);
  const [uploading, setUploading] = useState(false);

  const save = useMutation({
    mutationFn: () =>
      updateFn({
        data: {
          id: pet.id,
          name: name.trim(),
          species,
          breed: breed.trim() || null,
          birthdate: birthdate || null,
          passing_date: passing || null,
          story: story.trim() || null,
          avatar_url: photo,
        },
      }),
    onSuccess: () => {
      toast.success("Saved.");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["pet", pet.id] });
      qc.invalidateQueries({ queryKey: ["my-pets"] });
      qc.invalidateQueries({ queryKey: ["memory-keeper"] });
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" aria-label="Edit pet">
          <Pencil className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Edit {pet.name}</DialogTitle>
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
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Species</Label>
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value as (typeof SPECIES)[number])}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {SPECIES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <Label>Breed</Label>
              <Input value={breed} onChange={(e) => setBreed(e.target.value)} />
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
            <Textarea rows={4} value={story} onChange={(e) => setStory(e.target.value)} />
          </div>
          <Button className="btn-gold w-full" disabled={!name.trim() || save.isPending || uploading} onClick={() => save.mutate()}>
            {save.isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
