import { useId } from "react";

/**
 * Realistic memorial candle.
 *
 * Kept the export name `PawLamp` so every existing call site (memorial page,
 * notifications, feed, header) continues to work without a rename sweep — but
 * the visual is a proper wax candle with a hand-lit flame, warm halo, and a
 * gentle flicker. Renders as a single self-contained SVG that scales to any
 * `size` and honours `prefers-reduced-motion` via CSS.
 *
 * Props kept identical to the previous icon:
 *   size  — width in px (height auto-derives from the candle aspect)
 *   glow  — when false, the outer halo is suppressed (used in dense list rows)
 */
export function PawLamp({
  size = 20,
  className,
  glow = true,
}: {
  size?: number;
  className?: string;
  glow?: boolean;
}) {
  const rawId = useId().replace(/:/g, "");
  const gid = `c${rawId}`;
  // 26 x 40 keeps a slender candle silhouette with room for flame + halo.
  const vbW = 26;
  const vbH = 40;
  const height = Math.round((size * vbH) / vbW);

  // Colours — warm ivory wax, amber flame, gold halo. Tuned to sit on the
  // project's navy surfaces without looking neon.
  const wickTop = "#2a1f14";
  const wickBase = "#0d0906";

  return (
    <svg
      width={size}
      height={height}
      viewBox={`0 0 ${vbW} ${vbH}`}
      className={className}
      role="img"
      aria-label="Candle"
      style={{ overflow: "visible" }}
    >
      <defs>
        {/* Wax pillar — ivory core with a soft shadow down the right edge. */}
        <linearGradient id={`${gid}-wax`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f7ecd4" />
          <stop offset="35%" stopColor="#f2e2bf" />
          <stop offset="70%" stopColor="#d9c092" />
          <stop offset="100%" stopColor="#a8894f" />
        </linearGradient>
        {/* Top rim — melted wax pool, slightly warmer & darker than the pillar. */}
        <radialGradient id={`${gid}-rim`} cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#fff4dc" />
          <stop offset="60%" stopColor="#e8d0a0" />
          <stop offset="100%" stopColor="#8a6a3a" />
        </radialGradient>
        {/* Flame body — hot white core → amber → deep orange edge. */}
        <radialGradient id={`${gid}-flame`} cx="50%" cy="65%" r="55%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="18%" stopColor="#fff6c8" />
          <stop offset="55%" stopColor="#ffb347" />
          <stop offset="90%" stopColor="#d55a10" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#7a2a05" stopOpacity="0" />
        </radialGradient>
        {/* Blue base of the flame near the wick. */}
        <radialGradient id={`${gid}-base`} cx="50%" cy="20%" r="40%">
          <stop offset="0%" stopColor="#9ec6ff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#9ec6ff" stopOpacity="0" />
        </radialGradient>
        {/* Outer halo — the light the candle casts into the room. */}
        <radialGradient id={`${gid}-halo`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffdca6" stopOpacity="0.75" />
          <stop offset="45%" stopColor="#e8b96d" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#e8b96d" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Soft halo behind everything. Suppressed when glow=false. */}
      {glow && (
        <ellipse
          cx={vbW / 2}
          cy="10"
          rx={vbW * 0.62}
          ry="10"
          fill={`url(#${gid}-halo)`}
          className="candle-halo"
        />
      )}

      {/* Candle body */}
      <g>
        {/* Faint ground shadow under the candle */}
        <ellipse cx={vbW / 2} cy="38.5" rx="8" ry="1.2" fill="#000" opacity="0.28" />

        {/* Wax pillar */}
        <rect
          x="7.5"
          y="17"
          width="11"
          height="21"
          rx="1.6"
          fill={`url(#${gid}-wax)`}
        />
        {/* Left-side sheen */}
        <rect x="8.6" y="18" width="1.1" height="18" rx="0.55" fill="#fff8e4" opacity="0.55" />
        {/* Right-side shadow to add roundness */}
        <rect x="16.5" y="18" width="1.4" height="19" rx="0.7" fill="#000" opacity="0.14" />

        {/* Melted wax rim (top of candle) */}
        <ellipse cx={vbW / 2} cy="17" rx="5.6" ry="1.5" fill={`url(#${gid}-rim)`} />
        {/* Small drip on the left rim */}
        <path d="M8.2 17.3 Q8 19 8.6 20.2 Q9.2 19 9 17.3 Z" fill="#f2e2bf" opacity="0.9" />
      </g>

      {/* Wick */}
      <line x1={vbW / 2} y1="15.6" x2={vbW / 2} y2="17.2" stroke={wickBase} strokeWidth="0.8" strokeLinecap="round" />
      <line x1={vbW / 2} y1="14.6" x2={vbW / 2} y2="15.9" stroke={wickTop} strokeWidth="0.7" strokeLinecap="round" />

      {/* Flame — a teardrop path filled with the radial gradient.
          Grouped so we can apply the flicker transform-origin at the wick. */}
      <g className="candle-flame" style={{ transformOrigin: `${vbW / 2}px 15px` }}>
        {/* Outer soft aura around the flame */}
        <ellipse cx={vbW / 2} cy="10" rx="3.6" ry="5.2" fill={`url(#${gid}-flame)`} opacity="0.45" />
        {/* Flame silhouette */}
        <path
          d={`M ${vbW / 2} 3.4
              C ${vbW / 2 + 2.6} 7.2, ${vbW / 2 + 2.9} 11.2, ${vbW / 2 + 1.6} 13.4
              C ${vbW / 2 + 0.6} 14.9, ${vbW / 2 - 0.6} 14.9, ${vbW / 2 - 1.6} 13.4
              C ${vbW / 2 - 2.9} 11.2, ${vbW / 2 - 2.6} 7.2, ${vbW / 2} 3.4 Z`}
          fill={`url(#${gid}-flame)`}
        />
        {/* Blue-hot base */}
        <ellipse cx={vbW / 2} cy="13.4" rx="1.1" ry="1.4" fill={`url(#${gid}-base)`} />
        {/* Bright inner core */}
        <ellipse cx={vbW / 2} cy="10.8" rx="0.75" ry="2.1" fill="#fff8d6" opacity="0.95" />
      </g>
    </svg>
  );
}

export default PawLamp;
