import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { getConstellation } from "@/lib/constellations";
import tulipPhoto from "@/assets/polaroid-tulip.jpg.asset.json";
import gingerCatPhoto from "@/assets/polaroid-ginger-cat.jpg.asset.json";
import dogCatPhoto from "@/assets/polaroid-dog-cat.jpg.asset.json";
import beaglePhoto from "@/assets/polaroid-beagle.jpg.asset.json";
import colliePhoto from "@/assets/polaroid-collie.jpg.asset.json";
import samoyedPhoto from "@/assets/polaroid-samoyed.jpg.asset.json";
import grassDogPhoto from "@/assets/polaroid-grass-dog.jpg.asset.json";
import candlesPhoto from "@/assets/memorial-candles.jpg.asset.json";

/**
 * Rotating homepage banners. Add, remove or reorder entries here to change
 * what appears in the banner space on the homepage.
 */
export type HomeBanner = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  cta: { label: string; to: string };
  image: string;
  caption: string;
  note?: string;
};

export const HOME_BANNERS: HomeBanner[] = [
  {
    id: "write",
    eyebrow: "For the one who waited by the door",
    title: "They loved you every single day. Let the world know.",
    body: "A photo, their name, a few words from your heart. Their memorial is ready in minutes — and it stays forever.",
    cta: { label: "Write a memorial", to: "/create/memorial" },
    image: tulipPhoto.url,
    caption: "Forever our good boy",
    note: "you waited by the door, always",
  },
  {
    id: "sky",
    eyebrow: "Look up tonight",
    title: "They're not gone. They're shining.",
    body: "Every memorial becomes a star in the season's constellation — a light you can always find again.",
    cta: { label: "Visit the garden", to: "/garden" },
    image: gingerCatPhoto.url,
    caption: "Shining somewhere tonight",
    note: "look up — I see you",
  },
  {
    id: "together",
    eyebrow: "You're not alone in this",
    title: "Someone, somewhere, is missing them too.",
    body: "Light a candle on a stranger's memorial. A small warm light that says: I understand.",
    cta: { label: "See the community", to: "/community" },
    image: dogCatPhoto.url,
    caption: "Loved by everyone",
    note: "never alone, not once",
  },
  {
    id: "letter",
    eyebrow: "The words you never got to say",
    title: "Write them one last letter.",
    body: "Thank them for the walks, the warmth, the way they always knew. Say goodbye — or simply, see you later.",
    cta: { label: "Write a memorial", to: "/create/memorial" },
    image: beaglePhoto.url,
    caption: "Thank you, Biscuit",
  },
  {
    id: "forever",
    eyebrow: "Love doesn't end",
    title: "Paw prints fade from the floor, never from the heart.",
    body: "Keep every photo, story and silly habit in one gentle place your whole family can visit.",
    cta: { label: "Begin their page", to: "/create/memorial" },
    image: grassDogPhoto.url,
    caption: "Running free",
  },
];

const ROTATE_MS = 4500;

