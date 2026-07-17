import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ComponentType, type CSSProperties, type ReactNode, type SVGProps } from "react";
import { ChevronDown, Utensils, Shirt, Stethoscope, Shield, Sparkles, PawPrint, HandHeart, MapPin, Skull, Cake, HeartHandshake, Home, Heart, Users, BookOpen, Feather, Cross, Gift, Bell, Mail, Moon, CalendarClock, ShoppingBag, MessagesSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { CandleDialog } from "@/components/site/CandleDialog";
import { IntroSequence } from "@/components/site/IntroSequence";
import { WaitlistDialog } from "@/components/site/WaitlistDialog";
import { BetaInviteDialog } from "@/components/site/BetaInviteDialog";
import { PawLamp } from "@/components/site/PawLamp";
import {
  pickFeaturedMemorial,
  listRecentCandles,
  countCandlesThisWeek,
} from "@/lib/candle-guest.functions";
import lifeHeroImg from "@/assets/life-hero.jpg";
import bridgeSkyImg from "@/assets/bridge-sky.jpg";
import pawtraitPreviewImg from "@/assets/pawtrait-preview.jpg";
import lifeServicesImg from "@/assets/life-services.jpg";
import lifeLifestyleImg from "@/assets/life-lifestyle.jpg";
import lifeAdoptionImg from "@/assets/life-adoption.jpg";

type WorldMode = "memory" | "life";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Rememfur — A gentle place for the pet you loved." },
      { name: "description", content: "Write their memorial, light a paw lamp in their name, and hold your grief with people who understand. A quiet home for the love that has nowhere to go." },
      { property: "og:title", content: "Rememfur — A gentle place for the pet you loved." },
      { property: "og:description", content: "Write their memorial, light a paw lamp, share your grief with a community that gets it." },
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

function CosmosBg({ mode = "memory", reduced = false }: { mode?: WorldMode; reduced?: boolean }) {
  const [stars, setStars] = useState<{ className: string; style: React.CSSProperties }[]>([]);
  const [streaks, setStreaks] = useState<{ id: number; top: string; left: string; ang: string }[]>([]);

  useEffect(() => {
    if (reduced) return;


    const starCount = typeof window !== "undefined" && window.innerWidth < 768 ? 60 : 130;
    const generated = Array.from({ length: starCount }, () => {
      const r = Math.random();
      const kind = r < 0.18 ? " warm" : r < 0.3 ? " blue" : "";
      const size = Math.random() < 0.85 ? 1.4 : 2.2;
      return {
        className: `star${kind}`,
        style: {
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          width: `${size}px`,
          height: `${size}px`,
          ["--o" as string]: 0.22 + Math.random() * 0.6,
          ["--d" as string]: `${2.6 + Math.random() * 4.5}s`,
          ["--dl" as string]: `${Math.random() * 5}s`,
        },
      };
    });
    setStars(generated);
  }, []);

  useEffect(() => {
    if (reduced) return;
    let id = 0;
    let alive = true;
    const spawn = () => {
      if (!alive) return;
      const item = {
        id: ++id,
        top: `${4 + Math.random() * 60}%`,
        left: `${Math.random() * 55}%`,
        ang: `${-20 - Math.random() * 18}deg`,
      };
      setStreaks((prev) => [...prev, item]);
      window.setTimeout(() => setStreaks((prev) => prev.filter((s) => s.id !== item.id)), 1500);
      const next = 3600 + Math.random() * 3600;
      window.setTimeout(spawn, next);
    };
    const t = window.setTimeout(spawn, 2000);
    return () => { alive = false; window.clearTimeout(t); };
  }, [reduced]);

  return (
    <div
      className="cosmos-bg"
      aria-hidden
      style={{
        opacity: mode === "life" ? 0 : 1,
        transition: reduced ? "none" : "opacity 1.1s ease",
        pointerEvents: "none",
      }}
    >
      <div className="base" />
      <div className="nebula">
        <div className="n n1" />
        <div className="n n2" />
        <div className="n n3" />
      </div>
      <div className="milkyway" />
      <div className="sky">
        {stars.map((s, i) => (
          <span key={i} className={s.className} style={s.style} />
        ))}
      </div>
      {streaks.map((s) => (
        <span
          key={s.id}
          className="shooter"
          style={{ top: s.top, left: s.left, ["--ang" as string]: s.ang } as React.CSSProperties}
        />
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

  // World state — default to memory; restore from localStorage
  const [mode, setMode] = useState<WorldMode>("memory");
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("rememfur.world");
      if (saved === "life" || saved === "memory") setMode(saved);
    } catch { /* ignore */ }
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    setReduced(!!mq?.matches);
  }, []);
  useEffect(() => {
    try { window.localStorage.setItem("rememfur.world", mode); } catch { /* ignore */ }
  }, [mode]);

  // Beta dialog controlled from many places
  const [betaOpen, setBetaOpen] = useState(false);
  const [betaSource, setBetaSource] = useState("hero");
  const openBeta = (source: string) => { setBetaSource(source); setBetaOpen(true); };

  const primaryCandle = (label: string = "Light a paw lamp") =>
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
              className="btn-gold ios-tappable"
            >
              <PawLamp size={18} />
              {label}
            </button>
          }
        />
      ) : (
        <Link
          to="/garden"
          className="btn-gold ios-tappable"
        >
          <PawLamp size={18} />
          {label}
        </Link>
      );

  // Palette variables scoped to the wrapper (do NOT bleed globally)
  const memoryVars: CSSProperties = {
    ["--w-bg" as string]: "radial-gradient(130% 90% at 50% 0%, #0D1530, #050810 62%)",
    ["--w-ink" as string]: "#F2ECDD",
    ["--w-muted" as string]: "rgba(242,236,221,0.6)",
    ["--w-accent" as string]: "#E8B96D",
    ["--w-accent-2" as string]: "#F6D9A0",
    ["--w-hair" as string]: "rgba(232,185,109,0.2)",
    ["--w-card-1" as string]: "#151f36",
    ["--w-card-2" as string]: "#0a0f20",
    ["--w-kind" as string]: "#8FC79E",
  };
  const lifeVars: CSSProperties = {
    ["--w-bg" as string]: "radial-gradient(130% 90% at 50% 0%, #F4E9D8, #EAD9BE 62%)",
    ["--w-ink" as string]: "#3A2C1C",
    ["--w-muted" as string]: "rgba(58,44,28,0.62)",
    ["--w-accent" as string]: "#A8641C",
    ["--w-accent-2" as string]: "#C9852F",
    ["--w-hair" as string]: "rgba(168,100,28,0.3)",
    ["--w-card-1" as string]: "#FFFDF7",
    ["--w-card-2" as string]: "#F6ECD8",
    ["--w-kind" as string]: "#5C9A6E",
  };
  const wrapperStyle: CSSProperties = {
    ...(mode === "life" ? lifeVars : memoryVars),
    background: "var(--w-bg)",
    color: "var(--w-ink)",
    transition: reduced ? "none" : "background 1.1s ease, color 1.1s ease",
  };

  return (
    <div className="relative min-h-screen text-white" style={wrapperStyle}>
      <VigilDogSymbol />
      <CosmosBg mode={mode} reduced={reduced} />
      <DawnBg mode={mode} reduced={reduced} />
      <IntroSequence />
      <SiteHeader />

      <WorldToggle mode={mode} setMode={setMode} reduced={reduced} />

      {/* MEMORY WORLD */}
      <WorldPane active={mode === "memory"} reduced={reduced}>
        <Hero
          primaryCandle={primaryCandle("Light a paw lamp")}
          onLastLetter={() => openBeta("last-letter")}
        />
        <section className="relative px-5 py-20 text-center md:px-8 md:py-28">
          <Reveal className="mx-auto max-w-3xl">
            <h2 className="font-display italic text-[24px] leading-[1.3] text-[#f5e6c8]/90 md:text-[34px] lg:text-[38px]">
              They were never <span className="not-italic">"just"</span> a pet. They were years of coming home to someone.
            </h2>
            <p className="mt-6 font-display text-[18px] leading-[1.5] text-white/70 md:text-[22px]">
              All that love doesn't disappear when they do. It just needs somewhere to go — a paw lamp in the dark, a memorial that stays, a star in a sky that remembers.
            </p>
          </Reveal>
          <Divider />
        </section>

        <GriefBelongingSection />
        <CareRail />
        <MarketplaceRail />
        <Chapters
          primaryCandle={primaryCandle("Light theirs now")}
          onDev={openBeta}
        />

        <Divider />
        <CandleStrip
          candles={recent.data ?? []}
          weekCount={weekly.data?.count ?? 0}
          loading={recent.isLoading}
        />

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
              <Reveal><Step n="II" title="Light their paw lamp." body="A small warm light burning in their name. Yours forever, and lit by anyone who visits." /></Reveal>
              <Reveal><Step n="III" title="Return anytime." body="Their page stays. Come back on the hard days — birthdays, anniversaries, quiet Tuesdays." /></Reveal>
            </div>
            <p className="mt-10 text-center text-[11px] uppercase tracking-[0.28em] text-white/45">
              No account needed. It takes about a minute.
            </p>
          </div>
        </section>

        <Divider />
        <section className="relative px-5 py-16 md:px-8 md:py-24">
          <div className="mx-auto max-w-md md:max-w-3xl">
            <Reveal>
              <h2 className="text-center font-display text-[30px] leading-[1.1] tracking-tight text-white md:text-5xl">
                Gentle answers
              </h2>
            </Reveal>
            <div className="mt-8 grid gap-3 md:mt-10">
              <FaqItem q="Is it free?" a="Yes. Creating a memorial, lighting a paw lamp, and visiting the garden are all free." />
              <FaqItem q="Do I need an account to light a paw lamp?" a="No. You can light a paw lamp for any pet without signing up. An account is only needed if you want to create your own memorial, keep a journal, or track your pets' records." />
              <FaqItem q="Can I keep a memorial private?" a="Yes. You can keep a memorial just for you, share it only with a link, or let it live in the garden — your choice, and you can change it anytime." />
              <FaqItem q="Can I add more photos later?" a="Yes. You can return anytime to add photos, edit their story, or update anything about their memorial." />
              <FaqItem q="What about the marketplace, vets, or funeral services?" a="Those are on the way — join the notify list on any card above and we'll let you know as each part opens." />
              <FaqItem q="Can I take a memorial down?" a="Yes. You control your memorials completely, and you can quietly take one down whenever you need to." />
            </div>
          </div>
        </section>

        <ClosingScene primaryCandle={primaryCandle("Light a paw lamp")} />
      </WorldPane>

      {/* LIFE WORLD */}
      <WorldPane active={mode === "life"} reduced={reduced}>
        <LifeWorld onDev={openBeta} />
      </WorldPane>

      {/* BRIDGE — shared */}
      <Bridge />

      {/* BETA — shared */}
      <BetaBand onOpen={() => openBeta("beta-band")} />

      <BetaInviteDialog source={betaSource} open={betaOpen} onOpenChange={setBetaOpen} />

      <div className="pb-[calc(120px+env(safe-area-inset-bottom))] md:pb-6">
        <SiteFooter />
      </div>
    </div>
  );
}


