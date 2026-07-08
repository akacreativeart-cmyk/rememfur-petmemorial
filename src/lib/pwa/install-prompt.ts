import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "rememfur.install.dismissed.v1";
const VISITS_KEY = "rememfur.visits.v1";
const INTRO_KEY = "rememfur.intro.seen.v1";

let deferred: BeforeInstallPromptEvent | null = null;
const listeners = new Set<(available: boolean) => void>();

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as BeforeInstallPromptEvent;
    listeners.forEach((fn) => fn(true));
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    try { localStorage.setItem(DISMISS_KEY, "1"); } catch { /* noop */ }
    listeners.forEach((fn) => fn(false));
  });
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    // @ts-expect-error iOS
    window.navigator.standalone === true
  );
}

export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) && !("MSStream" in window);
}

export function useInstallPrompt() {
  const [available, setAvailable] = useState<boolean>(!!deferred);
  useEffect(() => {
    const fn = (v: boolean) => setAvailable(v);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);
  async function promptInstall(): Promise<"accepted" | "dismissed" | "unavailable"> {
    if (!deferred) return "unavailable";
    await deferred.prompt();
    const choice = await deferred.userChoice;
    deferred = null;
    setAvailable(false);
    try { localStorage.setItem(DISMISS_KEY, "1"); } catch { /* noop */ }
    return choice.outcome;
  }
  return { available, isIOS: isIOS(), isStandalone: isStandalone(), promptInstall };
}

export function bumpVisitCount(): number {
  try {
    const n = Number(localStorage.getItem(VISITS_KEY) ?? "0") + 1;
    localStorage.setItem(VISITS_KEY, String(n));
    return n;
  } catch {
    return 1;
  }
}

export function shouldSuggestInstall(): boolean {
  if (typeof window === "undefined") return false;
  if (isStandalone()) return false;
  try {
    if (localStorage.getItem(DISMISS_KEY) === "1") return false;
    if (localStorage.getItem(INTRO_KEY) !== "1") return false; // wait until intro seen
    const visits = Number(localStorage.getItem(VISITS_KEY) ?? "0");
    return visits >= 2;
  } catch {
    return false;
  }
}

export function dismissInstallSuggestion() {
  try { localStorage.setItem(DISMISS_KEY, "1"); } catch { /* noop */ }
}
