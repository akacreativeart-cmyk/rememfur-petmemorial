import { useState } from "react";
import { Flag } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
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
import { Textarea } from "@/components/ui/textarea";
import { reportContent } from "@/lib/moderation.functions";

type ContentType = "candle" | "message" | "post" | "comment";

export function ReportButton({
  contentType,
  contentId,
  label = "Report",
  className,
}: {
  contentType: ContentType;
  contentId: string;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [sent, setSent] = useState(false);
  const reportFn = useServerFn(reportContent);

  const mut = useMutation({
    mutationFn: () =>
      reportFn({
        data: {
          content_type: contentType,
          content_id: contentId,
          reason: reason.trim() ? reason.trim() : null,
        },
      }),
    onSuccess: () => {
      setSent(true);
    },
    onError: (e: Error) => toast.error(e.message ?? "Couldn't send report."),
  });

  function handleOpen(o: boolean) {
    setOpen(o);
    if (!o) {
      // reset after close so re-opens are fresh
      setTimeout(() => {
        setReason("");
        setSent(false);
      }, 200);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className={
            className ??
            "inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground/60 opacity-70 transition hover:bg-muted hover:text-muted-foreground hover:opacity-100"
          }
        >
          <Flag className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {sent ? "Thank you" : "Report this?"}
          </DialogTitle>
          <DialogDescription>
            {sent
              ? "Thank you — we'll take a look."
              : "If something here feels unsafe or unkind, let us know. Reports are private."}
          </DialogDescription>
        </DialogHeader>

        {!sent && (
          <div className="space-y-2 pt-1">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              Reason (optional)
            </label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value.slice(0, 500))}
              placeholder="A few words to help us understand…"
              rows={3}
              className="resize-none"
            />
            <div className="text-right text-[11px] text-muted-foreground">
              {reason.length}/500
            </div>
          </div>
        )}

        <DialogFooter>
          {sent ? (
            <Button
              onClick={() => handleOpen(false)}
              className="w-full rounded-full"
            >
              Close
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => handleOpen(false)}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                onClick={() => mut.mutate()}
                disabled={mut.isPending}
                className="rounded-full bg-[var(--cta)] text-[var(--cta-foreground,white)] hover:opacity-90"
              >
                {mut.isPending ? "Sending…" : "Send report"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
