import { useEffect, useState } from "react";
import { Flame } from "lucide-react";

const BURN_MS = 24 * 60 * 60 * 1000; // a candle burns for 24h

function format(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m left`;
  if (m > 0) return `${m}m ${sec.toString().padStart(2, "0")}s left`;
  return `${sec}s left`;
}

export function CandleCountdown({ litAt, className = "" }: { litAt: string | Date; className?: string }) {
  const start = typeof litAt === "string" ? new Date(litAt).getTime() : litAt.getTime();
  const end = start + BURN_MS;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (now >= end) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [end, now]);

  const remaining = end - now;
  const burning = remaining > 0;
  const pct = Math.max(0, Math.min(100, (remaining / BURN_MS) * 100));

  return (
    <div className={`inline-flex items-center gap-1.5 text-[11px] ${className}`}>
      <Flame className={`h-3 w-3 ${burning ? "text-[var(--cta)]" : "text-muted-foreground"}`} />
      <span className={burning ? "text-[var(--cta)]" : "text-muted-foreground"}>
        {burning ? format(remaining) : "candle has gone out"}
      </span>
      <span
        aria-hidden
        className="ml-1 h-1 w-12 overflow-hidden rounded-full bg-muted"
      >
        <span
          className="block h-full bg-[var(--cta)] transition-[width] duration-1000 ease-linear"
          style={{ width: `${pct}%` }}
        />
      </span>
    </div>
  );
}
