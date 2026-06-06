import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Flame, Share2, Copy, Twitter, Facebook, MessageCircle } from "lucide-react";
import { toast } from "sonner";
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

  const memorialFn = useServerFn(lightCandleGuest);
  const postFn = useServerFn(lightCandleGuestOnPost);

  const mut = useMutation({
    mutationFn: async () => {
      if (target.kind === "memorial") {
        return memorialFn({
          data: { memorial_id: target.memorial_id, name: name || null, message: message || null },
        });
      }
      return postFn({
        data: { post_id: target.post_id, name: name || null, message: message || null },
      });
    },
    onSuccess: () => {
      toast.success("Candle lit 🕯️");
      setLit(true);
      onLit?.();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const lines = message.split(/\r?\n/);
  const tooManyLines = lines.length > 2;
  const tooLong = message.length > 180;
  const disabled = mut.isPending || tooManyLines || tooLong;

  const shareUrl =
    typeof window !== "undefined"
      ? target.kind === "memorial" && target.slug
        ? `${window.location.origin}/memorial/${target.slug}`
        : window.location.href
      : "";
  const petName = target.kind === "memorial" ? target.pet_name : null;
  const shareText = petName
    ? `I just lit a candle for ${petName} on Rememfur 🕯️ — light one too?`
    : `I just lit a candle on Rememfur 🕯️ — light one too?`;

  async function nativeShare() {
    try {
      if (navigator.share) {
        await navigator.share({ title: "Rememfur", text: shareText, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        toast.success("Link copied to share");
      }
    } catch {
      /* user cancelled */
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied");
  }

  function resetAndClose(o: boolean) {
    setOpen(o);
    if (!o) {
      setLit(false);
      setName("");
      setMessage("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-2xl">
            <Flame className="h-5 w-5 text-[var(--cta)]" />
            {lit ? "Candle lit 🕯️" : "Light a candle"}
            {!lit && target.kind === "memorial" && target.pet_name ? (
              <span className="text-base font-normal text-muted-foreground">for {target.pet_name}</span>
            ) : null}
          </DialogTitle>
          <DialogDescription>
            {lit
              ? "Thank you. Their light is a little brighter because of you. Share so others can light one too."
              : "Anyone can light a candle — no account needed. Leave up to two short lines."}
          </DialogDescription>
        </DialogHeader>

        {!lit ? (
          <div className="space-y-3 pt-1">
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
            <Button
              onClick={() => mut.mutate()}
              disabled={disabled}
              className="w-full rounded-full bg-[var(--cta)] text-[var(--cta-foreground,white)] hover:opacity-90"
            >
              <Flame className="mr-2 h-4 w-4" />
              {mut.isPending ? "Lighting…" : "Light the candle"}
            </Button>
            {!user && (
              <p className="text-center text-[11px] text-muted-foreground">
                Want to share photos or join the community? <a href="/signup" className="underline">Create a free account</a>.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-center py-4">
              <div className="relative">
                <div className="hero-candle candle-glow scale-90" />
              </div>
            </div>
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
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on X / Twitter"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-muted hover:bg-muted/70"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-muted hover:bg-muted/70"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on WhatsApp"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-muted hover:bg-muted/70"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
            <Button variant="ghost" onClick={() => resetAndClose(false)} className="w-full rounded-full">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
