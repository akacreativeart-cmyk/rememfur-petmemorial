import { useMemo, useState, type ReactNode } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Sparkles, Copy, Heart, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { requestBetaInvite } from "@/lib/beta.functions";

type Variant = "console" | "waitlist";

export function BetaInviteDialog({
  source,
  variant = "waitlist",
  trigger,
  open: controlledOpen,
  onOpenChange,
}: {
  source: string;
  variant?: Variant;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const fn = useServerFn(requestBetaInvite);

  function handleOpen(o: boolean) {
    setOpen(o);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        {variant === "console" ? (
          <ConsoleFlow source={source} fn={fn} onClose={() => handleOpen(false)} />
        ) : (
          <WaitlistFlow source={source} fn={fn} onClose={() => handleOpen(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ── Waitlist variant (dev tiles, last letter) ───────────────────────── */

function WaitlistFlow({
  source,
  fn,
  onClose,
}: {
  source: string;
  fn: ReturnType<typeof useServerFn<typeof requestBetaInvite>>;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const mut = useMutation({
    mutationFn: () =>
      fn({ data: { email: email.trim(), note: note.trim() || null, source } }),
    onSuccess: () => setDone(true),
    onError: (e: Error) => toast.error(e.message ?? "Couldn't submit your request."),
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 font-display text-xl">
          <Sparkles className="h-4 w-4 text-[#E8B96D]" />
          {done ? "You're on the list." : "Request early access"}
        </DialogTitle>
        <DialogDescription>
          {done
            ? "A lamp is lit for your place. We'll be in touch when a seat opens — quietly, and soon."
            : "We're welcoming a small number of early companions. Leave your email and we'll light the way in when a seat opens."}
        </DialogDescription>
      </DialogHeader>

      {!done && (
        <div className="space-y-3 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Email</label>
            <Input
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              maxLength={200}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              Who are you here for?{" "}
              <span className="normal-case tracking-normal text-muted-foreground/70">(optional)</span>
            </label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="A name, a pet, a story — anything you'd like us to know."
              rows={3}
              maxLength={500}
            />
          </div>
        </div>
      )}

      <DialogFooter>
        {done ? (
          <Button onClick={onClose} className="w-full rounded-full">Close</Button>
        ) : (
          <>
            <Button variant="ghost" onClick={onClose} className="rounded-full">Cancel</Button>
            <button
              type="button"
              onClick={() => mut.mutate()}
              disabled={!emailOk || mut.isPending}
              className="btn-gold-sm w-full sm:w-auto"
            >
              {mut.isPending ? "Sending…" : "Request early access"}
            </button>
          </>
        )}
      </DialogFooter>
    </>
  );
}

/* ── Console variant (comfort a grieving friend) ─────────────────────── */

function ConsoleFlow({
  source,
  fn,
  onClose,
}: {
  source: string;
  fn: ReturnType<typeof useServerFn<typeof requestBetaInvite>>;
  onClose: () => void;
}) {
  const [step, setStep] = useState<"names" | "words">("names");
  const [friend, setFriend] = useState("");
  const [pet, setPet] = useState("");
  const [me, setMe] = useState("");
  const [betaEmail, setBetaEmail] = useState("");

  const friendName = friend.trim() || "them";
  const petName = pet.trim() || "your companion";

  const messages = useMemo(
    () => [
      {
        key: "tender",
        label: "Tender",
        body: `I know ${petName} wasn't "just a pet." They were family, and I'm so sorry, ${friendName}.`,
      },
      {
        key: "low",
        label: "Low-pressure",
        body: `No need to reply — just know I'm thinking of you and ${petName} today.`,
      },
      {
        key: "honest",
        label: "Honest",
        body: `I don't have the right words, ${friendName}, but I didn't want to say nothing.`,
      },
    ],
    [friendName, petName],
  );

  const saveMut = useMutation({
    mutationFn: () =>
      fn({
        data: {
          email: "console+placeholder@rememfur.local",
          note: `${friend.trim() || "friend"} · ${pet.trim() || "pet"}${me.trim() ? ` · from ${me.trim()}` : ""}`,
          source,
        },
      }),
    onError: () => {
      /* silent — the comfort flow doesn't require a saved record */
    },
  });

  const selfMut = useMutation({
    mutationFn: (email: string) =>
      fn({ data: { email, note: null, source: "beta-selfserve" } }),
    onSuccess: () => toast.success("Added to the beta list."),
    onError: (e: Error) => toast.error(e.message ?? "Couldn't add you."),
  });

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied — send it whenever you're ready.");
    } catch {
      toast.error("Couldn't copy — try selecting and copying manually.");
    }
  }

  async function sendPawLamp() {
    const url = typeof window !== "undefined" ? window.location.origin : "https://rememfur.com";
    const text = `Thinking of you and ${petName}. A quiet place, if you'd like it — ${url}`;
    saveMut.mutate();
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await (navigator as Navigator).share({ text, url });
        return;
      } catch {
        /* fall through to copy */
      }
    }
    await copyText(text);
  }

  const canContinue = friend.trim().length > 0;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(betaEmail.trim());

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 font-display text-xl">
          <Heart className="h-4 w-4 text-[#E8B96D]" />
          Be there for them
        </DialogTitle>
        <DialogDescription>
          {step === "names"
            ? "Tell us who they are, and we'll help you find the words."
            : "Pick whichever fits. Copy it, send it, then close this window."}
        </DialogDescription>
      </DialogHeader>

      {step === "names" ? (
        <div className="space-y-3 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              Your friend's name
            </label>
            <Input
              value={friend}
              onChange={(e) => setFriend(e.target.value)}
              placeholder="e.g. Sam"
              maxLength={80}
              autoFocus
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-muted-foreground">
                Their pet's name{" "}
                <span className="normal-case tracking-normal text-muted-foreground/70">(optional)</span>
              </label>
              <Input value={pet} onChange={(e) => setPet(e.target.value)} placeholder="e.g. Milo" maxLength={80} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-muted-foreground">
                Your name{" "}
                <span className="normal-case tracking-normal text-muted-foreground/70">(optional)</span>
              </label>
              <Input value={me} onChange={(e) => setMe(e.target.value)} placeholder="From…" maxLength={80} />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3 pt-1">
          {messages.map((m) => (
            <div
              key={m.key}
              className="rounded-xl border border-border/60 bg-muted/30 p-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  {m.label}
                </p>
                <button
                  type="button"
                  onClick={() => copyText(m.body)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-2.5 py-1 text-[11px] font-medium text-foreground/80 hover:bg-muted/50"
                >
                  <Copy className="h-3 w-3" /> Copy
                </button>
              </div>
              <p className="mt-2 font-display text-[15px] leading-snug text-foreground">
                {m.body}
              </p>
            </div>
          ))}

          <div className="rounded-lg border border-dashed border-border/60 bg-transparent p-3">
            <p className="text-[10.5px] uppercase tracking-[0.2em] text-muted-foreground">
              Gentle to avoid
            </p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
              "at least they had a long life" · "you can always get another" · "it was just a pet"
            </p>
          </div>

          <button
            type="button"
            onClick={sendPawLamp}
            className="btn-gold-sm w-full"
          >
            <Send className="h-3.5 w-3.5" />
            Send them a paw lamp
          </button>

          <div className="mt-2 space-y-1.5 border-t border-border/50 pt-3">
            <p className="text-[11px] text-muted-foreground">
              Want early access for yourself? Leave your email.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                inputMode="email"
                value={betaEmail}
                onChange={(e) => setBetaEmail(e.target.value)}
                placeholder="you@example.com"
                maxLength={200}
              />
              <Button
                type="button"
                variant="outline"
                disabled={!emailOk || selfMut.isPending}
                onClick={() => selfMut.mutate(betaEmail.trim())}
                className="rounded-full"
              >
                {selfMut.isPending ? "Adding…" : "Add me"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <DialogFooter>
        {step === "names" ? (
          <>
            <Button variant="ghost" onClick={onClose} className="rounded-full">Cancel</Button>
            <button
              type="button"
              disabled={!canContinue}
              onClick={() => setStep("words")}
              className="btn-gold-sm w-full sm:w-auto"
            >
              Continue
            </button>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={() => setStep("names")} className="rounded-full">
              Back
            </Button>
            <Button onClick={onClose} className="rounded-full">Close</Button>
          </>
        )}
      </DialogFooter>
    </>
  );
}
