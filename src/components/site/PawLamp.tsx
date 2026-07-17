import { useId } from "react";

/**
 * Paw-lamp icon — a warm gold paw glyph resting on a soft radial glow.
 *
 * Named `PawLamp` because every UI surface (buttons, notifications, feed,
 * memorial page, header) imports it under that name. Renders as a single
 * self-contained SVG so it scales cleanly at any `size` and reads correctly
 * on dark panels.
 *
 * Props:
 *   size — width in px (height auto-derives from the icon aspect)
 *   glow — when false, the soft under-halo is suppressed for dense list rows
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
  const gid = `p${rawId}`;
  // 32 x 34 keeps four toe pads + main pad + halo without clipping.
  const vbW = 32;
  const vbH = 34;
  const height = Math.round((size * vbH) / vbW);

  return (
    <svg
      width={size}
      height={height}
      viewBox={`0 0 ${vbW} ${vbH}`}
      className={className}
      role="img"
      aria-label="Paw lamp"
      style={{ overflow: "visible" }}
    >
      <defs>
        {/* Warm gold fill for the paw glyph */}
        <linearGradient id={`${gid}-gold`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F6D9A0" />
          <stop offset="55%" stopColor="#E8B96D" />
          <stop offset="100%" stopColor="#C9852F" />
        </linearGradient>
        {/* Soft warm halo below the paw */}
        <radialGradient id={`${gid}-halo`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFDCA6" stopOpacity="0.75" />
          <stop offset="55%" stopColor="#E8B96D" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#E8B96D" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Under-halo — warm light the paw casts onto the surface below */}
      {glow && (
        <ellipse
          cx={vbW / 2}
          cy={vbH - 5}
          rx={vbW * 0.5}
          ry="5"
          fill={`url(#${gid}-halo)`}
          className="candle-halo"
        />
      )}

      {/* Paw — four toe pads + main pad */}
      <g fill={`url(#${gid}-gold)`}>
        <ellipse cx="6" cy="11" rx="2.6" ry="3.4" />
        <ellipse cx="12" cy="6.5" rx="2.6" ry="3.4" />
        <ellipse cx="20" cy="6.5" rx="2.6" ry="3.4" />
        <ellipse cx="26" cy="11" rx="2.6" ry="3.4" />
        <path
          d="M16 13.2c4.4 0 8.8 3.6 8.8 7.9 0 3.2-2.5 5-5.5 5-1.9 0-2.8-1-3.3-1-.5 0-1.4 1-3.3 1-3 0-5.5-1.8-5.5-5 0-4.3 4.4-7.9 8.8-7.9z"
        />
      </g>
    </svg>
  );
}

export default PawLamp;
