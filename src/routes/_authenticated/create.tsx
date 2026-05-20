import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { createMemorial } from "@/lib/memorials.functions";
import { transformPortrait } from "@/lib/transform.functions";
import { lightCandle } from "@/lib/tributes.functions";
import { Sparkles, Upload, Heart, Check, Loader2, X } from "lucide-react";
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

export const Route = createFileRoute("/_authenticated/create")({
  component: CreatePage,
  head: () => ({ meta: [{ title: "Create memorial — Rememfur" }] }),
});

const STYLES = [
  { key: "painting", label: "Memory Painting", note: "Oil portrait" },
  { key: "storybook", label: "Soft Storybook", note: "Whimsical illustration" },
  { key: "sketch", label: "Timeless Sketch", note: "Pencil portrait" },
  { key: "watercolor", label: "Watercolor", note: "Dreamy remembrance" },
] as const;

type StyleKey = (typeof STYLES)[number]["key"];

function CreatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const transformFn = useServerFn(transformPortrait);
  const createFn = useServerFn(createMemorial);
  const candleFn = useServerFn(lightCandle);

  const [step, setStep] = useState(1);
  const [heroUrl, setHeroUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [style, setStyle] = useState<StyleKey>("painting");
  const [transformedUrl, setTransformedUrl] = useState<string | null>(null);
  const [transforming, setTransforming] = useState(false);

  const [petName, setPetName] = useState("");
  const [species, setSpecies] = useState<"dog" | "cat" | "other">("dog");
  const [birthDate, setBirthDate] = useState("");
  const [passingDate, setPassingDate] = useState("");
  const [epitaph, setEpitaph] = useState("");
  const [story, setStory] = useState("");

  const [candleMsg, setCandleMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const hasProgress =
    !!heroUrl || !!transformedUrl || !!petName || !!epitaph || !!story || !!candleMsg;

  const handleCancel = () => {
    setCancelling(true);
    window.setTimeout(() => navigate({ to: "/dashboard" }), 360);
  };

  const handleUpload = async (file: File) => {
    if (!user) return;
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("pet-photos").upload(path, file, { contentType: file.type });
    setUploading(false);
    if (error) return toast.error(error.message);
    const { data } = supabase.storage.from("pet-photos").getPublicUrl(path);
    setHeroUrl(data.publicUrl);
    toast.success("Photo uploaded.");
  };

  const runTransform = async () => {
    if (!heroUrl) return;
    setTransforming(true);
    try {
      const res = await transformFn({ data: { source_image_url: heroUrl, style } });
      setTransformedUrl(res.url);
      toast.success("Portrait painted.");
    } catch (e: any) {
      toast.error(e.message ?? "Could not paint the portrait");
    } finally {
      setTransforming(false);
    }
  };

  const finish = async () => {
    if (!petName) return toast.error("Please add their name.");
    setSubmitting(true);
    try {
      const res = await createFn({
        data: {
          pet_name: petName,
          species,
          birth_date: birthDate || null,
          passing_date: passingDate || null,
          epitaph: epitaph || null,
          story: story || null,
          hero_image_url: heroUrl,
          transformed_image_url: transformedUrl,
          transform_style: transformedUrl ? style : null,
          is_public: true,
        },
      });
      try {
        await candleFn({ data: { memorial_id: res.id, message: candleMsg || null } });
      } catch {}
      toast.success("Memorial created with love.");
      navigate({ to: "/memorial/$slug", params: { slug: res.slug } });
    } catch (e: any) {
      toast.error(e.message ?? "Could not create memorial");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={
        cancelling
          ? "pointer-events-none animate-fade-out transition-opacity duration-300"
          : "animate-fade-in"
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-foreground">Create a memorial</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A four-step ritual: photo, transform, tribute, candle.
          </p>
        </div>
        {hasProgress ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground">
                <X className="mr-1 h-4 w-4" /> Cancel
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="font-display text-2xl">
                  Set this aside for now?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Your progress won't be saved. You can begin again whenever you feel ready.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-full">Keep going</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleCancel}
                  className="rounded-full bg-muted text-foreground hover:bg-muted/80"
                >
                  Yes, cancel
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full text-muted-foreground"
            onClick={handleCancel}
          >
            <X className="mr-1 h-4 w-4" /> Cancel
          </Button>
        )}
      </div>


      <ol className="mt-7 flex items-center gap-3 text-xs">
        {["Photo", "Transform", "Tribute", "Candle"].map((label, i) => {
          const n = i + 1;
          const active = step === n;
          const done = step > n;
          return (
            <li key={label} className="flex flex-1 items-center gap-2">
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${done ? "bg-sage-deep text-primary-foreground" : active ? "bg-terracotta text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                {done ? <Check className="h-3.5 w-3.5" /> : n}
              </span>
              <span className={`${active ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
              {i < 3 && <div className="ml-1 h-px flex-1 bg-border" />}
            </li>
          );
        })}
      </ol>

      <div className="mt-8 rounded-3xl border border-border/60 bg-card p-8 soft-shadow">
        {step === 1 && (
          <section>
            <h2 className="font-display text-2xl text-foreground">Upload a photo</h2>
            <p className="mt-1 text-sm text-muted-foreground">Choose one that feels like them.</p>
            <label className="mt-6 flex h-64 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-cream/40 transition hover:border-sage">
              {heroUrl ? (
                <img src={heroUrl} alt="" className="h-full w-full rounded-2xl object-cover" />
              ) : (
                <>
                  <Upload className="h-8 w-8 text-sage-deep" />
                  <div className="text-sm text-foreground">{uploading ? "Uploading…" : "Click to upload or drop a photo"}</div>
                  <div className="text-xs text-muted-foreground">JPG / PNG up to ~10MB</div>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
            </label>
            <div className="mt-6 flex justify-end">
              <Button disabled={!heroUrl} onClick={() => setStep(2)} className="rounded-full bg-sage-deep text-primary-foreground hover:bg-sage-deep/90">Next</Button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section>
            <h2 className="font-display text-2xl text-foreground">Choose a transformation</h2>
            <p className="mt-1 text-sm text-muted-foreground">AI gently paints your photo in the style you pick.</p>
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              {STYLES.map((s) => (
                <button key={s.key} onClick={() => setStyle(s.key)} className={`rounded-2xl border-2 p-4 text-left transition ${style === s.key ? "border-sage-deep bg-sage/10" : "border-border hover:border-sage/40"}`}>
                  <Sparkles className="h-5 w-5 text-terracotta" />
                  <div className="mt-2 font-display text-sm text-foreground">{s.label}</div>
                  <div className="text-xs text-muted-foreground">{s.note}</div>
                </button>
              ))}
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-muted/30 p-3 text-center">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Original</div>
                {heroUrl && <img src={heroUrl} alt="" className="mt-2 aspect-square w-full rounded-xl object-cover" />}
              </div>
              <div className="rounded-2xl border border-border bg-muted/30 p-3 text-center">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Painted portrait</div>
                {transforming ? (
                  <div className="mt-2 flex aspect-square w-full items-center justify-center rounded-xl bg-cream/40 text-sage-deep">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : transformedUrl ? (
                  <img src={transformedUrl} alt="" className="mt-2 aspect-square w-full rounded-xl object-cover" />
                ) : (
                  <div className="mt-2 flex aspect-square w-full items-center justify-center rounded-xl bg-cream/40 text-sm text-muted-foreground">Preview will appear here</div>
                )}
              </div>
            </div>
            <div className="mt-6 flex flex-wrap justify-between gap-2">
              <Button variant="ghost" onClick={() => setStep(1)} className="rounded-full">Back</Button>
              <div className="flex gap-2">
                <Button onClick={runTransform} disabled={transforming || !heroUrl} variant="outline" className="rounded-full">
                  {transforming ? "Painting…" : transformedUrl ? "Repaint" : "Paint portrait"}
                </Button>
                <Button onClick={() => setStep(3)} className="rounded-full bg-sage-deep text-primary-foreground hover:bg-sage-deep/90">
                  {transformedUrl ? "Next" : "Skip and continue"}
                </Button>
              </div>
            </div>
          </section>
        )}

        {step === 3 && (
          <section>
            <h2 className="font-display text-2xl text-foreground">Write a tribute</h2>
            <p className="mt-1 text-sm text-muted-foreground">In your own voice, in your own time.</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="pn">Their name</Label>
                <Input id="pn" value={petName} onChange={(e) => setPetName(e.target.value)} placeholder="Luna" />
              </div>
              <div>
                <Label htmlFor="sp">Species</Label>
                <select id="sp" value={species} onChange={(e) => setSpecies(e.target.value as any)} className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Label htmlFor="bd">Birth date (optional)</Label>
                <Input id="bd" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="pd">Angel day (optional)</Label>
                <Input id="pd" type="date" value={passingDate} onChange={(e) => setPassingDate(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="ep">A short epitaph</Label>
                <Input id="ep" value={epitaph} onChange={(e) => setEpitaph(e.target.value)} placeholder="You were my sunshine, every single day." />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="st">Their story</Label>
                <Textarea id="st" rows={6} value={story} onChange={(e) => setStory(e.target.value)} placeholder="What made them uniquely them? What will you miss most?" />
              </div>
            </div>
            <div className="mt-6 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(2)} className="rounded-full">Back</Button>
              <Button disabled={!petName} onClick={() => setStep(4)} className="rounded-full bg-sage-deep text-primary-foreground hover:bg-sage-deep/90">Next</Button>
            </div>
          </section>
        )}

        {step === 4 && (
          <section className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-terracotta/15 candle-glow">
              <Heart className="h-9 w-9 text-terracotta" />
            </div>
            <h2 className="mt-5 font-display text-3xl text-foreground">Light their first candle</h2>
            <p className="mt-2 text-sm text-muted-foreground">A flame to mark the moment.</p>
            <div className="mx-auto mt-5 max-w-md text-left">
              <Label htmlFor="cm">A few words (optional)</Label>
              <Textarea id="cm" rows={3} value={candleMsg} onChange={(e) => setCandleMsg(e.target.value)} placeholder="Rest gently, sweet friend." />
            </div>
            <div className="mt-7 flex justify-center gap-3">
              <Button variant="ghost" onClick={() => setStep(3)} className="rounded-full">Back</Button>
              <Button disabled={submitting} onClick={finish} size="lg" className="rounded-full bg-terracotta px-7 text-accent-foreground hover:bg-terracotta/90">
                {submitting ? "Lighting…" : "Light candle & publish"}
              </Button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
