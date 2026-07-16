import { useState, type ReactNode } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
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

export function BetaInviteDialog({
  source,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: {
  source: string;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);
  const fn = useServerFn(requestBetaInvite);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const mut = useMutation({
    mutationFn: () =>
      fn({ data: { email: email.trim(), note: note.trim() || null, source } }),
    onSuccess: () => setDone(true),
    onError: (e: Error) => toast.error(e.message ?? "Couldn't submit your request."),
  });

  function handleOpen(o: boolean) {
    setOpen(o);
    if (!o) {
      setTimeout(() => {
        setEmail("");
        setNote("");
        setDone(false);
      }, 200);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <Sparkles className="h-4 w-4 text-[#E8B96D]" />
            {done ? "You're on the list." : "Request your invitation"}
          </DialogTitle>
          <DialogDescription>
            {done
              ? "A lamp is lit for your place. We'll be in touch when a seat opens — quietly, and soon."
              : "We're welcoming a limited number of early companions. Leave your email and we'll light the way in when a seat opens."}
          </DialogDescription>
        </DialogHeader>

        {!done && (
          <div className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-muted-foreground">
                Email
              </label>
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
                Who are you here for? <span className="normal-case tracking-normal text-muted-foreground/70">(optional)</span>
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
            <Button onClick={() => handleOpen(false)} className="w-full rounded-full">
              Close
            </Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => handleOpen(false)} className="rounded-full">
                Cancel
              </Button>
              <Button
                onClick={() => mut.mutate()}
                disabled={!emailOk || mut.isPending}
                className="rounded-full bg-gradient-to-b from-[#F6D9A0] to-[#E8B96D] text-[#1a1200] hover:brightness-105"
              >
                {mut.isPending ? "Sending…" : "Request invitation"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
