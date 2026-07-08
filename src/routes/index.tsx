import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, Flame, Image as ImageIcon, Flower2, BookOpen, Users, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
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
      { title: "RememFur — Light a candle for the pet you loved." },
      { name: "description", content: "A quiet place to remember them. Say their name, light their candle, keep them close. No account needed." },
    ],
  }),
});

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
  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}

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

  const primaryCandle = featured.data ? (
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
          className="ios-tappable inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-[15px] font-semibold text-neutral-900 hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05070f]"
        >
          Light a candle 🕯️
        </button>
      }
    />
  ) : (
    <Link
      to="/garden"
      className="ios-tappable inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-[15px] font-semibold text-neutral-900 hover:bg-white/90"
    >
      Light a candle 🕯️
    </Link>
  );

  return (
    <div className="min-h-screen bg-[#05070f] text-white">
      <IntroSequence />
      <SiteHeader />

      {/* 1. OPENING SCENE — native CSS */}
      <HeroScene primaryCandle={primaryCandle} />

      {/* 2. STORY BEAT */}
      <section className="relative bg-gradient-to-b from-[#05070f] to-[#0a0e1f] px-5 py-20 text-center md:px-8 md:py-28">
        <Reveal className="mx-auto max-w-3xl">
          <p className="font-display italic text-[22px] leading-[1.35] text-[#f5e6c8]/90 md:text-[32px] lg:text-[36px]">
            They were not <span className="not-italic">"just a dog."</span> Not <span className="not-italic">"just a cat."</span> They were seventeen years of coming home to someone.
          </p>
          <p className="mt-6 font-display text-[20px] leading-[1.4] text-white/70 md:text-[28px]">
            All that love doesn't disappear. It just needs a place.
          </p>
        </Reveal>
      </section>

      {/* 3. FEATURE CHAPTERS */}
      <FeatureChapters />

      {/* 4. HOW IT WORKS */}
      <section className="relative bg-gradient-to-b from-[#0a0e1f] to-[#05070f] px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-md md:max-w-[1200px]">
          <Reveal>
            <h2 className="text-center font-display text-[28px] leading-[1.1] tracking-tight text-white md:text-4xl lg:text-5xl">
              How it works
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-6 md:mt-14 md:grid-cols-3 md:gap-8">
            <Reveal><StepCard icon={ImageIcon} title="Create their memorial." body="A name, a photo, a few words about who they were. It takes about a minute." /></Reveal>
            <Reveal><StepCard icon={Share2} title="Share it with people who loved them." body="Send the link to family and friends. They can visit, leave a candle, add a memory." /></Reveal>
            <Reveal><StepCard icon={Flame} title="Candles keep their flame alive." body="Anyone — you, strangers, people who understand — can light a candle. Their light stays." /></Reveal>
          </div>
          <p className="mt-10 text-center text-[12px] uppercase tracking-[0.25em] text-white/45">
            No account needed. It takes about a minute.
          </p>
        </div>
      </section>

      {/* 5. LIVE PROOF — real data only */}
      <CandleStrip
        candles={recent.data ?? []}
        weekCount={weekly.data?.count ?? 0}
        loading={recent.isLoading}
      />

      {/* 6. FAQ */}
      <section className="relative bg-gradient-to-b from-[#05070f] to-[#0a0e1f] px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-md md:max-w-3xl">
          <Reveal>
            <h2 className="text-center font-display text-[28px] leading-[1.1] tracking-tight text-white md:text-4xl">
              Gentle answers
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-3 md:mt-10">
            <FaqItem q="Is it free?" a="Yes. Creating a memorial, lighting a candle, and visiting the garden are all free." />
            <FaqItem q="Do I need an account to light a candle?" a="No. You can light a candle for any pet without signing up. An account is only needed if you want to create your own memorial or keep a journal." />
            <FaqItem q="Can I keep a memorial private?" a="Yes. You can keep a memorial just for you, share it only with a link, or let it live in the garden — your choice, and you can change it anytime." />
            <FaqItem q="Can I add more photos later?" a="Yes. You can return anytime to add photos, edit their story, or update anything about their memorial." />
            <FaqItem q="What happens to candles after 24 hours?" a="The flame rests, but the count remains. Every candle ever lit is remembered — and anyone can light a new one, any day." />
            <FaqItem q="Can I take a memorial down?" a="Yes. You control your memorials completely, and you can quietly take one down whenever you need to." />
          </div>
        </div>
      </section>

      {/* 7. CLOSING */}
      <section className="relative bg-[#05070f] px-5 py-16 text-center md:px-8 md:py-24">
        <Reveal className="mx-auto max-w-md md:max-w-2xl">
          <h2 className="font-display text-[28px] leading-[1.1] tracking-tight text-white md:text-4xl">
            They mattered. They still do.
          </h2>
          <div className="mt-8">{primaryCandle}</div>
          <p className="mt-6 text-[14px] leading-relaxed text-white/60 md:text-base">
            It takes a minute. It stays forever.
          </p>
        </Reveal>
      </section>

      <div className="bg-[#05070f] pb-[calc(72px+env(safe-area-inset-bottom))] md:pb-6">
        <SiteFooter />
      </div>
    </div>
  );
}

