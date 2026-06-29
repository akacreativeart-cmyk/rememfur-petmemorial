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
  // Smooth phases across the day
  if (h >= 5 && h < 7) {
    // Pre-dawn / dawn
    return {
      name: "dawn",
      gradient:
        "linear-gradient(180deg, #1b1b3a 0%, #5b3a6b 35%, #f5a26b 70%, #ffd9a8 100%)",
      stars: 0.5,
    };
  }
  if (h >= 7 && h < 10) {
    // Sunrise → morning
    return {
      name: "sunrise",
      gradient:
        "linear-gradient(180deg, #ffb27a 0%, #ffd9a8 35%, #d6ecff 75%, #eaf6ff 100%)",
      stars: 0,
    };
  }
  if (h >= 10 && h < 16) {
    // Midday — clear blue sky
    return {
      name: "day",
      gradient:
        "linear-gradient(180deg, #74b8f0 0%, #a9d4f5 50%, #e6f1fa 100%)",
      stars: 0,
    };
  }
  if (h >= 16 && h < 18) {
    // Late afternoon, golden hour
    return {
      name: "golden",
      gradient:
        "linear-gradient(180deg, #f0c27b 0%, #f7a072 50%, #efb480 100%)",
      stars: 0,
    };
  }
  if (h >= 18 && h < 20) {
    // Sunset
    return {
      name: "sunset",
      gradient:
        "linear-gradient(180deg, #2c3e7b 0%, #7a3b75 30%, #e15d4a 65%, #ffb480 100%)",
      stars: 0.3,
    };
  }
  if (h >= 20 && h < 22) {
    // Dusk
    return {
      name: "dusk",
      gradient:
        "linear-gradient(180deg, #0c1336 0%, #2a2256 45%, #6b3a78 90%, #b56b80 100%)",
      stars: 0.8,
    };
  }
  // 22 → 5: deep night
  return {
    name: "night",
    gradient:
      "linear-gradient(180deg, #04061a 0%, #0a0e2c 50%, #14163a 100%)",
    stars: 1,
  };
}

function useHour() {
  const [h, setH] = useState(() =>
    typeof window === "undefined" ? 12 : new Date().getHours(),
  );
  useEffect(() => {
    const id = setInterval(() => setH(new Date().getHours()), 60_000);
    return () => clearInterval(id);
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
