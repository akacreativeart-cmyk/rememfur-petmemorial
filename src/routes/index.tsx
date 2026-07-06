import { createFileRoute, Link } from "@tanstack/react-router";
import { Flame, Share2, Sparkles, Image as ImageIcon, Flower2, BookOpen, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/use-auth";
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

function HomePage() {
  const { user } = useAuth();

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
      className="ios-tappable inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-[15px] font-semibold text-neutral-900 hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05070f]"
    >
      Light a candle 🕯️
    </Link>
  );

  return (
    <div className="min-h-screen bg-[#05070f] text-white">
      <SiteHeader />

      {/* Hero — the candle sky scene. */}
      <div
        className="relative w-full overflow-hidden bg-[#090d1a] md:h-[75vh] lg:h-[80vh]"
        style={{ height: "calc(100dvh - 54px - 72px - env(safe-area-inset-top) - env(safe-area-inset-bottom))" }}
      >
        <iframe
          src="/app.html?embed=1"
          title="rememfur"
          className="h-full w-full border-0"
          style={{ background: "#090d1a" }}
        />
      </div>

      {/* Hero copy — placed just below the sky so the candle stays first. */}
      <section className="relative bg-[#05070f] px-5 pt-10 pb-12 text-center md:px-8 md:pt-14 md:pb-16">
        <div className="mx-auto max-w-md md:max-w-2xl">
          <h1 className="font-display text-[32px] leading-[1.05] tracking-tight text-white md:text-5xl lg:text-6xl">
            <span className="block">Grief is just love with nowhere to go.</span>
            <span className="mt-1 block text-[var(--gold)] italic">Now it has somewhere.</span>
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-white/70 md:text-lg">
            Light a candle for the pet you loved. Say their name. Keep them close.
          </p>
          <div className="mt-7 flex flex-col items-center gap-3">
            {primaryCandle}
            <Link
              to="/garden"
              className="text-[13px] text-white/55 underline-offset-4 hover:text-white/80 hover:underline"
            >
              Visit the sky — see who's being remembered
            </Link>
          </div>
        </div>
      </section>

      {/* Empathy beat */}
      <section className="relative bg-gradient-to-b from-[#05070f] to-[#0a0e1f] px-5 py-16 text-center md:px-8 md:py-24">
        <div className="mx-auto max-w-md md:max-w-2xl">
          <p className="text-[15px] leading-relaxed text-white/70 md:text-xl">
            When a pet dies, the world expects you to move on quickly. But you know what they were. Not "just a dog." Not "just a cat." Seventeen years of coming home to someone. — All that love doesn't disappear. It just needs a place.
          </p>
        </div>
      </section>


      {/* How it works */}
      <section className="relative bg-gradient-to-b from-[#0a0e1f] to-[#05070f] px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-md md:max-w-[1200px]">
          <h2 className="text-center font-display text-[28px] leading-[1.1] tracking-tight text-white md:text-4xl lg:text-5xl">
            How it works
          </h2>
          <div className="mt-10 grid gap-6 md:mt-14 md:grid-cols-3 md:gap-8">
            <StepCard
              icon={ImageIcon}
              title="Create their memorial."
              body="A name, a photo, a few words about who they were. It takes about a minute."
            />
            <StepCard
              icon={Share2}
              title="Share it with people who loved them."
              body="Send the link to family and friends. They can visit, leave a candle, add a memory."
            />
            <StepCard
              icon={Flame}
              title="Candles keep their flame alive."
              body="Anyone — you, strangers, people who understand — can light a candle. Their light stays."
            />
          </div>
          <p className="mt-10 text-center text-[12px] uppercase tracking-[0.25em] text-white/45">
            No account needed. It takes about a minute.
          </p>
        </div>
      </section>

      {/* What lives here */}
      <section className="relative bg-gradient-to-b from-[#05070f] to-[#0a0e1f] px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-md md:max-w-[1200px]">
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.28em] text-amber-200/70">What lives here</p>
            <h2 className="mt-3 font-display text-[28px] leading-[1.1] tracking-tight text-white md:text-4xl lg:text-5xl">
              Small rooms for a big kind of love.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:mt-14 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
            <FeatureCard
              icon={ImageIcon}
              title="Memorials"
              body="A page that stays — photos, their story, the details only you know. Share it, or keep it just for you."
            />
            <FeatureCard
              icon={Flame}
              title="Candles"
              body="Anyone can light one, no account needed. Each candle burns on the Wall of Light for 24 hours; the count stays forever."
            />
            <FeatureCard
              icon={Flower2}
              title="The Garden"
              body="Walk quietly among everyone's companions. Light a candle for a stranger's pet — they might light one for yours."
              to="/garden"
            />
            <FeatureCard
              icon={BookOpen}
              title="The Journal"
              body="A private place for the words you're not ready to share. Only you can see what you write here."
            />
            <FeatureCard
              icon={Users}
              title="The Feed"
              body="Memories shared by people who understand. Photos, small stories, the good days and the hard ones."
              to="/community"
            />
            <FeatureCard
              icon={Sparkles}
              title="Grief Support"
              body="Gentle resources for the first night, for children, for anyone who just needs to hear that this grief is real."
              to="/grief-support"
            />
          </div>
        </div>
      </section>

      {/* Why we built this — quiet full-width */}
      <section className="relative bg-[#05070f] px-5 py-16 text-center md:px-8 md:py-24">
        <div className="mx-auto max-w-md md:max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.28em] text-amber-200/70">Why we built this</p>
          <p className="mt-6 text-[16px] leading-relaxed text-white/70 md:text-xl">
            Pet grief is real grief. When they go, the house gets quiet in a way nothing else can fix — and the world often expects you to be fine by Monday.
          </p>
          <p className="mt-4 text-[16px] leading-relaxed text-white/70 md:text-xl">
            We made RememFur because a life that mattered deserves a place that stays. Somewhere the love can go, whenever you need it.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative bg-gradient-to-b from-[#05070f] to-[#0a0e1f] px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-md md:max-w-3xl">
          <h2 className="text-center font-display text-[28px] leading-[1.1] tracking-tight text-white md:text-4xl">
            Gentle answers
          </h2>
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


      {/* The sky — live candle strip with social proof */}
      <CandleStrip
        candles={recent.data ?? []}
        weekCount={weekly.data?.count ?? 0}
        loading={recent.isLoading}
      />

      {/* Grief support */}
      <section className="relative bg-gradient-to-b from-[#05070f] via-[#0a0e1f] to-[#05070f] px-5 py-16 text-center md:px-8 md:py-24">
        <div className="mx-auto max-w-md md:max-w-2xl">
          <h2 className="font-display text-[28px] leading-[1.1] tracking-tight text-white md:text-4xl">
            You don't have to carry this alone.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-white/65 md:text-lg">
            Losing them hurts in ways people don't always understand. We've gathered gentle resources — for the first night, for explaining it to children, for elderly owners saying goodbye to a lifelong companion, and for anyone who just needs to hear that this grief is real.
          </p>
          <Link
            to="/grief-support"
            className="mt-6 inline-flex items-center text-[15px] font-medium text-amber-200 hover:text-amber-100"
          >
            Grief support →
          </Link>
          <p className="mt-8 text-[12px] text-white/40">
            Free pet-loss support lines:{" "}
            <a href="tel:+18774743310" className="text-white/60 hover:text-white">ASPCA 877-474-3310</a>
            {" "}·{" "}
            <a href="tel:+18559335683" className="text-white/60 hover:text-white">Lap of Love 855-933-5683</a>
          </p>
        </div>
      </section>

      {/* Closing */}
      <section
        className="relative bg-[#05070f] px-5 py-16 text-center md:px-8 md:py-24"
      >
        <div className="mx-auto max-w-md md:max-w-2xl">
          <h2 className="font-display text-[28px] leading-[1.1] tracking-tight text-white md:text-4xl">
            They mattered. They still do.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-white/65 md:text-lg">
            Give the love somewhere to go. It takes a minute. It stays forever.
          </p>
          <div className="mt-8">
            {primaryCandle}
          </div>
        </div>
      </section>

      <div className="bg-[#05070f] pb-[calc(72px+env(safe-area-inset-bottom))] md:pb-6">
        <SiteFooter />
      </div>
    </div>
  );
}


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
        <h2 className="text-center font-display text-[28px] leading-[1.1] tracking-tight text-white md:text-4xl">
          Strangers light candles for pets they never met.
        </h2>
        <p className="mt-4 text-center text-[15px] leading-relaxed text-white/65 md:text-lg">
          Every flame in this sky is a pet who was deeply loved — and behind each one, people who understand exactly how you feel. Light a candle for someone else's companion, and someone may light one for yours.
        </p>
        <div className="mt-6 text-center">
          <Link
            to="/garden"
            className="ios-tappable inline-flex items-center justify-center rounded-full bg-white/10 px-6 py-2.5 text-[14px] font-medium text-white ring-1 ring-white/15 hover:bg-white/15"
          >
            See the sky
          </Link>
        </div>

        <div className="mt-10 flex items-baseline justify-between">
          <p className="text-[11px] uppercase tracking-[0.28em] text-amber-200/70">
            Candles burning
          </p>
          <p className="text-[11px] text-white/50">
            {loading ? "…" : `${weekCount} candles lit this week`}
          </p>
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
      <h3 className="mt-4 font-display text-[20px] leading-tight text-white md:text-[22px]">
        {title}
      </h3>
      <p className="mt-2 text-[14px] leading-relaxed text-white/60">
        {body}
      </p>
    </div>
  );
}

function FeatureCard({ title, body, icon: Icon, to }: { title: string; body: string; icon: LucideIcon; to?: string }) {
  const inner = (
    <div className="flex h-full flex-col rounded-2xl bg-white/[0.04] p-6 ring-1 ring-white/10 transition hover:bg-white/[0.06] md:p-7">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--gold3)] text-[var(--gold)]">
        <Icon className="h-4 w-4" strokeWidth={2} />
      </span>
      <h3 className="mt-4 font-display text-[19px] leading-tight text-white md:text-[21px]">{title}</h3>
      <p className="mt-2 text-[14px] leading-relaxed text-white/60">{body}</p>
      {to && <span className="mt-4 text-[13px] font-medium text-amber-200/85">Visit →</span>}
    </div>
  );
  if (to) return <Link to={to}>{inner}</Link>;
  return inner;
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

