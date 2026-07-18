import { useEffect, useRef } from "react";
import { Download, Printer } from "lucide-react";

export type PolaroidProps = {
  imageUrl?: string | null;
  petName: string;
  message?: string | null;
  onOrderPrint?: () => void;
};

/**
 * Polaroid keepsake — a live preview and a "Download keepsake" button that
 * paints the same composition onto a 1200×1500 canvas for high-resolution
 * print. If no photo is provided we render a lit paw-lamp illustration
 * inside the frame so lamp-only memorials still get a keepsake.
 *
 * The HTML preview and the canvas render are kept intentionally close (same
 * proportions, same handwriting caption) so what you see is what you print.
 */
export function Polaroid({ imageUrl, petName, message, onOrderPrint }: PolaroidProps) {
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Pre-load the image so canvas draw works reliably. `crossOrigin` lets us
  // use the pet-photos bucket (public) without tainting the canvas.
  useEffect(() => {
    if (!imageUrl) return;
    const im = new Image();
    im.crossOrigin = "anonymous";
    im.src = imageUrl;
    imgRef.current = im;
  }, [imageUrl]);

  const download = async () => {
    const W = 1200;
    const H = 1500;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // White polaroid card
    ctx.fillStyle = "#FBF7EE";
    ctx.fillRect(0, 0, W, H);

    // Photo well (square, generous top/side margin, big caption strip at bottom)
    const pad = 72;
    const wellSize = W - pad * 2;
    const wellX = pad;
    const wellY = pad;
    ctx.fillStyle = "#0B1122";
    ctx.fillRect(wellX, wellY, wellSize, wellSize);

    // Photo (if any) drawn cover-style
    const drawPhoto = async () => {
      if (!imageUrl) return;
      const img = await loadImage(imageUrl);
      const { sx, sy, sw, sh } = coverCrop(img.width, img.height, wellSize, wellSize);
      ctx.drawImage(img, sx, sy, sw, sh, wellX, wellY, wellSize, wellSize);
    };

    const drawLampFallback = () => {
      // Warm halo
      const cx = wellX + wellSize / 2;
      const cy = wellY + wellSize / 2;
      const grad = ctx.createRadialGradient(cx, cy, 20, cx, cy, wellSize * 0.55);
      grad.addColorStop(0, "rgba(255, 220, 166, 0.95)");
      grad.addColorStop(0.4, "rgba(232, 185, 109, 0.35)");
      grad.addColorStop(1, "rgba(232, 185, 109, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(wellX, wellY, wellSize, wellSize);
      // Paw glyph
      ctx.fillStyle = "#E8B96D";
      const scale = wellSize / 260;
      const px = cx - 60 * scale;
      const py = cy - 40 * scale;
      const drawEllipse = (x: number, y: number, rx: number, ry: number) => {
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
      };
      drawEllipse(px + 20 * scale, py + 20 * scale, 18 * scale, 24 * scale);
      drawEllipse(px + 60 * scale, py, 18 * scale, 24 * scale);
      drawEllipse(px + 100 * scale, py, 18 * scale, 24 * scale);
      drawEllipse(px + 140 * scale, py + 20 * scale, 18 * scale, 24 * scale);
      drawEllipse(px + 80 * scale, py + 80 * scale, 55 * scale, 40 * scale);
    };

    const finish = () => {
      // Handwriting caption at bottom
      ctx.fillStyle = "#1a1420";
      // Name (bigger)
      ctx.textAlign = "center";
      ctx.font = "italic 72px \"Caveat\", \"Kalam\", cursive, sans-serif";
      ctx.fillText(petName || "Forever loved", W / 2, H - 180);
      // Message
      if (message && message.trim()) {
        ctx.font = "italic 40px \"Caveat\", \"Kalam\", cursive, sans-serif";
        ctx.fillStyle = "#4a3b30";
        wrapText(ctx, message.trim(), W / 2, H - 110, W - 200, 46);
      }

      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      const safe = (petName || "keepsake").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "keepsake";
      a.download = `${safe}-keepsake.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    if (imageUrl) {
      drawPhoto().then(finish).catch(() => {
        drawLampFallback();
        finish();
      });
    } else {
      drawLampFallback();
      finish();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="polaroid-frame relative w-full max-w-[320px] rounded-[8px] bg-[#FBF7EE] p-4 pb-16 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.55),0_2px_0_rgba(0,0,0,0.05)] transition-transform"
        style={{ transform: "rotate(-1.2deg)" }}
      >
        <div className="aspect-square w-full overflow-hidden rounded-[3px] bg-[#0B1122]">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={petName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="relative flex h-full w-full items-center justify-center">
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(255,220,166,0.9) 0%, rgba(232,185,109,0.35) 40%, rgba(232,185,109,0) 75%)",
                }}
              />
              <PawGlyph className="relative h-24 w-24 text-[#E8B96D]" />
            </div>
          )}
        </div>
        <div className="mt-4 text-center leading-tight">
          <div className="font-hand text-[26px] text-[#1a1420]">{petName || "Forever loved"}</div>
          {message && message.trim() ? (
            <div className="mt-1 font-hand text-[16px] text-[#4a3b30]">{message.trim()}</div>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        onClick={download}
        className="btn-gold-sm"
      >
        <Download className="h-4 w-4" />
        Download keepsake
      </button>

      {onOrderPrint && (
        <button
          type="button"
          onClick={onOrderPrint}
          className="inline-flex items-center gap-1.5 text-[11.5px] uppercase tracking-[0.18em] text-muted-foreground underline-offset-4 hover:underline"
        >
          <Printer className="h-3 w-3" />
          Order a printed keepsake
        </button>
      )}
    </div>
  );
}

function PawGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden fill="currentColor">
      <ellipse cx="14" cy="24" rx="6" ry="8" />
      <ellipse cx="26" cy="14" rx="6" ry="8" />
      <ellipse cx="38" cy="14" rx="6" ry="8" />
      <ellipse cx="50" cy="24" rx="6" ry="8" />
      <path d="M32 28c9 0 18 8 18 16 0 6-5 10-11 10-4 0-6-2-7-2s-3 2-7 2c-6 0-11-4-11-10 0-8 9-16 18-16z" />
    </svg>
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function coverCrop(sw: number, sh: number, dw: number, dh: number) {
  const sr = sw / sh;
  const dr = dw / dh;
  let cropW = sw;
  let cropH = sh;
  if (sr > dr) {
    cropW = sh * dr;
  } else {
    cropH = sw / dr;
  }
  return {
    sx: (sw - cropW) / 2,
    sy: (sh - cropH) / 2,
    sw: cropW,
    sh: cropH,
  };
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  const start = y - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((ln, i) => ctx.fillText(ln, x, start + i * lineHeight));
}

export default Polaroid;
