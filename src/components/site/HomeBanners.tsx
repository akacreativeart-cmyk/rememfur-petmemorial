import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { getConstellation } from "@/lib/constellations";
import pet1 from "@/assets/pet-1.jpg";
import pet2 from "@/assets/pet-2.jpg";
import pet3 from "@/assets/pet-3.jpg";
import pet4 from "@/assets/pet-4.jpg";
import heroEditorial from "@/assets/memorial-editorial-hero.jpg";

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
};

export const HOME_BANNERS: HomeBanner[] = [
  {
    id: "write",
    eyebrow: "Begin gently",
    title: "Give them a page that stays.",
    body: "A photo, a name, a few words. Their memorial is ready in minutes.",
    cta: { label: "Write a memorial", to: "/create/memorial" },
    image: pet1,
    caption: "Forever our good boy",
  },
  {
    id: "sky",
    eyebrow: "Their sky",
    title: "Every pet becomes a star.",
    body: "Each memorial is placed in the season's constellation — a light you can find again.",
    cta: { label: "Visit the garden", to: "/garden" },
    image: pet2,
    caption: "Shining somewhere tonight",
  },
  {
    id: "together",
    eyebrow: "You're not alone",
    title: "Light a paw lamp for a friend.",
    body: "Anyone can leave a small warm light on a memorial — no account needed.",
    cta: { label: "See the community", to: "/community" },
    image: pet3,
    caption: "Loved by everyone",
  },
];

const ROTATE_MS = 6500;

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
      className="px-5 py-10 md:px-8 md:py-14"
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
                <Link to={b.cta.to} tabIndex={idx === i ? 0 : -1} className="btn-gold ios-tappable mt-6 inline-flex">
                  {b.cta.label}
                </Link>
              </div>
              <div className="order-1 flex justify-center md:order-2">
                <Polaroid src={b.image} caption={b.caption} tilt={idx % 2 ? 3 : -3} />
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

export function Polaroid({ src, caption, tilt = 0, className = "" }: { src: string; caption: string; tilt?: number; className?: string }) {
  return (
    <figure
      className={`w-[200px] rounded-[4px] bg-[#fffdf8] p-3 pb-4 shadow-[0_18px_40px_-18px_rgba(44,36,34,0.55)] md:w-[240px] ${className}`}
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <img src={src} alt={caption} loading="lazy" className="aspect-square w-full object-cover" />
      <figcaption className="mt-3 text-center font-hand text-xl leading-none text-[#2C2422]">{caption}</figcaption>
    </figure>
  );
}

/** Polaroids hanging beneath the season's constellation. */
export function PolaroidSky() {
  const c = getConstellation(new Date());
  const pics = [
    { src: pet1, caption: "Biscuit ✦", tilt: -6 },
    { src: pet2, caption: "Luna", tilt: 4 },
    { src: pet4, caption: "Our Max", tilt: -2 },
    { src: heroEditorial, caption: "Sunny days", tilt: 6 },
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
              <Polaroid src={p.src} caption={p.caption} tilt={p.tilt} className="!w-[150px] md:!w-[200px]" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
