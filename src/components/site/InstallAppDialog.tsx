import { useEffect, useState } from "react";
import { Download, Share as ShareIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useInstallPrompt, dismissInstallSuggestion } from "@/lib/pwa/install-prompt";

export function InstallAppDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { available, isIOS, isStandalone, promptInstall } = useInstallPrompt();
  useEffect(() => {
    const fn = () => setOpen(true);
    window.addEventListener("rememfur:open-install", fn);
    return () => window.removeEventListener("rememfur:open-install", fn);
  }, []);

  if (isStandalone) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Add Rememfur to your home screen</DialogTitle>
          <DialogDescription>Keep their flame close — open Rememfur with a tap.</DialogDescription>
        </DialogHeader>
        <div className="pt-1">
          {available && !isIOS ? (
            <Button
              onClick={async () => { await promptInstall(); setOpen(false); }}
              className="w-full rounded-full bg-[var(--cta)] text-[var(--cta-foreground,white)] hover:opacity-90"
            >
              <Download className="mr-2 h-4 w-4" /> Install Rememfur
            </Button>
          ) : isIOS ? (
            <ol className="space-y-3 text-sm text-foreground">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/80"><ShareIcon className="h-3.5 w-3.5" /></span>
                <span>Tap the <strong>Share</strong> icon in Safari.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/80"><Plus className="h-3.5 w-3.5" /></span>
                <span>Choose <strong>Add to Home Screen</strong>.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/80 text-xs">✓</span>
                <span>Tap <strong>Add</strong> — Rememfur will appear beside your other apps.</span>
              </li>
            </ol>
          ) : (
            <p className="text-sm text-muted-foreground">
              Your browser doesn't offer a direct install here. Try opening Rememfur in Chrome or Safari on your phone.
            </p>
          )}
          <button
            type="button"
            onClick={() => { dismissInstallSuggestion(); setOpen(false); }}
            className="mt-4 block w-full text-center text-xs text-muted-foreground/80 hover:text-muted-foreground"
          >
            Don't show again
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
