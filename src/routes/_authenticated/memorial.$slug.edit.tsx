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
  deleteMemorial,
} from "@/lib/memorials.functions";
import { toast } from "sonner";
import { Trash2, ArrowLeft, Save } from "lucide-react";

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
  const fetchUpdate = useServerFn(updateMemorial);
  const fetchDelete = useServerFn(deleteMemorial);

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
      toast.success("Memorial removed gently.");
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
                Visible in the Memorial Garden so others can light candles.
              </div>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-6">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="rounded-full text-destructive hover:text-destructive">
                <Trash2 className="mr-1.5 h-4 w-4" /> Delete memorial
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="font-display text-2xl">
                  Let {m.pet_name}'s page go?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This removes the memorial, all candles, messages, and photos. It cannot be undone — your memories of them remain forever.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-full">Keep it</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => remove.mutate()}
                  disabled={remove.isPending}
                  className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {remove.isPending ? "Removing…" : "Yes, remove gently"}
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
