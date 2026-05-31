import { ReactNode } from "react";

type Polaroid = { img: string; caption?: string; rotate?: number };

interface PageHeroProps {
  eyebrow: string;
  title: string;
  intro?: ReactNode;
  /** A short handwritten label tucked under the title — sets the storybook mood. */
  handwritten?: string;
  /** 1–3 small polaroid photos pinned to the hero, like memories on a wall. */
  polaroids?: Polaroid[];
  children?: ReactNode;
}

/**
 * Unified hero for every page — a torn page from the memory book.
 * Warm paper backdrop, a handwritten chapter mark, optional pinned polaroids.
 */
export function PageHero({ eyebrow, title, intro, handwritten, polaroids, children }: PageHeroProps) {
  return (
    <section className="relative mb-10 overflow-hidden rounded-[2rem] border border-border/60 memory-wall px-6 py-10 md:px-10 md:py-14">
      {/* corner tape strips for the storybook feel */}
      <span aria-hidden className="tape absolute -top-2 left-8 -rotate-6" />
      <span aria-hidden className="tape absolute -top-2 right-10 rotate-3" />

      <div className="relative z-10 max-w-2xl">
        <div className="font-hand text-lg text-[var(--terracotta)]">{eyebrow}</div>
        <h1 className="mt-2 font-display text-4xl leading-[1.05] text-foreground md:text-5xl">{title}</h1>
        {handwritten && (
          <p className="mt-3 font-hand text-2xl text-[var(--cta)]">{handwritten}</p>
        )}
        {intro && <p className="mt-4 max-w-xl text-muted-foreground">{intro}</p>}
        {children && <div className="mt-6">{children}</div>}
      </div>

      {polaroids && polaroids.length > 0 && (
        <div className="pointer-events-none absolute inset-0 hidden md:block">
          {polaroids.slice(0, 3).map((p, i) => {
            const positions = [
              "right-6 top-6 rotate-[4deg] w-40",
              "right-32 bottom-4 -rotate-[6deg] w-36",
              "right-56 top-12 rotate-[-2deg] w-32",
            ];
            const rot = p.rotate !== undefined ? { transform: `rotate(${p.rotate}deg)` } : undefined;
            return (
              <figure
                key={i}
                className={`polaroid absolute ${positions[i]}`}
                style={rot}
              >
                <img src={p.img} alt={p.caption ?? ""} className="aspect-square w-full object-cover" loading="lazy" />
                {p.caption && (
                  <figcaption className="mt-2 text-center font-hand text-base text-[var(--ink)]">
                    {p.caption}
                  </figcaption>
                )}
              </figure>
            );
          })}
        </div>
      )}
    </section>
  );
}
