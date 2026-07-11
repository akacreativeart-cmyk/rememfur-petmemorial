import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { CandleDialog } from "@/components/site/CandleDialog";
import { IntroSequence } from "@/components/site/IntroSequence";
import {
  pickFeaturedMemorial,
  listRecentCandles,
  countCandlesThisWeek,
} from "@/lib/candle-guest.functions";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Rememfur — Release a star for the pet you loved." },
      { name: "description", content: "A quiet place to remember them. Say their name, release their star into the sky, keep them close. No account needed." },
    ],
  }),
});

/* ────────── Reveal helper ────────── */

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("in-view");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}
function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useReveal<HTMLDivElement>();
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>;
}

/* ────────── Vigil dog SVG symbol (defined once, reused via <use>) ────────── */

function VigilDogSymbol() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
      <symbol id="vigil-dog" viewBox="0 0 686 1119">
        <g transform="translate(0,1119) scale(0.1,-0.1)">
          <path d="M3882 11161 c-53 -39 -109 -94 -147 -146 -29 -39 -47 -60 -139 -159 -25 -27 -46 -53 -46 -57 0 -4 -33 -32 -73 -63 l-73 -56 -176 0 c-144 0 -178 -3 -188 -15 -7 -8 -19 -15 -27 -15 -8 0 -41 -20 -73 -45 -32 -25 -65 -45 -73 -45 -8 0 -20 -7 -27 -15 -7 -8 -18 -15 -25 -15 -7 0 -41 -21 -76 -47 -64 -46 -114 -95 -199 -194 -72 -84 -154 -163 -201 -195 -104 -70 -169 -127 -164 -145 4 -12 -17 -38 -75 -90 -44 -40 -80 -79 -80 -86 0 -7 -14 -32 -30 -55 -33 -45 -33 -56 0 -38 14 8 5 -10 -28 -52 -61 -78 -106 -180 -128 -289 -13 -61 -33 -114 -75 -195 -47 -89 -60 -125 -65 -176 -9 -86 14 -165 63 -218 43 -48 60 -52 37 -8 -10 19 -18 63 -20 103 l-4 70 14 -41 c23 -67 104 -183 116 -164 10 16 85 -66 121 -133 28 -54 34 -75 38 -157 l6 -95 33 40 c48 57 93 166 107 259 12 81 12 81 21 41 12 -54 11 -183 -2 -273 -11 -74 -5 -94 21 -72 13 11 13 6 1 -31 -45 -146 -80 -212 -145 -273 -52 -49 -38 -62 23 -21 20 13 36 20 36 15 0 -5 -37 -55 -83 -111 -132 -163 -201 -273 -126 -203 37 33 33 26 -37 -76 -58 -85 -103 -176 -133 -269 -17 -51 -21 -90 -21 -188 0 -67 4 -123 9 -123 4 0 16 17 25 38 16 37 16 36 11 -63 -5 -113 -27 -189 -79 -275 -19 -30 -45 -77 -59 -105 -14 -27 -79 -131 -145 -230 -67 -99 -119 -181 -117 -184 3 -2 16 4 30 13 30 20 32 10 4 -24 -54 -68 -121 -174 -111 -178 7 -2 1 -24 -18 -62 -17 -33 -53 -130 -81 -217 -28 -87 -60 -182 -72 -212 -15 -39 -17 -56 -9 -59 19 -6 14 -23 -28 -96 -45 -77 -53 -114 -20 -96 25 13 25 9 -1 -43 -27 -55 -80 -209 -74 -215 3 -3 15 8 27 23 47 59 50 62 43 41 -44 -138 -48 -176 -41 -401 6 -212 -2 -314 -29 -390 -16 -45 -70 -176 -112 -271 -43 -98 -46 -101 -94 -122 -44 -20 -49 -25 -43 -47 l6 -25 -83 0 c-75 0 -81 -1 -63 -15 18 -13 16 -14 -22 -15 -24 0 -47 -6 -54 -15 -7 -8 -22 -15 -34 -15 -22 0 -46 -17 -46 -32 0 -4 7 -8 15 -8 27 0 16 -16 -28 -40 -48 -27 -187 -164 -187 -185 0 -16 21 -11 55 12 43 29 36 10 -16 -45 -76 -78 -146 -187 -162 -254 -4 -14 -10 -34 -13 -45 -3 -10 17 7 45 37 42 45 61 48 31 5 -10 -15 -36 -119 -50 -200 -13 -73 -54 -237 -70 -281 -6 -14 -10 -34 -10 -45 0 -18 2 -19 29 -4 16 8 41 29 55 47 l25 32 -9 -39 c-5 -22 -14 -87 -20 -145 -9 -88 -35 -233 -57 -315 -10 -37 23 5 66 85 26 47 41 67 41 53 0 -26 -59 -235 -89 -313 -31 -82 -26 -89 24 -40 l45 44 -3 -64 c-1 -36 2 -86 6 -112 l8 -46 -71 -72 c-75 -76 -120 -138 -120 -167 0 -13 7 -11 33 13 57 53 77 67 83 62 3 -4 -17 -31 -45 -62 -61 -67 -91 -155 -91 -262 l1 -69 25 60 c44 106 49 100 49 -58 1 -177 12 -207 43 -113 12 37 22 74 23 84 1 9 7 -19 14 -63 7 -44 22 -100 34 -125 21 -44 78 -116 86 -108 2 2 -1 23 -6 47 -14 61 -7 71 19 28 23 -36 91 -102 98 -94 2 2 -7 30 -20 63 -13 32 -27 75 -31 94 -6 31 -2 27 34 -31 60 -98 131 -153 246 -189 22 -7 70 -28 108 -46 37 -18 67 -30 67 -25 0 4 -14 27 -30 49 -17 23 -28 42 -25 42 17 0 154 -112 175 -143 14 -20 29 -37 34 -37 5 0 6 25 2 56 l-6 56 47 -39 c27 -21 77 -64 112 -95 35 -32 67 -55 71 -53 5 3 12 29 16 58 l7 52 13 -70 c16 -89 37 -147 75 -206 29 -46 95 -106 105 -96 3 2 -4 29 -15 58 -21 59 -35 119 -28 119 3 0 17 -20 31 -44 40 -68 150 -162 242 -207 118 -58 128 -52 50 32 -37 40 -65 74 -62 76 2 2 24 -11 49 -30 26 -20 95 -52 173 -80 71 -25 180 -64 242 -86 61 -22 112 -37 112 -34 0 4 -17 25 -38 46 l-37 39 31 -15 c60 -31 378 -149 448 -167 39 -10 84 -23 100 -29 49 -19 42 -4 -27 59 -86 79 -170 204 -104 156 92 -68 201 -134 261 -157 106 -42 121 -38 61 16 l-50 45 55 -21 c146 -57 365 -118 378 -104 2 2 -10 17 -28 32 -68 57 -150 153 -131 153 5 0 13 -5 16 -10 19 -31 327 -160 381 -160 10 0 -28 28 -83 62 -56 35 -98 64 -94 66 4 1 84 -25 177 -59 338 -122 376 -131 572 -137 109 -3 172 -1 172 6 0 5 -28 20 -62 32 -93 34 -299 122 -295 127 3 2 17 -1 32 -7 16 -6 116 -34 224 -61 108 -28 255 -66 326 -85 130 -34 335 -57 335 -38 0 5 -27 19 -59 32 -63 24 -174 82 -169 87 2 2 33 -5 69 -15 171 -47 410 -60 535 -29 53 14 50 24 -12 33 -25 3 -94 22 -152 42 -118 39 -158 59 -105 50 177 -29 593 -67 593 -53 0 6 -127 49 -199 67 -79 21 -35 20 105 0 169 -25 344 -27 443 -5 39 9 73 20 76 24 2 5 -33 13 -78 20 -45 7 -125 23 -177 36 l-95 23 150 1 c83 1 189 6 235 12 126 15 124 24 -6 42 l-89 12 225 9 c285 12 494 13 543 3 20 -4 37 -4 37 0 0 13 -148 109 -215 140 -33 15 -112 37 -175 49 l-115 22 96 1 c103 1 251 -22 402 -64 50 -14 99 -25 106 -25 20 0 -54 54 -126 91 l-58 31 68 -6 c42 -3 90 -15 124 -31 67 -30 73 -31 73 -5 0 29 -118 149 -205 209 -41 29 -108 68 -148 87 -39 19 -58 32 -42 28 17 -3 45 -10 63 -14 48 -12 39 3 -23 33 -70 34 -188 64 -314 79 -55 6 -98 15 -95 20 3 4 49 8 102 8 60 0 92 4 87 9 -20 19 -192 62 -273 68 -109 8 -93 24 30 30 72 4 117 0 198 -17 169 -36 160 -35 125 -10 -16 11 -52 32 -80 46 -27 14 -57 29 -65 33 -57 31 -80 41 -97 41 -10 0 -27 7 -37 15 -14 10 -45 15 -102 15 -46 0 -86 4 -89 10 -9 15 -76 12 -156 -6 -39 -9 -73 -14 -75 -11 -3 3 29 15 70 28 41 13 72 27 70 31 -9 14 -126 8 -216 -10 -48 -10 -85 -15 -83 -11 3 3 30 24 61 45 l57 39 -37 3 c-20 2 -51 -4 -68 -12 -17 -9 -40 -16 -51 -16 -10 0 -33 -6 -50 -14 -18 -8 -61 -19 -97 -26 -36 -7 -96 -21 -135 -31 -38 -11 -74 -19 -80 -19 -5 0 27 24 73 54 45 29 86 56 90 61 4 4 -31 5 -78 2 -66 -4 -106 -13 -179 -41 -51 -21 -96 -35 -98 -32 -3 3 18 20 47 38 75 46 40 48 -91 5 -57 -19 -133 -41 -169 -50 -181 -44 -243 -57 -247 -53 -6 5 105 58 272 131 93 40 160 61 178 57 21 -6 1 33 -43 84 -28 31 -48 59 -46 61 2 3 21 0 42 -6 62 -17 62 2 3 60 -33 31 -49 54 -41 56 17 6 15 32 -3 39 -15 6 -98 125 -111 158 -6 15 -3 15 27 -3 38 -23 69 -27 69 -9 0 6 -19 40 -42 76 -38 59 -68 140 -68 186 0 16 5 13 25 -14 30 -41 68 -67 119 -81 50 -14 56 -6 17 27 -30 25 -81 110 -81 134 0 6 19 -4 43 -23 80 -65 103 -68 73 -9 -20 42 -33 105 -50 247 -17 135 -33 252 -42 295 -9 44 12 8 35 -60 29 -82 38 -91 46 -47 9 47 -11 160 -46 265 -16 47 -29 88 -29 90 0 15 71 -92 94 -141 15 -33 30 -56 33 -53 10 10 -18 167 -44 244 -33 100 -76 184 -127 252 -60 79 -63 87 -29 62 31 -22 63 -29 63 -14 -1 4 -14 23 -30 42 -17 19 -30 39 -30 45 0 5 -8 15 -18 21 -36 23 -202 267 -202 297 0 5 13 -1 29 -12 26 -19 51 -27 51 -18 0 2 -8 28 -18 58 -11 30 -22 74 -26 99 l-6 45 30 -35 c16 -19 30 -30 30 -25 0 19 -48 190 -69 243 -12 29 -21 55 -21 58 0 2 17 -6 37 -20 20 -14 40 -23 45 -20 4 3 -3 27 -17 54 -30 59 -70 163 -52 136 20 -32 80 -97 84 -92 2 2 -3 42 -11 88 -9 45 -20 136 -24 201 -7 117 -3 134 26 105 9 -9 15 -9 23 -1 12 12 -25 102 -63 155 -10 15 -17 28 -14 28 3 0 34 -12 70 -26 45 -19 72 -25 91 -20 l28 7 -40 42 c-49 52 -68 83 -78 126 l-7 34 44 -47 c25 -25 52 -46 61 -46 21 0 21 5 1 65 -20 56 -14 195 11 285 8 30 18 86 21 123 11 107 24 89 25 -35 l0 -113 20 43 c27 62 39 149 39 292 0 70 4 130 9 135 15 17 44 342 38 428 -6 84 -42 209 -90 320 -14 31 -23 57 -20 57 3 0 19 -15 36 -32 21 -23 32 -29 35 -19 5 16 -63 154 -89 177 -10 9 -19 22 -19 27 0 6 11 0 25 -13 49 -46 27 11 -37 96 -43 58 -47 70 -17 54 36 -20 33 -2 -8 57 -42 61 -77 125 -93 171 l-10 27 18 -25 c9 -13 27 -36 39 -50 l23 -25 -6 35 c-15 95 -49 222 -77 280 -17 36 -33 69 -36 75 -4 10 9 1 85 -54 l47 -34 -6 29 c-17 88 -108 276 -193 397 -19 26 -34 49 -34 52 0 3 17 -6 37 -20 77 -52 86 -19 16 57 -42 45 -45 50 -23 45 14 -3 45 -9 69 -13 55 -9 50 2 -24 51 -52 35 -175 179 -162 191 3 3 22 1 44 -5 45 -13 103 -14 103 -3 0 4 -15 16 -32 27 -39 22 -103 82 -73 67 11 -6 47 -13 79 -17 65 -8 69 2 13 32 -90 46 -152 127 -197 259 -31 88 -27 102 15 59 63 -63 185 -119 185 -86 0 5 -11 22 -24 38 -23 27 -46 66 -46 77 0 3 15 -5 34 -18 40 -27 95 -51 101 -44 3 3 -13 41 -34 84 -27 54 -51 127 -76 229 -34 143 -58 209 -105 285 l-22 35 32 -35 c77 -84 148 -226 151 -299 1 -25 1 -25 10 4 22 69 -18 271 -72 364 -28 47 -17 49 20 4 17 -21 31 -35 31 -31 0 32 -94 183 -173 278 -25 30 -44 56 -42 58 2 2 15 -4 29 -14 46 -29 40 -8 -19 76 -76 107 -110 203 -101 284 3 32 10 64 15 70 27 32 102 245 125 352 76 361 44 634 -100 849 -22 33 -52 80 -66 105 -15 25 -40 58 -58 75 -27 26 -39 30 -103 33 -67 4 -75 2 -115 -27z m913 -8861 c8 -16 15 -33 15 -37 -1 -13 -40 41 -40 55 0 20 9 14 25 -18z m-345 -935 c0 -2 -20 -16 -45 -30 -50 -30 -208 -88 -199 -74 15 25 244 123 244 104z" />
        </g>
      </symbol>
    </svg>
  );
}

