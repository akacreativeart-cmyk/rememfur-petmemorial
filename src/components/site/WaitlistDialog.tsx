import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Bell } from "lucide-react";
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
import { joinWaitlist } from "@/lib/waitlist.functions";

export function WaitlistDialog({
  itemName,
  section,
  trigger,
}: {
  itemName: string;
  section: string;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [done, setDone] = useState<null | "new" | "dup">(null);
  const fn = useServerFn(joinWaitlist);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const mut = useMutation({
    mutationFn: () =>
      fn({
        data: { email: email.trim(), item_name: itemName, section },
      }),
    onSuccess: (res) => {
      setDone(res.duplicate ? "dup" : "new");
    },
    onError: (e: Error) => toast.error(e.message ?? "Couldn't add you to the list."),
  });

  function handleOpen(o: boolean) {
    setOpen(o);
    if (!o) {
      setTimeout(() => {
        setEmail("");
        setDone(null);
      }, 200);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <Bell className="h-4 w-4 text-[var(--cta)]" />
            {done ? "You're on the list" : "Notify me"}
          </DialogTitle>
          <DialogDescription>
            {done === "dup"
              ? `You're already on the list for ${itemName}. We'll be in touch.`
              : done === "new"
                ? "We'll let you know when this arrives."
                : `Drop your email and we'll let you know when ${itemName} is ready.`}
          </DialogDescription>
        </DialogHeader>

        {!done && (
          <div className="space-y-2 pt-1">
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
                className="rounded-full bg-[var(--cta)] text-[var(--cta-foreground,white)] hover:opacity-90"
              >
                {mut.isPending ? "Adding…" : "Notify me"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
