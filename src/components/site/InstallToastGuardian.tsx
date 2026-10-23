import { useEffect } from "react";
import { toast } from "sonner";
import { useLocation } from "@tanstack/react-router";
import {
  bumpVisitCount, shouldSuggestInstall, dismissInstallSuggestion, isStandalone,
} from "@/lib/pwa/install-prompt";

let bumped = false;
let shown = false;

export function InstallToastGuardian() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone()) return;
    if (!bumped) { bumpVisitCount(); bumped = true; }
    if (shown) return;
    if (pathname === "/create" || pathname === "/") return; // avoid intro & create
    if (!shouldSuggestInstall()) return;
    shown = true;
    const t = window.setTimeout(() => {
      toast("Keep their flame close — add Rememfur to your home screen", {
        duration: 8000,
        action: {
          label: "Install",
          onClick: () => {
            const ev = new CustomEvent("rememfur:open-install");
            window.dispatchEvent(ev);
          },
        },
        cancel: { label: "Not now", onClick: () => dismissInstallSuggestion() },
        onDismiss: () => dismissInstallSuggestion(),
      });
    }, 1200);
    return () => window.clearTimeout(t);
  }, [pathname]);
  return null;
}
