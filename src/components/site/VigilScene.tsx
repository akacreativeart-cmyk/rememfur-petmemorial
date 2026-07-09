import { useEffect, useRef } from "react";

interface VigilSceneProps {
  /** When true, draws the full Canis Major constellation lines above the dog. */
  showConstellation?: boolean;
  /** Overall aspect. Defaults to wide (hero). Use "square" for the closing scene. */
  variant?: "hero" | "compact";
  className?: string;
}

/**
 * "The Vigil" — a dark hill, a sitting dog silhouette, and Sirius watching from above.
 * Pure SVG + CSS. Freezes on rest frame under prefers-reduced-motion.
 */
export function VigilScene({ showConstellation = false, variant = "hero", className = "" }: VigilSceneProps) {
  const rootRef = useRef<SVGSVGElement | null>(null);

  // Self-drawing constellation lines on scroll into view.
  useEffect(() => {
    if (!showConstellation) return;
    const el = rootRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("vigil-in-view");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            (e.target as SVGSVGElement).classList.add("vigil-in-view");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [showConstellation]);

  const isHero = variant === "hero";
  const w = 800;
  const h = isHero ? 500 : 500;

  // Canis Major constellation, positioned above and beside the dog.
  // Sirius sits at (560, 130); other stars radiate from there.
  const stars = [
    { id: "sirius", cx: 560, cy: 130, r: 5.5 },
    { id: "mirzam", cx: 470, cy: 180 },
    { id: "muliphein", cx: 590, cy: 90 },
    { id: "wezen", cx: 640, cy: 240 },
    { id: "adhara", cx: 600, cy: 300 },
    { id: "aludra", cx: 700, cy: 250 },
    { id: "furud", cx: 520, cy: 260 },
  ];
  const lines: Array<[string, string]> = [
    ["sirius", "mirzam"],
    ["sirius", "muliphein"],
    ["sirius", "wezen"],
    ["wezen", "aludra"],
    ["wezen", "adhara"],
    ["adhara", "furud"],
  ];
  const byId = Object.fromEntries(stars.map((s) => [s.id, s]));

  return (
    <svg
      ref={rootRef}
      viewBox={`0 0 ${w} ${h}`}
      className={`vigil-scene block h-full w-full ${showConstellation ? "vigil-with-constellation" : ""} ${className}`}
      preserveAspectRatio="xMidYMax slice"
      aria-hidden
    >
      <defs>
        <radialGradient id="siriusCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fffef2" stopOpacity="1" />
          <stop offset="30%" stopColor="#ffe9b0" stopOpacity="0.95" />
          <stop offset="70%" stopColor="#d4b378" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#d4b378" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="siriusGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffe9b0" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#d4b378" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#d4b378" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="starFlareV" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#fff2cc" stopOpacity="0" />
          <stop offset="50%" stopColor="#fffbe6" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fff2cc" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="starFlareH" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#fff2cc" stopOpacity="0" />
          <stop offset="50%" stopColor="#fffbe6" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fff2cc" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffe9b0" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#ffe9b0" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="smallStar" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="60%" stopColor="#e6e1d6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#e6e1d6" stopOpacity="0" />
        </radialGradient>
        <filter id="softBlur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>

      {/* Faint diagonal starlight beam from Sirius down toward the dog */}
      <g className="vigil-beam" style={{ mixBlendMode: "screen" }}>
        <polygon
          points="540,140 590,140 360,470 300,470"
          fill="url(#beamGrad)"
          filter="url(#softBlur)"
        />
      </g>

      {/* Constellation lines (only in closing scene) */}
      {showConstellation && (
        <g className="vigil-constellation" stroke="#d4b378" strokeOpacity="0.55" strokeWidth="1" strokeLinecap="round" fill="none">
          {lines.map(([a, b], i) => {
            const A = byId[a]!;
            const B = byId[b]!;
            const dx = B.cx - A.cx;
            const dy = B.cy - A.cy;
            const len = Math.sqrt(dx * dx + dy * dy);
            return (
              <line
                key={`${a}-${b}`}
                x1={A.cx}
                y1={A.cy}
                x2={B.cx}
                y2={B.cy}
                className="vigil-line"
                style={
                  {
                    strokeDasharray: len,
                    strokeDashoffset: len,
                    "--dash": `${len}px`,
                    "--delay": `${i * 150}ms`,
                  } as React.CSSProperties
                }
              />
            );
          })}
        </g>
      )}

      {/* Sirius — bright core, cross flare, glow */}
      <g className="vigil-sirius" style={{ transformOrigin: "560px 130px" }}>
        <circle cx="560" cy="130" r="46" fill="url(#siriusGlow)" />
        <rect x="558" y="94" width="4" height="72" rx="2" fill="url(#starFlareV)" />
        <rect x="524" y="128" width="72" height="4" rx="2" fill="url(#starFlareH)" />
        <circle cx="560" cy="130" r="7" fill="url(#siriusCore)" />
      </g>

      {/* Supporting constellation stars (soft, always visible if constellation is on) */}
      {showConstellation &&
        stars
          .filter((s) => s.id !== "sirius")
          .map((s, i) => (
            <g key={s.id} className="vigil-star" style={{ ["--delay" as any]: `${900 + i * 120}ms` }}>
              <circle cx={s.cx} cy={s.cy} r="10" fill="url(#smallStar)" opacity="0.6" />
              <circle cx={s.cx} cy={s.cy} r="2.2" fill="#fffbe6" />
            </g>
          ))}

      {/* Ambient stars (a few, faint) */}
      {[
        [90, 60], [180, 110], [260, 60], [340, 130], [430, 70],
        [700, 60], [740, 180], [80, 220], [220, 260], [380, 40],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={i % 3 === 0 ? 1.4 : 1} fill="#e6e1d6" opacity={0.55} />
      ))}

      {/* Hill silhouette */}
      <path
        d="M 0 470 C 120 430, 240 420, 360 445 C 480 470, 600 435, 720 450 C 760 455, 790 460, 800 465 L 800 500 L 0 500 Z"
        fill="#04060D"
      />

      {/* Dog silhouette on the hill — sitting, facing up/right toward Sirius */}
      <g className="vigil-dog">
        <g className="vigil-dog-torso" style={{ transformOrigin: "352px 452px" }}>
          {/* haunch */}
          <ellipse cx="345" cy="452" rx="17" ry="16.5" fill="#04060D" />
          {/* chest */}
          <ellipse cx="363" cy="437" rx="14.5" ry="17" fill="#04060D" />
          {/* front leg */}
          <rect x="364" y="435" width="8" height="33" rx="3.5" fill="#04060D" />
          {/* rear paw */}
          <rect x="336" y="461" width="20" height="7" rx="3.5" fill="#04060D" />
          {/* tail, curling out from the haunch */}
          <path d="M331 461 c-8-4-10-13-3-18 l3.4 3.4 c-4 3.2-3 8.4 1.6 11 z" fill="#04060D" />
        </g>

        {/* Head group — very slow tilt every ~25s */}
        <g className="vigil-dog-head" style={{ transformOrigin: "363px 420px" }}>
          {/* neck, rising from the chest to the head */}
          <path d="M358 415 h20 l-5 20 h-13 z" fill="#04060D" />
          {/* head */}
          <ellipse cx="370" cy="410" rx="13.5" ry="12.5" fill="#04060D" />
          {/* snout */}
          <rect x="378" y="407" width="14" height="8.5" rx="4.2" fill="#04060D" />
          {/* ear — flicks */}
          <g className="vigil-dog-ear" style={{ transformOrigin: "365px 405px" }}>
            <path d="M361 393 l7 14 -14 4 z" fill="#04060D" />
          </g>
        </g>
      </g>
    </svg>
  );
}
