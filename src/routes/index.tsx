import { createFileRoute, Link } from "@tanstack/react-router";
import { Flame } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/use-auth";
import { SiteHeader } from "@/components/site/SiteHeader";
import { CandleDialog } from "@/components/site/CandleDialog";
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
          src="/app.html"
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
            When a pet dies, the world expects you to move on quickly. But you know what they were. Not "just a dog." Not "just a cat." Seventeen years of coming home to someone.
          </p>
          <p className="mt-5 text-[15px] leading-relaxed text-white/70 md:text-xl">
            All that love doesn't disappear. It just needs a place.
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
              title="Say their name."
              body="Tell us who they were — a name, a photo, a few words. Or just a name. That's enough."
            />
            <StepCard
              title="Light their candle."
              body="One flame, burning in a sky beside thousands of others. Theirs."
            />
            <StepCard
              title="Return anytime."
              body="Their light stays. Come back on the hard days — the birthdays, the anniversaries, the quiet Tuesdays."
            />
          </div>
          <p className="mt-10 text-center text-[12px] uppercase tracking-[0.25em] text-white/45">
            No account needed. It takes about a minute.
          </p>
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
        style={{ paddingBottom: "calc(120px + env(safe-area-inset-bottom))" }}
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

function StepCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-white/[0.04] p-6 text-center ring-1 ring-white/10 md:p-8">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--gold3)] text-[var(--gold)]">
        <Flame className="h-4 w-4" strokeWidth={2} />
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
