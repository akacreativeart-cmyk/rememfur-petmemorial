import { useEffect, useState } from "react";

/**
 * Dynamic sky: gradient + stars based on the viewer's current local hour.
 * Renders as a fixed full-screen layer behind all content.
 */
type Phase = {
  name: string;
  gradient: string;
  stars: number; // 0..1
};

function phaseForHour(h: number): Phase {
  if (h >= 5 && h < 7) {
    return {
      name: "dawn",
      gradient:
        "linear-gradient(180deg, #0a0f24 0%, #1a2342 35%, #3d3a5c 70%, #8a5a6a 100%)",
      stars: 0.55,
    };
  }
  if (h >= 7 && h < 10) {
    return {
      name: "sunrise",
      gradient:
        "linear-gradient(180deg, #1a2342 0%, #3a4a72 30%, #7a6a8a 60%, #d49a7a 90%, #f0b878 100%)",
      stars: 0.15,
    };
  }
  if (h >= 10 && h < 16) {
    return {
      name: "day",
      gradient:
        "linear-gradient(180deg, #1c3050 0%, #2a4a74 45%, #5878a0 100%)",
      stars: 0,
    };
  }
  if (h >= 16 && h < 18) {
    return {
      name: "golden",
      gradient:
        "linear-gradient(180deg, #2a2a52 0%, #6a4a6a 45%, #d49a6a 100%)",
      stars: 0.1,
    };
  }
  if (h >= 18 && h < 20) {
    return {
      name: "sunset",
      gradient:
        "linear-gradient(180deg, #0e1424 0%, #2a2a52 25%, #5a3a62 55%, #a85a5a 80%, #e08858 100%)",
      stars: 0.35,
    };
  }
  if (h >= 20 && h < 22) {
    return {
      name: "dusk",
      gradient:
        "linear-gradient(180deg, #060a18 0%, #141a38 40%, #28244a 75%, #4a3458 100%)",
      stars: 0.85,
    };
  }
  // Deep night — matches reference #090d1a body
  return {
    name: "night",
    gradient:
      "radial-gradient(ellipse 120% 80% at 50% 0%, #0e1530 0%, #0a1024 35%, #060912 70%), linear-gradient(to bottom, #080d1a, #05080f)",
    stars: 1,
  };
}

function useHour() {
  const [h, setH] = useState(() => {
    if (typeof window === "undefined") return 12;
    const d = new Date();
    return d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
  });
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setH(d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600);
    };
    // Poll every 30s so the gradient drifts smoothly through the day and
    // automatically follows the viewer's local clock, including DST shifts
    // (new Date() always reflects the current local timezone).
    const id = window.setInterval(tick, 30_000);
    const onVis = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", tick);
    tick();
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", tick);
    };
  }, []);
  return h;
}

// Stable star field
const STARS = Array.from({ length: 80 }, (_, i) => {
  // Pseudo-random but stable per index
  const x = (i * 37) % 100;
  const y = (i * 53) % 70;
  const s = ((i * 13) % 3) + 1;
  const d = (i * 7) % 4;
  return { x, y, s, d };
});

export function SkyBackground() {
  const h = useHour();
  const phase = phaseForHour(h);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{
        background: phase.gradient,
        transition: "background 4s ease",
      }}
    >
      {/* Stars (visible when phase.stars > 0) */}
      {phase.stars > 0 && (
        <div
          className="absolute inset-0"
          style={{ opacity: phase.stars }}
        >
          {STARS.map((st, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                top: `${st.y}%`,
                left: `${st.x}%`,
                width: `${st.s}px`,
                height: `${st.s}px`,
                opacity: 0.8,
                animation: `twinkle ${2 + st.d}s ease-in-out ${st.d * 0.3}s infinite`,
                boxShadow: "0 0 4px rgba(255,255,255,0.7)",
              }}
            />
          ))}
          {/* Moon */}
          <div
            className="absolute rounded-full"
            style={{
              top: "8%",
              right: "12%",
              width: 64,
              height: 64,
              background:
                "radial-gradient(circle at 35% 35%, #fff 0%, #f3f0e0 60%, #d9d3b8 100%)",
              boxShadow:
                "0 0 40px rgba(255,255,230,0.45), 0 0 80px rgba(255,255,230,0.25)",
            }}
          />
        </div>
      )}

      {/* Sun for daytime / sunrise / sunset */}
      {(phase.name === "sunrise" ||
        phase.name === "day" ||
        phase.name === "golden" ||
        phase.name === "sunset") && (
        <div
          className="absolute rounded-full"
          style={{
            top:
              phase.name === "day"
                ? "10%"
                : phase.name === "golden"
                ? "32%"
                : phase.name === "sunset"
                ? "58%"
                : "30%",
            right: phase.name === "sunrise" ? "15%" : "20%",
            width: 110,
            height: 110,
            background:
              phase.name === "sunset"
                ? "radial-gradient(circle, #ffd28a 0%, #ff8a4d 60%, rgba(255,138,77,0) 75%)"
                : phase.name === "golden"
                ? "radial-gradient(circle, #fff0c2 0%, #ffba6b 55%, rgba(255,186,107,0) 75%)"
                : "radial-gradient(circle, #fff7d6 0%, #ffd56e 55%, rgba(255,213,110,0) 75%)",
            filter: "blur(0.5px)",
          }}
        />
      )}

      {/* Soft cloud wash to keep text legible */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/3"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.25) 100%)",
        }}
      />

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
