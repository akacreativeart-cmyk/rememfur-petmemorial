/**
 * Guarded service worker registration.
 * Refuses to register inside Lovable preview/dev/iframe contexts.
 * Unregisters any stale registration when refusing.
 */

function isRefusedContext(): boolean {
  if (typeof window === "undefined") return true;
  if (!("serviceWorker" in navigator)) return true;
  if (!import.meta.env.PROD) return true;
  try {
    if (window.self !== window.top) return true;
  } catch {
    return true;
  }
  const host = window.location.hostname;
  if (
    host.startsWith("id-preview--") ||
    host.startsWith("preview--") ||
    host === "lovableproject.com" ||
    host.endsWith(".lovableproject.com") ||
    host === "lovableproject-dev.com" ||
    host.endsWith(".lovableproject-dev.com") ||
    host === "beta.lovable.dev" ||
    host.endsWith(".beta.lovable.dev")
  ) {
    return true;
  }
  if (new URLSearchParams(window.location.search).get("sw") === "off") return true;
  return false;
}

async function unregisterOwn(): Promise<void> {
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      regs
        .filter((r) => (r.active?.scriptURL || r.installing?.scriptURL || r.waiting?.scriptURL || "").endsWith("/sw.js"))
        .map((r) => r.unregister()),
    );
  } catch {
    /* noop */
  }
}

export async function registerServiceWorker(): Promise<void> {
  if (isRefusedContext()) {
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      await unregisterOwn();
    }
    return;
  }
  try {
    await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  } catch (err) {
    console.warn("SW registration failed", err);
  }
}
