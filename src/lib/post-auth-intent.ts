// Lightweight client-side hint for what to do after auth completes.
// The URL `redirect` param always wins — this only guides the default (no-redirect) case.
// Written on the /signup or /login page (before password submit or OAuth handoff),
// consumed on /dashboard (the default post-auth landing).

const KEY = "rememfur:postAuthIntent";

export type PostAuthIntent = "welcome" | "return";

export function setPostAuthIntent(intent: PostAuthIntent) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, intent);
  } catch {
    /* private mode / storage full — safe to ignore */
  }
}

export function consumePostAuthIntent(): PostAuthIntent | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(KEY);
    if (v) window.localStorage.removeItem(KEY);
    return v === "welcome" || v === "return" ? v : null;
  } catch {
    return null;
  }
}

export function clearPostAuthIntent() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