/* ────────── HERO ────────── */

function Hero({ primaryCandle, onLastLetter }: { primaryCandle: ReactNode; onLastLetter?: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <section
      className="relative flex w-full flex-col overflow-hidden"
      style={{ minHeight: "100svh" }}
      aria-label="A quiet vigil beneath the night sky"
    >
      {/* Moon top-right — clear of mobile header */}
      <div className="pointer-events-none absolute right-5 top-16 z-20 md:right-10 md:top-8">
        <MoonBadge />
      </div>

      {/* TOP: story + CTA in normal flow, centered vertically in remaining space */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pb-8 pt-14 text-center md:pt-24">
        <div className="mx-auto flex w-full max-w-md flex-col items-center md:max-w-2xl">
          <p className="rise-in font-display italic text-[15px] leading-[1.4] text-[var(--gold)]/90 md:text-[18px]" style={{ animationDelay: "0.05s" }}>
            From their first day to long after their last.
          </p>
          <p className="rise-in mt-3 text-[11px] uppercase tracking-[0.32em] text-amber-200/75" style={{ animationDelay: "0.15s" }}>
            In loving memory · and in living joy
          </p>
          <h1 className="rise-in mt-4 font-display leading-[1.08] tracking-tight text-white" style={{ animationDelay: "0.3s", fontSize: "clamp(26px, 7.4vw, 64px)" }}>
            Our beloved companions become the{" "}
            <span className="italic text-[var(--gold)]">stars that watch over us</span>.
          </h1>
          <p className="rise-in mx-auto mt-5 max-w-[30ch] font-display italic text-[16px] leading-[1.55] text-white/75 md:max-w-none md:text-[20px]" style={{ animationDelay: "0.7s" }}>
            Grief this deep needs somewhere to belong. Here, it does.
          </p>

          <div className="rise-in mt-8 flex w-full flex-col items-center gap-3" style={{ animationDelay: "1.1s" }}>
            <div className="w-full max-w-[300px] [&>*]:w-full [&>*]:justify-center md:w-auto md:max-w-none">
              {primaryCandle}
            </div>
            <Link to="/create/memorial" className="link-gold">
              Write a memorial
            </Link>
            <button
              type="button"
              onClick={onLastLetter}
              className="mt-1 inline-flex items-center gap-2 font-display italic text-[15.5px] text-[var(--gold)]/90 underline-offset-4 opacity-90 hover:underline"
            >
              <Mail className="h-4 w-4" />
              Send them your last letter
            </button>
          </div>
        </div>
      </div>


      {/* BOTTOM: Vigil scene as normal-flow block — content above can never overlap */}
      <div className="relative w-full h-[220px] md:h-[340px]">
        {/* Hill — full-width, always spans viewport */}
        <svg
          aria-hidden
          className="absolute inset-x-0 bottom-0 z-[1] h-[45%] w-full"
          viewBox="0 0 800 60"
          preserveAspectRatio="none"
        >
          <path d="M 0 20 C 140 0, 260 -4, 380 8 C 500 20, 620 2, 740 10 C 770 12, 790 14, 800 16 L 800 60 L 0 60 Z" fill="#04060D" />
        </svg>

        {/* Dog perched on hill crest */}
        <div
          className="pointer-events-none absolute left-1/2 z-[3] -translate-x-1/2 vigil-dog-torso"
          style={{ bottom: "20%", transformOrigin: "bottom center" }}
        >
          <div className="w-[88px] md:w-[124px]">
            <VigilDog size={150} className="h-auto w-full" />
          </div>
        </div>

        {/* Scroll cue */}
        <div
          aria-hidden
          className={`pointer-events-none absolute bottom-2 left-1/2 z-10 -translate-x-1/2 transition-opacity duration-500 ${scrolled ? "opacity-0" : "opacity-100"}`}
        >
          <ChevronDown className="scroll-cue h-5 w-5 text-white/60" />
        </div>
      </div>
    </section>
  );
}


/* ────────── SIX CHAPTERS ────────── */

function Chapters({ primaryCandle, onDev }: { primaryCandle: ReactNode; onDev?: (source: string) => void }) {
  const devPill = (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2 py-[3px] text-[9px] font-medium uppercase tracking-[0.22em] text-white/55">
      In development
    </span>
  );
  const devCta = (source: string, label: string) => (
    <button
      type="button"
      onClick={() => onDev?.(source)}
      className="mt-6 inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/40 bg-white/[0.03] px-5 py-2.5 text-[13px] font-medium text-[var(--gold)] hover:bg-white/[0.06]"
    >
      <Sparkles className="h-4 w-4" />
      {label}
    </button>
  );

  const items = useMemo(() => [
    {
      roman: "I", eyebrow: "Their memorial", title: "A page that stays.",
      body: "Photos, their story, the details only you knew — a place their name can live.",
      cta: <Link to="/create" className="mt-6 btn-gold ios-tappable">Begin their memorial</Link>,
      plaque: <PlaqueMedallion />,
    },
    {
      roman: "II", eyebrow: "Paw lamps", title: "A warm light in their name.",
      body: "Anyone can light a paw lamp — no account, no noise. Each one burns quietly beside the others, and the count stays forever.",
      cta: primaryCandle,
      plaque: <PlaqueCandles />,
    },
    {
      roman: "III", eyebrow: "The garden", title: "A sky full of dogs.",
      body: "Above the garden hangs Canis Major — the Great Dog — home of Sirius, the brightest star in Earth's whole night sky. The ancients put a dog there so it would never be forgotten. We understand completely.",
      cta: <Link to="/garden" className="mt-6 link-gold">Visit the garden →</Link>,
      plaque: <PlaqueCanisMajor />,
    },
    {
      roman: "IV", eyebrow: "Their Sky", title: "The sky remembers the night they left.",
      body: "Every memorial carries the real constellation from the night they passed, paired with a hand-written line. Tap the sky on any memorial to feel it pulse.",
      cta: <Link to="/garden" className="mt-6 link-gold">See a sky →</Link>,
      plaque: <PlaqueTheirSky />,
    },
    {
      roman: "V", eyebrow: "The journal", title: "For the words you're not ready to say out loud.",
      body: "Private. Only yours. Written when the house is at its quietest.",
      cta: <Link to="/journal" className="mt-6 link-gold">Open the journal →</Link>,
      plaque: <PlaqueJournal />,
    },
    {
      roman: "VI", eyebrow: "Grief support", title: "This grief is real. You're not overreacting.",
      body: (<>Free pet-loss support lines: <a href="tel:+18774743310" className="text-white/80 hover:text-white">ASPCA · 877-474-3310</a> · <a href="tel:+18559335683" className="text-white/80 hover:text-white">Lap of Love · 855-933-5683</a></>),
      cta: <Link to="/grief-support" className="mt-6 link-gold">Grief support →</Link>,
      plaque: <PlaqueSupport />,
    },
    {
      roman: "VII", eyebrow: "Their last letter", title: "The things left unsaid.",
      body: "Write it, seal it, send it — wherever they are now.",
      dev: true, source: "last-letter",
      cta: devCta("last-letter", "Get early access"),
      plaque: <PlaqueLastLetter />,
    },
    {
      roman: "VIII", eyebrow: "Pawtrait Tales™", title: "Their whole life, an illustrated storybook.",
      body: "Their whole life woven into an illustrated storybook, with a gentle hand from AI.",
      dev: true, source: "pawtrait-tales",
      cta: devCta("pawtrait-tales", "Get early access"),
      plaque: <PlaquePawtrait />,
    },
  ], [primaryCandle, onDev]);

  return (
    <section className="relative px-5 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-md md:max-w-[1100px] space-y-20 md:space-y-28">
        {items.map((c, i) => (
          <Reveal key={c.eyebrow}>
            <div className={`grid items-center gap-8 md:grid-cols-2 md:gap-16 ${i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""}`}>
              <div className="text-center md:text-left">
                <p className="flex items-center justify-center md:justify-start gap-3 text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
                  <span className="font-display text-[16px] not-italic text-[var(--gold)] tracking-normal">{c.roman}</span>
                  <span className="h-px w-8 bg-[var(--gold)]/40" />
                  {c.eyebrow}
                  {"dev" in c && c.dev && <>{devPill}</>}
                </p>
                <h2 className="mt-3 font-display text-[28px] leading-[1.1] tracking-tight text-white md:text-4xl lg:text-5xl">
                  {c.title}
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-white/70 md:text-lg">
                  {c.body}
                </p>
                <div className="flex justify-center md:justify-start">{c.cta}</div>
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
    <section aria-label="Recent paw lamps" className="relative px-0 pt-8 md:pt-12">
      <div className="mx-auto max-w-md px-5 md:max-w-[1200px] md:px-8">
        <Reveal>
          <h2 className="text-center font-display text-[28px] leading-[1.1] tracking-tight text-white md:text-5xl">
            Strangers light paw lamps for pets they never met.
          </h2>
          <p className="mt-4 text-center text-[15px] leading-relaxed text-white/65 md:text-lg">
            Every small light is a pet who was deeply loved.
          </p>
        </Reveal>
        <div className="mt-10 flex items-baseline justify-between">
          <p className="text-[11px] uppercase tracking-[0.28em] text-amber-200/70">Paw lamps burning</p>
          {!loading && weekCount > 0 && (
            <p className="text-[11px] text-white/50">{weekCount} lit this week</p>
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
                  <p className="mt-2 line-clamp-2 text-[12px] leading-snug text-white/70">{c.message?.trim() || "✨"}</p>
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
            <p className="mt-4 font-display text-[17px] text-white">The sky is just beginning. Light one of the first paw lamps.</p>
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
          <div className="absolute left-1/2 bottom-[10%] -translate-x-1/2 vigil-dog-torso" style={{ transformOrigin: "bottom center" }}>
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
          <Link to="/create" className="link-gold">
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

/* ────────── Grief belonging section ────────── */

function GriefBelongingSection() {
  const cards = [
    {
      Icon: PawLamp as ComponentType<{ size?: number; className?: string }>,
      title: "Express it",
      body: "Light a paw lamp, write to them, keep a private journal only you can read.",
    },
    {
      Icon: Users,
      title: "Belong somewhere",
      body: "A community who won't say 'it was just a dog' — because for them, it never was.",
    },
    {
      Icon: BookOpen,
      title: "Be guided",
      body: "Gentle guidance for the first night, telling children, guilt, and anniversaries.",
    },
  ];
  return (
    <section className="relative px-5 py-16 md:px-8 md:py-24">
      <Reveal className="mx-auto max-w-3xl text-center">
        <p className="text-[11px] uppercase tracking-[0.32em] text-amber-200/70">
          The grief no one prepares you for
        </p>
        <h2 className="mt-3 font-display text-[28px] leading-[1.15] tracking-tight text-white md:text-[42px]">
          This love was real. So the loss is real grief — even if the world calls it small.
        </h2>
        <div className="mx-auto mt-6 max-w-2xl space-y-4 text-left text-[15px] leading-relaxed text-white/70 md:text-[17px]">
          <p>
            Grief researchers call this <span className="italic">disenfranchised grief</span> — a loss that is
            profound to you but unacknowledged by others. People expect you "over it" in a matter of days.
            You feel like you have to apologise for still crying.
          </p>
          <p>
            Grief held alone hardens. Grief spoken aloud to people who understand softens. That's why
            this place exists — a small ritual to give the love somewhere to go, and a community that
            already knows what you're carrying.
          </p>
        </div>
      </Reveal>

      <div className="mx-auto mt-10 grid max-w-md gap-4 md:mt-14 md:max-w-[1100px] md:grid-cols-3 md:gap-6">
        {cards.map((c) => (
          <Reveal key={c.title}>
            <div className="flex h-full flex-col items-start rounded-2xl bg-white/[0.04] p-6 ring-1 ring-white/10">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.06] text-[var(--gold)]">
                <c.Icon size={22} className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-[20px] text-white">{c.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-white/65">{c.body}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link to="/create/memorial" className="btn-gold ios-tappable">
          Write a memorial
        </Link>
        <Link
          to="/community"
          className="inline-flex items-center rounded-full border border-white/20 px-6 py-3 text-[14px] font-medium text-white/85 hover:border-white/40 hover:bg-white/5"
        >
          Join the community
        </Link>
        <Link to="/grief-support" className="link-gold">
          or find grief support →
        </Link>
      </div>
      <Divider />
    </section>
  );
}

/* ────────── Marketplace rails ────────── */

type IconType = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;

type RailCard = {
  key: string;
  title: string;
  desc: string;
  Icon: IconType;
  highlight?: boolean;
};

const CARE_CARDS: RailCard[] = [
  { key: "adoption", title: "Adoption", desc: "Give a waiting companion a home. Verified shelters & rescues.", Icon: Home, highlight: true },
  { key: "donate", title: "Donate to care", desc: "Fund a shelter, or help a person who can't afford care for their pet.", Icon: Heart, highlight: true },
  { key: "strays", title: "Tag a stray", desc: "Map and tag neighbourhood strays so the community can watch over them.", Icon: MapPin, highlight: true },
  { key: "vets", title: "Vets", desc: "Vetted local vets, second opinions, gentle care.", Icon: Stethoscope },
  { key: "whisperer", title: "Pet whisperer", desc: "Behaviour help, training, and quiet communication.", Icon: Feather },
];

const MARKET_CARDS: RailCard[] = [
  { key: "food", title: "Healthy food", desc: "Only genuinely wholesome, non-junk nutrition.", Icon: Utensils },
  { key: "apparel", title: "Apparel", desc: "Small-batch clothing and accessories for both of you.", Icon: Shirt },
  { key: "insurance", title: "Insurance", desc: "Honest, jargon-free pet insurance.", Icon: Shield },
  { key: "funeral", title: "Funeral services", desc: "Cremation, home burial, and after-care.", Icon: Cross },
  { key: "birthdays", title: "Birthdays", desc: "Celebrate the days they came into the world.", Icon: Cake },
  { key: "keepsakes", title: "Keepsakes", desc: "Handmade paw prints, portraits, and memorabilia.", Icon: Gift },
  { key: "training", title: "Enrichment", desc: "Play, puzzles, and gentle brain-work for a full life.", Icon: Sparkles },
  { key: "wellbeing", title: "Wellbeing", desc: "Supplements, recovery, and everyday care.", Icon: PawPrint },
];

function CareRail() {
  return (
    <RailSection
      title="Care, honour & good karma"
      subtitle="Not everything here is for sale. Some things are just kind — and they come first."
      kicker={
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-emerald-200">
          <HandHeart className="h-3 w-3" /> Non-commercial first
        </span>
      }
      cards={CARE_CARDS}
      section="kind"
    />
  );
}

function MarketplaceRail() {
  return (
    <RailSection
      title="For the life you share"
      subtitle="One day, everything they need — chosen with the same care you'd choose it."
      kicker={
        <span className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white/70">
          Marketplace
        </span>
      }
      cards={MARKET_CARDS}
      section="marketplace"
    />
  );
}

function RailSection({
  title,
  subtitle,
  kicker,
  cards,
  section,
}: {
  title: string;
  subtitle?: string;
  kicker: ReactNode;
  cards: RailCard[];
  section: string;
}) {
  return (
    <section className="relative px-0 py-10 md:py-14">
      <div className="mx-auto max-w-md px-5 md:max-w-[1200px] md:px-8">
        <Reveal>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-[22px] leading-tight tracking-tight text-white md:text-[30px]">
              {title}
            </h2>
            {kicker}
          </div>
          {subtitle && (
            <p className="mt-2 max-w-[60ch] text-[13.5px] leading-relaxed text-white/55">
              {subtitle}
            </p>
          )}
        </Reveal>
      </div>

      <div
        className="mx-auto mt-5 max-w-[1400px] overflow-x-auto px-5 py-4 md:px-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        <ul className="flex snap-x snap-mandatory gap-4 pr-5 md:pr-8">
          {cards.map((c) => (
            <li key={c.key} className="snap-start">
              <RailCardView card={c} section={section} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function RailCardView({ card, section }: { card: RailCard; section: string }) {
  const { title, desc, Icon, highlight } = card;

  const outerBg = highlight
    ? "linear-gradient(160deg, rgba(143,199,158,.4), rgba(143,199,158,.05) 42%, transparent)"
    : "linear-gradient(160deg, rgba(255,255,255,.14), rgba(255,255,255,.02) 40%, transparent)";
  const innerBg = highlight
    ? "linear-gradient(165deg,#152a20,#0e1c16 62%,#0b1611)"
    : "linear-gradient(165deg,#151f36,#0b1024 62%,#0a0f20)";
  const iconBg = highlight
    ? "radial-gradient(circle at 40% 35%, rgba(143,199,158,.28), rgba(143,199,158,.06))"
    : "radial-gradient(circle at 40% 35%, rgba(232,185,109,.22), rgba(232,185,109,.05))";
  const iconShadow = highlight
    ? "inset 0 0 0 1px rgba(143,199,158,.4), 0 0 22px -8px rgba(143,199,158,.55)"
    : "inset 0 0 0 1px rgba(232,185,109,.28), 0 0 22px -8px rgba(232,185,109,.5)";
  const iconStroke = highlight ? "#8FC79E" : "#E8B96D";

  return (
    <div
      className="w-[248px] shrink-0 rounded-[20px] p-px transition duration-[400ms] hover:-translate-y-1"
      style={{ background: outerBg }}
    >
      <div
        className="relative flex h-full flex-col overflow-hidden rounded-[19px] px-[22px] pb-[22px] pt-6"
        style={{ background: innerBg }}
      >
        {/* faint cosmic stars */}
        <span className="pointer-events-none absolute right-4 top-3 h-[2px] w-[2px] rounded-full bg-white/40" />
        <span className="pointer-events-none absolute right-9 top-6 h-[2px] w-[2px] rounded-full bg-white/40" />
        <span className="pointer-events-none absolute right-6 top-10 h-[2px] w-[2px] rounded-full bg-white/40" />

        {highlight && (
          <span
            className="pointer-events-none absolute z-10 font-medium uppercase"
            style={{
              top: 14,
              right: -30,
              padding: "3px 34px",
              background: "rgba(143,199,158,.9)",
              color: "#0b1611",
              transform: "rotate(45deg)",
              fontSize: 8,
              letterSpacing: "0.16em",
            }}
          >
            Kind
          </span>
        )}

        <div
          className="mb-5 flex h-[52px] w-[52px] items-center justify-center rounded-[14px]"
          style={{ background: iconBg, boxShadow: iconShadow }}
        >
          <Icon width={24} height={24} strokeWidth={1.5} style={{ stroke: iconStroke }} />
        </div>

        <h3 className="font-display text-[22px] leading-tight text-white">{title}</h3>
        <p
          className="mt-2 flex-1 text-[13px] text-white/55"
          style={{ lineHeight: 1.62, minHeight: 62 }}
        >
          {desc}
        </p>

        <div className="mt-5">
          <WaitlistDialog
            itemName={title}
            section={section}
            trigger={
              <button
                type="button"
                className="notify-btn flex w-full items-center justify-center gap-2 rounded-[12px] px-3 py-3 text-[11px] font-medium uppercase transition"
                style={
                  highlight
                    ? {
                        border: "1px solid rgba(143,199,158,.5)",
                        background: "rgba(143,199,158,.1)",
                        color: "#BEE3C8",
                        letterSpacing: "0.22em",
                      }
                    : {
                        border: "1px solid rgba(232,185,109,.2)",
                        background: "rgba(232,185,109,.06)",
                        color: "#E8B96D",
                        letterSpacing: "0.22em",
                      }
                }
              >
                <Bell size={18} strokeWidth={1.5} />
                Notify me
              </button>
            }
          />
        </div>
      </div>
    </div>
  );
}




/* ────────── World Toggle + Panes + Dawn ────────── */

function WorldToggle({ mode, setMode, reduced }: { mode: WorldMode; setMode: (m: WorldMode) => void; reduced: boolean }) {
  const isLife = mode === "life";
  return (
    <div className="relative z-30 mx-auto flex w-full max-w-md flex-col items-center px-5 pt-5 md:max-w-2xl md:pt-6">
      <div
        role="tablist"
        aria-label="Choose a world"
        className="relative inline-flex rounded-full p-1 shadow-[0_2px_16px_-8px_rgba(0,0,0,0.5)]"
        style={{
          background: isLife ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.05)",
          border: `1px solid ${isLife ? "rgba(168,100,28,0.28)" : "rgba(232,185,109,0.28)"}`,
          backdropFilter: "blur(10px)",
        }}
      >
        {/* Sliding indicator */}
        <span
          aria-hidden
          className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full"
          style={{
            transform: isLife ? "translateX(100%)" : "translateX(0%)",
            transition: reduced ? "none" : "transform 0.55s cubic-bezier(.4,0,.2,1), background 0.55s ease",
            background: isLife
              ? "linear-gradient(180deg,#E7C79A,#C9852F)"
              : "linear-gradient(180deg,#F6D9A0,#E8B96D)",
            boxShadow: "0 6px 18px -8px rgba(232,185,109,0.6)",
          }}
        />
        {[
          { key: "memory" as const, label: "Their memory", shortLabel: "Memory", Icon: Moon },
          { key: "life" as const, label: "Their life", shortLabel: "Life", Icon: Heart },
        ].map(({ key, label, shortLabel, Icon }) => {
          const active = mode === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setMode(key)}
              className="relative z-[1] inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[11.5px] font-medium transition md:gap-2 md:px-4 md:py-2 md:text-[13px]"
              style={{
                color: active
                  ? isLife ? "#1a1200" : "#1a1200"
                  : isLife ? "rgba(58,44,28,0.7)" : "rgba(242,236,221,0.7)",
              }}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={2} />
              <span className="md:hidden">{shortLabel}</span>
              <span className="hidden md:inline">{label}</span>
            </button>
          );
        })}
      </div>
      <p
        className="mt-3 text-center font-display italic text-[13px] md:text-[14px]"
        style={{ color: isLife ? "rgba(58,44,28,0.7)" : "rgba(242,236,221,0.65)" }}
      >
        {isLife
          ? "An ecosystem for the ones still by our side"
          : "A sanctuary for the ones we've lost"}
      </p>
    </div>
  );
}

function WorldPane({ active, reduced, children }: { active: boolean; reduced: boolean; children: ReactNode }) {
  if (reduced) {
    return active ? <div>{children}</div> : null;
  }
  return (
    <div
      aria-hidden={!active}
      style={{
        display: active ? "block" : "none",
        opacity: active ? 1 : 0,
        transform: active ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 0.8s ease, transform 0.8s ease",
      }}
    >
      {children}
    </div>
  );
}

function DawnBg({ mode, reduced }: { mode: WorldMode; reduced: boolean }) {
  const active = mode === "life";
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden
      style={{
        opacity: active ? 1 : 0,
        transition: reduced ? "none" : "opacity 1.1s ease",
      }}
    >
      {/* Warm haze base */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, rgba(255,220,150,0.55), rgba(244,233,216,0.0) 62%)",
        }}
      />
      {/* Sun glow */}
      <div
        className="absolute left-1/2 top-[-160px] h-[520px] w-[520px] -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: "rgba(255,220,150,0.5)" }}
      />
      {/* Soft petal dots */}
      {!reduced &&
        Array.from({ length: 10 }).map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              width: 5, height: 5,
              left: `${(i * 91) % 100}%`,
              top: `${(i * 53) % 100}%`,
              background: "rgba(200,140,80,0.35)",
              filter: "blur(1px)",
              animation: `dawnDrift ${18 + i * 2}s linear ${i * -3}s infinite`,
            }}
          />
        ))}
      <style>{`@keyframes dawnDrift { 0% { transform: translate(0,0);} 50% { transform: translate(20px,-16px);} 100% { transform: translate(0,0);} }`}</style>
    </div>
  );
}

/* ────────── LIFE WORLD ────────── */

type LifeTile = { key: string; title: string; body: string; Icon: IconType; kind?: boolean; source?: string; cover?: string; coverAlt?: string };

const LIFE_TILES: LifeTile[] = [
  { key: "pet-profiles", title: "Pet profiles", body: "Every companion in one place — their records, milestones, and people.", Icon: PawPrint, source: "life-pet-profiles" },
  { key: "health", title: "Health & reminders", body: "Vaccinations, vet visits, insurance, grooming — tracked, with gentle nudges so nothing slips.", Icon: CalendarClock, source: "life-health" },
  { key: "services", title: "Services near you", body: "Trusted vets, groomers, walkers, sitters and boarding — booked without the chaos.", Icon: Stethoscope, source: "life-services", cover: lifeServicesImg, coverAlt: "A calm veterinary moment — gentle hands examining a relaxed golden dog" },
  { key: "food", title: "Food & essentials", body: "Genuinely wholesome nutrition and gear — no junk brands, no clutter.", Icon: ShoppingBag, source: "life-food" },
  { key: "lifestyle", title: "Lifestyle & celebrations", body: "Birthdays, gotcha-days, playdates and outings — the joy, organised.", Icon: Cake, source: "life-lifestyle", cover: lifeLifestyleImg, coverAlt: "A small joyful birthday moment for a dog with a paper hat and a bowl of treats" },
  { key: "community", title: "Community feed", body: "Share the wins and the mess with people who get it. Ask anything.", Icon: MessagesSquare },
  { key: "adoption", title: "Adoption & shelters", body: "Give a waiting companion a home. Verified rescues — non-commercial, always first.", Icon: Home, kind: true, source: "life-adoption", cover: lifeAdoptionImg, coverAlt: "A hopeful shelter dog looking up through kennel bars into warm light" },
  { key: "stray", title: "Tag a stray", body: "Map neighbourhood strays so the whole community can watch over them.", Icon: MapPin, kind: true, source: "life-stray" },
  { key: "donate", title: "Donate to care", body: "Fund a shelter, or help someone who can't afford care for the pet they love.", Icon: HandHeart, kind: true, source: "life-donate" },
];

function LifeWorld({ onDev }: { onDev: (source: string) => void }) {
  return (
    <div style={{ color: "var(--w-ink)" }}>
      {/* Hero */}
      <section className="relative px-5 pb-12 pt-8 text-center md:px-8 md:pb-20 md:pt-14">
        <div className="mx-auto max-w-md md:max-w-2xl">
          <p className="font-display italic text-[15px] leading-[1.4] md:text-[18px]" style={{ color: "var(--w-accent)" }}>
            From their first day to long after their last.
          </p>
          <p className="mt-3 text-[11px] uppercase tracking-[0.32em]" style={{ color: "var(--w-accent)" }}>
            In living joy · and in loving memory
          </p>
          <h1 className="mt-4 font-display leading-[1.08] tracking-tight" style={{ color: "var(--w-ink)", fontSize: "clamp(26px, 7.4vw, 64px)" }}>
            Every good day, <span className="italic" style={{ color: "var(--w-accent)" }}>looked after</span>.
          </h1>
          <p className="mx-auto mt-5 max-w-[30ch] font-display italic text-[16px] leading-[1.55] md:max-w-none md:text-[20px]" style={{ color: "var(--w-muted)" }}>
            One home for their whole life with you.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <Link
              to="/create"
              className="inline-flex w-full max-w-[300px] items-center justify-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold shadow-[0_10px_28px_-12px_rgba(168,100,28,0.6)] hover:brightness-105 md:w-auto md:max-w-none"
              style={{ background: "linear-gradient(180deg,#E7C79A,#C9852F)", color: "#231604" }}
            >
              <PawPrint className="h-4 w-4" strokeWidth={2} />
              Add your pet
            </Link>
            <Link to="/community" className="text-[14px] font-medium underline-offset-4 hover:underline" style={{ color: "var(--w-accent)" }}>
              Explore the community →
            </Link>
          </div>
        </div>

        {/* Painterly hero image */}
        <div className="mx-auto mt-10 w-full max-w-[900px] md:mt-12">
          <div
            className="relative overflow-hidden rounded-[24px]"
            style={{
              aspectRatio: "4 / 3",
              border: "1px solid var(--w-hair)",
              boxShadow: "0 24px 60px -30px rgba(58,44,28,0.35)",
            }}
          >
            <img
              src={lifeHeroImg}
              alt="A person tenderly holding a golden retriever's face while a tabby cat weaves around them at dawn"
              className="h-full w-full object-cover md:[aspect-ratio:16/10]"
              style={{ aspectRatio: "inherit" }}
              width={1440}
              height={912}
              loading="lazy"
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
              style={{ background: "linear-gradient(180deg, rgba(244,233,216,0) 0%, rgba(244,233,216,0.85) 100%)" }}
            />
          </div>
        </div>
      </section>

      {/* Explainer */}
      <section className="relative px-5 py-14 text-center md:px-8">
        <div className="mx-auto max-w-[720px]">
          <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em]" style={{ color: "var(--w-accent)" }}>
            <Heart className="h-3.5 w-3.5" /> Their life
          </p>
          <p className="mt-4 font-display italic text-[20px] leading-[1.4] md:text-[27px]" style={{ color: "var(--w-ink)" }}>
            The half of RememFur for right now — the whole living, breathing companionship you share every day.
          </p>
          <p className="mt-5 text-[15px] leading-relaxed md:text-[16px]" style={{ color: "var(--w-muted)" }}>
            Every pet — dog, cat, bird, rabbit, any beloved creature — gets a living profile and a whole ecosystem around it. Health tracked and reminded: vaccinations, vet visits, insurance, grooming. Services you can trust, nearby: vets, groomers, walkers, sitters. A lifestyle worth celebrating: birthdays, gotcha-days, outings, playdates. A community that gets it. And the kind things always first — adoption, shelters, strays, and helping owners in need.
          </p>
        </div>
      </section>

      {/* Tiles */}
      <section className="relative px-5 py-10 md:px-8 md:py-14">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-center font-display leading-tight tracking-tight" style={{ color: "var(--w-ink)", fontSize: "clamp(22px, 5.5vw, 38px)" }}>
            An ecosystem for the life you share
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-[14px] leading-relaxed md:text-[15px]" style={{ color: "var(--w-muted)" }}>
            Health, milestones, community and everything they need — bright, simple, and always at hand.
          </p>
          <ul className="mt-10 grid gap-3 md:grid-cols-3 md:gap-6">
            {LIFE_TILES.map((t) => (
              <li key={t.key}>
                <LifeTileCard tile={t} onDev={onDev} />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function LifeTileCard({ tile, onDev }: { tile: LifeTile; onDev: (source: string) => void }) {
  const { title, body, Icon, kind, source } = tile;
  const isDev = !!source;
  const stroke = kind ? "var(--w-kind)" : "var(--w-accent)";
  const borderGrad = kind
    ? "linear-gradient(160deg, rgba(92,154,110,.5), rgba(92,154,110,.05) 42%, transparent)"
    : "linear-gradient(160deg, rgba(168,100,28,.35), rgba(168,100,28,.05) 42%, transparent)";
  const innerBg = kind
    ? "linear-gradient(165deg,#FFFDF7,#EFEDDF 62%,#E6E5D2)"
    : "linear-gradient(165deg,#FFFDF7,#F6ECD8 62%,#F0E1C1)";
  const iconBg = kind
    ? "radial-gradient(circle at 40% 35%, rgba(92,154,110,.22), rgba(92,154,110,.05))"
    : "radial-gradient(circle at 40% 35%, rgba(168,100,28,.22), rgba(168,100,28,.04))";
  const iconShadow = kind
    ? "inset 0 0 0 1px rgba(92,154,110,.4), 0 0 22px -8px rgba(92,154,110,.55)"
    : "inset 0 0 0 1px rgba(168,100,28,.35), 0 0 22px -8px rgba(168,100,28,.5)";

  const inner = (
    <div className="rounded-[19px] p-[18px] md:p-6" style={{ background: innerBg }}>
      <div className="flex items-start justify-between gap-3">
        <div
          className="flex h-[52px] w-[52px] items-center justify-center rounded-[14px]"
          style={{ background: iconBg, boxShadow: iconShadow }}
        >
          <Icon width={24} height={24} strokeWidth={1.5} style={{ stroke: stroke as string }} />
        </div>
        {isDev && (
          <span className="inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-2 py-[3px] text-[9px] font-medium uppercase tracking-[0.2em]" style={{ borderColor: "rgba(58,44,28,0.25)", color: "rgba(58,44,28,0.6)" }}>
            In development
          </span>
        )}
      </div>
      <h3 className="mt-5 font-display text-[22px] leading-tight" style={{ color: "var(--w-ink)" }}>
        {title}
      </h3>
      <p className="mt-2 text-[13px] md:text-[13.5px]" style={{ lineHeight: 1.62, color: "var(--w-muted)" }}>
        {body}
      </p>
    </div>
  );

  const wrapperStyle: CSSProperties = {
    background: borderGrad,
    padding: 1,
    borderRadius: 20,
  };

  if (isDev) {
    return (
      <button
        type="button"
        onClick={() => onDev(source!)}
        className="block w-full text-left transition duration-300 hover:-translate-y-1"
        style={wrapperStyle}
      >
        {inner}
      </button>
    );
  }
  return (
    <Link
      to="/community"
      className="block transition duration-300 hover:-translate-y-1"
      style={wrapperStyle}
    >
      {inner}
    </Link>
  );
}

/* ────────── BRIDGE + BETA BAND ────────── */

function Bridge() {
  return (
    <section className="relative px-[18px] py-14 md:px-8 md:py-20">
      <div
        className="relative mx-auto max-w-[900px] overflow-hidden rounded-[20px] p-6 text-center md:p-10"
        style={{
          background: "linear-gradient(160deg, rgba(232,185,109,0.08), rgba(232,185,109,0.02))",
          border: "1px solid var(--w-hair)",
        }}
      >
        {/* Painterly sky background */}
        <img
          src={bridgeSkyImg}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          style={{ opacity: 0.28 }}
          width={1600}
          height={704}
          loading="lazy"
        />
        {/* Legibility scrim (adapts per world via w-bg) */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--w-bg) 55%, transparent) 0%, color-mix(in srgb, var(--w-bg) 78%, transparent) 100%)",
          }}
        />
        <div className="relative">
          <p className="text-[11px] uppercase tracking-[0.3em]" style={{ color: "var(--w-accent)" }}>
            The two are one
          </p>
          <h3 className="mt-3 font-display leading-[1.2] tracking-tight" style={{ color: "var(--w-ink)", fontSize: "clamp(22px, 5.5vw, 32px)" }}>
            A pet never leaves. They only move from one sky to another.
          </h3>
          <p className="mx-auto mt-5 max-w-[62ch] text-[14.5px] leading-relaxed md:text-[16px]" style={{ color: "var(--w-muted)" }}>
            When the hardest day comes, a living pet's profile becomes their memorial — their whole life, every birthday and photo and milestone, carried gently across. The same love, in both seasons. This is the only place that holds all of it.
          </p>
        </div>
      </div>
    </section>
  );
}

function BetaBand({ onOpen }: { onOpen: () => void }) {
  return (
    <section className="relative px-[18px] py-12 md:px-8 md:py-20">
      <div
        className="mx-auto flex max-w-[900px] flex-col items-center rounded-[20px] p-6 text-center md:p-12"
        style={{
          background: "linear-gradient(150deg,#12182b,#0a0e1c 70%)",
          border: "1px solid rgba(232,185,109,0.28)",
          color: "#F2ECDD",
        }}
      >
        <span
          className="inline-flex items-center gap-2 rounded-full border border-[rgba(232,185,109,0.4)] bg-white/[0.03] px-3 py-1 text-[10.5px] font-medium uppercase tracking-[0.22em] text-[#E8B96D]"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E8B96D] opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#E8B96D]" />
          </span>
          Invitation-only beta · limited seats
        </span>
        <h3 className="mt-5 font-display leading-[1.15] tracking-tight text-white" style={{ fontSize: "clamp(22px, 5.6vw, 36px)" }}>
          Be one of the first through the door.
        </h3>
        <p className="mt-4 max-w-[60ch] text-[14.5px] leading-relaxed text-white/70 md:text-[16px]">
          RememFur is opening quietly, to a small circle of early companions who'll help shape it. Request your invitation — we're letting people in a few at a time.
        </p>
        <button
          type="button"
          onClick={onOpen}
          className="mt-7 inline-flex w-full max-w-[320px] items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#F6D9A0] to-[#E8B96D] px-6 py-3 text-[14px] font-semibold text-[#1a1200] shadow-[0_10px_28px_-12px_rgba(232,185,109,0.6)] hover:brightness-105 md:w-auto md:max-w-none"
        >
          <Sparkles className="h-4 w-4" />
          Request an invitation
        </button>
        <p className="mt-4 text-[11.5px] text-white/45">
          No spam. Just a note when a seat opens for you.
        </p>
      </div>
    </section>
  );
}

/* ────────── Plaques for dev chapters ────────── */

function PlaqueLastLetter() {
  return (
    <div className="w-full max-w-[340px]">
      <Plaque>
        <div className="rounded-md bg-[#0a1024] p-5 ring-1 ring-white/10">
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/50">A sealed letter</p>
          <p className="mt-3 font-hand text-[22px] leading-snug text-[var(--gold)]">
            There are things I didn't get to say.
          </p>
          <div className="mt-4 space-y-2">
            <div className="hw-line w-11/12" />
            <div className="hw-line w-10/12" />
            <div className="hw-line w-9/12" />
            <div className="hw-line w-6/12" />
          </div>
          <p className="mt-5 flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-amber-200/60">
            <Mail className="h-3 w-3" /> Sealed with love
          </p>
        </div>
      </Plaque>
    </div>
  );
}

function PlaquePawtrait() {
  return (
    <div className="w-full max-w-[340px]">
      <Plaque>
        <div className="flex flex-col items-center py-4">
          <div
            className="overflow-hidden rounded-xl border border-[var(--gold)]/40"
            style={{
              width: "100%",
              maxWidth: 260,
              height: 120,
              boxShadow: "inset 0 0 20px rgba(212,179,120,0.12), 0 0 30px -10px rgba(212,179,120,0.35)",
            }}
          >
            <img
              src={pawtraitPreviewImg}
              alt="An open illustrated storybook of a dog through the seasons in warm lamplight"
              className="h-full w-full object-cover"
              width={1024}
              height={768}
              loading="lazy"
            />
          </div>
          <p className="mt-5 font-display italic text-[15px] text-white/75">
            "Once upon a good boy…"
          </p>
          <p className="mt-2 text-[11px] uppercase tracking-[0.26em] text-amber-200/60">
            An illustrated storybook, of them
          </p>
        </div>
      </Plaque>
    </div>
  );
}

