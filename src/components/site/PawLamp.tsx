import { useId } from "react";

type PawLampProps = {
  size?: number;
  className?: string;
  glow?: boolean;
};

/** A shared, natural-looking ivory memorial candle for every platform surface. */
export function PawLamp({ size = 20, className, glow = true }: PawLampProps) {
  const gid = `candle-${useId().replace(/:/g, "")}`;
  const height = Math.round(size * 1.52);

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 40 61"
      className={className}
      role="img"
      aria-label="Memorial candle"
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id={`${gid}-wax`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#BBA589" />
          <stop offset="0.16" stopColor="#E8D9C2" />
          <stop offset="0.42" stopColor="#FFF8EA" />
          <stop offset="0.7" stopColor="#EBD9BC" />
          <stop offset="1" stopColor="#A99073" />
        </linearGradient>
        <linearGradient id={`${gid}-wax-top`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFF9EC" />
          <stop offset="0.62" stopColor="#E5D0AE" />
          <stop offset="1" stopColor="#B89D7B" />
        </linearGradient>
        <radialGradient id={`${gid}-melt`} cx="48%" cy="42%" r="62%">
          <stop offset="0" stopColor="#C8AD88" />
          <stop offset="0.45" stopColor="#EAD7B7" />
          <stop offset="1" stopColor="#FFF6E5" />
        </radialGradient>
        <linearGradient id={`${gid}-flame`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#5F87C4" />
          <stop offset="0.15" stopColor="#FFF5D6" />
          <stop offset="0.48" stopColor="#FFD073" />
          <stop offset="0.78" stopColor="#F19A34" />
          <stop offset="1" stopColor="#C85C16" />
        </linearGradient>
        <radialGradient id={`${gid}-core`} cx="50%" cy="70%" r="55%">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.55" stopColor="#FFF7D7" stopOpacity="0.96" />
          <stop offset="1" stopColor="#FFE7A7" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${gid}-halo`}>
          <stop offset="0" stopColor="#FFD991" stopOpacity="0.42" />
          <stop offset="0.52" stopColor="#E8B96D" stopOpacity="0.13" />
          <stop offset="1" stopColor="#E8B96D" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${gid}-pool`}>
          <stop offset="0" stopColor="#D69A4A" stopOpacity="0.3" />
          <stop offset="1" stopColor="#D69A4A" stopOpacity="0" />
        </radialGradient>
      </defs>

      {glow && <ellipse cx="20" cy="57" rx="18" ry="3.2" fill={`url(#${gid}-pool)`} />}
      {glow && <ellipse cx="20" cy="16" rx="19" ry="18" fill={`url(#${gid}-halo)`} className="candle-anim candle-glow-pulse" />}

      <path d="M8 28.5C8 25.5 10.6 23 13.6 23h12.8c3 0 5.6 2.5 5.6 5.5V53c0 3.4-2.8 6-6.2 6H14.2C10.8 59 8 56.4 8 53V28.5Z" fill={`url(#${gid}-wax)`} />
      <path d="M9.5 29v23.6c0 2.8 1.9 4.8 4.4 5.1" fill="none" stroke="#FFF8E9" strokeWidth="1.2" strokeLinecap="round" opacity="0.68" />
      <path d="M29.5 29v23" fill="none" stroke="#8B735B" strokeWidth="0.8" strokeLinecap="round" opacity="0.28" />
      <path d="M12.5 33c1.2 2.8 0.8 6.6 2.2 8.7 1.3 1.9 2.7.5 2.4-2.1-.3-2.8-1.5-5-4.6-6.6Z" fill="#F3E5CF" opacity="0.72" />

      <ellipse cx="20" cy="27.5" rx="12" ry="5.2" fill={`url(#${gid}-wax-top)`} />
      <path d="M9.3 27.2c2.2-2.6 5.7-3.8 10.7-3.8s8.7 1.2 10.8 3.8c-2.6-1.4-5.9-2.1-10.8-2.1-4.8 0-8.2.7-10.7 2.1Z" fill="#FFF9EC" opacity="0.94" />
      <ellipse cx="20" cy="27.2" rx="6.4" ry="2.4" fill={`url(#${gid}-melt)`} />
      <ellipse cx="17.8" cy="26.4" rx="2.4" ry="0.65" fill="#FFFDF6" opacity="0.8" />

      <path d="M20 27v-5.1c0-1.5.5-2.4 1.2-3.2" fill="none" stroke="#39281E" strokeWidth="1.45" strokeLinecap="round" />
      <path d="M20.9 19.1c.8-.2 1.5.1 1.8.7" fill="none" stroke="#17100D" strokeWidth="1" strokeLinecap="round" />

      <g className="candle-anim candle-flame-sway">
        <path d="M21.2 2.5c.7 4.9 7.1 8.2 5.2 14.2-.9 3-3.3 5.2-6.5 5.2-3.8 0-6.6-2.8-6.4-6.5.3-4.3 4.5-7.2 7.7-12.9Z" fill={`url(#${gid}-flame)`} />
        <path d="M20.3 9.5c.6 2.8 3.1 4.5 2.2 7.5-.4 1.6-1.4 2.8-2.8 2.8-1.7 0-2.8-1.5-2.6-3.4.2-2.3 1.9-4 3.2-6.9Z" fill={`url(#${gid}-core)`} />
      </g>
    </svg>
  );
}

export default PawLamp;