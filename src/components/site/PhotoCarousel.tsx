import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Swipeable photo carousel with dots and a gentle autoplay.
 *
 * A single image renders exactly like a plain <img> block (no chrome).
 * Autoplay advances every `interval` ms, pauses on hover/touch, and is
 * disabled for users who prefer reduced motion.
 */
export function PhotoCarousel({
  images,
  alt = "",
  className = "",
  imgClassName = "max-h-[420px] w-full object-cover",
  interval = 4000,
}: {
  images: string[];
  alt?: string;
  className?: string;
  imgClassName?: string;
  interval?: number;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const touchX = useRef<number | null>(null);

  const count = images.length;
  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);

  useEffect(() => {
    if (count < 2 || paused) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), interval);
    return () => clearInterval(id);
  }, [count, paused, interval]);

  if (count === 0) return null;
  if (count === 1) {
    return (
      <div className={`overflow-hidden rounded-2xl border border-border/60 bg-muted ${className}`}>
        <img src={images[0]} alt={alt} className={imgClassName} loading="lazy" />
      </div>
    );
  }

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-border/60 bg-muted ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        setPaused(true);
        touchX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const start = touchX.current;
        const end = e.changedTouches[0]?.clientX ?? null;
        touchX.current = null;
        if (start != null && end != null && Math.abs(end - start) > 40) go(index + (end < start ? 1 : -1));
        setTimeout(() => setPaused(false), 3000);
      }}
    >
      <div
        ref={trackRef}
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((src, i) => (
          <img key={src + i} src={src} alt={alt} className={`w-full shrink-0 ${imgClassName}`} loading="lazy" />
        ))}
      </div>

      <button
        type="button"
        aria-label="Previous photo"
        onClick={() => go(index - 1)}
        className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white backdrop-blur transition hover:bg-black/60 group-hover:block"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Next photo"
        onClick={() => go(index + 1)}
        className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white backdrop-blur transition hover:bg-black/60 group-hover:block"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      <div className="absolute inset-x-0 bottom-2 flex items-center justify-center gap-1.5">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to photo ${i + 1}`}
            onClick={() => go(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-4 bg-white" : "w-1.5 bg-white/55"
            }`}
          />
        ))}
      </div>
      <div className="absolute right-2 top-2 rounded-full bg-black/45 px-2 py-0.5 text-[11px] text-white">
        {index + 1}/{count}
      </div>
    </div>
  );
}

export default PhotoCarousel;
