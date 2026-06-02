import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Flame } from "lucide-react";
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
    | { kind: "memorial"; memorial_id: string; pet_name?: string | null }
    | { kind: "post"; post_id: string };
  trigger: React.ReactNode;
  onLit?: () => void;
};

export function CandleDialog({ target, trigger, onLit }: Props) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

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
      setName("");
      setMessage("");
      setOpen(false);
      onLit?.();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const lines = message.split(/\r?\n/);
  const tooManyLines = lines.length > 2;
  const tooLong = message.length > 180;
  const disabled = mut.isPending || tooManyLines || tooLong;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-2xl">
            <Flame className="h-5 w-5 text-[var(--terracotta)]" />
            Light a candle
            {target.kind === "memorial" && target.pet_name ? (
              <span className="text-base font-normal text-muted-foreground">for {target.pet_name}</span>
            ) : null}
          </DialogTitle>
          <DialogDescription>
            Anyone can light a candle — no account needed. Leave up to two short lines.
          </DialogDescription>
        </DialogHeader>

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
      </DialogContent>
    </Dialog>
  );
}