function VigilDog({ size = 150, className = "" }: { size?: number; className?: string }) {
  // aspect 686:1119
  const w = size;
  const h = Math.round((size * 1119) / 686);
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 686 1119"
      className={className}
      style={{ filter: "drop-shadow(-3px -2px 6px rgba(242,222,170,0.12)) drop-shadow(0 4px 8px rgba(0,0,0,0.6))" }}
      aria-hidden
    >
      <use href="#vigil-dog" fill="#04060D" />
    </svg>
  );
}

/* ────────── Cosmos background with shooting stars ────────── */

function CosmosBg() {
  const [streaks, setStreaks] = useState<{ id: number; sx: string; sy: string }[]>([]);
  useEffect(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    let id = 0;
    let alive = true;
    const spawn = () => {
      if (!alive) return;
      const item = {
        id: ++id,
        sx: `${Math.random() * 60}%`,
        sy: `${5 + Math.random() * 55}%`,
      };
      setStreaks((prev) => [...prev, item]);
      window.setTimeout(() => setStreaks((prev) => prev.filter((s) => s.id !== item.id)), 1500);
      const next = 4000 + Math.random() * 2000;
      window.setTimeout(spawn, next);
    };
    const t = window.setTimeout(spawn, 3000);
    return () => { alive = false; window.clearTimeout(t); };
  }, []);
  return (
    <div className="cosmos-bg" aria-hidden>
      <div className="cosmos-stars" />
      <div className="milkyway" />
      <div className="nebula a" />
      <div className="nebula b" />
      {streaks.map((s) => (
        <span key={s.id} className="shoot" style={{ ["--sx" as string]: s.sx, ["--sy" as string]: s.sy } as React.CSSProperties} />
      ))}
      <div className="grain" />
    </div>
  );
}