function HeroScene({ primaryCandle }: { primaryCandle: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      className="home-hero relative flex w-full items-end justify-center"
      style={{ minHeight: "calc(100dvh - 54px - env(safe-area-inset-top))" }}
      aria-label="A candle beneath a quiet sky"
    >
      <div className="stars" aria-hidden />
      <div className="stars2" aria-hidden />
      <div className="stars3" aria-hidden />
      <div className="hero-glow" aria-hidden />

      {/* Candle */}
      <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-[14%] md:bottom-[12%]">
        <span className="hero-candle" aria-hidden>
          <span className="flame" />
        </span>
      </div>

      {/* Story + CTAs */}
      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center px-5 pb-[26%] pt-24 text-center md:max-w-2xl md:pb-[22%] md:pt-32">
        <p className="rise-in font-display text-[18px] leading-[1.4] text-white/75 md:text-[22px]" style={{ animationDelay: "0.2s" }}>
          The house is quieter now.
        </p>
        <p className="rise-in mt-3 font-display text-[18px] leading-[1.4] text-white/75 md:text-[22px]" style={{ animationDelay: "1.4s" }}>
          The bowl is still by the door.
        </p>
        <p className="rise-in mt-3 font-display text-[18px] leading-[1.4] text-[#f5e6c8]/90 md:text-[22px]" style={{ animationDelay: "2.6s" }}>
          The love — the love is still everywhere.
        </p>

        <h1 className="rise-in mt-8 font-display text-[30px] leading-[1.05] tracking-tight text-white md:text-5xl lg:text-6xl" style={{ animationDelay: "4.0s" }}>
          Grief is just love with nowhere to go.
        </h1>
        <p className="rise-in mt-2 font-display italic text-[24px] leading-[1.1] text-[var(--gold)] md:text-4xl lg:text-5xl" style={{ animationDelay: "4.8s" }}>
          Now it has somewhere.
        </p>

        <div className="rise-in mt-8 flex flex-col items-center gap-3" style={{ animationDelay: "5.8s" }}>
          {primaryCandle}
          <Link to="/create" className="text-[13px] text-white/60 underline-offset-4 hover:text-white/90 hover:underline">
            Create their memorial
          </Link>
        </div>
      </div>

      {/* Scroll cue */}
      <div
        aria-hidden
        className={`pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 transition-opacity duration-500 ${scrolled ? "opacity-0" : "opacity-100"}`}
      >
        <ChevronDown className="scroll-cue h-5 w-5 text-white/60" />
      </div>
    </section>
  );
}

