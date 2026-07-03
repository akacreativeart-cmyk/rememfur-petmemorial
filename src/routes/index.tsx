import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, PhoneCall, Users, BookOpen, Flame, Sparkles } from "lucide-react";
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
      { title: "rememfur — a gentle place for pet grief" },
      { name: "description", content: "A gentle pet memorial for the love that stays. Light a candle, share a memory, and find grief support." },
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

  return (
    <div className="min-h-screen bg-[#05070f] text-white">
      <SiteHeader />

      {/* Hero — the iframe scene. CTAs live inside the scene so nothing floats over content below. */}
      <div
        className="relative w-full overflow-hidden bg-[#090d1a]"
        style={{ height: "calc(100dvh - 54px - 72px - env(safe-area-inset-top) - env(safe-area-inset-bottom))" }}
      >
        <iframe
          src="/app.html"
          title="rememfur"
          className="h-full w-full border-0"
          style={{ background: "#090d1a" }}
        />
      </div>

      {/* Quiet candle affordance directly below the hero — no floating panel. */}
      <div className="mx-auto flex max-w-md items-center justify-center gap-2 px-5 pt-5 text-[12px] uppercase tracking-[0.28em] text-white/70">
        {featured.data ? (
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
                className="inline-flex items-center gap-1.5 underline-offset-4 hover:text-amber-100 hover:underline focus:outline-none"
              >
                <Flame className="h-3.5 w-3.5" strokeWidth={2} />
                or light a candle
              </button>
            }
          />
        ) : (
          <Link to="/garden" className="inline-flex items-center gap-1.5 underline-offset-4 hover:text-amber-100 hover:underline">
            <Flame className="h-3.5 w-3.5" strokeWidth={2} />
            or light a candle
          </Link>
        )}
      </div>

      {/* Live candle strip */}
      <CandleStrip
        candles={recent.data ?? []}
        weekCount={weekly.data?.count ?? 0}
        loading={recent.isLoading}
      />

      {/* About the idea */}
      <section
        aria-labelledby="idea-heading"
        className="relative bg-gradient-to-b from-[#05070f] to-[#0a0e1f] px-5 pt-16 pb-10"
      >
        <div className="mx-auto max-w-md">
          <p className="text-center text-[11px] uppercase tracking-[0.28em] text-amber-200/70">
            What rememfur is
          </p>
          <h2
            id="idea-heading"
            className="mt-3 text-center font-display text-[30px] leading-[1.1] tracking-tight text-white"
          >
            A quiet home for the love that outlives them
          </h2>
          <p className="mt-4 text-center text-[15px] leading-relaxed text-white/70">
            Rememfur is a sanctuary for pet parents — a place to build a beautiful memorial, gather with others who understand, and find real grief support when the ache comes back.
          </p>

          <div className="mt-8 grid gap-3">
            <IdeaCard n="01" title="Build a memorial that feels like them" body="Photos, their story, and the little details only you know — a keepsake gravestone, a painted portrait if you like — all kept somewhere safe." />
            <IdeaCard n="02" title="Light a candle, leave a note" body="Anyone can light a candle on any memorial. Watch them flicker for 24 hours across a shared Wall of Light. No login needed to give kindness." />
            <IdeaCard n="03" title="Sit with a community that gets it" body="Share the good days and the hard nights. Read stories from others who loved and lost. Send a paw, a candle, a comment." />
            <IdeaCard n="04" title="Grief support, adoption, medical, memorabilia" body="Helplines and counsellors, shelters for when you're ready, vet resources for the road, and keepsakes made with care." />
          </div>
        </div>
      </section>

      {/* Grief support section */}
      <section
        aria-labelledby="grief-heading"
        className="relative bg-gradient-to-b from-[#05070f] via-[#0a0e1f] to-[#05070f] px-5 pt-14"
        style={{ paddingBottom: "calc(120px + env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto max-w-md">
          <p className="text-center text-[11px] uppercase tracking-[0.28em] text-amber-200/70">You are not alone</p>
          <h2 id="grief-heading" className="mt-3 text-center font-display text-[30px] leading-[1.1] tracking-tight text-white">
            Grief support, whenever it finds you
          </h2>
          <p className="mt-3 text-center text-[15px] leading-relaxed text-white/65">
            The love doesn't end — and neither does the ache. These small doorways are here for the hard nights and the quiet mornings.
          </p>

          {/* Helpline card */}
          <div className="mt-8 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-200/15 text-amber-200">
                <PhoneCall className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <h3 className="font-display text-lg text-white">Talk to someone tonight</h3>
                <p className="text-[12px] text-white/55">Free, confidential pet-loss support lines</p>
              </div>
            </div>
            <ul className="mt-4 divide-y divide-white/5 text-[14px]">
              <li className="flex items-center justify-between py-2.5">
                <span className="text-white/80">ASPCA Pet Loss (US)</span>
                <a href="tel:+18774743310" className="font-medium text-amber-200 hover:text-amber-100">
                  877-474-3310
                </a>
              </li>
              <li className="flex items-center justify-between py-2.5">
                <span className="text-white/80">Blue Cross Pet Bereavement (UK)</span>
                <a href="tel:+448000966606" className="font-medium text-amber-200 hover:text-amber-100">
                  0800 096 6606
                </a>
              </li>
              <li className="flex items-center justify-between py-2.5">
                <span className="text-white/80">Lap of Love (24/7, US)</span>
                <a href="tel:+18559335683" className="font-medium text-amber-200 hover:text-amber-100">
                  855-933-5683
                </a>
              </li>
            </ul>
          </div>

          {/* Ways to feel held */}
          <div className="mt-6 grid gap-3">
            <SupportCard to="/grief-support" icon={Heart} title="Ways to feel held" body="Rituals, journaling prompts, and gentle guides for the first days, the first month, and the year that follows." />
            <SupportCard to="/community" icon={Users} title="A community that understands" body="Read stories from others who loved and lost. Leave a candle, a note, a small kindness." />
            <SupportCard to="/resources" icon={BookOpen} title="Reading & resources" body="Books for children, guides for anticipatory grief, and articles from grief counsellors." />
            <SupportCard to="/adoption" icon={Sparkles} title="When you're ready — not before" body="Adoption stories and shelters, for the day (however far away) you're ready to love again." />
          </div>

          {/* Coping — gentle guidance */}
          <div className="mt-10">
            <h3 className="text-center font-display text-[22px] leading-tight text-white">Small things that help</h3>
            <p className="mt-2 text-center text-[13px] text-white/55">
              Gentle practices, taken from grief counsellors and pet parents who've walked this road.
            </p>
            <div className="mt-5 space-y-3">
              <CopingItem title="Name what you feel">Sadness, guilt, anger, relief — all of it belongs. Write one sentence tonight: "Right now I feel…"</CopingItem>
              <CopingItem title="Keep a small ritual">Light a candle at the same time each evening. Say their name out loud. Rituals give grief a shape.</CopingItem>
              <CopingItem title="Tell one story">Post a memory here, or tell one person today. Grief that is spoken is grief that is shared.</CopingItem>
              <CopingItem title="Let the body grieve too">Walk their old route. Drink water. Sleep when you can. The body carries what words can't.</CopingItem>
              <CopingItem title="Be careful with the 'shoulds'">You don't have to be over it by any date. Grief isn't linear and it isn't a project to finish.</CopingItem>
            </div>
          </div>

          {/* What people ask */}
          <div className="mt-10">
            <h3 className="text-center font-display text-[22px] leading-tight text-white">What people quietly wonder</h3>
            <div className="mt-5 space-y-3">
              <FaqItem q="Is it silly to grieve a pet this much?">No. You are grieving a daily witness to your life — someone who greeted you, slept beside you, needed you. The size of the love decides the size of the loss.</FaqItem>
              <FaqItem q="When will it stop hurting?">It softens. It doesn't disappear, and it isn't meant to. The ache becomes a quieter companion that means you loved well.</FaqItem>
              <FaqItem q="Should I get another pet?">Only when it feels like welcoming, not replacing. There is no right timeline — for some it's weeks, for others years. Both are okay.</FaqItem>
              <FaqItem q="What do I do with their things?">Keep what comforts you, donate what would help another animal, and don't rush. Grief has its own pace with objects too.</FaqItem>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-white/10 bg-black/30 p-5 text-center">
            <p className="font-serif italic text-[15px] leading-relaxed text-white/70">"Grief is just love with no place to go."</p>
            <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-white/40">— Jamie Anderson</p>
          </div>

          <div className="mt-8 flex flex-col items-center gap-3">
            <Link
              to={user ? "/create" : "/signup"}
              search={user ? undefined : ({ redirect: "/create" } as never)}
              className="ios-tappable inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-[15px] font-semibold text-neutral-900 hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05070f]"
            >
              Create a memorial
            </Link>
            {!user && (
              <p className="text-[12px] text-white/50">
                Free — takes about a minute. Sign in to save your memorial.
              </p>
            )}
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
      className="relative bg-gradient-to-b from-[#05070f] to-[#05070f] px-0 pt-10"
    >
      <div className="mx-auto max-w-md px-5">
        <div className="flex items-baseline justify-between">
          <p className="text-[11px] uppercase tracking-[0.28em] text-amber-200/70">
            Candles burning
          </p>
          <p className="text-[11px] text-white/50">
            {loading ? "…" : `${weekCount} candles lit this week`}
          </p>
        </div>
      </div>

      {enough ? (
        <div className="mt-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
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
        <div className="mx-auto mt-4 max-w-md px-5">
          <div className="flex flex-col items-center rounded-2xl bg-white/[0.03] p-6 text-center ring-1 ring-white/10">
            <span className="hero-candle scale-90" aria-hidden>
              <span className="flame" />
            </span>
            <p className="mt-3 font-display text-[17px] text-white">
              The first candles are waiting to be lit.
            </p>
            <p className="mt-1 text-[13px] text-white/55">
              Light one for a friend — no account needed.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function SupportCard({ to, icon: Icon, title, body }: { to: string; icon: any; title: string; body: string }) {
  return (
    <Link
      to={to}
      className="group flex gap-4 rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10 transition hover:bg-white/[0.07]"
    >
      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-amber-200">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <span className="flex-1">
        <span className="block font-display text-[17px] leading-tight text-white">{title}</span>
        <span className="mt-1 block text-[13.5px] leading-relaxed text-white/60">{body}</span>
      </span>
    </Link>
  );
}

function IdeaCard({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="flex gap-4 rounded-2xl bg-white/[0.04] p-5 ring-1 ring-white/10">
      <span className="font-display text-[22px] leading-none text-amber-200/80">{n}</span>
      <div className="flex-1">
        <h3 className="font-display text-[17px] leading-tight text-white">{title}</h3>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-white/60">{body}</p>
      </div>
    </div>
  );
}

function CopingItem({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10">
      <p className="font-display text-[15px] text-white">{title}</p>
      <p className="mt-1 text-[13.5px] leading-relaxed text-white/60">{children}</p>
    </div>
  );
}

function FaqItem({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10 open:bg-white/[0.05]">
      <summary className="cursor-pointer list-none font-display text-[15px] text-white marker:hidden">
        <span className="mr-2 text-amber-200/70 transition group-open:rotate-45 inline-block">+</span>
        {q}
      </summary>
      <p className="mt-2 pl-6 text-[13.5px] leading-relaxed text-white/65">{children}</p>
    </details>
  );
}
