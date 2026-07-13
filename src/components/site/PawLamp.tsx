import { useId } from "react";

/**
 * PawLamp — a paw shape in warm gold (#E8B96D) with a soft radial glow beneath it.
 * Used as the tribute action icon (formerly a candle/flame).
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
  const gid = useId().replace(/:/g, "");
  const height = Math.round(size * 1.15);
  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 26 30"
      className={className}
      aria-hidden
    >
      {glow && (
        <defs>
          <radialGradient id={`pl-${gid}`} cx="50%" cy="78%" r="55%">
            <stop offset="0%" stopColor="#F5D28A" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#E8B96D" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#E8B96D" stopOpacity="0" />
          </radialGradient>
        </defs>
      )}
      {glow && <ellipse cx="13" cy="25" rx="12" ry="4.5" fill={`url(#pl-${gid})`} />}
      <g fill="#E8B96D">
        {/* main pad */}
        <ellipse cx="13" cy="16.5" rx="5" ry="5.5" />
        {/* side toes */}
        <ellipse cx="4.5" cy="12.5" rx="2.3" ry="3" />
        <ellipse cx="21.5" cy="12.5" rx="2.3" ry="3" />
        {/* top toes */}
        <ellipse cx="8.5" cy="6.5" rx="2" ry="2.6" />
        <ellipse cx="17.5" cy="6.5" rx="2" ry="2.6" />
      </g>
    </svg>
  );
}

export default PawLamp;
