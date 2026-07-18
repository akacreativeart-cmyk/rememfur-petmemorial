import { useState, type ReactNode } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Heart, Sparkles } from "lucide-react";
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

/**
 * BetaInviteDialog
 *
 * Two shapes, one dialog, one table (`beta_invites`).
 *
 * • `console` — someone wants to bring a grieving friend here. We collect
 *   the friend's name + email (email required so we can reach them) and an
 *   optional short message. Saved as `email = friend, note = "{friend} · {msg}"`,
 *   with the caller-provided `source` (e.g. "console-friend").
 * • `waitlist` — the caller wants early access for themselves. Classic
 *   email + optional "who are you here for" note.
 */
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        {variant === "console" ? (
          <ConsoleFlow source={source} fn={fn} onClose={() => setOpen(false)} />
        ) : (
          <WaitlistFlow source={source} fn={fn} onClose={() => setOpen(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ── Waitlist variant (dev tiles, last-letter) ───────────────────────── */

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

/* ── Console-a-friend variant ────────────────────────────────────────── */

function ConsoleFlow({
  source,
  fn,
  onClose,
}: {
  source: string;
  fn: ReturnType<typeof useServerFn<typeof requestBetaInvite>>;
  onClose: () => void;
}) {
  const [friend, setFriend] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit = friend.trim().length > 0 && emailOk;

  const mut = useMutation({
    mutationFn: () =>
      fn({
        data: {
          email: email.trim(),
          note: `${friend.trim()}${message.trim() ? ` · ${message.trim()}` : ""}`,
          source,
        },
      }),
    onSuccess: () => setDone(true),
    onError: (e: Error) => toast.error(e.message ?? "Couldn't send that just now."),
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 font-display text-xl">
          <Heart className="h-4 w-4 text-[#E8B96D]" />
          {done ? "Your lamp is on its way." : "Console a friend"}
        </DialogTitle>
        <DialogDescription>
          {done
            ? "They'll know you were there."
            : "We'll help you find the words, and invite them somewhere gentle."}
        </DialogDescription>
      </DialogHeader>

      {!done ? (
        <div className="space-y-3 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              Friend's name
            </label>
            <Input
              value={friend}
              onChange={(e) => setFriend(e.target.value)}
              placeholder="e.g. Sam"
              maxLength={80}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              Friend's email
            </label>
            <Input
              type="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="them@example.com"
              maxLength={200}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              A short message{" "}
              <span className="normal-case tracking-normal text-muted-foreground/70">(optional)</span>
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="I'm so sorry. Thinking of you and them."
              rows={3}
              maxLength={500}
            />
          </div>
        </div>
      ) : (
        <div className="pt-2">
          <p className="rounded-2xl border border-border/60 bg-muted/30 p-4 text-sm text-foreground/80">
            We'll send {friend.trim() || "your friend"} a gentle invitation to a place that
            understands. No noise, no pressure — just a soft door, when they're ready.
          </p>
        </div>
      )}

      <DialogFooter>
        {done ? (
          <Button onClick={onClose} className="w-full rounded-full">Close</Button>
        ) : (
          <>
            <Button variant="ghost" onClick={onClose} className="rounded-full">
              Cancel
            </Button>
            <button
              type="button"
              onClick={() => mut.mutate()}
              disabled={!canSubmit || mut.isPending}
              className="btn-gold-sm w-full sm:w-auto"
            >
              {mut.isPending ? "Sending…" : "Send the lamp"}
            </button>
          </>
        )}
      </DialogFooter>
    </>
  );
}