export function HomeBanners() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = HOME_BANNERS.length;

  useEffect(() => {
    if (paused || n < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => {
      if (!document.hidden) setI((v) => (v + 1) % n);
    }, ROTATE_MS);
    return () => window.clearInterval(t);
  }, [paused, n]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Rememfur highlights"
      className="px-4 py-8 md:px-8 md:py-14"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="mx-auto max-w-[1100px] overflow-hidden rounded-[28px] border border-[var(--w-hair)] bg-[var(--w-card,#fff)] soft-shadow">
        <div className="relative">
          {HOME_BANNERS.map((b, idx) => (
            <div
              key={b.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${idx + 1} of ${n}`}
              aria-hidden={idx !== i}
              className={`grid items-center gap-6 p-6 transition-opacity duration-700 md:grid-cols-[1.1fr_0.9fr] md:gap-10 md:p-10 ${
                idx === i ? "relative opacity-100" : "pointer-events-none absolute inset-0 opacity-0"
              }`}
            >
              <div className="order-2 text-center md:order-1 md:text-left">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--w-accent)]">{b.eyebrow}</p>
                <h2 className="mt-3 font-display text-3xl leading-tight text-[var(--w-ink)] md:text-5xl">{b.title}</h2>
                <p className="mt-4 text-base leading-relaxed text-[var(--w-muted)] md:text-lg">{b.body}</p>
                <Link to={b.cta.to} tabIndex={idx === i ? 0 : -1} className="link-gold mt-6 inline-flex">
                  {b.cta.label}
                </Link>
              </div>
              <div className="order-1 flex justify-center md:order-2">
                <Polaroid src={b.image} caption={b.caption} note={b.note} tilt={idx % 2 ? 3 : -3} candle />
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-2 pb-5">
          {HOME_BANNERS.map((b, idx) => (
            <button
              key={b.id}
              type="button"
              aria-label={`Show banner ${idx + 1}`}
              aria-current={idx === i}
              onClick={() => setI(idx)}
              className={`h-2 rounded-full transition-all ${idx === i ? "w-6 bg-[var(--w-accent)]" : "w-2 bg-[var(--w-hair)]"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/** Classic polaroid: ivory card, wide chin, handwritten note in dark ink. */
export function Polaroid({ src, caption, note, tilt = 0, className = "", candle = false }: { src: string; caption: string; note?: string; tilt?: number; className?: string; candle?: boolean }) {
  return (
    <figure
      className={`relative rounded-[3px] bg-[#FBF7EE] p-3 pb-4 shadow-[0_22px_45px_-18px_rgba(0,0,0,0.6),0_2px_0_rgba(0,0,0,0.04)] ${candle ? "w-[78vw] max-w-[300px] md:w-[340px] md:max-w-none" : "w-[210px] md:w-[250px]"} ${className}`}
      style={{ transform: `rotate(${tilt * 0.6}deg)` }}
    >
      {/* push pin */}
      <span aria-hidden className="absolute left-1/2 top-[-9px] z-10 h-5 w-5 -translate-x-1/2 rounded-full shadow-[0_3px_4px_rgba(0,0,0,0.45)]" style={{ background: "radial-gradient(circle at 35% 30%, #f3a3a3, #b3262f 55%, #6e1118)" }} />
      <img src={src} alt={caption} loading="lazy" className="aspect-square w-full rounded-[2px] object-cover" />
      <figcaption className="mt-3 text-center leading-tight text-[#2a1e14]">
        <span className="block font-hand text-[26px] -rotate-2" style={{ color: "#1d2a4a" }}>{caption}</span>
        {note && <span className="mt-1 block font-hand text-[19px] rotate-1" style={{ color: "#2b3a5e" }}>{note}</span>}
      </figcaption>
      {candle && (
        <img
          src={candlesPhoto.url}
          alt="Lit memorial candles"
          loading="lazy"
          className="absolute -bottom-4 -left-16 h-24 w-24 rounded-full border-4 border-[#FBF7EE] object-cover shadow-lg md:h-28 md:w-28"
        />
      )}
    </figure>
  );
}

/** Polaroids hanging beneath the season's constellation. */
export function PolaroidSky() {
  const c = getConstellation(new Date());
  const pics = [
    { src: beaglePhoto.url, caption: "Biscuit ✦", note: "my sunshine", tilt: -6 },
    { src: colliePhoto.url, caption: "Luna", note: "goodnight, sweet girl", tilt: 4 },
    { src: samoyedPhoto.url, caption: "Our Max", note: "best friend forever", tilt: -2 },
    { src: grassDogPhoto.url, caption: "Sunny days", note: "run free, love", tilt: 6 },
  ];
  return (
    <section className="dark-scene relative overflow-hidden bg-[#0b1024] px-5 py-16 text-center md:px-8 md:py-24" aria-label="Polaroids under their sky">
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="pointer-events-none absolute left-1/2 top-6 h-[220px] w-[220px] -translate-x-1/2 opacity-90 md:h-[300px] md:w-[300px]" aria-hidden>
        {c.lines.map(([a, b], k) => (
          <line key={k} x1={c.stars[a][0]} y1={c.stars[a][1]} x2={c.stars[b][0]} y2={c.stars[b][1]} stroke="#E8B96D" strokeOpacity="0.55" strokeWidth="0.35" />
        ))}
        {c.stars.map(([x, y, r], k) => (
          <circle key={k} cx={x} cy={y} r={r * 0.7} fill="#FFF3D6" />
        ))}
      </svg>
      <div className="relative mx-auto max-w-[1100px] pt-[200px] md:pt-[260px]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E8B96D]">Tonight: {c.name}</p>
        <h2 className="mt-3 font-display text-3xl leading-tight text-[#FBF7F2] md:text-5xl">Their photos, beneath their stars.</h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-[#E9DED4] md:text-lg">Every memorial keeps its polaroids under the constellation of the season they're remembered in.</p>
        <div className="mt-10 grid grid-cols-2 justify-items-center gap-6 md:grid-cols-4">
          {pics.map((p) => (
            <div key={p.caption} className="flex flex-col items-center">
              <span className="h-8 w-px bg-[#E8B96D]/50" aria-hidden />
              <Polaroid src={p.src} caption={p.caption} note={p.note} tilt={p.tilt} className="!w-[150px] md:!w-[200px]" />
            </div>
          ))}
        </div>
        <div className="mx-auto mt-12 max-w-[720px] overflow-hidden rounded-[18px] border border-[#E8B96D]/30 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)]">
          <img src={candlesPhoto.url} alt="Three lit memorial candles on a wooden table" loading="lazy" className="h-48 w-full object-cover md:h-64" />
        </div>
      </div>
    </section>
  );
}