/* ────────── Moon phase ────────── */

const MOON_NAMES = [
  "New moon", "Waxing crescent", "First quarter", "Waxing gibbous",
  "Full moon", "Waning gibbous", "Last quarter", "Waning crescent",
];
function moonPhase(now = new Date()) {
  const synodic = 29.53058867;
  const ref = Date.UTC(2000, 0, 6, 18, 14, 0);
  const days = (now.getTime() - ref) / 86400000;
  const age = ((days % synodic) + synodic) % synodic;
  const phase = age / synodic; // 0..1
  const idx = Math.floor(((phase * 8) + 0.5)) % 8;
  const illum = (1 - Math.cos(2 * Math.PI * phase)) / 2; // 0..1
  return { phase, illum, name: MOON_NAMES[idx] };
}
function MoonBadge() {
  const [state] = useState(() => moonPhase());
  const { illum, phase, name } = state;
  // Simple shadow disc offset for a waxing/waning look
  const waxing = phase < 0.5;
  const offset = (1 - illum) * 40; // px
  const dx = waxing ? -offset : offset;
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="moon-wrap">
        <div className="moon-disc">
          <div className="moon-shadow" style={{ transform: `translateX(${dx}px)` }} />
        </div>
      </div>
      <p className="text-[10px] uppercase tracking-[0.22em] text-white/55">
        Tonight's moon · <span className="text-white/75">{name}</span>
      </p>
    </div>
  );
}

/* ────────── Constellation divider ────────── */

