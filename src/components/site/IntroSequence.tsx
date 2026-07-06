import { useEffect, useState } from "react";

const STORAGE_KEY = "rememfur.intro.seen.v1";

const STANZAS: string[][] = [
  ["Grief is just love", "with nowhere to go."],
  ["No note to send.", "No door to knock on.", "No number to call."],
  ["So it stays.", "Circling. Looking for somewhere to land."],
];

const FINAL = "Now it has somewhere.";

export function IntroSequence() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [step, setStep] = useState(0); // 0..STANZAS.length = final
  const [leaving, setLeaving] = useState(false);

  // Client-only decision: don't SSR the overlay so crawlers get home content.
  useEffect(() => {
    setMounted(true);
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      return;
    }
    const mq = typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : null;
    setReduced(!!mq?.matches);
    setVisible(true);
  }, []);

  // Advance stanzas
  useEffect(() => {
    if (!visible || reduced) return;
    if (step >= STANZAS.length) return;
    const HOLD = 1800;
    const FADE = 600;
    const t = window.setTimeout(() => setStep((s) => s + 1), HOLD + FADE);
    return () => window.clearTimeout(t);
  }, [visible, reduced, step]);

  // Auto-advance after final stanza settles
  useEffect(() => {
    if (!visible || reduced) return;
    if (step !== STANZAS.length) return;
    const t = window.setTimeout(() => finish(), 600 + 1800 + 2500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, reduced, step]);

  function finish() {
    if (leaving) return;
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
    setLeaving(true);
    window.setTimeout(() => setVisible(false), 500);
  }

  if (!mounted || !visible) return null;

  const showFinal = reduced || step >= STANZAS.length;
  const currentStanza = !reduced && step < STANZAS.length ? STANZAS[step] : null;

  return (
    <div
      role="dialog"
      aria-label="Welcome"
      onClick={finish}
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#05070f] px-6 text-center transition-opacity duration-500 ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
      style={{
        backgroundImage:
          "radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.6), transparent 60%), radial-gradient(1px 1px at 70% 20%, rgba(255,255,255,0.5), transparent 60%), radial-gradient(1.5px 1.5px at 40% 70%, rgba(255,255,255,0.7), transparent 60%), radial-gradient(1px 1px at 85% 60%, rgba(255,255,255,0.5), transparent 60%), radial-gradient(1px 1px at 15% 85%, rgba(255,255,255,0.6), transparent 60%), radial-gradient(1px 1px at 60% 50%, rgba(255,255,255,0.4), transparent 60%)",
      }}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          finish();
        }}
        className="absolute right-4 top-4 rounded-full px-3 py-1.5 text-[12px] uppercase tracking-[0.28em] text-white/45 hover:text-white/80"
      >
        Skip
      </button>

      <div className="mx-auto max-w-xl">
        {currentStanza && (
          <div key={step} className="intro-fade font-display text-white/90">
            {currentStanza.map((line, i) => (
              <p
                key={i}
                className="text-[28px] leading-[1.35] md:text-[40px]"
              >
                {line}
              </p>
            ))}
          </div>
        )}

        {showFinal && (
          <div className="intro-in flex flex-col items-center">
            <p className="font-display italic text-[32px] leading-[1.25] text-[#f5e6c8] md:text-[52px]">
              {FINAL}
            </p>
            <span className="hero-candle mt-8 scale-90 opacity-0 animate-[intro-flame_1200ms_ease-out_400ms_forwards]" aria-hidden>
              <span className="flame" />
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                finish();
              }}
              className="mt-10 rounded-full border border-white/20 px-6 py-2 text-[12px] uppercase tracking-[0.28em] text-white/70 transition hover:border-white/40 hover:text-white"
            >
              Enter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
