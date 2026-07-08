import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useLocation } from "@tanstack/react-router";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { submitBetaFeedback } from "@/lib/feedback.functions";
import { useAuth } from "@/hooks/use-auth";

export function FeedbackDialog({ trigger }: { trigger: React.ReactNode }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => { if (!open) { setDone(false); setMessage(""); setEmail(""); } }, [open]);

  const fn = useServerFn(submitBetaFeedback);
  const mut = useMutation({
    mutationFn: () => fn({ data: { message: message.trim(), email: email.trim() || null, page_path: pathname } }),
    onSuccess: () => { setDone(true); },
    onError: (e: Error) => toast.error(e.message || "Couldn't send feedback"),
  });

  const disabled = mut.isPending || message.trim().length < 3;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Share feedback</DialogTitle>
          <DialogDescription>
            {done ? "" : "We're still building this gently. Tell us what's working, what's not, or what would help."}
          </DialogDescription>
        </DialogHeader>
        {done ? (
          <div className="py-6 text-center">
            <p className="font-display text-lg text-foreground">Thank you for helping us build this gently.</p>
            <Button className="mt-6 rounded-full" onClick={() => setOpen(false)}>Close</Button>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">What's working? What's not?</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                maxLength={4000}
                placeholder="Anything at all…"
                className="resize-none"
              />
            </div>
            {!user && (
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground">Email (optional)</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" type="email" />
              </div>
            )}
            <Button
              onClick={() => mut.mutate()}
              disabled={disabled}
              className="w-full rounded-full bg-[var(--cta)] text-[var(--cta-foreground,white)] hover:opacity-90"
            >
              <Send className="mr-2 h-4 w-4" />
              {mut.isPending ? "Sending…" : "Send feedback"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
