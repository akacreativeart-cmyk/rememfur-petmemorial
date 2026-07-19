import { useEffect, useState } from "react";

const STORAGE_KEY = "rememfur.intro.seen.v1";

const STANZAS: string[][] = [
  ["Grief is just love", "with nowhere to go."],
  ["No note to send.", "No door to knock on.", "No number to call."],
  ["So it stays.", "Circling. Looking for somewhere to land."],
];

const FINAL = "Now it has somewhere.";

// ~1.5× the previous cadence — a slower, quieter breath.
const HOLD = 2600;
const FADE = 900;

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
    const t = window.setTimeout(() => setStep((s) => s + 1), HOLD + FADE);
    return () => window.clearTimeout(t);
  }, [visible, reduced, step]);

  // Auto-advance after final stanza settles
  useEffect(() => {
    if (!visible || reduced) return;
    if (step !== STANZAS.length) return;
    const t = window.setTimeout(() => finish(), FADE + HOLD + 3400);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, reduced, step]);

  function finish() {
    if (leaving) return;
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
    setLeaving(true);
    window.setTimeout(() => setVisible(false), 700);
  }

  if (!mounted || !visible) return null;

  const showFinal = reduced || step >= STANZAS.length;
  const currentStanza = !reduced && step < STANZAS.length ? STANZAS[step] : null;

  return (
    <div
      role="dialog"
      aria-label="Welcome"
      onClick={finish}
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#05070f] px-6 text-center transition-opacity duration-700 ${
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
            <IntroCandle reduced={reduced} />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                finish();
              }}
              className="mt-10 rounded-full border border-white/25 px-6 py-2 text-[12px] uppercase tracking-[0.28em] text-white/75 transition hover:border-white/45 hover:text-white"
            >
              Enter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * A crafted lit candle for the intro finale.
 * SVG wax pillar + layered flame (outer amber glow → warm mid → bright core)
 * with a gentle CSS flicker and a soft under-halo. Respects reduced motion.
 */
function IntroCandle({ reduced }: { reduced: boolean }) {
  return (
    <div
      className="relative mt-9"
      aria-hidden
      style={{
        width: 88,
        height: 168,
        opacity: 0,
        animation: reduced ? "none" : "intro-flame 1400ms ease-out 600ms forwards",
      }}
    >
      {/* Soft under-glow on the surface below */}
      <span
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: -8,
          width: 140,
          height: 34,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, rgba(255,196,120,0.55) 0%, rgba(232,185,109,0.18) 45%, rgba(232,185,109,0) 75%)",
          filter: "blur(3px)",
        }}
      />

      {/* Flame — layered glow behind, sharp core in front */}
      <svg
        viewBox="0 0 88 100"
        width="88"
        height="100"
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          top: 0,
          overflow: "visible",
          transformOrigin: "50% 92%",
          animation: reduced ? "none" : "intro-flicker 2.4s ease-in-out infinite",
        }}
      >
        <defs>
          <radialGradient id="ic-outer" cx="50%" cy="70%" r="55%">
            <stop offset="0%" stopColor="#ffb060" stopOpacity="0.55" />
            <stop offset="55%" stopColor="#e8901c" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#e8901c" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="ic-mid" cx="50%" cy="75%" r="50%">
            <stop offset="0%" stopColor="#fff2c4" stopOpacity="1" />
            <stop offset="55%" stopColor="#f4b866" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#c9822a" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="ic-core" cx="50%" cy="80%" r="45%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="55%" stopColor="#fff4c4" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#fff4c4" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Outer amber glow — big teardrop */}
        <ellipse cx="44" cy="58" rx="30" ry="42" fill="url(#ic-outer)" />
        {/* Warm mid — the flame body */}
        <path
          d="M44 18 C 58 40, 66 58, 60 76 C 56 90, 32 90, 28 76 C 22 58, 30 40, 44 18 Z"
          fill="url(#ic-mid)"
        />
        {/* Bright hot core */}
        <path
          d="M44 40 C 51 54, 52 66, 48 78 C 46 84, 42 84, 40 78 C 36 66, 37 54, 44 40 Z"
          fill="url(#ic-core)"
        />
      </svg>

      {/* Wick */}
      <span
        className="absolute left-1/2 -translate-x-1/2"
        style={{ top: 92, width: 2, height: 10, background: "#1a1206", borderRadius: 1 }}
      />

      {/* Candle wax pillar */}
      <span
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          top: 100,
          width: 42,
          height: 62,
          borderRadius: "6px 6px 8px 8px",
          background:
            "linear-gradient(180deg, #f8efd6 0%, #ecdbb0 45%, #d6bd85 100%)",
          boxShadow:
            "inset -7px 0 12px -6px rgba(80,50,20,0.45), inset 6px 0 10px -6px rgba(255,240,210,0.55), 0 12px 26px -12px rgba(0,0,0,0.6)",
        }}
      />
      {/* Melted rim */}
      <span
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          top: 96,
          width: 46,
          height: 8,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at 45% 30%, #fff4d4 0%, #e5cf9c 55%, #b89658 100%)",
          boxShadow: "0 4px 8px -3px rgba(0,0,0,0.5)",
        }}
      />
    </div>
  );
}
