import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { AuthGateDialog } from "@/components/site/AuthGateDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { createMemorial } from "@/lib/memorials.functions";
import { assistCaption } from "@/lib/ai-assist.functions";
import { Polaroid } from "@/components/site/Polaroid";
import { PawLamp } from "@/components/site/PawLamp";
import { BetaInviteDialog } from "@/components/site/BetaInviteDialog";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Loader2,
  Sparkles,
  Upload,
  Video,
  X,
} from "lucide-react";

export const Route = createFileRoute("/create/memorial")({
  component: CreatePage,
  head: () => ({ meta: [{ title: "Write a memorial — Rememfur" }] }),
});

/* ─────────────────────────── constants ─────────────────────────── */

const SPECIES = [
  { key: "dog", label: "Dog" },
  { key: "cat", label: "Cat" },
  { key: "other", label: "Other" }, // bird / rabbit / other → all map to "other" in DB
] as const;

const PRONOUN_OPTIONS = ["he/him", "she/her", "they/them"] as const;

const STEP_LABELS = ["Who they were", "Their time", "A photo", "A message", "Keepsake"] as const;

const DRAFT_KEY = "rememfur.create.draft.v2";

type SpeciesKey = (typeof SPECIES)[number]["key"];

/* ─────────────────────────── page ─────────────────────────── */

function CreatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const createFn = useServerFn(createMemorial);
  const assistFn = useServerFn(assistCaption);

  const [step, setStep] = useState(0);

  // Step 1 — who
  const [petName, setPetName] = useState("");
  const [nickname, setNickname] = useState("");
  const [species, setSpecies] = useState<SpeciesKey>("dog");
  const [speciesOther, setSpeciesOther] = useState(""); // free text kept in `breed` alongside actual breed for now
  const [breed, setBreed] = useState("");

  // Step 2 — their time
  const [pronouns, setPronouns] = useState<string>("they/them");
  const [birthDate, setBirthDate] = useState("");
  const [passingDate, setPassingDate] = useState("");
  const [unsureDates, setUnsureDates] = useState(false);
  const [approxAge, setApproxAge] = useState("");
  const [location, setLocation] = useState("");

  // Step 3 — photo
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null); // blob url of raw
  const [cropOpen, setCropOpen] = useState(false);
  const [cropAspect, setCropAspect] = useState<1 | 0.8>(1); // 1 square, 4/5=0.8 portrait
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPx, setCroppedAreaPx] = useState<Area | null>(null);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);
  const [lampOnly, setLampOnly] = useState(false);

  // Step 4 — message
  const [message, setMessage] = useState("");
  const [assisting, setAssisting] = useState(false);

  // Submit / auth
  const [submitting, setSubmitting] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const finishOnAuthRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /* ── draft persistence (survives sign-in bounce) ── */

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.petName) setPetName(d.petName);
      if (d.nickname) setNickname(d.nickname);
      if (d.species) setSpecies(d.species);
      if (d.speciesOther) setSpeciesOther(d.speciesOther);
      if (d.breed) setBreed(d.breed);
      if (d.pronouns) setPronouns(d.pronouns);
      if (d.birthDate) setBirthDate(d.birthDate);
      if (d.passingDate) setPassingDate(d.passingDate);
      if (d.unsureDates) setUnsureDates(d.unsureDates);
      if (d.approxAge) setApproxAge(d.approxAge);
      if (d.location) setLocation(d.location);
      if (d.message) setMessage(d.message);
      if (d.lampOnly) setLampOnly(d.lampOnly);
      if (typeof d.step === "number") setStep(Math.min(d.step, 4));
    } catch { /* ignore */ }
  }, []);

  const saveDraft = () => {
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          petName, nickname, species, speciesOther, breed,
          pronouns, birthDate, passingDate, unsureDates, approxAge, location,
          message, lampOnly, step,
        }),
      );
    } catch { /* ignore */ }
  };

  const clearDraft = () => {
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
  };

  /* ── photo handling ── */

  const onPickFile = (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("Please choose a photo (JPG or PNG).");
      return;
    }
    setLampOnly(false);
    setPhotoFile(f);
    const url = URL.createObjectURL(f);
    setPhotoPreview(url);
    setCropOpen(true);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const onCropComplete = useCallback((_: Area, areaPx: Area) => {
    setCroppedAreaPx(areaPx);
  }, []);

  const applyCrop = async () => {
    if (!photoPreview || !croppedAreaPx) return;
    const blob = await canvasCrop(photoPreview, croppedAreaPx);
    setCroppedBlob(blob);
    if (croppedPreview) URL.revokeObjectURL(croppedPreview);
    setCroppedPreview(URL.createObjectURL(blob));
    setCropOpen(false);
  };

  const chooseLampOnly = () => {
    setLampOnly(true);
    setPhotoFile(null);
    setCroppedBlob(null);
    if (photoPreview) { URL.revokeObjectURL(photoPreview); setPhotoPreview(null); }
    if (croppedPreview) { URL.revokeObjectURL(croppedPreview); setCroppedPreview(null); }
  };

  /* ── AI assist for message ── */

  const runAssist = async () => {
    setAssisting(true);
    try {
      const { caption } = await assistFn({
        data: {
          draft: message,
          tone: "tender",
          petName,
          nickname,
          species: species === "other" ? (speciesOther || "beloved companion") : species,
          pronouns,
        },
      });
      if (caption) setMessage(caption);
    } catch (e: any) {
      if (String(e?.message ?? "").toLowerCase().includes("unauthorized")) {
        saveDraft();
        finishOnAuthRef.current = false;
        setAuthOpen(true);
        return;
      }
      toast.error(e?.message ?? "AI couldn't help just now.");
    } finally {
      setAssisting(false);
    }
  };

  /* ── submit / publish ── */

  const canGoNext = useMemo(() => {
    if (step === 0) return petName.trim().length > 0;
    return true;
  }, [step, petName]);

  const goNext = () => {
    if (!canGoNext) return;
    saveDraft();
    setStep((s) => Math.min(s + 1, 4));
  };
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const uploadCropped = async (userId: string): Promise<string | null> => {
    if (!croppedBlob) return null;
    const path = `${userId}/${Date.now()}.jpg`;
    const { error } = await supabase.storage
      .from("pet-photos")
      .upload(path, croppedBlob, { contentType: "image/jpeg" });
    if (error) throw new Error(error.message);
    return supabase.storage.from("pet-photos").getPublicUrl(path).data.publicUrl;
  };

  const publish = async () => {
    if (!petName.trim()) {
      toast.error("A name, please — even a single letter.");
      setStep(0);
      return;
    }
    if (!user) {
      saveDraft();
      finishOnAuthRef.current = true;
      setAuthOpen(true);
      return;
    }
    setSubmitting(true);
    try {
      const heroUrl = croppedBlob ? await uploadCropped(user.id) : null;
      const breedField = species === "other" && speciesOther
        ? `${speciesOther}${breed ? ` · ${breed}` : ""}`
        : (breed || null);
      const res = await createFn({
        data: {
          pet_name: petName.trim(),
          species: species,
          birth_date: unsureDates ? null : (birthDate || null),
          passing_date: unsureDates ? null : (passingDate || null),
          epitaph: message.trim() ? message.trim().slice(0, 200) : null,
          story: null,
          hero_image_url: heroUrl,
          is_public: true,
          nickname: nickname.trim() || null,
          pronouns: pronouns || null,
          breed: breedField,
          approx_age: unsureDates ? (approxAge.trim() || null) : null,
          location: location.trim() || null,
        },
      });
      clearDraft();
      toast.success("Their memorial is lit.");
      navigate({ to: "/memorial/$slug", params: { slug: res.slug }, search: { welcome: 1 } as never });
    } catch (e: any) {
      toast.error(e?.message ?? "Couldn't save. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // If the auth gate closed with a user, and we intended to finish, do it.
  useEffect(() => {
    if (user && finishOnAuthRef.current) {
      finishOnAuthRef.current = false;
      publish();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  /* ─────────────────────── render ─────────────────────── */

  const heroPreviewUrl = croppedPreview || null;

  return (
    <main className="min-h-screen bg-background pb-24 pt-8">
      <div className="mx-auto max-w-2xl px-5">
        <Stepper step={step} />

        <div className="mt-8 rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm md:p-10">
          {step === 0 && (
            <StepWho
              petName={petName} setPetName={setPetName}
              nickname={nickname} setNickname={setNickname}
              species={species} setSpecies={setSpecies}
              speciesOther={speciesOther} setSpeciesOther={setSpeciesOther}
              breed={breed} setBreed={setBreed}
            />
          )}

          {step === 1 && (
            <StepTime
              pronouns={pronouns} setPronouns={setPronouns}
              birthDate={birthDate} setBirthDate={setBirthDate}
              passingDate={passingDate} setPassingDate={setPassingDate}
              unsureDates={unsureDates} setUnsureDates={setUnsureDates}
              approxAge={approxAge} setApproxAge={setApproxAge}
              location={location} setLocation={setLocation}
            />
          )}

          {step === 2 && (
            <StepPhoto
              heroPreviewUrl={heroPreviewUrl}
              lampOnly={lampOnly}
              onPickClick={() => fileInputRef.current?.click()}
              onLampOnly={chooseLampOnly}
              onRecrop={() => photoPreview && setCropOpen(true)}
              fileInputRef={fileInputRef}
              onFile={onPickFile}
            />
          )}

          {step === 3 && (
            <StepMessage
              petName={nickname || petName}
              message={message}
              setMessage={setMessage}
              assisting={assisting}
              runAssist={runAssist}
            />
          )}

          {step === 4 && (
            <StepPreview
              petName={petName}
              nickname={nickname}
              message={message}
              heroPreviewUrl={heroPreviewUrl}
              submitting={submitting}
              onPublish={publish}
              onOrderPrint={() => setPrintOpen(true)}
            />
          )}

          {/* nav */}
          <div className="mt-8 flex items-center justify-between border-t border-border/50 pt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={goBack}
              disabled={step === 0}
              className="rounded-full"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
            </Button>

            {step < 4 ? (
              <button
                type="button"
                onClick={goNext}
                disabled={!canGoNext}
                className="btn-gold-sm"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={publish}
                disabled={submitting}
                className="btn-gold-sm"
              >
                {submitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Lighting…</>
                ) : (
                  <><Check className="h-4 w-4" /> Publish memorial</>
                )}
              </button>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-[11.5px] uppercase tracking-[0.2em] text-muted-foreground">
          Every field but their name is optional. Take your time.
        </p>
      </div>

      {/* Cropper dialog */}
      {cropOpen && photoPreview && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#0B1122]/95 backdrop-blur">
          <div className="flex items-center justify-between px-5 py-4 text-white">
            <button
              type="button"
              onClick={() => setCropOpen(false)}
              className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white"
              aria-label="Cancel crop"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/70">Reposition</div>
            <div className="w-9" />
          </div>
          <div className="relative flex-1">
            <Cropper
              image={photoPreview}
              crop={crop}
              zoom={zoom}
              aspect={cropAspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              objectFit="contain"
            />
          </div>
          <div className="space-y-4 px-5 pb-8 pt-4 text-white">
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={() => setCropAspect(1)}
                className={aspectPillClass(cropAspect === 1)}
              >Square</button>
              <button
                type="button"
                onClick={() => setCropAspect(0.8)}
                className={aspectPillClass(cropAspect === 0.8)}
              >Portrait 4:5</button>
            </div>
            <div className="mx-auto max-w-xs">
              <Slider
                value={[zoom]}
                min={1}
                max={3}
                step={0.01}
                onValueChange={(v) => setZoom(v[0] ?? 1)}
              />
            </div>
            <div className="flex justify-center">
              <button type="button" onClick={applyCrop} className="btn-gold-sm">
                <Check className="h-4 w-4" /> Use this crop
              </button>
            </div>
          </div>
        </div>
      )}

      <AuthGateDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        onAuthed={() => { /* useEffect on user picks it up */ }}
        title="Sign in to save their memorial"
        description="We keep drafts safe. Sign in and we'll finish where you left off."
      />

      <BetaInviteDialog
        source="polaroid-print"
        variant="waitlist"
        open={printOpen}
        onOpenChange={setPrintOpen}
      />
    </main>
  );
}

/* ─────────────────────── steps ─────────────────────── */

function Stepper({ step }: { step: number }) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-center gap-1.5">
        {STEP_LABELS.map((_, i) => (
          <span
            key={i}
            className={`h-1 rounded-full transition-all ${
              i === step ? "w-8 bg-[var(--cta)]" : i < step ? "w-4 bg-[var(--cta)]/60" : "w-4 bg-border"
            }`}
          />
        ))}
      </div>
      <div className="text-center">
        <div className="text-[10.5px] uppercase tracking-[0.24em] text-muted-foreground">
          Step {step + 1} of {STEP_LABELS.length}
        </div>
        <h1 className="mt-1 font-display text-2xl leading-tight md:text-3xl">
          {STEP_LABELS[step]}
        </h1>
      </div>
    </div>
  );
}

function StepWho({
  petName, setPetName, nickname, setNickname, species, setSpecies,
  speciesOther, setSpeciesOther, breed, setBreed,
}: {
  petName: string; setPetName: (v: string) => void;
  nickname: string; setNickname: (v: string) => void;
  species: SpeciesKey; setSpecies: (v: SpeciesKey) => void;
  speciesOther: string; setSpeciesOther: (v: string) => void;
  breed: string; setBreed: (v: string) => void;
}) {
  return (
    <div className="space-y-5">
      <p className="text-[15px] leading-relaxed text-muted-foreground">
        Start with a name. The one you called out at the door.
      </p>
      <Field label="Their name" required>
        <Input value={petName} onChange={(e) => setPetName(e.target.value)} maxLength={80} placeholder="e.g. Luna" autoFocus />
      </Field>
      <Field label="Nickname" hint="what you really called them (optional)">
        <Input value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={80} placeholder="e.g. Moonpie" />
      </Field>
      <Field label="What kind of soul?">
        <div className="grid grid-cols-3 gap-2">
          {SPECIES.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setSpecies(s.key)}
              className={choiceClass(species === s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </Field>
      {species === "other" && (
        <Field label="Specifically" hint="e.g. rabbit, bird, ferret">
          <Input value={speciesOther} onChange={(e) => setSpeciesOther(e.target.value)} maxLength={40} placeholder="e.g. rabbit" />
        </Field>
      )}
      <Field label="Breed" hint="optional">
        <Input value={breed} onChange={(e) => setBreed(e.target.value)} maxLength={80} placeholder="e.g. Golden Retriever" />
      </Field>
    </div>
  );
}

function StepTime({
  pronouns, setPronouns, birthDate, setBirthDate, passingDate, setPassingDate,
  unsureDates, setUnsureDates, approxAge, setApproxAge, location, setLocation,
}: {
  pronouns: string; setPronouns: (v: string) => void;
  birthDate: string; setBirthDate: (v: string) => void;
  passingDate: string; setPassingDate: (v: string) => void;
  unsureDates: boolean; setUnsureDates: (v: boolean) => void;
  approxAge: string; setApproxAge: (v: string) => void;
  location: string; setLocation: (v: string) => void;
}) {
  return (
    <div className="space-y-5">
      <p className="text-[15px] leading-relaxed text-muted-foreground">
        A few gentle details. Nothing here is required.
      </p>
      <Field label="How they were known">
        <RadioGroup value={pronouns} onValueChange={setPronouns} className="grid grid-cols-3 gap-2">
          {PRONOUN_OPTIONS.map((p) => (
            <label
              key={p}
              className={`${choiceClass(pronouns === p)} cursor-pointer text-center`}
            >
              <RadioGroupItem value={p} className="sr-only" />
              {p}
            </label>
          ))}
        </RadioGroup>
      </Field>

      {!unsureDates ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Date of birth" hint="optional">
            <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
          </Field>
          <Field label="Date they passed" hint="optional — powers Their Sky">
            <Input type="date" value={passingDate} onChange={(e) => setPassingDate(e.target.value)} />
          </Field>
        </div>
      ) : (
        <Field label="Approximate age or time" hint="e.g. about 12 years · summer of 2019">
          <Input value={approxAge} onChange={(e) => setApproxAge(e.target.value)} maxLength={120} placeholder="e.g. around 12 years" />
        </Field>
      )}

      <label className="flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/40 px-4 py-3">
        <Switch checked={unsureDates} onCheckedChange={setUnsureDates} />
        <span className="text-sm text-foreground/85">I'm not sure of exact dates</span>
      </label>

      <Field label="Their city" hint="optional — shapes their constellation">
        <Input value={location} onChange={(e) => setLocation(e.target.value)} maxLength={120} placeholder="e.g. Brooklyn, NY" />
      </Field>
    </div>
  );
}

function StepPhoto({
  heroPreviewUrl, lampOnly, onPickClick, onLampOnly, onRecrop, fileInputRef, onFile,
}: {
  heroPreviewUrl: string | null;
  lampOnly: boolean;
  onPickClick: () => void;
  onLampOnly: () => void;
  onRecrop: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFile: (f: File | null) => void;
}) {
  return (
    <div className="space-y-6">
      <p className="text-[15px] leading-relaxed text-muted-foreground">
        A single photo is enough. Or light a paw lamp for now — you can always add one later.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={onPickClick}
          className={`group flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed p-8 transition ${
            heroPreviewUrl
              ? "border-[var(--cta)]/60 bg-[var(--cta)]/5"
              : "border-border hover:border-[var(--cta)]/60 hover:bg-muted/40"
          }`}
        >
          {heroPreviewUrl ? (
            <>
              <img src={heroPreviewUrl} alt="" className="h-40 w-40 rounded-2xl object-cover shadow-md" />
              <div className="flex gap-2 pt-2">
                <span className="btn-quiet text-[11px]">Replace</span>
                <button type="button" onClick={(e) => { e.stopPropagation(); onRecrop(); }} className="btn-quiet text-[11px]">
                  Reposition
                </button>
              </div>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground group-hover:text-[var(--cta)]" />
              <div className="text-center">
                <div className="font-medium">Upload a photo</div>
                <div className="text-xs text-muted-foreground">JPG or PNG · you can crop next</div>
              </div>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onLampOnly}
          className={`flex flex-col items-center justify-center gap-3 rounded-3xl border-2 p-8 transition ${
            lampOnly
              ? "border-[var(--cta)]/60 bg-[var(--cta)]/5"
              : "border-border hover:border-[var(--cta)]/60 hover:bg-muted/40"
          }`}
        >
          <PawLamp size={40} />
          <div className="text-center">
            <div className="font-medium">Just light a paw lamp</div>
            <div className="text-xs text-muted-foreground">No photo — soft glow instead</div>
          </div>
        </button>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border/60 bg-muted/30 px-4 py-3 opacity-60">
        <Video className="h-4 w-4 text-muted-foreground" />
        <div className="flex-1">
          <div className="text-sm font-medium">Add a video</div>
          <div className="text-xs text-muted-foreground">Coming soon.</div>
        </div>
      </div>
    </div>
  );
}

function StepMessage({
  petName, message, setMessage, assisting, runAssist,
}: {
  petName: string;
  message: string;
  setMessage: (v: string) => void;
  assisting: boolean;
  runAssist: () => void;
}) {
  return (
    <div className="space-y-5">
      <p className="text-[15px] leading-relaxed text-muted-foreground">
        A short message — an epitaph, a private joke, one true sentence.
        {petName ? ` We'll write it about ${petName}, not "it".` : ""}
      </p>
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={5}
        maxLength={500}
        placeholder="e.g. He waited by the door every evening. He still does, somewhere."
        className="text-base leading-relaxed"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{message.length}/500</span>
        <button
          type="button"
          onClick={runAssist}
          disabled={assisting}
          className="btn-quiet"
        >
          {assisting ? (
            <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…</>
          ) : (
            <><Sparkles className="h-3.5 w-3.5" /> Help me write this</>
          )}
        </button>
      </div>
    </div>
  );
}

function StepPreview({
  petName, nickname, message, heroPreviewUrl, submitting, onPublish, onOrderPrint,
}: {
  petName: string;
  nickname: string;
  message: string;
  heroPreviewUrl: string | null;
  submitting: boolean;
  onPublish: () => void;
  onOrderPrint: () => void;
}) {
  return (
    <div className="space-y-6">
      <p className="text-center text-[15px] leading-relaxed text-muted-foreground">
        Their keepsake. Yours to hold, print, or share.
      </p>
      <Polaroid
        imageUrl={heroPreviewUrl}
        petName={nickname || petName}
        message={message}
        onOrderPrint={onOrderPrint}
      />
      <p className="text-center text-[12px] text-muted-foreground">
        Publishing opens their memorial page — their constellation, the wall of paw lamps, and this keepsake.
      </p>
      {submitting && (
        <div className="flex justify-center text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Lighting their memorial…
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── small building blocks ─────────────────────── */

function Field({
  label, hint, required, children,
}: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-2 text-[13px] font-medium">
        {label}
        {required && <span className="text-[10px] uppercase tracking-wider text-[var(--cta)]">required</span>}
        {hint && <span className="text-[11px] font-normal text-muted-foreground">{hint}</span>}
      </Label>
      {children}
    </div>
  );
}

function choiceClass(active: boolean) {
  return `rounded-2xl border px-3 py-2.5 text-sm transition ${
    active
      ? "border-[var(--cta)] bg-[var(--cta)]/10 text-foreground"
      : "border-border bg-background/50 text-foreground/80 hover:border-[var(--cta)]/50"
  }`;
}

function aspectPillClass(active: boolean) {
  return `rounded-full border px-4 py-1.5 text-[12px] uppercase tracking-[0.16em] transition ${
    active ? "border-[#E8B96D] bg-[#E8B96D]/15 text-[#E8B96D]" : "border-white/20 text-white/70 hover:bg-white/5"
  }`;
}

/* ─────────────────────── canvas crop helper ─────────────────────── */

async function canvasCrop(imageSrc: string, area: Area): Promise<Blob> {
  const img = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(area.width);
  canvas.height = Math.round(area.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(
    img,
    area.x, area.y, area.width, area.height,
    0, 0, area.width, area.height,
  );
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Crop failed"))),
      "image/jpeg",
      0.92,
    );
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