function Divider() {
  return (
    <div className="const-divider" aria-hidden>
      <span className="cd-dot" />
      <span className="cd-line" />
      <span className="cd-dot" />
      <span className="cd-line" />
      <span className="cd-dot" />
    </div>
  );
}

/* ────────── Plaque wrapper ────────── */

function Plaque({ children }: { children: ReactNode }) {
  return (
    <div className="plaque">
      <span className="brk-tl" />
      <span className="brk-tr" />
      <span className="brk-bl" />
      <span className="brk-br" />
      <div className="plaque-inner">{children}</div>
    </div>
  );
}

/* ────────── Home page ────────── */

function HomePage() {
  const featuredFn = useServerFn(pickFeaturedMemorial);
  const recentFn = useServerFn(listRecentCandles);
  const countFn = useServerFn(countCandlesThisWeek);

  const featured = useQuery({
    queryKey: ["home", "featured-memorial"],
    queryFn: () => featuredFn(),
    staleTime: 60_000,
  });
  const recent = useQuery({
    queryKey: ["home", "recent-candles"],
    queryFn: () => recentFn({ data: { limit: 12 } }),
    staleTime: 30_000,
  });
  const weekly = useQuery({
    queryKey: ["home", "candles-week"],
    queryFn: () => countFn(),
    staleTime: 60_000,
  });

  const primaryCandle = (label: string = "Release a star") =>
    featured.data ? (
      <CandleDialog
        target={{
          kind: "memorial",
          memorial_id: featured.data.id,
          pet_name: featured.data.pet_name,
          slug: featured.data.slug,
        }}
        trigger={
          <button
            type="button"
            className="ios-tappable inline-flex items-center justify-center rounded-full bg-gradient-to-b from-amber-200 to-amber-400 px-7 py-3.5 text-[15px] font-semibold text-[#1a1200] shadow-[0_0_28px_-6px_rgba(251,191,36,0.55)] hover:from-amber-100 hover:to-amber-300"
          >
            {label} ✨
          </button>
        }
      />
    ) : (
      <Link
        to="/garden"
        className="ios-tappable inline-flex items-center justify-center rounded-full bg-gradient-to-b from-amber-200 to-amber-400 px-7 py-3.5 text-[15px] font-semibold text-[#1a1200] shadow-[0_0_28px_-6px_rgba(251,191,36,0.55)] hover:from-amber-100 hover:to-amber-300"
      >
        {label} ✨
      </Link>
    );

  return (
    <div className="relative min-h-screen text-white">
      <VigilDogSymbol />
      <CosmosBg />
      <IntroSequence />
      <SiteHeader />

      {/* A · HERO */}
      <Hero primaryCandle={primaryCandle("Release a star")} />

      {/* A2 · CONSTELLATION INTRO — explain the sky concept before anything else */}
      <section className="relative px-5 py-16 text-center md:px-8 md:py-20">
        <Reveal className="mx-auto max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.32em] text-amber-200/70">The sky above</p>
          <h2 className="mt-3 font-display text-[24px] leading-[1.25] text-[#f5e6c8]/95 md:text-[32px]">
            That bright one is <span className="italic">Sirius</span> — the eye of <span className="italic">Canis Major</span>, the Great Dog.
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-white/70 md:text-[17px]">
            The ancients put a dog in the stars so it would never be forgotten. On Rememfur, every pet who is loved becomes a star of their own — released gently into the same night sky, burning quietly beside all the others.
          </p>
        </Reveal>
        <Divider />
      </section>

      {/* B · PASSAGE */}
      <section className="relative px-5 py-20 text-center md:px-8 md:py-28">
        <Reveal className="mx-auto max-w-3xl">
          <h2 className="font-display italic text-[24px] leading-[1.3] text-[#f5e6c8]/90 md:text-[34px] lg:text-[38px]">
            They were not <span className="not-italic">"just a dog."</span> Not <span className="not-italic">"just a cat."</span> They were seventeen years of coming home to someone.
          </h2>
          <p className="mt-6 font-display text-[18px] leading-[1.5] text-white/70 md:text-[22px]">
            All that love doesn't disappear. It just needs somewhere to go — a star, a page that stays, a sky that remembers.
          </p>
        </Reveal>
        <Divider />
      </section>

      {/* C · SIX CHAPTERS */}
      <Chapters primaryCandle={primaryCandle("Release theirs now")} />

      {/* D · LIVE CANDLES */}
      <Divider />
      <CandleStrip
        candles={recent.data ?? []}
        weekCount={weekly.data?.count ?? 0}
        loading={recent.isLoading}
      />

      {/* E · HOW IT WORKS */}
      <Divider />
      <section className="relative px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-md md:max-w-[1100px]">
          <Reveal>
            <h2 className="text-center font-display text-[30px] leading-[1.1] tracking-tight text-white md:text-5xl">
              How it works
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-6 md:mt-14 md:grid-cols-3 md:gap-8">
            <Reveal><Step n="I" title="Say their name." body="Tell us who they were — a name, a photo, a few words. Or just a name. That's enough." /></Reveal>
            <Reveal><Step n="II" title="Release their star." body="One star, drifting up into a sky beside thousands of others. Theirs." /></Reveal>
            <Reveal><Step n="III" title="Return anytime." body="Their star stays. Come back on the hard days — the birthdays, the anniversaries, the quiet Tuesdays." /></Reveal>
          </div>
          <p className="mt-10 text-center text-[11px] uppercase tracking-[0.28em] text-white/45">
            No account needed. It takes about a minute.
          </p>
        </div>
      </section>

      {/* F · FAQ */}
      <Divider />
      <section className="relative px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-md md:max-w-3xl">
          <Reveal>
            <h2 className="text-center font-display text-[30px] leading-[1.1] tracking-tight text-white md:text-5xl">
              Gentle answers
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-3 md:mt-10">
            <FaqItem q="Is it free?" a="Yes. Creating a memorial, releasing a star, and visiting the garden are all free." />
            <FaqItem q="Do I need an account to release a star?" a="No. You can release a star for any pet without signing up. An account is only needed if you want to create your own memorial or keep a journal." />
            <FaqItem q="Can I keep a memorial private?" a="Yes. You can keep a memorial just for you, share it only with a link, or let it live in the garden — your choice, and you can change it anytime." />
            <FaqItem q="Can I add more photos later?" a="Yes. You can return anytime to add photos, edit their story, or update anything about their memorial." />
            <FaqItem q="What happens to a star after 24 hours?" a="The bright glow softens, but the star remains. Every star ever released is remembered — and anyone can release a new one, any day." />
            <FaqItem q="Can I take a memorial down?" a="Yes. You control your memorials completely, and you can quietly take one down whenever you need to." />
          </div>
        </div>
      </section>

      {/* G · CLOSING */}
      <ClosingScene primaryCandle={primaryCandle("Release a star")} />

      <div className="pb-[calc(72px+env(safe-area-inset-bottom))] md:pb-6">
        <SiteFooter />
      </div>
    </div>
  );
}

