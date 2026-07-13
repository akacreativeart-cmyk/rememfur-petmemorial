import { createFileRoute, useNavigate, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  getMyMemorialBySlug,
  updateMemorial,
  softDeleteMemorial,
  listMyMemorialPhotos,
  addMemorialPhoto,
  deleteMemorialPhoto,
} from "@/lib/memorials.functions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Trash2, ArrowLeft, Save, Upload, ImagePlus, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/memorial/$slug/edit")({
  component: EditMemorialPage,
  loader: async ({ params }) => {
    const m = await getMyMemorialBySlug({ data: { slug: params.slug } });
    if (!m) throw notFound();
    return m;
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `Edit ${loaderData?.pet_name ?? "memorial"} — Rememfur` }],
  }),
});

function EditMemorialPage() {
  const m = Route.useLoaderData();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const fetchUpdate = useServerFn(updateMemorial);
  const fetchDelete = useServerFn(softDeleteMemorial);
  const fetchPhotos = useServerFn(listMyMemorialPhotos);
  const fetchAddPhoto = useServerFn(addMemorialPhoto);
  const fetchDelPhoto = useServerFn(deleteMemorialPhoto);

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const { data: photos = [] } = useQuery({
    queryKey: ["mine-photos", m.id],
    queryFn: () => fetchPhotos({ data: { memorial_id: m.id } }),
  });

  const handlePhotoUpload = async (file: File) => {
    if (!user) return;
    setUploadingPhoto(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/${m.id}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("gallery")
      .upload(path, file, { contentType: file.type });
    if (upErr) {
      setUploadingPhoto(false);
      return toast.error(upErr.message);
    }
    const { data: pub } = supabase.storage.from("gallery").getPublicUrl(path);
    try {
      await fetchAddPhoto({ data: { memorial_id: m.id, image_url: pub.publicUrl } });
      qc.invalidateQueries({ queryKey: ["mine-photos", m.id] });
      toast.success("Photo added.");
    } catch (e: any) {
      toast.error(e.message);
    }
    setUploadingPhoto(false);
  };

  const handlePhotoDelete = async (photoId: string) => {
    try {
      await fetchDelPhoto({ data: { photo_id: photoId } });
      qc.invalidateQueries({ queryKey: ["mine-photos", m.id] });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const [petName, setPetName] = useState(m.pet_name);
  const [species, setSpecies] = useState<"dog" | "cat" | "other">(
    (m.species ?? "other") as "dog" | "cat" | "other",
  );
  const [birthDate, setBirthDate] = useState(m.birth_date ?? "");
  const [passingDate, setPassingDate] = useState(m.passing_date ?? "");
  const [epitaph, setEpitaph] = useState(m.epitaph ?? "");
  const [story, setStory] = useState(m.story ?? "");
  const [isPublic, setIsPublic] = useState(!!m.is_public);

  const save = useMutation({
    mutationFn: () =>
      fetchUpdate({
        data: {
          slug: m.slug,
          pet_name: petName,
          species,
          birth_date: birthDate || null,
          passing_date: passingDate || null,
          epitaph: epitaph || null,
          story: story || null,
          is_public: isPublic,
        },
      }),
    onSuccess: () => {
      toast.success("Memorial updated.");
      navigate({ to: "/memorial/$slug", params: { slug: m.slug } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: () => fetchDelete({ data: { id: m.id } }),
    onSuccess: () => {
      toast.success(`${m.pet_name}'s memorial has been quietly taken down.`);
      navigate({ to: "/dashboard" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Link
            to="/memorial/$slug"
            params={{ slug: m.slug }}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> Back to memorial
          </Link>
          <h1 className="mt-1 font-display text-4xl text-foreground">
            Edit {m.pet_name}'s memorial
          </h1>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-border/60 bg-card p-7 soft-shadow">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="pn">Their name</Label>
            <Input id="pn" value={petName} onChange={(e) => setPetName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="sp">Species</Label>
            <select
              id="sp"
              value={species}
              onChange={(e) => setSpecies(e.target.value as "dog" | "cat" | "other")}
              className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <Label htmlFor="bd">Birth date</Label>
            <Input id="bd" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="pd">Angel day</Label>
            <Input id="pd" type="date" value={passingDate} onChange={(e) => setPassingDate(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="ep">Epitaph</Label>
            <Input id="ep" value={epitaph} onChange={(e) => setEpitaph(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="st">Their story</Label>
            <Textarea id="st" rows={6} value={story} onChange={(e) => setStory(e.target.value)} />
          </div>
          <div className="md:col-span-2 flex items-center justify-between rounded-2xl bg-cream/60 p-4">
            <div>
              <div className="text-sm font-medium text-foreground">Public memorial</div>
              <div className="text-xs text-muted-foreground">
                Visible in the Memorial Garden so others can light paw lamps.
              </div>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>
        </div>

        {/* Gallery management */}
        <div className="mt-8 border-t border-border/60 pt-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl text-foreground">Gallery</h2>
              <p className="mt-1 text-xs text-muted-foreground">Photos that appear on {m.pet_name}'s memorial.</p>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground transition hover:bg-muted">
              <Upload className="h-3.5 w-3.5" />
              {uploadingPhoto ? "Uploading…" : "Add photo"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])}
              />
            </label>
          </div>
          {photos.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-border bg-cream/40 p-8 text-center text-sm text-muted-foreground">
              <ImagePlus className="mx-auto h-6 w-6 opacity-70" />
              <p className="mt-2">No gallery photos yet. Add a favorite moment.</p>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-3 gap-3 md:grid-cols-4 lg:grid-cols-5">
              {photos.map((p: any) => (
                <div key={p.id} className="group relative aspect-square overflow-hidden rounded-2xl bg-muted">
                  <img src={p.image_url} alt={p.caption ?? ""} className="h-full w-full object-cover" />
                  <button
                    onClick={() => handlePhotoDelete(p.id)}
                    aria-label="Remove photo"
                    className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition group-hover:opacity-100 hover:bg-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>


        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-6">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="rounded-full text-destructive hover:text-destructive">
                <Trash2 className="mr-1.5 h-4 w-4" /> Take down this memorial
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="font-display text-2xl">
                  Take down {m.pet_name}'s memorial?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will quietly take down {m.pet_name}'s memorial and its paw lamps. This can be undone by contacting support.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-full">Keep it</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => remove.mutate()}
                  disabled={remove.isPending}
                  className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {remove.isPending ? "Taking down…" : "Take it down gently"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <div className="flex gap-2">
            <Link to="/memorial/$slug" params={{ slug: m.slug }}>
              <Button variant="ghost" className="rounded-full">Cancel</Button>
            </Link>
            <Button
              onClick={() => save.mutate()}
              disabled={save.isPending || !petName.trim()}
              className="rounded-full bg-sage-deep text-primary-foreground hover:bg-sage-deep/90"
            >
              <Save className="mr-1.5 h-4 w-4" />
              {save.isPending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
