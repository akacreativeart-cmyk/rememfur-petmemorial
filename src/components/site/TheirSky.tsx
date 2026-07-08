import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";

interface TheirSkyProps {
  petName: string;
  passingDate: string | null; // ISO date
  location?: string | null;
  memorialUrl: string;
  species?: "dog" | "cat" | "other" | null;
}

/** Canis Major layout — the dog constellation. Extension point below for future variants. */
const CANIS_MAJOR = {
  name: "Canis Major",
  stars: [
    { id: "sirius", x: 30, y: 30, r: 3, glow: true },
    { id: "s1", x: 14, y: 38, r: 1.4 },
    { id: "s2", x: 46, y: 16, r: 1.4 },
    { id: "s3", x: 52, y: 56, r: 1.6 },
    { id: "s4", x: 38, y: 78, r: 1.4 },
    { id: "s5", x: 72, y: 72, r: 1.5 },
    { id: "s6", x: 20, y: 72, r: 1.3 },
  ],
  lines: [
    ["sirius", "s1"],
    ["sirius", "s2"],
    ["sirius", "s3"],
    ["s3", "s5"],
    ["s3", "s4"],
    ["s4", "s6"],
  ] as Array<[string, string]>,
};

function seasonOf(iso: string | null): "spring" | "summer" | "autumn" | "winter" {
  if (!iso) return "winter";
  const m = new Date(iso).getUTCMonth() + 1; // 1..12
  if (m >= 3 && m <= 5) return "spring";
  if (m >= 6 && m <= 8) return "summer";
  if (m >= 9 && m <= 11) return "autumn";
  return "winter";
}

const PROSE: Record<ReturnType<typeof seasonOf>, string[]> = {
  spring: [
    "The night they left, the first warm wind moved through the yard — and Sirius held steady, as if it had been waiting.",
    "Somewhere between the blossoms and the last cold breath, Canis Major turned its slow head westward, watching.",
    "Spring nights are honest — every star bright enough to hurt, and one bright enough to keep them company.",
  ],
  summer: [
    "On the shortest night of their life, Sirius was hidden by the dawn — but the dog star always finds its way back.",
    "Summer skies are shy about grief. Canis Major waits below the horizon, quietly, until you're ready.",
    "The night they left, warm air held the smell of grass, and one star kept vigil where they used to sleep.",
  ],
  autumn: [
    "As the leaves turned, Sirius returned to the eastern sky at four in the morning — a companion for anyone still awake.",
    "Autumn brought Canis Major back to your window. He rises early now, watching, the way they used to.",
    "The night they left, a long shadow of a dog crossed the sky, and Sirius burned so bright it cast one of its own.",
  ],
  winter: [
    "On the night they left, Sirius burned so bright it cast a shadow — the whole southern sky was a dog looking up.",
    "Winter is when Canis Major stands tall over the world, faithful, refusing to leave the sky before morning.",
    "Cold nights hold the brightest stars. Sirius watched, the way they used to watch the door.",
  ],
};

