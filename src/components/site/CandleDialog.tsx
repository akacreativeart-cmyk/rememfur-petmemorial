import { useEffect, useState } from "react";
import { softHaptic } from "@/lib/haptic";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Flame, Share2, Copy, Twitter, Facebook, MessageCircle, Lock, Heart } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { lightCandleGuest, lightCandleGuestOnPost } from "@/lib/candle-guest.functions";
import { listMyMemorials } from "@/lib/memorials.functions";
import { useAuth } from "@/hooks/use-auth";

type Props = {
  target:
    | { kind: "memorial"; memorial_id: string; pet_name?: string | null; slug?: string | null }
    | { kind: "post"; post_id: string };
  trigger: React.ReactNode;
  onLit?: () => void;
};

export function CandleDialog({ target, trigger, onLit }: Props) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [lit, setLit] = useState(false);
  const [showBridge, setShowBridge] = useState(false);

  const myMemorialsFn = useServerFn(listMyMemorials);
  const myMemorialsQ = useQuery({
    queryKey: ["my-memorials-count-bridge"],
    queryFn: () => myMemorialsFn(),
    enabled: !!user && open,
    staleTime: 60_000,
  });
  const shouldShowBridge = !user || (myMemorialsQ.data?.length ?? 0) === 0;

  useEffect(() => {
    if (!lit) { setShowBridge(false); return; }
    const t = window.setTimeout(() => setShowBridge(true), 400);
    return () => window.clearTimeout(t);
  }, [lit]);

  const memorialFn = useServerFn(lightCandleGuest);
  const postFn = useServerFn(lightCandleGuestOnPost);

  const mut = useMutation({
    mutationFn: async () => {
      // Only authenticated users may attach name/message. Guests light anonymously.
      const safeName = user ? name || null : null;
      const safeMessage = user ? message || null : null;
      if (target.kind === "memorial") {
        return memorialFn({
          data: { memorial_id: target.memorial_id, name: safeName, message: safeMessage },
        });
      }
      return postFn({
        data: { post_id: target.post_id, name: safeName, message: safeMessage },
      });
    },
    onSuccess: () => {
      softHaptic(20);
      toast.success("Star released ✨");
      setLit(true);
      onLit?.();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const lines = message.split(/\r?\n/);
  const tooManyLines = lines.length > 2;
  const tooLong = message.length > 180;
  const disabled = mut.isPending || (!!user && (tooManyLines || tooLong));

  const shareUrl =
    typeof window !== "undefined"
      ? target.kind === "memorial" && target.slug
        ? `${window.location.origin}/memorial/${target.slug}`
        : window.location.href
      : "";
  const petName = target.kind === "memorial" ? target.pet_name : null;
  const shareText = petName
    ? `I just released a star for ${petName} on Rememfur ✨ — release one too?`
    : `I just released a star on Rememfur ✨ — release one too?`;

  async function nativeShare() {
    try {
      if (navigator.share) {
        await navigator.share({ title: "Rememfur", text: shareText, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        toast.success("Link copied to share");
      }
    } catch { /* user cancelled */ }
  }

  function copyLink() {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied");
  }

  function resetAndClose(o: boolean) {
    setOpen(o);
    if (!o) { setLit(false); setName(""); setMessage(""); }
  }

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-2xl">
            <Flame className="h-5 w-5 text-[var(--cta)]" />
            {lit ? "Star released ✨" : "Release a star"}
            {!lit && target.kind === "memorial" && target.pet_name ? (
              <span className="text-base font-normal text-muted-foreground">for {target.pet_name}</span>
            ) : null}
          </DialogTitle>
          <DialogDescription>
            {lit
              ? "Thank you. Their sky is a little brighter because of you."
              : user
                ? "Leave up to two short lines — they'll glow softly beside their star."
                : "Anyone can release a star right now — no account needed."}
          </DialogDescription>
        </DialogHeader>

        {!lit ? (
          <div className="space-y-3 pt-1">
            {user ? (
              <>
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">Your name</label>
                  <Input
                    value={name || user?.user_metadata?.display_name || ""}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="A friend"
                    maxLength={40}
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">A few words (optional)</label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={"thinking of you\nthank you for everything"}
                    rows={2}
                    className="resize-none"
                  />
                  <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
                    <span className={tooManyLines ? "text-destructive" : ""}>Two lines max</span>
                    <span className={tooLong ? "text-destructive" : ""}>{message.length}/180</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-[color-mix(in_oklab,var(--cta)_40%,transparent)] bg-[color-mix(in_oklab,var(--cta)_5%,transparent)] p-4 text-center">
                <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--cta)_12%,transparent)] text-[var(--cta)]">
                  <Lock className="h-4 w-4" />
                </div>
                <p className="text-sm text-foreground">
                  Want to leave your name or a few words?
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  <Link to="/signup" className="font-medium text-[var(--cta)] underline-offset-2 hover:underline">Create a free account</Link>{" "}
                  or{" "}
                  <Link to="/login" className="font-medium text-[var(--cta)] underline-offset-2 hover:underline">sign in</Link>{" "}
                  — it takes a moment. Their star will still be released if you'd rather not.
                </p>
              </div>
            )}

            <Button
              onClick={() => mut.mutate()}
              disabled={disabled}
              className="w-full rounded-full bg-[var(--cta)] text-[var(--cta-foreground,white)] hover:opacity-90"
            >
              <Flame className="mr-2 h-4 w-4" />
              {mut.isPending ? "Lighting…" : user ? "Light the candle" : "Light a candle anonymously"}
            </Button>
          </div>
        ) : (
          <div className="relative space-y-4 pt-1">
            {/* Dark → bright bloom background */}
            <div className="relative -mx-6 -mt-2 overflow-hidden rounded-xl">
              <div className="candle-lighting-bg relative flex h-44 items-center justify-center">
                <div className="candle-rays" aria-hidden />
                <div className="hero-candle candle-glow scale-110 relative z-10">
                  <div className="flame" />
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Share so others can light one too.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={nativeShare}
                className="rounded-full bg-[var(--cta)] text-[var(--cta-foreground,white)] hover:opacity-90"
              >
                <Share2 className="mr-2 h-4 w-4" /> Share
              </Button>
              <Button variant="outline" onClick={copyLink} className="rounded-full">
                <Copy className="mr-2 h-4 w-4" /> Copy link
              </Button>
            </div>
            <div className="flex items-center justify-center gap-2">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank" rel="noopener noreferrer" aria-label="Share on X / Twitter"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-muted hover:bg-muted/70"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-muted hover:bg-muted/70"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
                target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-muted hover:bg-muted/70"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
            {!user && (
              <p className="text-center text-[11px] text-muted-foreground">
                <Link to="/signup" className="underline">Create an account</Link> to leave your name on future candles.
              </p>
            )}

            {shouldShowBridge && showBridge && (
              <div
                className="mt-2 border-t border-border/50 pt-5 text-center opacity-0"
                style={{ animation: "intro-fade 400ms ease forwards" }}
              >
                <p className="text-sm text-muted-foreground">Is there someone you're remembering too?</p>
                <div className="mt-3 flex flex-col items-center gap-2">
                  <Link
                    to="/create"
                    onClick={() => resetAndClose(false)}
                    className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_oklab,var(--cta)_14%,transparent)] px-5 py-2 text-sm text-foreground ring-1 ring-[color-mix(in_oklab,var(--cta)_35%,transparent)] transition hover:bg-[color-mix(in_oklab,var(--cta)_22%,transparent)]"
                  >
                    <Heart className="h-4 w-4 text-[var(--cta)]" />
                    Make a place for them
                  </Link>
                  <button
                    type="button"
                    onClick={() => resetAndClose(false)}
                    className="text-[11px] text-muted-foreground/80 hover:text-muted-foreground"
                  >
                    Not now
                  </button>
                </div>
              </div>
            )}

            {!(shouldShowBridge && showBridge) && (
              <Button variant="ghost" onClick={() => resetAndClose(false)} className="w-full rounded-full">
                Done
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
