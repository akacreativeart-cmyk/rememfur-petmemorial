import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

type Props = {
  name: string;
  birth?: string | null;
  passing?: string | null;
  epitaph?: string | null;
};

function fmt(d?: string | null) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return d;
  }
}

export function GravestoneCard({ name, birth, passing, epitaph }: Props) {
  const ref = useRef<SVGSVGElement>(null);

  const download = () => {
    const svg = ref.current;
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([xml], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(name || "gravestone").toLowerCase().replace(/\s+/g, "-")}-gravestone.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const display = name?.trim() || "Their name";
  const dates = [fmt(birth), fmt(passing)].filter(Boolean).join("  —  ");
  const line = (epitaph || "Forever in our hearts").slice(0, 80);

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-[#e7e3da] to-[#cfc8bb] p-4">
        <svg
          ref={ref}
          viewBox="0 0 400 480"
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto block h-auto w-full max-w-xs"
        >
          <defs>
            <linearGradient id="stoneGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#b9b3a7" />
              <stop offset="55%" stopColor="#8e887d" />
              <stop offset="100%" stopColor="#6f6a5f" />
            </linearGradient>
            <radialGradient id="flameGrad" cx="0.5" cy="0.6" r="0.6">
              <stop offset="0%" stopColor="#fff4c2" />
              <stop offset="55%" stopColor="#ffb648" />
              <stop offset="100%" stopColor="#c04a1a" stopOpacity="0.9" />
            </radialGradient>
            <radialGradient id="flameGlow" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor="#ffd479" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#ffd479" stopOpacity="0" />
            </radialGradient>
            <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.2" />
            </filter>
          </defs>

          {/* Ground */}
          <ellipse cx="200" cy="450" rx="170" ry="14" fill="#5a5346" opacity="0.35" />
          <rect x="40" y="430" width="320" height="22" rx="4" fill="#7a7060" />

          {/* Stone */}
          <path
            d="M80,430 L80,170 Q80,70 200,70 Q320,70 320,170 L320,430 Z"
            fill="url(#stoneGrad)"
            stroke="#4f4a40"
            strokeWidth="2"
          />
          {/* Inner bevel */}
          <path
            d="M100,420 L100,180 Q100,90 200,90 Q300,90 300,180 L300,420 Z"
            fill="none"
            stroke="#3f3a31"
            strokeWidth="1"
            opacity="0.5"
          />

          {/* Paw print at top */}
          <g fill="#3f3a31" opacity="0.7" transform="translate(200 130)">
            <ellipse cx="0" cy="6" rx="14" ry="11" />
            <ellipse cx="-14" cy="-8" rx="5" ry="7" />
            <ellipse cx="-5" cy="-15" rx="4.5" ry="6.5" />
            <ellipse cx="5" cy="-15" rx="4.5" ry="6.5" />
            <ellipse cx="14" cy="-8" rx="5" ry="7" />
          </g>

          {/* Name */}
          <text
            x="200"
            y="200"
            textAnchor="middle"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize="30"
            fontWeight="600"
            fill="#2c2820"
            letterSpacing="1"
          >
            {display.slice(0, 18)}
          </text>

          {/* Divider */}
          <line x1="130" y1="222" x2="270" y2="222" stroke="#2c2820" strokeWidth="1" opacity="0.6" />

          {/* Dates */}
          <text
            x="200"
            y="252"
            textAnchor="middle"
            fontFamily="Georgia, serif"
            fontSize="14"
            fill="#2c2820"
            opacity="0.85"
          >
            {dates || "—"}
          </text>

          {/* Epitaph */}
          <foreignObject x="60" y="275" width="280" height="80">
            <div
              style={{
                fontFamily: "Georgia, serif",
                fontSize: "13px",
                fontStyle: "italic",
                color: "#2c2820",
                textAlign: "center",
                lineHeight: 1.4,
                opacity: 0.9,
              }}
            >
              "{line}"
            </div>
          </foreignObject>


          {/* Flower bouquet (left) */}
          <g transform="translate(120 405)">
            <path d="M0,0 C-6,-18 -14,-30 -18,-44" stroke="#3a6b2e" strokeWidth="2" fill="none" />
            <path d="M0,0 C2,-16 6,-28 12,-40" stroke="#3a6b2e" strokeWidth="2" fill="none" />
            <path d="M0,0 C-2,-14 -4,-24 -2,-36" stroke="#3a6b2e" strokeWidth="2" fill="none" />
            {/* leaves */}
            <ellipse cx="-10" cy="-20" rx="6" ry="3" fill="#4f8a3d" transform="rotate(-30 -10 -20)" />
            <ellipse cx="6" cy="-22" rx="6" ry="3" fill="#4f8a3d" transform="rotate(30 6 -22)" />
            {/* petals */}
            <g transform="translate(-18 -46)">
              <circle r="5" fill="#e85d8f" />
              <circle cx="-5" cy="-2" r="4" fill="#f48fb1" />
              <circle cx="5" cy="-2" r="4" fill="#f48fb1" />
              <circle cx="0" cy="-6" r="4" fill="#f48fb1" />
              <circle r="2" fill="#fff3a8" />
            </g>
            <g transform="translate(12 -42)">
              <circle r="5" fill="#c84cf0" />
              <circle cx="-5" cy="-2" r="4" fill="#d98af0" />
              <circle cx="5" cy="-2" r="4" fill="#d98af0" />
              <circle cx="0" cy="-6" r="4" fill="#d98af0" />
              <circle r="2" fill="#fff3a8" />
            </g>
            <g transform="translate(-2 -38)">
              <circle r="4" fill="#ffb84c" />
              <circle cx="-4" cy="-2" r="3" fill="#ffd479" />
              <circle cx="4" cy="-2" r="3" fill="#ffd479" />
              <circle cx="0" cy="-5" r="3" fill="#ffd479" />
            </g>
          </g>

          {/* Candle (right) */}
          <g transform="translate(280 405)">
            {/* base plate */}
            <ellipse cx="0" cy="20" rx="22" ry="4" fill="#3f3a31" opacity="0.4" />
            {/* wax */}
            <rect x="-10" y="-30" width="20" height="50" rx="3" fill="#f3ead4" stroke="#9a8f72" strokeWidth="1" />
            <rect x="-10" y="-30" width="6" height="50" fill="#fff8e6" opacity="0.7" />
            {/* wick */}
            <line x1="0" y1="-30" x2="0" y2="-38" stroke="#222" strokeWidth="1.4" />
            {/* glow */}
            <circle cx="0" cy="-46" r="22" fill="url(#flameGlow)">
              <animate attributeName="r" values="20;26;20" dur="2.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;1;0.7" dur="2.2s" repeatCount="indefinite" />
            </circle>
            {/* flame */}
            <g filter="url(#soft)">
              <path
                d="M0,-58 C6,-50 8,-44 6,-40 C4,-36 -4,-36 -6,-40 C-8,-44 -6,-50 0,-58 Z"
                fill="url(#flameGrad)"
              >
                <animateTransform
                  attributeName="transform"
                  type="scale"
                  values="1 1; 1.05 0.95; 0.96 1.04; 1 1"
                  dur="1.4s"
                  repeatCount="indefinite"
                  additive="sum"
                />
              </path>
              <path
                d="M0,-52 C3,-48 4,-44 3,-42 C2,-40 -2,-40 -3,-42 C-4,-44 -3,-48 0,-52 Z"
                fill="#fff7d6"
                opacity="0.9"
              />
            </g>
          </g>
        </svg>
      </div>
      <div className="flex justify-end">
        <Button type="button" size="sm" variant="outline" className="rounded-full" onClick={download}>
          <Download className="mr-1.5 h-3.5 w-3.5" /> Download gravestone
        </Button>
      </div>
    </div>
  );
}
