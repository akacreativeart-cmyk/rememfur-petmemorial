import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { getConstellation, getProse, type Constellation } from "@/lib/constellations";

interface TheirSkyProps {
  petName: string;
  passingDate: string | null; // ISO date
  location?: string | null;
  memorialUrl: string;
  species?: "dog" | "cat" | "other" | null;
  memorialId?: string | null;
}

export function TheirSky({ petName, passingDate, location, memorialUrl, species, memorialId }: TheirSkyProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [pulsing, setPulsing] = useState(false);
  void species;

  const constellation: Constellation = useMemo(
    () => getConstellation(passingDate ? new Date(passingDate) : new Date()),
    [passingDate],
  );

  const seed = memorialId ?? `${petName}-${passingDate ?? ""}`;
  const sentence = useMemo(() => getProse(constellation, seed), [constellation, seed]);

  const dateLabel = passingDate ? format(new Date(passingDate), "MMMM d, yyyy") : null;
  const eyebrow = [dateLabel ? `On ${dateLabel}` : null, location?.trim() || null].filter(Boolean).join(" · ");
  const captionLoc = location?.trim();
  const caption = [dateLabel, "Evening sky", constellation.name, captionLoc].filter(Boolean).join(" · ");

  const triggerPulse = () => {
    setPulsing(false);
    requestAnimationFrame(() => setPulsing(true));
    window.setTimeout(() => setPulsing(false), 650);
  };

  const shareText = () => {
    return [`${constellation.name} for ${petName}.`, sentence, caption, memorialUrl].filter(Boolean).join("\n");
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

    const bg = ctx.createLinearGradient(0, 0, 0, size);
    bg.addColorStop(0, "#0a0e1f");
    bg.addColorStop(1, "#05070f");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);

    const pad = 140;
    const inner = size - pad * 2;
    const toXY = (x: number, y: number) => [pad + (x / 100) * inner, pad + (y / 100) * inner] as const;

    ctx.strokeStyle = "rgba(212,179,120,0.55)";
    ctx.lineWidth = 1.5;
    for (const [ai, bi] of constellation.lines) {
      const A = constellation.stars[ai];
      const B = constellation.stars[bi];
      if (!A || !B) continue;
      const [ax, ay] = toXY(A[0], A[1]);
      const [bx, by] = toXY(B[0], B[1]);
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
    }
    for (const s of constellation.stars) {
      const [cx, cy] = toXY(s[0], s[1]);
      const r = s[2];
      if (r >= 2) {
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
      ctx.arc(cx, cy, r * 3.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#e6e1d6";
    ctx.textAlign = "center";
    ctx.font = "600 42px Georgia, 'Cormorant Garamond', serif";
    ctx.fillText(constellation.name, size / 2, 90);
    ctx.font = "italic 28px Georgia, 'Cormorant Garamond', serif";
    ctx.fillStyle = "rgba(230,225,214,0.9)";
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
      const slug = constellation.name.toLowerCase().replace(/\s+/g, "-");
      a.download = `${petName}-${slug}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

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
      <p className="mt-1 text-xs text-white/50">The constellation that hung over you that night.</p>

      <button
        type="button"
        onClick={triggerPulse}
        className="mt-5 block aspect-square w-full max-w-md rounded-2xl bg-gradient-to-b from-[#0a0e1f] to-[#05070f] ring-1 ring-white/10"
        aria-label={`Tap to feel ${constellation.name}`}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 100 100"
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

          <g className="ts-lines" stroke="#d4b378" strokeOpacity="0.55" strokeWidth="0.4" strokeLinecap="round" fill="none">
            {constellation.lines.map(([ai, bi], i) => {
              const A = constellation.stars[ai];
              const B = constellation.stars[bi];
              if (!A || !B) return null;
              const dx = B[0] - A[0];
              const dy = B[1] - A[1];
              const len = Math.sqrt(dx * dx + dy * dy);
              return (
                <line
                  key={`${ai}-${bi}`}
                  x1={A[0]}
                  y1={A[1]}
                  x2={B[0]}
                  y2={B[1]}
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

          {constellation.stars.map((s, i) => {
            const glow = s[2] >= 2;
            return (
              <g
                key={i}
                className={`ts-star ${glow ? "ts-star-sirius" : ""}`}
                style={{ ["--delay" as any]: `${constellation.lines.length * 150 + i * 90}ms`, transformOrigin: `${s[0]}px ${s[1]}px` }}
              >
                {glow && <circle cx={s[0]} cy={s[1]} r={s[2] + 4} fill="url(#tsSiriusGlow)" />}
                <circle cx={s[0]} cy={s[1]} r={s[2]} fill={glow ? "url(#tsSirius)" : "#fffbe6"} />
              </g>
            );
          })}
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
