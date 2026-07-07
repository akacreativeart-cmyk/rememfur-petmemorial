import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AuthGateDialog } from "@/components/site/AuthGateDialog";
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
import { assistCaption } from "@/lib/ai-assist.functions";
import {
  Sparkles,
  Upload,
  Heart,
  Check,
  Loader2,
  X,
  ShoppingBag,
  Phone,
  Users,
  HandHeart,
  ArrowRight,
  Copy,
  Share2,
  Mail,
  MessageCircle,
  Facebook,
  Twitter,
} from "lucide-react";
import { GravestoneCard } from "@/components/site/GravestoneCard";
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

export const Route = createFileRoute("/create")({
  component: CreatePage,
  validateSearch: (search: Record<string, unknown>) => ({
    welcome: search.welcome === 1 || search.welcome === "1" ? 1 : undefined,
  }),
  head: () => ({ meta: [{ title: "Create memorial — Rememfur" }] }),
});

const STYLES = [
  { key: "painting", label: "Memory Painting", note: "Oil portrait" },
  { key: "storybook", label: "Soft Storybook", note: "Whimsical illustration" },
  { key: "sketch", label: "Timeless Sketch", note: "Pencil portrait" },
  { key: "watercolor", label: "Watercolor", note: "Dreamy remembrance" },
] as const;

type StyleKey = (typeof STYLES)[number]["key"];

const TRAIT_TAGS = [
  "playful", "loyal", "gentle", "mischievous", "cuddly", "brave",
  "curious", "goofy", "wise", "sunshine", "shadow", "best friend",
];

function CreatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const transformFn = useServerFn(transformPortrait);
  const createFn = useServerFn(createMemorial);
  const candleFn = useServerFn(lightCandle);
  const assistFn = useServerFn(assistCaption);

  const [step, setStep] = useState(1);
  const [heroUrl, setHeroUrl] = useState<string | null>(null);
  const [heroKind, setHeroKind] = useState<"image" | "video" | "audio" | "file">("image");
  const [uploading, setUploading] = useState(false);
  // For guests: keep the actual File in memory (blob URL for preview).
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [needsPhotoReattach, setNeedsPhotoReattach] = useState(false);

  const [style, setStyle] = useState<StyleKey>("painting");
  const [transformedUrl, setTransformedUrl] = useState<string | null>(null);
  const [transforming, setTransforming] = useState(false);
  const [modFilter, setModFilter] = useState<"none" | "warm" | "noir" | "bloom" | "honey" | "dream" | "fade">("none");
  const [compareView, setCompareView] = useState<"split" | "stack">("split");


  const [petName, setPetName] = useState("");
  const [species, setSpecies] = useState<"dog" | "cat" | "other">("dog");
  const [birthDate, setBirthDate] = useState("");
  const [passingDate, setPassingDate] = useState("");
  const [epitaph, setEpitaph] = useState("");
  const [story, setStory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [assisting, setAssisting] = useState(false);
  const [showGravestone, setShowGravestone] = useState(false);

  const [candleMsg, setCandleMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const finishOnAuthRef = useRef(false);

  const DRAFT_KEY = "rememfur.create.draft.v1";
  const FINISH_FLAG = "rememfur.create.finishAfterAuth.v1";

  const saveDraft = () => {
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ petName, species, birthDate, passingDate, epitaph, story, tags, candleMsg, style, step }),
      );
    } catch { /* ignore */ }
  };

  const clearDraft = () => {
    try { localStorage.removeItem(DRAFT_KEY); localStorage.removeItem(FINISH_FLAG); } catch { /* ignore */ }
  };

  // On mount: restore any pending draft (fields survive, photo file does not).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.petName && !petName) setPetName(d.petName);
      if (d.species) setSpecies(d.species);
      if (d.birthDate) setBirthDate(d.birthDate);
      if (d.passingDate) setPassingDate(d.passingDate);
      if (d.epitaph) setEpitaph(d.epitaph);
      if (d.story) setStory(d.story);
      if (Array.isArray(d.tags)) setTags(d.tags);
      if (d.candleMsg) setCandleMsg(d.candleMsg);
      if (d.style) setStyle(d.style);
      if (d.step && typeof d.step === "number") setStep(Math.min(d.step, 4));
      if (localStorage.getItem(FINISH_FLAG) === "1") setNeedsPhotoReattach(true);
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasProgress =
    !!heroUrl || !!transformedUrl || !!petName || !!epitaph || !!story || !!candleMsg;

  const handleCancel = () => {
    setCancelling(true);
    clearDraft();
    window.setTimeout(() => navigate({ to: user ? "/dashboard" : "/" }), 360);
  };

  const uploadFileForUser = async (file: File, userId: string): Promise<string> => {
    const ext = file.name.split(".").pop() || "bin";
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("pet-photos").upload(path, file, { contentType: file.type });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from("pet-photos").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleUpload = async (file: File) => {
    const t = file.type;
    const kind: typeof heroKind = t.startsWith("video/") ? "video" : t.startsWith("audio/") ? "audio" : t.startsWith("image/") ? "image" : "file";
    setHeroKind(kind);
    setNeedsPhotoReattach(false);
    if (!user) {
      // Guest: hold onto the file in memory, preview via blob URL.
      setPendingFile(file);
      setHeroUrl(URL.createObjectURL(file));
      toast.success("Photo added — we'll finish saving when you're signed in.");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadFileForUser(file, user.id);
      setHeroUrl(url);
      setPendingFile(null);
      toast.success("Memory uploaded.");
    } catch (e: any) {
      toast.error(e?.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
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

  const toggleTag = (t: string) => {
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const aiAssist = async () => {
    setAssisting(true);
    try {
      const seed = [
        petName && `About ${petName}, a ${species}.`,
        tags.length && `They were ${tags.join(", ")}.`,
        story.trim(),
      ].filter(Boolean).join(" ");
      const res = await assistFn({ data: { draft: seed, tone: "tender" } });
      if (res?.caption) setStory(res.caption);
      toast.success("AI draft ready — edit freely.");
    } catch (e: any) {
      toast.error(e.message ?? "AI assist unavailable");
    } finally {
      setAssisting(false);
    }
  };

  const doFinish = async (activeUserId: string) => {
    setSubmitting(true);
    try {
      // If a guest picked a file before signing in, upload it now.
      let finalHeroUrl = heroUrl;
      if (pendingFile) {
        const url = await uploadFileForUser(pendingFile, activeUserId);
        finalHeroUrl = url;
        setHeroUrl(url);
        setPendingFile(null);
      } else if (heroUrl && heroUrl.startsWith("blob:")) {
        // Stale blob URL with no file — clear it (photo was lost on redirect).
        finalHeroUrl = null;
        setHeroUrl(null);
      }
      const fullStory = [story.trim(), tags.length ? `\n\nThey were ${tags.join(", ")}.` : ""].join("");
      const res = await createFn({
        data: {
          pet_name: petName,
          species,
          birth_date: birthDate || null,
          passing_date: passingDate || null,
          epitaph: epitaph || null,
          story: fullStory || null,
          hero_image_url: finalHeroUrl,
          transformed_image_url: transformedUrl,
          transform_style: transformedUrl ? style : null,
          is_public: true,
        },
      });
      try {
        await candleFn({ data: { memorial_id: res.id, message: candleMsg || null } });
      } catch {}
      toast.success("Memorial created with love.");
      setPublishedSlug(res.slug);
      setStep(5);
      clearDraft();
    } catch (e: any) {
      toast.error(e.message ?? "Could not create memorial");
    } finally {
      setSubmitting(false);
    }
  };

  const finish = async () => {
    if (!petName) return toast.error("Please add their name.");
    if (!user) {
      // Guest: preserve draft and prompt sign-in.
      saveDraft();
      finishOnAuthRef.current = true;
      setAuthOpen(true);
      return;
    }
    await doFinish(user.id);
  };

  // If a guest signs in via password inside the dialog, auto-continue the save.
  useEffect(() => {
    if (user && finishOnAuthRef.current && petName) {
      finishOnAuthRef.current = false;
      void doFinish(user.id);
    }
    // Also handle post-OAuth-redirect return.
    if (user && !finishOnAuthRef.current && petName) {
      try {
        if (localStorage.getItem(FINISH_FLAG) === "1") {
          localStorage.removeItem(FINISH_FLAG);
          if (pendingFile || !needsPhotoReattach) {
            void doFinish(user.id);
          }
        }
      } catch { /* ignore */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const { welcome } = Route.useSearch();

  return (
    <div
      className={
        cancelling
          ? "pointer-events-none animate-fade-out transition-opacity duration-300"
          : "animate-fade-in"
      }
    >
      {welcome === 1 && step === 1 && (
        <div className="mb-8 overflow-hidden rounded-3xl border border-amber-400/25 bg-gradient-to-br from-amber-400/10 via-amber-300/5 to-transparent p-8 text-center soft-shadow md:p-12">
          <p className="font-display text-3xl text-foreground md:text-4xl lg:text-5xl">
            Welcome. Who are we remembering?
          </p>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
            Take your time. We'll keep everything safe as you go.
          </p>
        </div>
      )}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-foreground">Create a memorial</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A gentle ritual: photo, transform, tribute, candle.
          </p>
        </div>
        {step < 5 && (hasProgress ? (
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
        ))}
      </div>


      {step < 5 && (
      <div className="mt-7">
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={4}
          aria-valuenow={step}
          aria-label={`Wizard progress: step ${step} of 4`}
        >
          <div
            className="h-full rounded-full bg-[var(--cta)] transition-all duration-500 ease-out"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
        <ol className="mt-4 flex items-center gap-3 text-xs">
          {["Photo", "Transform", "Tribute", "Candle"].map((label, i) => {
            const n = i + 1;
            const active = step === n;
            const done = step > n;
            return (
              <li key={label} className="flex flex-1 items-center gap-2">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${done ? "bg-sage-deep text-primary-foreground" : active ? "bg-[var(--cta)] text-[var(--cta-foreground)]" : "bg-muted text-muted-foreground"}`}>
                  {done ? <Check className="h-3.5 w-3.5" /> : n}
                </span>
                <span className={`${active ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
                {i < 3 && <div className="ml-1 h-px flex-1 bg-border" />}
              </li>
            );
          })}
        </ol>
        <p className="mt-2 text-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Step {step} of 4 · {Math.round((step / 4) * 100)}%
        </p>
      </div>
      )}

      {needsPhotoReattach && step === 1 && (
        <div className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-400/5 p-4 text-sm text-foreground">
          Add their photo back — everything else is safe.
        </div>
      )}

      <div className="mt-8 rounded-3xl border border-border/60 bg-card p-8 soft-shadow">
        {step === 1 && (
          <section>
            <h2 className="font-display text-2xl text-foreground">Upload a photo</h2>
            <p className="mt-1 text-sm text-muted-foreground">A photo that feels most like them — the one you keep coming back to.</p>

            <label className="mt-6 flex h-64 cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border-2 border-dashed border-border bg-cream/40 transition hover:border-sage">
              {heroUrl ? (
                heroKind === "video" ? (
                  <video src={heroUrl} controls className="h-full w-full rounded-2xl object-cover" />
                ) : heroKind === "audio" ? (
                  <div className="flex w-full flex-col items-center gap-3 p-6">
                    <div className="text-sm text-muted-foreground">Voice memory</div>
                    <audio src={heroUrl} controls className="w-full" />
                  </div>
                ) : heroKind === "image" ? (
                  <img src={heroUrl} alt="" className="h-full w-full rounded-2xl object-cover" />
                ) : (
                  <a href={heroUrl} target="_blank" rel="noreferrer" className="text-sm text-sage-deep underline">View file</a>
                )
              ) : (
                <>
                  <Upload className="h-8 w-8 text-sage-deep" />
                  <div className="text-sm text-foreground">{uploading ? "Uploading…" : "Click to upload or drop a memory"}</div>
                  <div className="text-xs text-muted-foreground">Photo, video, or audio · up to ~25MB</div>
                </>
              )}
              <input
                type="file"
                accept="image/*,video/*,audio/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
              />
            </label>
            <div className="mt-6 flex justify-end">
              <Button disabled={!heroUrl} onClick={() => setStep(2)} className="rounded-full bg-[var(--cta)] text-[var(--cta-foreground)] hover:bg-[var(--cta-deep)]">Next</Button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section>
            <h2 className="font-display text-2xl text-foreground">Transform & refine</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {heroKind === "image"
                ? "Paint their portrait in a style — then add a modern filter. See the original and transformed side by side."
                : "Painted portraits work best with photos. You can skip this step."}
            </p>

            {heroKind === "image" && (
              <>
                <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {STYLES.map((s) => (
                    <button key={s.key} onClick={() => setStyle(s.key)} className={`rounded-2xl border-2 p-4 text-left transition ${style === s.key ? "border-[var(--cta)] bg-[color-mix(in_oklab,var(--cta)_8%,transparent)]" : "border-border hover:border-sage/40"}`}>
                      <Sparkles className="h-5 w-5 text-[var(--cta)]" />
                      <div className="mt-2 font-display text-sm text-foreground">{s.label}</div>
                      <div className="text-xs text-muted-foreground">{s.note}</div>
                    </button>
                  ))}
                </div>

                {/* Compare toggle */}
                <div className="mt-5 flex items-center justify-between gap-3">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">View</div>
                  <div className="inline-flex rounded-full border border-border bg-muted/40 p-0.5 text-xs">
                    <button onClick={() => setCompareView("split")} className={`rounded-full px-3 py-1 ${compareView === "split" ? "bg-[var(--cta)] text-[var(--cta-foreground)]" : "text-muted-foreground"}`}>Side by side</button>
                    <button onClick={() => setCompareView("stack")} className={`rounded-full px-3 py-1 ${compareView === "stack" ? "bg-[var(--cta)] text-[var(--cta-foreground)]" : "text-muted-foreground"}`}>Overlay</button>
                  </div>
                </div>

                {compareView === "split" ? (
                  <div className="mt-3 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-border bg-muted/30 p-3 text-center">
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">Original</div>
                      {heroUrl && <img src={heroUrl} alt="" className={`mt-2 aspect-square w-full rounded-xl object-cover filt-${modFilter}`} />}
                    </div>
                    <div className="rounded-2xl border border-border bg-muted/30 p-3 text-center">
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">Painted portrait</div>
                      {transforming ? (
                        <div className="mt-2 flex aspect-square w-full items-center justify-center rounded-xl bg-cream/40 text-sage-deep">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      ) : transformedUrl ? (
                        <img src={transformedUrl} alt="" className={`mt-2 aspect-square w-full rounded-xl object-cover filt-${modFilter}`} />
                      ) : (
                        <div className="mt-2 flex aspect-square w-full items-center justify-center rounded-xl bg-cream/40 text-sm text-muted-foreground">Preview will appear here</div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-2xl border border-border bg-muted/30">
                    {heroUrl && <img src={heroUrl} alt="original" className={`absolute inset-0 h-full w-full object-cover filt-${modFilter}`} />}
                    {transformedUrl && (
                      <img src={transformedUrl} alt="painted" className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 filt-${modFilter}`} style={{ clipPath: "inset(0 0 0 50%)" }} />
                    )}
                    <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-white/80 mix-blend-difference" />
                    <div className="absolute left-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white">Original</div>
                    {transformedUrl && (
                      <div className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white">Painted</div>
                    )}
                  </div>
                )}

                {/* Modern filter strip */}
                <div className="mt-5">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Modern filters</div>
                  <div className="mt-2 -mx-1 flex gap-2 overflow-x-auto pb-1">
                    {(["none","warm","noir","bloom","honey","dream","fade"] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setModFilter(f)}
                        className={`shrink-0 rounded-xl border p-1.5 text-center transition ${modFilter === f ? "border-[var(--cta)] ring-2 ring-[var(--cta)]/30" : "border-border/60"}`}
                      >
                        <img src={transformedUrl ?? heroUrl ?? ""} alt="" className={`h-14 w-14 rounded-md object-cover filt-${f}`} />
                        <div className="mt-1 text-[10px] capitalize text-muted-foreground">{f}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="mt-6 flex flex-wrap justify-between gap-2">
              <Button variant="ghost" onClick={() => setStep(1)} className="rounded-full">Back</Button>
              <div className="flex gap-2">
                {heroKind === "image" && (
                  <Button onClick={runTransform} disabled={transforming || !heroUrl} variant="outline" className="rounded-full">
                    {transforming ? "Painting…" : transformedUrl ? "Repaint" : "Paint portrait"}
                  </Button>
                )}
                <Button onClick={() => setStep(3)} className="rounded-full bg-[var(--cta)] text-[var(--cta-foreground)] hover:bg-[var(--cta-deep)]">
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
                <Label>Tap a few traits that capture them</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {TRAIT_TAGS.map((t) => {
                    const active = tags.includes(t);
                    return (
                      <button
                        type="button"
                        key={t}
                        onClick={() => toggleTag(t)}
                        className={`rounded-full border px-3 py-1 text-xs transition ${
                          active
                            ? "border-[var(--cta)] bg-[var(--cta)] text-[var(--cta-foreground)]"
                            : "border-border bg-card text-foreground hover:bg-muted/50"
                        }`}
                      >
                        {active ? "✓ " : "+ "}{t}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="st">Their story</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={assisting}
                    onClick={aiAssist}
                    className="h-7 text-xs text-[var(--cta)] hover:bg-[color-mix(in_oklab,var(--cta)_10%,transparent)]"
                  >
                    <Sparkles className="mr-1 h-3.5 w-3.5" />
                    {assisting ? "Writing…" : "AI assist"}
                  </Button>
                </div>
                <Textarea id="st" rows={6} value={story} onChange={(e) => setStory(e.target.value)} placeholder="What made them uniquely them? What will you miss most?" />
                <p className="mt-1 text-xs text-muted-foreground">
                  Tip: add a few traits above, then tap <span className="text-[var(--cta)]">AI assist</span> to draft a starting paragraph.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-border/60 bg-cream/30 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-display text-lg text-foreground">Gravestone keepsake</div>
                  <p className="text-xs text-muted-foreground">
                    A gentle headstone with their name, dates, a small message, fresh flowers and a burning candle.
                  </p>
                </div>
                <Button
                  type="button"
                  variant={showGravestone ? "default" : "outline"}
                  size="sm"
                  className={`rounded-full ${showGravestone ? "bg-[var(--cta)] text-[var(--cta-foreground)] hover:bg-[var(--cta-deep)]" : ""}`}
                  onClick={() => setShowGravestone((v) => !v)}
                >
                  {showGravestone ? "Hide preview" : "Preview gravestone"}
                </Button>
              </div>
              {showGravestone && (
                <div className="mt-4 animate-fade-in">
                  <GravestoneCard
                    name={petName}
                    birth={birthDate}
                    passing={passingDate}
                    epitaph={epitaph}
                  />
                  <p className="mt-2 text-center text-[11px] text-muted-foreground">
                    Updates live as you edit the fields above.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-between">

              <Button variant="ghost" onClick={() => setStep(2)} className="rounded-full">Back</Button>
              <Button disabled={!petName} onClick={() => setStep(4)} className="rounded-full bg-[var(--cta)] text-[var(--cta-foreground)] hover:bg-[var(--cta-deep)]">Next</Button>
            </div>
          </section>
        )}

        {step === 4 && (
          <section className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--cta)_15%,transparent)] candle-glow">
              <Heart className="h-9 w-9 text-[var(--cta)]" />
            </div>
            <h2 className="mt-5 font-display text-3xl text-foreground">Light their first candle</h2>
            <p className="mt-2 text-sm text-muted-foreground">A flame to mark the moment.</p>
            <div className="mx-auto mt-5 max-w-md text-left">
              <Label htmlFor="cm">A few words (optional)</Label>
              <Textarea id="cm" rows={3} value={candleMsg} onChange={(e) => setCandleMsg(e.target.value)} placeholder="Rest gently, sweet friend." />
            </div>
            <div className="mt-7 flex justify-center gap-3">
              <Button variant="ghost" onClick={() => setStep(3)} className="rounded-full">Back</Button>
              <Button disabled={submitting} onClick={finish} size="lg" className="rounded-full bg-[var(--cta)] px-7 text-[var(--cta-foreground)] hover:bg-[var(--cta-deep)]">
                {submitting ? "Lighting…" : "Light candle & publish"}
              </Button>
            </div>
          </section>
        )}

        {step === 5 && (
          <section className="animate-fade-in">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage/20">
                <Check className="h-7 w-7 text-sage-deep" />
              </div>
              <h2 className="mt-4 font-display text-3xl text-foreground">
                {petName ? `${petName}'s memorial is live` : "Memorial published"}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Their story has a home now. When you're ready, here are gentle next steps.
              </p>
              {publishedSlug && (
                <Link
                  to="/memorial/$slug"
                  params={{ slug: publishedSlug }}
                  className="mt-4 inline-flex items-center gap-1 text-sm text-[var(--cta)] hover:underline"
                >
                  Visit memorial <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>

            {publishedSlug && (
              <ShareMemorialCard slug={publishedSlug} petName={petName} epitaph={epitaph} />
            )}

            <div className="chapter-rule mt-8" aria-hidden />
            <h3 className="mt-6 text-center font-display text-xl text-foreground">Continue the journey</h3>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {/* Adoption — most important, first + full width */}
              <Link
                to="/adoption"
                className="group md:col-span-2 flex items-center gap-4 rounded-2xl border border-border/60 bg-gradient-to-br from-[color-mix(in_oklab,var(--sage)_18%,var(--card))] to-card p-5 soft-shadow transition hover:border-sage-deep/40"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sage/25 text-sage-deep">
                  <HandHeart className="h-6 w-6" />
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-lg text-foreground">Open your home again</span>
                    <span className="rounded-full bg-sage-deep/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-sage-deep">
                      most loved
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    When the time is right, another soul is waiting. Browse pets from partner shelters near you.
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
              </Link>

              <Link
                to="/grief-support"
                className="group flex items-start gap-3 rounded-2xl border border-border/60 bg-card p-5 soft-shadow transition hover:border-[var(--cta)]/40"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--cta)_12%,transparent)] text-[var(--cta)]">
                  <Phone className="h-5 w-5" />
                </span>
                <div>
                  <div className="font-display text-base text-foreground">Grief helpline</div>
                  <p className="text-xs text-muted-foreground">
                    Talk to a counselor who understands pet loss — 24/7, confidential.
                  </p>
                </div>
              </Link>

              <Link
                to="/community"
                className="group flex items-start gap-3 rounded-2xl border border-border/60 bg-card p-5 soft-shadow transition hover:border-sage/60"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sage/20 text-sage-deep">
                  <Users className="h-5 w-5" />
                </span>
                <div>
                  <div className="font-display text-base text-foreground">Community circles</div>
                  <p className="text-xs text-muted-foreground">
                    Weekly online support groups with others who get it.
                  </p>
                </div>
              </Link>

              <Link
                to="/marketplace"
                className="group md:col-span-2 flex items-start gap-3 rounded-2xl border border-border/60 bg-card p-5 soft-shadow transition hover:border-gold/60"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--gold)_25%,transparent)] text-foreground">
                  <ShoppingBag className="h-5 w-5" />
                </span>
                <div className="flex-1">
                  <div className="font-display text-base text-foreground">Keepsakes & memorial gifts</div>
                  <p className="text-xs text-muted-foreground">
                    Custom portraits, paw-print jewelry, urns, garden stones — handpicked from artisan makers.
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
              </Link>
            </div>

            <div className="mt-8 flex justify-center">
              <Button
                onClick={() => publishedSlug ? navigate({ to: "/memorial/$slug", params: { slug: publishedSlug } }) : navigate({ to: "/dashboard" })}
                className="rounded-full bg-[var(--cta)] px-6 text-[var(--cta-foreground)] hover:bg-[var(--cta-deep)]"
              >
                Visit the memorial
              </Button>
            </div>
          </section>
        )}
      </div>

      <AuthGateDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        title={petName ? `So ${petName}'s place is always here when you return` : "So their place is always here when you return"}
        subtitle="A quick sign-in — everything you've written stays exactly as it is."
        beforeOAuthRedirect={() => {
          saveDraft();
          try { localStorage.setItem(FINISH_FLAG, "1"); } catch { /* ignore */ }
        }}
        onAuthed={() => { /* auto-finish handled by user effect */ }}
        oauthRedirectPath="/create"
      />
    </div>
  );
}

function ShareMemorialCard({
  slug,
  petName,
  epitaph,
}: {
  slug: string;
  petName: string;
  epitaph: string;
}) {
  const [copied, setCopied] = useState(false);
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/memorial/${slug}`
      : `/memorial/${slug}`;
  const shareTitle = petName ? `${petName}'s memorial` : "A memorial on Rememfur";
  const shareText = epitaph
    ? `${shareTitle} — "${epitaph}"`
    : `${shareTitle} — light a candle and leave a memory.`;

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(shareText);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy — please copy manually.");
    }
  };

  const nativeShare = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await (navigator as any).share({ title: shareTitle, text: shareText, url });
      } catch {
        /* user cancelled */
      }
    } else {
      copy();
    }
  };

  const socials: { label: string; href: string; icon: any }[] = [
    {
      label: "Share on WhatsApp",
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    },
    {
      label: "Share by email",
      icon: Mail,
      href: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodedText}%0A%0A${encodedUrl}`,
    },
    {
      label: "Share on Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: "Share on X",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    },
  ];

  return (
    <div className="mt-8 rounded-2xl border border-border/60 bg-cream/30 p-5 soft-shadow">
      <div className="flex items-center gap-2">
        <Share2 className="h-4 w-4 text-[var(--cta)]" />
        <h3 className="font-display text-lg text-foreground">Share their memorial</h3>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Send this gentle link to family and friends so they can light a candle too.
      </p>

      <label htmlFor="memorial-url" className="sr-only">
        Memorial URL
      </label>
      <div className="mt-4 flex items-stretch gap-2">
        <input
          id="memorial-url"
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          className="min-w-0 flex-1 truncate rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--cta)]/40"
          aria-label="Memorial URL"
        />
        <Button
          type="button"
          onClick={copy}
          className="shrink-0 rounded-full bg-[var(--cta)] px-4 text-[var(--cta-foreground)] hover:bg-[var(--cta-deep)]"
          aria-live="polite"
        >
          {copied ? (
            <>
              <Check className="mr-1 h-4 w-4" /> Copied
            </>
          ) : (
            <>
              <Copy className="mr-1 h-4 w-4" /> Copy
            </>
          )}
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={nativeShare}
          className="rounded-full"
        >
          <Share2 className="mr-1.5 h-4 w-4" /> Share…
        </Button>
        {socials.map(({ label, href, icon: Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="ios-tappable inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition hover:bg-muted"
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </a>
        ))}
      </div>
    </div>
  );
}
