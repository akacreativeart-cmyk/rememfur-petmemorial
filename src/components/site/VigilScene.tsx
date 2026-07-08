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
      <g className="vigil-dog" style={{ transformOrigin: "360px 460px" }}>
        <g className="vigil-dog-torso" style={{ transformOrigin: "360px 455px" }}>
          {/* haunch + body */}
          <path
            d="M 300 455
               C 300 425, 320 405, 350 405
               C 385 405, 410 425, 415 455
               C 415 460, 415 465, 415 468
               L 295 468
               C 295 465, 295 460, 300 455 Z"
            fill="#04060D"
          />
          {/* tail curling up behind */}
          <path
            d="M 300 445 C 285 435, 280 415, 295 405 C 300 402, 305 410, 300 418 C 297 428, 302 438, 308 442 Z"
            fill="#04060D"
          />
          {/* front legs / chest */}
          <path
            d="M 372 435 C 372 452, 372 462, 372 468 L 382 468 C 382 462, 382 452, 382 435 Z"
            fill="#04060D"
          />
        </g>

        {/* Head group — very slow tilt every ~25s */}
        <g className="vigil-dog-head" style={{ transformOrigin: "372px 400px" }}>
          {/* neck */}
          <path d="M 358 420 C 358 405, 370 395, 380 395 L 390 415 Z" fill="#04060D" />
          {/* head */}
          <ellipse cx="378" cy="388" rx="17" ry="15" fill="#04060D" />
          {/* muzzle */}
          <path d="M 388 388 C 396 385, 398 393, 392 395 C 388 396, 384 393, 388 388 Z" fill="#04060D" />
          {/* left ear (still) */}
          <path d="M 366 375 C 361 362, 370 358, 374 372 Z" fill="#04060D" />
          {/* right ear — flicks */}
          <g className="vigil-dog-ear" style={{ transformOrigin: "384px 376px" }}>
            <path d="M 380 375 C 385 361, 393 361, 392 375 Z" fill="#04060D" />
          </g>
        </g>
      </g>
    </svg>
  );
}
