import { useId } from "react";

/**
 * Realistic memorial candle.
 *
 * Kept under the historical name `PawLamp` because every UI surface (buttons,
 * notifications, feed, memorial page, header) imports it under that name.
 *
 * Rendering:
 *   - size <= 22  → flame-only variant, so it stays legible in dense list rows
 *   - size >  22  → full pillar candle: wax body with vertical texture, warm rim
 *     light, melted rim with pooled-wax highlight, wick and layered flame.
 *
 * Motion is a multi-frequency flicker (flame sway + independent glow pulse) so
 * it never reads as a single loop. Reduced-motion users get a still candle
 * (handled in styles.css via the `.candle-anim` guard).
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
  const flameOnly = size <= 22;

  const vbW = flameOnly ? 24 : 34;
  const vbH = flameOnly ? 30 : 54;
  const height = Math.round((size * vbH) / vbW);

  const defs = (
    <defs>
      {/* Flame body: pale core → amber → deep amber */}
      <radialGradient id={`${gid}-flame`} cx="50%" cy="62%" r="62%">
        <stop offset="0%" stopColor="#FFF7E2" />
        <stop offset="38%" stopColor="#FFD98A" />
        <stop offset="72%" stopColor="#F0A83C" />
        <stop offset="100%" stopColor="#D9711C" stopOpacity="0.85" />
      </radialGradient>
      {/* Blue-hot base of the flame */}
      <radialGradient id={`${gid}-blue`} cx="50%" cy="72%" r="60%">
        <stop offset="0%" stopColor="#9CC9FF" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#6EA8F0" stopOpacity="0" />
      </radialGradient>
      {/* Warm halo around the flame */}
      <radialGradient id={`${gid}-glow`} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFD79B" stopOpacity="0.55" />
        <stop offset="55%" stopColor="#E8B96D" stopOpacity="0.18" />
        <stop offset="100%" stopColor="#E8B96D" stopOpacity="0" />
      </radialGradient>
      {/* Wax pillar */}
      <linearGradient id={`${gid}-wax`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#B99B78" />
        <stop offset="16%" stopColor="#F2E4CE" />
        <stop offset="52%" stopColor="#FBF3E4" />
        <stop offset="82%" stopColor="#E3CFB0" />
        <stop offset="100%" stopColor="#A98D6C" />
      </linearGradient>
      {/* Melted rim */}
      <linearGradient id={`${gid}-rim`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFF3DC" />
        <stop offset="100%" stopColor="#DCC4A2" />
      </linearGradient>
      {/* Light pool cast on the surface below */}
      <radialGradient id={`${gid}-pool`} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFDCA6" stopOpacity="0.55" />
        <stop offset="60%" stopColor="#E8B96D" stopOpacity="0.16" />
        <stop offset="100%" stopColor="#E8B96D" stopOpacity="0" />
      </radialGradient>
    </defs>
  );

  if (flameOnly) {
    return (
      <svg
        width={size}
        height={height}
        viewBox={`0 0 ${vbW} ${vbH}`}
        className={className}
        role="img"
        aria-label="Candle flame"
        style={{ overflow: "visible" }}
      >
        {defs}
        {glow && (
          <circle cx="12" cy="14" r="12" fill={`url(#${gid}-glow)`} className="candle-anim candle-glow-pulse" />
        )}
        <g className="candle-anim candle-flame-sway" style={{ transformOrigin: "12px 25px" }}>
          <path
            d="M12 2.5c3.6 4.1 6.2 7.4 6.2 11.4 0 3.9-2.8 6.6-6.2 6.6s-6.2-2.7-6.2-6.6C5.8 10.4 8.1 7.4 12 2.5z"
            fill={`url(#${gid}-flame)`}
          />
          <ellipse cx="12" cy="16.6" rx="2.9" ry="3.6" fill={`url(#${gid}-blue)`} />
          <ellipse cx="12" cy="11.6" rx="1.5" ry="3.1" fill="#FFFBF0" opacity="0.9" />
        </g>
        {/* wick tip so the flame doesn't float */}
        <path d="M12 20.4v3.1" stroke="#4A3A2A" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={height}
      viewBox={`0 0 ${vbW} ${vbH}`}
      className={className}
      role="img"
      aria-label="Memorial candle"
      style={{ overflow: "visible" }}
    >
      {defs}

      {/* light pool on the surface */}
      {glow && <ellipse cx="17" cy="50" rx="16" ry="4.4" fill={`url(#${gid}-pool)`} />}

      {/* ambient glow around the flame */}
      {glow && (
        <circle cx="17" cy="12" r="14" fill={`url(#${gid}-glow)`} className="candle-anim candle-glow-pulse" />
      )}

      {/* wax pillar */}
      <path d="M8.5 22h17v25a3 3 0 0 1-3 3h-11a3 3 0 0 1-3-3V22z" fill={`url(#${gid}-wax)`} />
      {/* vertical wax texture */}
      <g stroke="#C9AE8B" strokeOpacity="0.35" strokeWidth="0.6" strokeLinecap="round">
        <path d="M12.4 26v20" />
        <path d="M17 27.5v18" />
        <path d="M21.6 25.5v20.5" />
      </g>
      {/* warm rim light down the left edge */}
      <path d="M10.2 23.5v23" stroke="#FFE9C4" strokeOpacity="0.7" strokeWidth="1.1" strokeLinecap="round" />

      {/* melted rim + wax pool highlight */}
      <ellipse cx="17" cy="22" rx="8.5" ry="2.9" fill={`url(#${gid}-rim)`} />
      <ellipse cx="17" cy="21.9" rx="5.4" ry="1.6" fill="#EBD6B4" />
      <ellipse cx="15.2" cy="21.5" rx="2.1" ry="0.7" fill="#FFF8EA" opacity="0.9" />
      {/* a drip of wax down the side */}
      <path d="M9.6 23.4c-.9 2.4-.6 4.4.5 5.2 1 .8 1.9-.3 1.7-2-.2-1.4-.9-2.4-2.2-3.2z" fill="#F6E9D3" opacity="0.85" />

      {/* wick */}
      <path d="M17 21.6v-3.4" stroke="#3E3123" strokeWidth="1.6" strokeLinecap="round" />

      {/* flame */}
      <g className="candle-anim candle-flame-sway" style={{ transformOrigin: "17px 20px" }}>
        <path
          d="M17 1.5c4.6 5.3 7.7 9.2 7.7 13.9 0 4.6-3.4 7.8-7.7 7.8s-7.7-3.2-7.7-7.8C9.3 10.7 12.3 6.9 17 1.5z"
          fill={`url(#${gid}-flame)`}
        />
        <ellipse cx="17" cy="18.4" rx="3.6" ry="4.4" fill={`url(#${gid}-blue)`} />
        <ellipse cx="17" cy="12.4" rx="1.8" ry="3.8" fill="#FFFBF0" opacity="0.92" />
      </g>
    </svg>
  );
}

export default PawLamp;