function FeatureChapters() {
  const chapters: Array<{
    eyebrow: string;
    title: string;
    body: ReactNode;
    cta?: { to: string; label: string };
    visual: ReactNode;
    icon: LucideIcon;
  }> = [
    {
      eyebrow: "Their memorial",
      title: "A page that stays.",
      body: "Photos, their story, the details only you knew — a place their name can live.",
      cta: { to: "/create", label: "Begin their memorial" },
      visual: <VignetteMemorial />,
      icon: ImageIcon,
    },
    {
      eyebrow: "Candles",
      title: "Anyone can light one. No account. No noise.",
      body: "Each burns on the Wall of Light for 24 hours. The count stays forever.",
      visual: <VignetteCandles />,
      icon: Flame,
    },
    {
      eyebrow: "The Garden",
      title: "Walk among everyone's companions.",
      body: "Light a candle for a stranger's pet. Someone may light one for yours.",
      cta: { to: "/garden", label: "Visit the garden" },
      visual: <VignetteGarden />,
      icon: Flower2,
    },
    {
      eyebrow: "The Journal",
      title: "For the words you're not ready to say out loud.",
      body: "Private. Only yours. Written when the house is at its quietest.",
      visual: <VignetteJournal />,
      icon: BookOpen,
    },
    {
      eyebrow: "The Feed",
      title: "People who understand.",
      body: "Memories shared by others who know this exact ache.",
      cta: { to: "/community", label: "See the feed" },
      visual: <VignetteFeed />,
      icon: Users,
    },
    {
      eyebrow: "Grief support",
      title: "This grief is real. You're not overreacting.",
      body: (
        <>
          Resources for the first night, for children, for anyone. Free pet-loss support lines:{" "}
          <a href="tel:+18774743310" className="text-white/80 hover:text-white">ASPCA 877-474-3310</a>
          {" · "}
          <a href="tel:+18559335683" className="text-white/80 hover:text-white">Lap of Love 855-933-5683</a>.
        </>
      ),
      cta: { to: "/grief-support", label: "Grief support" },
      visual: <VignetteSupport />,
      icon: Sparkles,
    },
  ];

  return (
    <section className="relative bg-gradient-to-b from-[#0a0e1f] via-[#05070f] to-[#0a0e1f] px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-md md:max-w-[1100px] space-y-20 md:space-y-28">
        {chapters.map((c, i) => (
          <Reveal key={c.eyebrow}>
            <div className={`grid items-center gap-8 md:grid-cols-2 md:gap-16 ${i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""}`}>
              <div>
                <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-amber-200/70">
                  <c.icon className="h-3.5 w-3.5" strokeWidth={2} />
                  {c.eyebrow}
                </p>
                <h3 className="mt-3 font-display text-[26px] leading-[1.1] tracking-tight text-white md:text-4xl">
                  {c.title}
                </h3>
                <p className="mt-4 text-[15px] leading-relaxed text-white/65 md:text-lg">
                  {c.body}
                </p>
                {c.cta && (
                  <Link
                    to={c.cta.to}
                    className="mt-6 inline-flex items-center text-[15px] font-medium text-amber-200 hover:text-amber-100"
                  >
                    {c.cta.label} →
                  </Link>
                )}
              </div>
              <div className="flex justify-center">{c.visual}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------- CSS vignettes (no images) ---------- */

function VignetteFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative aspect-[4/5] w-full max-w-[320px] overflow-hidden rounded-3xl bg-gradient-to-b from-[#0f1428] to-[#070a15] ring-1 ring-white/10 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)]">
      {children}
    </div>
  );
}

function VignetteMemorial() {
  return (
    <VignetteFrame>
      <div className="absolute inset-0 flex flex-col items-center justify-end p-6">
        <div className="absolute inset-x-8 top-8 aspect-square rounded-2xl bg-gradient-to-br from-[#1d243d] to-[#0a0e1f] ring-1 ring-white/10" />
        <div className="relative mt-auto w-full text-center">
          <p className="font-display text-[20px] text-white">Their Name</p>
          <p className="mt-1 text-[12px] text-white/50">2008 — 2025</p>
          <p className="mt-3 text-[12px] italic text-white/60">"Always at the door."</p>
        </div>
      </div>
    </VignetteFrame>
  );
}

function VignetteCandles() {
  return (
    <VignetteFrame>
      <div className="absolute inset-0 flex items-end justify-center gap-6 pb-14">
        {[0, 1, 2].map((i) => (
          <span key={i} className="hero-candle scale-[0.7]" style={{ transform: `scale(0.7) translateY(${i === 1 ? -8 : 0}px)` }} aria-hidden>
            <span className="flame" style={{ animationDelay: `${i * 0.35}s`, animationDuration: `${1.1 + i * 0.15}s` }} />
          </span>
        ))}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
    </VignetteFrame>
  );
}

function VignetteGarden() {
  return (
    <VignetteFrame>
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(1.5px 1.5px at 20% 30%, rgba(255,240,210,0.9), transparent 60%), radial-gradient(1.5px 1.5px at 60% 55%, rgba(255,240,210,0.85), transparent 60%), radial-gradient(1.5px 1.5px at 80% 25%, rgba(255,240,210,0.85), transparent 60%), radial-gradient(1.5px 1.5px at 35% 75%, rgba(255,240,210,0.9), transparent 60%), radial-gradient(1.5px 1.5px at 75% 80%, rgba(255,240,210,0.8), transparent 60%)",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#070a15] to-transparent" />
        <p className="absolute inset-x-0 bottom-5 text-center font-display text-[13px] italic text-white/65">
          Every light is a life that was loved.
        </p>
      </div>
    </VignetteFrame>
  );
}

function VignetteJournal() {
  return (
    <VignetteFrame>
      <div className="absolute inset-0 p-6">
        <div className="h-full rounded-2xl bg-[#0b1024] p-5 ring-1 ring-white/10">
          <p className="font-display text-[13px] text-white/75">Tuesday, 2:14 am</p>
          <div className="mt-3 space-y-2">
            <div className="h-2 w-11/12 rounded-full bg-white/10" />
            <div className="h-2 w-9/12 rounded-full bg-white/10" />
            <div className="h-2 w-10/12 rounded-full bg-white/10" />
            <div className="h-2 w-6/12 rounded-full bg-white/10" />
          </div>
          <p className="mt-6 text-[11px] uppercase tracking-[0.24em] text-amber-200/60">Only you</p>
        </div>
      </div>
    </VignetteFrame>
  );
}

function VignetteFeed() {
  return (
    <VignetteFrame>
      <div className="absolute inset-0 space-y-3 p-5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-2xl bg-white/[0.05] p-3 ring-1 ring-white/10">
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-gradient-to-br from-amber-200/60 to-amber-500/30" />
              <div className="h-2 w-24 rounded-full bg-white/15" />
            </div>
            <div className="mt-2 space-y-1.5">
              <div className="h-2 w-11/12 rounded-full bg-white/10" />
              <div className="h-2 w-8/12 rounded-full bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    </VignetteFrame>
  );
}

function VignetteSupport() {
  return (
    <VignetteFrame>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
        <span className="flame-flicker">
          <Flame className="h-8 w-8" />
        </span>
        <p className="font-display text-[16px] leading-snug text-white/85">
          You don't have to carry this alone.
        </p>
        <div className="grid w-full gap-2 text-[12px] text-white/70">
          <div className="rounded-xl bg-white/[0.04] px-3 py-2 ring-1 ring-white/10">ASPCA · 877-474-3310</div>
          <div className="rounded-xl bg-white/[0.04] px-3 py-2 ring-1 ring-white/10">Lap of Love · 855-933-5683</div>
        </div>
      </div>
    </VignetteFrame>
  );
}

/* ---------- Live candle strip ---------- */

function CandleStrip({
  candles,
  weekCount,
  loading,
}: {
  candles: Array<{
    id: string;
    lit_by_name: string | null;
    message: string | null;
    pet_name: string | null;
    memorial_slug: string | null;
  }>;
  weekCount: number;
  loading: boolean;
}) {
  const enough = candles.length >= 3;
  return (
    <section
      aria-label="Recent candles"
      className="relative bg-gradient-to-b from-[#05070f] to-[#05070f] px-0 pt-16 md:pt-24"
    >
      <div className="mx-auto max-w-md px-5 md:max-w-[1200px] md:px-8">
        <Reveal>
          <h2 className="text-center font-display text-[28px] leading-[1.1] tracking-tight text-white md:text-4xl">
            Strangers light candles for pets they never met.
          </h2>
          <p className="mt-4 text-center text-[15px] leading-relaxed text-white/65 md:text-lg">
            Every flame is a pet who was deeply loved. Light one for someone else's companion, and someone may light one for yours.
          </p>
          <div className="mt-6 text-center">
            <Link
              to="/garden"
              className="ios-tappable inline-flex items-center justify-center rounded-full bg-white/10 px-6 py-2.5 text-[14px] font-medium text-white ring-1 ring-white/15 hover:bg-white/15"
            >
              See the sky
            </Link>
          </div>
        </Reveal>

        <div className="mt-10 flex items-baseline justify-between">
          <p className="text-[11px] uppercase tracking-[0.28em] text-amber-200/70">
            Candles burning
          </p>
          {!loading && weekCount > 0 && (
            <p className="text-[11px] text-white/50">
              {weekCount} candles lit this week
            </p>
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
                    <span className="hero-candle scale-[0.55]" aria-hidden>
                      <span className="flame" />
                    </span>
                    <span className="truncate font-display text-[14px] text-white">
                      {c.pet_name ?? "A friend"}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-[12px] leading-snug text-white/70">
                    {c.message?.trim() || "🕯️"}
                  </p>
                  <p className="mt-2 text-[10.5px] uppercase tracking-[0.18em] text-amber-200/70">
                    {c.lit_by_name ?? "A friend"}
                  </p>
                </div>
              );
              return (
                <li key={c.id}>
                  {c.memorial_slug ? (
                    <Link to="/memorial/$slug" params={{ slug: c.memorial_slug }}>
                      {inner}
                    </Link>
                  ) : (
                    inner
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="mx-auto mt-4 max-w-md px-5 md:max-w-[1200px] md:px-8">
          <div className="flex flex-col items-center rounded-2xl bg-white/[0.03] p-6 text-center ring-1 ring-white/10">
            <span className="hero-candle scale-90" aria-hidden>
              <span className="flame" />
            </span>
            <p className="mt-3 font-display text-[17px] text-white">
              The sky is just beginning. Light one of the first candles.
            </p>
            <p className="mt-1 text-[13px] text-white/55">
              No account needed.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function StepCard({ title, body, icon: Icon = Flame }: { title: string; body: string; icon?: LucideIcon }) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-white/[0.04] p-6 text-center ring-1 ring-white/10 md:p-8">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--gold3)] text-[var(--gold)]">
        <Icon className="h-4 w-4" strokeWidth={2} />
      </span>
      <h3 className="mt-4 font-display text-[20px] leading-tight text-white md:text-[22px]">{title}</h3>
      <p className="mt-2 text-[14px] leading-relaxed text-white/60">{body}</p>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-2xl bg-white/[0.04] p-5 ring-1 ring-white/10 open:bg-white/[0.06] md:p-6">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-[17px] text-white md:text-[18px]">
        {q}
        <span className="text-amber-200/70 transition group-open:rotate-45">+</span>
      </summary>
      <p className="mt-3 text-[14px] leading-relaxed text-white/65">{a}</p>
    </details>
  );
}
