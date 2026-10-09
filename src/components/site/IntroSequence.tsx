import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

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
      className={`intro-scene fixed inset-0 z-[100] flex items-center justify-center bg-background px-6 text-center text-foreground transition-opacity duration-700 ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
      style={{
        backgroundImage:
          "radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.6), transparent 60%), radial-gradient(1px 1px at 70% 20%, rgba(255,255,255,0.5), transparent 60%), radial-gradient(1.5px 1.5px at 40% 70%, rgba(255,255,255,0.7), transparent 60%), radial-gradient(1px 1px at 85% 60%, rgba(255,255,255,0.5), transparent 60%), radial-gradient(1px 1px at 15% 85%, rgba(255,255,255,0.6), transparent 60%), radial-gradient(1px 1px at 60% 50%, rgba(255,255,255,0.4), transparent 60%)",
      }}
    >
      <Button
        type="button"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          finish();
        }}
        className="absolute right-4 top-4"
      >
        Skip
      </Button>

      <div className="mx-auto flex w-full max-w-xl flex-col items-center">
        <div className="flex min-h-48 items-center justify-center md:min-h-56">
        {currentStanza && (
          <div key={step} className="intro-fade font-display text-foreground">
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
            <p className="font-display italic text-[32px] leading-[1.25] text-foreground md:text-[52px]">
              {FINAL}
            </p>
          </div>
        )}
        </div>
        <Button type="button" variant="gold" size="lg" onClick={finish} className="mt-8">
          Enter Rememfur
        </Button>
      </div>
    </div>
  );
}
