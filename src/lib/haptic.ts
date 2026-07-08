export function softHaptic(ms = 20): void {
  if (typeof navigator === "undefined") return;
  try {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    if ("vibrate" in navigator) navigator.vibrate(ms);
  } catch {
    /* noop */
  }
}