/* ────────── HERO ────────── */

function Hero({ primaryCandle }: { primaryCandle: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <section
      className="relative flex w-full flex-col items-center justify-end overflow-hidden"
      style={{ minHeight: "100svh" }}
      aria-label="A quiet vigil beneath the night sky"
    >
      {/* Moon top-right */}
      <div className="pointer-events-none absolute right-5 top-5 md:right-10 md:top-10">
        <MoonBadge />
      </div>

      {/* Centered story sequence — kept intentionally sparse so the vigil scene breathes */}
      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center px-5 pb-[30%] pt-24 text-center md:max-w-2xl md:pb-[24%] md:pt-32">
        <h1 className="rise-in font-display text-[32px] leading-[1.05] tracking-tight text-white md:text-6xl lg:text-7xl" style={{ animationDelay: "0.3s" }}>
          Grief is just love
          <br className="hidden sm:inline" /> with nowhere to go.
        </h1>

        <div className="rise-in mt-10 flex flex-col items-center gap-3" style={{ animationDelay: "1.1s" }}>
          {primaryCandle}
          <Link to="/create" className="text-[13px] text-white/60 underline-offset-4 hover:text-white/90 hover:underline">
            Create their memorial
          </Link>
        </div>
      </div>

      {/* The Vigil — hill + dog + Sirius */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[46%]">
        <svg viewBox="0 0 800 400" preserveAspectRatio="xMidYMax slice" className="h-full w-full" aria-hidden>
          <defs>
            <radialGradient id="hero-sirius-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff2cc" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#d4b378" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="hero-beam" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffe9b0" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#ffe9b0" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="hero-flareV" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#fff2cc" stopOpacity="0" />
              <stop offset="50%" stopColor="#fffbe6" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#fff2cc" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="hero-flareH" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#fff2cc" stopOpacity="0" />
              <stop offset="50%" stopColor="#fffbe6" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#fff2cc" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* light beam */}
          <polygon points="540,60 590,60 380,340 310,340" fill="url(#hero-beam)" />
          {/* Sirius */}
          <g className="vigil-sirius" style={{ transformOrigin: "560px 60px" }}>
            <circle cx="560" cy="60" r="42" fill="url(#hero-sirius-glow)" />
            <rect x="558" y="28" width="4" height="64" rx="2" fill="url(#hero-flareV)" />
            <rect x="528" y="58" width="64" height="4" rx="2" fill="url(#hero-flareH)" />
            <circle cx="560" cy="60" r="6" fill="#fffbe6" />
          </g>
          {/* Hill */}
          <path d="M 0 340 C 140 300, 260 292, 380 315 C 500 340, 620 305, 740 320 C 770 324, 790 328, 800 332 L 800 400 L 0 400 Z" fill="#04060D" />
        </svg>
        {/* Dog perched on hill */}
        <div className="absolute left-1/2 bottom-[18%] -translate-x-1/2 vigil-dog-torso" style={{ transformOrigin: "bottom center" }}>
          <VigilDog size={150} />
        </div>
      </div>

      {/* Scroll cue */}
      <div
        aria-hidden
        className={`pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 transition-opacity duration-500 ${scrolled ? "opacity-0" : "opacity-100"}`}
      >
        <ChevronDown className="scroll-cue h-5 w-5 text-white/60" />
      </div>
    </section>
  );
}

/* ────────── SIX CHAPTERS ────────── */

function Chapters({ primaryCandle }: { primaryCandle: ReactNode }) {
  const items = useMemo(() => [
    {
      roman: "I", eyebrow: "Their memorial", title: "A page that stays.",
      body: "Photos, their story, the details only you knew — a place their name can live.",
      cta: <Link to="/create" className="mt-6 inline-flex items-center text-[15px] font-medium text-amber-200 hover:text-amber-100">Begin their memorial →</Link>,
      plaque: <PlaqueMedallion />,
    },
    {
      roman: "II", eyebrow: "Stars", title: "Anyone can release one. No account. No noise.",
      body: "Each burns on the wall of light. The count stays forever.",
      cta: primaryCandle,
      plaque: <PlaqueCandles />,
    },
    {
      roman: "III", eyebrow: "The garden", title: "A sky full of dogs.",
      body: "Above the garden hangs Canis Major — the Great Dog — home of Sirius, the brightest star in Earth's whole night sky. The ancients put a dog there so it would never be forgotten. We understand completely.",
      cta: <Link to="/garden" className="mt-6 inline-flex items-center text-[15px] font-medium text-amber-200 hover:text-amber-100">Visit the garden →</Link>,
      plaque: <PlaqueCanisMajor />,
    },
    {
      roman: "IV", eyebrow: "Their Sky", title: "The sky remembers the night they left.",
      body: "Every memorial carries the real constellation from the night they passed, paired with a hand-written line. Tap the sky on any memorial to feel it pulse.",
      cta: <Link to="/garden" className="mt-6 inline-flex items-center text-[15px] font-medium text-amber-200 hover:text-amber-100">See a sky →</Link>,
      plaque: <PlaqueTheirSky />,
    },
    {
      roman: "V", eyebrow: "The journal", title: "For the words you're not ready to say out loud.",
      body: "Private. Only yours. Written when the house is at its quietest.",
      cta: <Link to="/journal" className="mt-6 inline-flex items-center text-[15px] font-medium text-amber-200 hover:text-amber-100">Open the journal →</Link>,
      plaque: <PlaqueJournal />,
    },
    {
      roman: "VI", eyebrow: "Grief support", title: "This grief is real. You're not overreacting.",
      body: (<>Free pet-loss support lines: <a href="tel:+18774743310" className="text-white/80 hover:text-white">ASPCA · 877-474-3310</a> · <a href="tel:+18559335683" className="text-white/80 hover:text-white">Lap of Love · 855-933-5683</a></>),
      cta: <Link to="/grief-support" className="mt-6 inline-flex items-center text-[15px] font-medium text-amber-200 hover:text-amber-100">Grief support →</Link>,
      plaque: <PlaqueSupport />,
    },
  ], [primaryCandle]);

  return (
    <section className="relative px-5 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-md md:max-w-[1100px] space-y-20 md:space-y-28">
        {items.map((c, i) => (
          <Reveal key={c.eyebrow}>
            <div className={`grid items-center gap-8 md:grid-cols-2 md:gap-16 ${i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""}`}>
              <div>
                <p className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
                  <span className="font-display text-[16px] not-italic text-[var(--gold)] tracking-normal">{c.roman}</span>
                  <span className="h-px w-8 bg-[var(--gold)]/40" />
                  {c.eyebrow}
                </p>
                <h2 className="mt-3 font-display text-[28px] leading-[1.1] tracking-tight text-white md:text-4xl lg:text-5xl">
                  {c.title}
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-white/70 md:text-lg">
                  {c.body}
                </p>
                <div>{c.cta}</div>
              </div>
              <div className="flex justify-center">{c.plaque}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ────────── Plaques ────────── */

function PlaqueMedallion() {
  return (
    <div className="w-full max-w-[340px]">
      <Plaque>
        <div className="flex flex-col items-center py-4">
          <div className="flex h-28 w-28 items-center justify-center rounded-full border border-[var(--gold)]/50 bg-[#04060D]" style={{ boxShadow: "inset 0 0 20px rgba(212,179,120,0.15), 0 0 30px -10px rgba(212,179,120,0.35)" }}>
            <svg width="72" height="72" viewBox="0 0 686 1119" aria-hidden>
              <use href="#vigil-dog" fill="#E8B96D" />
            </svg>
          </div>
          <p className="mt-5 font-display text-[22px] text-white">Their Name</p>
          <p className="mt-1 text-[12px] tracking-widest text-white/50">2008 — 2025</p>
          <p className="mt-3 font-display italic text-[14px] text-white/70">"Always at the door."</p>
          <div className="mt-5 flex items-end gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="oc-candle" style={{ height: i === 1 ? 36 : 28 }}>
                <span className="oc-flame" style={{ animationDelay: `${i * 0.3}s` }}>
                  <span className="l1" /><span className="l2" /><span className="l3" />
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[11px] uppercase tracking-[0.28em] text-amber-200/60">a light kept, night after night</p>
        </div>
      </Plaque>
    </div>
  );
}

function PlaqueCandles() {
  const heights = [42, 60, 36];
  return (
    <div className="w-full max-w-[340px]">
      <Plaque>
        <div className="relative flex h-[220px] items-end justify-center gap-10 py-4">
          {heights.map((h, i) => (
            <div key={i} className="oc-candle" style={{ height: h, width: 20 }}>
              <span className="oc-flame" style={{ animationDelay: `${i * 0.37}s`, animationDuration: `${1.05 + i * 0.19}s` }}>
                <span className="l1" /><span className="l2" /><span className="l3" />
              </span>
            </div>
          ))}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        <p className="mt-2 text-center font-display italic text-[14px] text-white/70">One flame. Then another. Then thousands.</p>
      </Plaque>
    </div>
  );
}

function PlaqueCanisMajor() {
  const ref = useRef<SVGSVGElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") { el?.classList.add("sky-in-view"); return; }
    const io = new IntersectionObserver((es) => {
      for (const e of es) if (e.isIntersecting) { (e.target as SVGSVGElement).classList.add("sky-in-view"); io.unobserve(e.target); }
    }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const stars = [
    { id: "sirius", cx: 180, cy: 110, r: 5, label: "Sirius · the Dog Star" },
    { id: "mirzam", cx: 90, cy: 155, label: "" },
    { id: "muliphein", cx: 210, cy: 70, label: "" },
    { id: "wezen", cx: 258, cy: 200, label: "Wezen" },
    { id: "adhara", cx: 218, cy: 250, label: "Adhara" },
    { id: "aludra", cx: 315, cy: 210, label: "" },
    { id: "furud", cx: 140, cy: 232, label: "" },
  ];
  const byId = Object.fromEntries(stars.map((s) => [s.id, s]));
  const lines: [string, string][] = [
    ["sirius", "mirzam"], ["sirius", "muliphein"], ["sirius", "wezen"],
    ["wezen", "aludra"], ["wezen", "adhara"], ["adhara", "furud"],
  ];
  return (
    <div className="w-full max-w-[380px]">
      <Plaque>
        <svg ref={ref} viewBox="0 0 360 300" className="their-sky-svg block h-[260px] w-full" aria-hidden>
          {/* faint background stars */}
          {Array.from({ length: 26 }).map((_, i) => {
            const x = (i * 47) % 360; const y = (i * 71) % 300;
            return <circle key={i} cx={x} cy={y} r={i % 5 === 0 ? 1.2 : 0.8} fill="#e6e1d6" opacity={0.4} />;
          })}
          {/* lines */}
          {lines.map(([a, b], i) => {
            const A = byId[a]!; const B = byId[b]!;
            const len = Math.hypot(B.cx - A.cx, B.cy - A.cy);
            return (
              <line key={i} x1={A.cx} y1={A.cy} x2={B.cx} y2={B.cy}
                stroke="#d4b378" strokeOpacity="0.55" strokeWidth="1" strokeLinecap="round"
                className="ts-line"
                style={{ strokeDasharray: len, strokeDashoffset: len, ["--delay" as string]: `${i * 150}ms` } as React.CSSProperties}
              />
            );
          })}
          {/* stars */}
          {stars.map((s, i) => (
            <g key={s.id} className={`ts-star ${s.id === "sirius" ? "ts-star-sirius" : ""}`} style={{ ["--delay" as string]: `${300 + i * 100}ms` } as React.CSSProperties}>
              <circle cx={s.cx} cy={s.cy} r={(s.r ?? 2.4) + 4} fill="#fff2cc" opacity="0.25" />
              <circle cx={s.cx} cy={s.cy} r={s.r ?? 2.2} fill="#fffbe6" />
              {s.label && (
                <text x={s.cx + 10} y={s.cy + 4} fontSize="10" fontStyle="italic" fill="#d4b378" opacity="0.75">{s.label}</text>
              )}
            </g>
          ))}
        </svg>
        <p className="mt-3 text-center font-display italic text-[14px] text-white/70">Canis Major, the Great Dog.</p>
      </Plaque>
    </div>
  );
}

function PlaqueTheirSky() {
  return (
    <div className="w-full max-w-[380px]">
      <Plaque>
        <svg viewBox="0 0 360 220" className="block h-[200px] w-full" aria-hidden>
          {Array.from({ length: 18 }).map((_, i) => {
            const x = (i * 61) % 360; const y = (i * 43) % 220;
            return <circle key={i} cx={x} cy={y} r={0.9} fill="#e6e1d6" opacity={0.4} />;
          })}
          {[[80, 60], [140, 100], [200, 70], [250, 130], [180, 160]].map(([x1, y1], i, arr) => {
            const [x2, y2] = arr[(i + 1) % arr.length];
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#d4b378" strokeOpacity="0.5" strokeWidth="0.8" />;
          })}
          {[[80, 60, 2.8], [140, 100, 2.2], [200, 70, 2.4], [250, 130, 3], [180, 160, 2]].map(([x, y, r], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r={r + 3} fill="#fff2cc" opacity="0.22" />
              <circle cx={x} cy={y} r={r} fill="#fffbe6" />
            </g>
          ))}
        </svg>
        <p className="mt-2 text-center font-display italic text-[14px] text-[#f5e6c8]/80">
          "The sky was clear the night he left. It hasn't stopped watching since."
        </p>
        <p className="mt-2 text-center text-[10px] uppercase tracking-[0.26em] text-white/45">
          Evening sky · a night to remember
        </p>
      </Plaque>
    </div>
  );
}

function PlaqueJournal() {
  return (
    <div className="w-full max-w-[340px]">
      <Plaque>
        <div className="rounded-md bg-[#0a1024] p-5 ring-1 ring-white/10">
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/50">Tuesday, 2:14 am</p>
          <p className="mt-3 font-hand text-[22px] leading-snug text-[var(--gold)]">
            I still hear his collar in the hallway.
          </p>
          <div className="mt-4 space-y-2">
            <div className="hw-line w-11/12" />
            <div className="hw-line w-9/12" />
            <div className="hw-line w-10/12" />
            <div className="hw-line w-7/12" />
          </div>
          <p className="mt-5 flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-amber-200/60">
            <span className="inline-block h-3 w-3 rounded-sm border border-current" /> Only you
          </p>
        </div>
      </Plaque>
    </div>
  );
}

function PlaqueSupport() {
  return (
    <div className="w-full max-w-[340px]">
      <Plaque>
        <div className="flex flex-col items-center py-4 text-center">
          <div className="oc-candle" style={{ height: 60, width: 22 }}>
            <span className="oc-flame"><span className="l1" /><span className="l2" /><span className="l3" /></span>
          </div>
          <p className="mt-6 font-display text-[18px] leading-snug text-white/85">
            You don't have to carry this alone.
          </p>
          <div className="mt-4 grid w-full gap-2 text-[12px] text-white/70">
            <div className="rounded-xl bg-white/[0.04] px-3 py-2 ring-1 ring-white/10">ASPCA · 877-474-3310</div>
            <div className="rounded-xl bg-white/[0.04] px-3 py-2 ring-1 ring-white/10">Lap of Love · 855-933-5683</div>
          </div>
        </div>
      </Plaque>
    </div>
  );
}

/* ────────── Live candles ────────── */

function CandleStrip({ candles, weekCount, loading }: {
  candles: Array<{ id: string; lit_by_name: string | null; message: string | null; pet_name: string | null; memorial_slug: string | null; }>;
  weekCount: number;
  loading: boolean;
}) {
  const enough = candles.length >= 3;
  return (
    <section aria-label="Recent candles" className="relative px-0 pt-8 md:pt-12">
      <div className="mx-auto max-w-md px-5 md:max-w-[1200px] md:px-8">
        <Reveal>
          <h2 className="text-center font-display text-[28px] leading-[1.1] tracking-tight text-white md:text-5xl">
            Strangers light candles for pets they never met.
          </h2>
          <p className="mt-4 text-center text-[15px] leading-relaxed text-white/65 md:text-lg">
            Every flame is a pet who was deeply loved.
          </p>
        </Reveal>
        <div className="mt-10 flex items-baseline justify-between">
          <p className="text-[11px] uppercase tracking-[0.28em] text-amber-200/70">Candles burning</p>
          {!loading && weekCount > 0 && (
            <p className="text-[11px] text-white/50">{weekCount} candles lit this week</p>
          )}
        </div>
      </div>
      {enough ? (
        <div className="mx-auto mt-4 max-w-[1200px] overflow-x-auto px-5 pb-2 md:px-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <ul className="flex gap-3">
            {candles.map((c) => {
              const inner = (
                <div className="flex h-full w-40 shrink-0 flex-col rounded-2xl bg-white/[0.04] p-3 ring-1 ring-white/10 transition hover:bg-white/[0.07]">
                  <div className="flex items-center gap-2">
                    <div className="oc-candle" style={{ height: 20, width: 12 }}>
                      <span className="oc-flame" style={{ transform: "translateX(-50%) scale(0.7)" }}>
                        <span className="l1" /><span className="l2" /><span className="l3" />
                      </span>
                    </div>
                    <span className="truncate font-display text-[14px] text-white">{c.pet_name ?? "A friend"}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-[12px] leading-snug text-white/70">{c.message?.trim() || "🕯️"}</p>
                  <p className="mt-2 text-[10.5px] uppercase tracking-[0.18em] text-amber-200/70">{c.lit_by_name ?? "A friend"}</p>
                </div>
              );
              return (
                <li key={c.id}>
                  {c.memorial_slug
                    ? <Link to="/memorial/$slug" params={{ slug: c.memorial_slug }}>{inner}</Link>
                    : inner}
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="mx-auto mt-4 max-w-md px-5 md:max-w-[1200px] md:px-8">
          <div className="flex flex-col items-center rounded-2xl bg-white/[0.03] p-6 text-center ring-1 ring-white/10">
            <div className="oc-candle" style={{ height: 46, width: 20 }}>
              <span className="oc-flame"><span className="l1" /><span className="l2" /><span className="l3" /></span>
            </div>
            <p className="mt-4 font-display text-[17px] text-white">The sky is just beginning. Light one of the first candles.</p>
            <p className="mt-1 text-[13px] text-white/55">No account needed.</p>
          </div>
        </div>
      )}
    </section>
  );
}

/* ────────── Closing ────────── */

function ClosingScene({ primaryCandle }: { primaryCandle: ReactNode }) {
  const ref = useRef<SVGSVGElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") { el?.classList.add("sky-in-view"); return; }
    const io = new IntersectionObserver((es) => {
      for (const e of es) if (e.isIntersecting) { (e.target as SVGSVGElement).classList.add("sky-in-view"); io.unobserve(e.target); }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const stars = [
    { id: "sirius", cx: 400, cy: 90, r: 4.5 },
    { id: "mirzam", cx: 320, cy: 130 },
    { id: "muliphein", cx: 430, cy: 55 },
    { id: "wezen", cx: 470, cy: 170 },
    { id: "adhara", cx: 435, cy: 215 },
    { id: "aludra", cx: 525, cy: 180 },
    { id: "furud", cx: 370, cy: 200 },
  ];
  const byId = Object.fromEntries(stars.map((s) => [s.id, s]));
  const lines: [string, string][] = [
    ["sirius", "mirzam"], ["sirius", "muliphein"], ["sirius", "wezen"],
    ["wezen", "aludra"], ["wezen", "adhara"], ["adhara", "furud"],
  ];

  return (
    <section className="relative px-5 py-16 text-center md:px-8 md:py-24">
      <Reveal className="mx-auto max-w-md md:max-w-2xl">
        <div className="relative mx-auto mb-8 h-[280px] w-full max-w-lg">
          <svg ref={ref} viewBox="0 0 800 320" className="their-sky-svg absolute inset-0 h-full w-full" aria-hidden>
            {lines.map(([a, b], i) => {
              const A = byId[a]!; const B = byId[b]!;
              const len = Math.hypot(B.cx - A.cx, B.cy - A.cy);
              return (
                <line key={i} x1={A.cx} y1={A.cy} x2={B.cx} y2={B.cy}
                  stroke="#d4b378" strokeOpacity="0.55" strokeWidth="1" strokeLinecap="round"
                  className="ts-line"
                  style={{ strokeDasharray: len, strokeDashoffset: len, ["--delay" as string]: `${i * 150}ms` } as React.CSSProperties}
                />
              );
            })}
            {stars.map((s, i) => (
              <g key={s.id} className={`ts-star ${s.id === "sirius" ? "ts-star-sirius" : ""}`} style={{ ["--delay" as string]: `${400 + i * 110}ms` } as React.CSSProperties}>
                <circle cx={s.cx} cy={s.cy} r={(s.r ?? 2.2) + 4} fill="#fff2cc" opacity="0.25" />
                <circle cx={s.cx} cy={s.cy} r={s.r ?? 2} fill="#fffbe6" />
              </g>
            ))}
            {/* small hill */}
            <path d="M 0 300 C 200 270, 400 275, 600 285 C 700 290, 780 295, 800 298 L 800 320 L 0 320 Z" fill="#04060D" />
          </svg>
          <div className="absolute left-1/2 bottom-[6%] -translate-x-1/2 vigil-dog-torso" style={{ transformOrigin: "bottom center" }}>
            <VigilDog size={90} />
          </div>
        </div>

        <h2 className="font-display text-[30px] leading-[1.1] tracking-tight text-white md:text-5xl">
          They mattered. They still do.
        </h2>
        <p className="mt-4 text-[16px] leading-relaxed text-white/70 md:text-lg">
          It takes a minute. It stays forever.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          {primaryCandle}
          <Link to="/create" className="text-[13px] text-white/60 underline-offset-4 hover:text-white/90 hover:underline">
            Create their memorial
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

/* ────────── Small components ────────── */

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-white/[0.04] p-6 text-center ring-1 ring-white/10 md:p-8">
      <span className="font-display text-[20px] italic text-[var(--gold)]">{n}</span>
      <span className="mt-4 inline-block h-px w-8 bg-[var(--gold)]/40" />
      <h3 className="mt-4 font-display text-[20px] leading-tight text-white md:text-[22px]">{title}</h3>
      <p className="mt-2 text-[14px] leading-relaxed text-white/60">{body}</p>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-2xl bg-white/[0.04] p-5 ring-1 ring-white/10 open:bg-white/[0.06] md:p-6">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-[18px] text-white md:text-[19px]">
        {q}
        <span className="text-[var(--gold)] text-xl transition-transform duration-300 group-open:rotate-45">+</span>
      </summary>
      <p className="mt-3 text-[14px] leading-relaxed text-white/65">{a}</p>
    </details>
  );
}