export function TheirSky({ petName, passingDate, location, memorialUrl, species }: TheirSkyProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [pulsing, setPulsing] = useState(false);
  // species reserved for future cat/rabbit variants; today always Canis Major.
  void species;

  const constellation = CANIS_MAJOR;
  const season = seasonOf(passingDate);
  const sentence = useMemo(() => {
    const opts = PROSE[season];
    return opts[Math.floor(Math.random() * opts.length)];
  }, [season]);

  const dateLabel = passingDate ? format(new Date(passingDate), "MMMM d, yyyy") : null;
  const eyebrow = [dateLabel ? `On ${dateLabel}` : null, location?.trim() || null].filter(Boolean).join(" · ");
  const captionLoc = location?.trim();
  const caption = [dateLabel, "Evening sky", captionLoc].filter(Boolean).join(" · ");

  const byId = Object.fromEntries(constellation.stars.map((s) => [s.id, s]));

  const triggerPulse = () => {
    setPulsing(false);
    // Force reflow so animation restarts on rapid taps.
    requestAnimationFrame(() => setPulsing(true));
    window.setTimeout(() => setPulsing(false), 650);
  };

  const shareText = () => {
    const bits = [
      `${constellation.name} for ${petName}.`,
      sentence,
      caption,
      memorialUrl,
    ];
    return bits.filter(Boolean).join("\n");
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText());
      toast.success("Copied");
    } catch {
      toast.error("Couldn't copy");
    }
  };

  const onSave = () => {
    const size = 1080;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Deep navy background
    const bg = ctx.createLinearGradient(0, 0, 0, size);
    bg.addColorStop(0, "#0a0e1f");
    bg.addColorStop(1, "#05070f");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);

    // Constellation — coords are on a 0..90 canvas roughly (leaves margins)
    const pad = 140;
    const inner = size - pad * 2;
    const toXY = (x: number, y: number) => [pad + (x / 90) * inner, pad + (y / 90) * inner] as const;

    // lines
    ctx.strokeStyle = "rgba(212,179,120,0.55)";
    ctx.lineWidth = 1.5;
    for (const [a, b] of constellation.lines) {
      const A = byId[a]!;
      const B = byId[b]!;
      const [ax, ay] = toXY(A.x, A.y);
      const [bx, by] = toXY(B.x, B.y);
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
    }
    // stars
    for (const s of constellation.stars) {
      const [cx, cy] = toXY(s.x, s.y);
      if (s.glow) {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 90);
        g.addColorStop(0, "rgba(255,249,220,0.9)");
        g.addColorStop(0.5, "rgba(212,179,120,0.25)");
        g.addColorStop(1, "rgba(212,179,120,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, 90, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#fffbe6";
      ctx.beginPath();
      ctx.arc(cx, cy, (s.r ?? 1.4) * 3.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Text
    ctx.fillStyle = "#e6e1d6";
    ctx.textAlign = "center";
    ctx.font = "600 42px Georgia, 'Cormorant Garamond', serif";
    ctx.fillText(constellation.name, size / 2, 90);
    ctx.font = "italic 28px Georgia, 'Cormorant Garamond', serif";
    ctx.fillStyle = "rgba(230,225,214,0.9)";
    // wrap sentence
    const words = sentence.split(" ");
    const lines: string[] = [];
    let line = "";
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (ctx.measureText(test).width > size - 160 && line) {
        lines.push(line);
        line = w;
      } else line = test;
    }
    if (line) lines.push(line);
    const startY = size - 180 - lines.length * 34;
    lines.forEach((ln, i) => ctx.fillText(ln, size / 2, startY + i * 40));

    ctx.font = "18px 'Jost', Helvetica, Arial, sans-serif";
    ctx.fillStyle = "rgba(230,225,214,0.55)";
    ctx.fillText(caption, size / 2, size - 90);
    ctx.fillStyle = "rgba(212,179,120,0.75)";
    ctx.fillText(`${petName} · rememfur.com`, size / 2, size - 56);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${petName}-canis-major.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  // Trigger the initial stroke-dashoffset animation once mounted.
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    requestAnimationFrame(() => el.classList.add("sky-in-view"));
  }, []);

  return (
    <section className="rounded-3xl border border-[var(--gold2)] bg-[var(--surface1)] p-7 soft-shadow">
      {eyebrow && (
        <p className="text-[11px] uppercase tracking-[0.28em] text-amber-200/70">{eyebrow}</p>
      )}
      <h2 className="mt-2 font-display text-2xl text-foreground">{constellation.name}</h2>
      <p className="mt-1 text-xs text-white/50">The dog constellation. Sirius is its brightest star.</p>

      <button
        type="button"
        onClick={triggerPulse}
        className="mt-5 block aspect-square w-full max-w-md rounded-2xl bg-gradient-to-b from-[#0a0e1f] to-[#05070f] ring-1 ring-white/10"
        aria-label={`Tap to feel ${constellation.name}`}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 90 90"
          className={`their-sky-svg h-full w-full ${pulsing ? "sky-pulse" : ""}`}
        >
          <defs>
            <radialGradient id="tsSiriusGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff8d6" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#d4b378" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#d4b378" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="tsSirius" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="60%" stopColor="#ffe9b0" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#d4b378" stopOpacity="0" />
            </radialGradient>
          </defs>

          <g className="ts-lines" stroke="#d4b378" strokeOpacity="0.55" strokeWidth="0.35" strokeLinecap="round" fill="none">
            {constellation.lines.map(([a, b], i) => {
              const A = byId[a]!;
              const B = byId[b]!;
              const dx = B.x - A.x;
              const dy = B.y - A.y;
              const len = Math.sqrt(dx * dx + dy * dy);
              return (
                <line
                  key={`${a}-${b}`}
                  x1={A.x}
                  y1={A.y}
                  x2={B.x}
                  y2={B.y}
                  className="ts-line"
                  style={
                    {
                      strokeDasharray: len,
                      strokeDashoffset: len,
                      "--dash": `${len}`,
                      "--delay": `${i * 150}ms`,
                    } as React.CSSProperties
                  }
                />
              );
            })}
          </g>

          {constellation.stars.map((s, i) => (
            <g
              key={s.id}
              className={`ts-star ${s.glow ? "ts-star-sirius" : ""}`}
              style={{ ["--delay" as any]: `${constellation.lines.length * 150 + i * 90}ms`, transformOrigin: `${s.x}px ${s.y}px` }}
            >
              {s.glow && <circle cx={s.x} cy={s.y} r="9" fill="url(#tsSiriusGlow)" />}
              <circle cx={s.x} cy={s.y} r={s.r} fill={s.glow ? "url(#tsSirius)" : "#fffbe6"} />
            </g>
          ))}
        </svg>
      </button>

      <p className="mt-6 font-display italic text-[18px] leading-relaxed text-white/85 md:text-[20px]">
        {sentence}
      </p>
      <p className="mt-3 text-xs text-white/50">{caption}</p>

      <div className="mt-5 flex gap-2">
        <Button variant="outline" size="sm" onClick={onCopy} className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10">
          <Copy className="mr-1.5 h-3.5 w-3.5" /> Share
        </Button>
        <Button variant="outline" size="sm" onClick={onSave} className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10">
          <Download className="mr-1.5 h-3.5 w-3.5" /> Save
        </Button>
      </div>
    </section>
  );
}
