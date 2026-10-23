import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Info, LifeBuoy, Gift, Feather, Heart, Share2, Search } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { CandleDialog } from "@/components/site/CandleDialog";
import { IntroSequence } from "@/components/site/IntroSequence";
import { AuthGateDialog } from "@/components/site/AuthGateDialog";
import { PawLamp } from "@/components/site/PawLamp";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { listGardenMemorials } from "@/lib/memorials.functions";
import { countCandlesThisWeek } from "@/lib/candle-guest.functions";
import { leaveFlower } from "@/lib/tributes.functions";
import { shareOrCopy } from "@/lib/share";
import { useAuth } from "@/hooks/use-auth";
import { softHaptic } from "@/lib/haptic";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Rememfur — The Memorial Garden for the pets we loved" },
      { name: "description", content: "Wander a garden of pet memorials, light a paw lamp in their name, and share the love that has nowhere to go. A gentle place for the pet you loved." },
      { property: "og:title", content: "Rememfur — The Memorial Garden" },
      { property: "og:description", content: "A shared garden of pet memorials. Light a paw lamp, leave a gentle word, and remember together." },
      { property: "og:url", content: "https://rememfur.com/" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://rememfur.com/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Rememfur",
          url: "https://rememfur.com",
          description: "A memorial garden for the pets we loved.",
        }),
      },
    ],
  }),
});

const filters = [
  { key: "all", label: "All pets" },
  { key: "dog", label: "Dogs" },
  { key: "cat", label: "Cats" },
  { key: "other", label: "Others" },
];

type GardenMemorial = {
  id: string;
  slug: string;
  pet_name: string;
  species: string;
  birth_date: string | null;
  passing_date: string | null;
  epitaph: string | null;
  hero_image_url: string | null;
  transformed_image_url: string | null;
  candle_count: number;
};

/* ────────── Top banner: warm dawn with drifting light motes ────────── */

function GardenBanner({ lampsThisWeek }: { lampsThisWeek: number }) {
  const { user } = useAuth();
  return (
    <section className="garden-banner relative overflow-hidden border-b border-border">
      {/* drifting light motes — transform/opacity only, paused for reduced motion */}
      <div aria-hidden className="garden-motes">
        {Array.from({ length: 14 }).map((_, i) => (
          <span
            key={i}
            className="mote"
            style={{
              left: `${(i * 37) % 100}%`,
              animationDuration: `${9 + (i % 5) * 3}s`,
              animationDelay: `${-(i * 1.7)}s`,
              width: `${3 + (i % 3) * 2}px`,
              height: `${3 + (i % 3) * 2}px`,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-3xl px-5 py-16 text-center md:py-24">
        <p className="font-hand text-2xl text-primary">every photograph holds a whole life</p>
        <h1 className="mt-2 font-display text-4xl leading-tight md:text-6xl">The Memorial Garden</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground md:text-lg">
          A peaceful sanctuary where every companion is remembered and loved. Wander, remember, light a paw lamp.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link to={user ? "/create/memorial" : "/signup"} search={user ? undefined : ({ redirect: "/create/memorial" } as never)}>
            <span className="btn-gold ios-tappable inline-flex items-center gap-2">
              <Feather className="h-4 w-4" strokeWidth={2} />
              Write a memorial
            </span>
          </Link>
          {lampsThisWeek > 0 && (
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-2 text-sm text-foreground soft-shadow">
              <PawLamp size={16} />
              {lampsThisWeek} paw {lampsThisWeek === 1 ? "lamp" : "lamps"} lit this week
            </span>
          )}
        </div>
      </div>
    </section>
  );
}

/* ────────── Garden card with gated engagement actions ────────── */

function GardenCard({ m, onGate }: { m: GardenMemorial; onGate: (action: string) => void }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const flowerFn = useServerFn(leaveFlower);
  const img = m.transformed_image_url ?? m.hero_image_url;
  const years = [m.birth_date?.slice(0, 4), m.passing_date?.slice(0, 4)].filter(Boolean).join(" – ");

  const requireAuth = (action: string, fn: () => void) => {
    if (!user) {
      onGate(action);
      return;
    }
    fn();
  };

  const sendLove = () =>
    requireAuth("send love", async () => {
      try {
        // Love is a flower tribute — never a paw lamp.
        await flowerFn({ data: { memorial_id: m.id, flower: "rose" } });
        softHaptic(20);
        toast.success(`Love sent to ${m.pet_name} ✨`);
        qc.invalidateQueries({ queryKey: ["memorial-flowers", m.id] });
      } catch (e: any) {
        toast.error(e?.message ?? "Couldn't send love just now");
      }
    });

  const share = () =>
    requireAuth("share this memorial", () =>
      shareOrCopy({
        title: `Remember ${m.pet_name}`,
        text: `Light a paw lamp for ${m.pet_name} on Rememfur`,
        url: `https://rememfur.com/memorial/${m.slug}`,
      }),
    );

  const lampButton = (
    <button
      type="button"
      aria-label={`Light a paw lamp for ${m.pet_name}`}
      className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-primary transition hover:bg-muted"
    >
      <PawLamp size={15} /> {m.candle_count}
    </button>
  );

  return (
    <article className={`polaroid garden-polaroid group transition hover:-translate-y-1 ${m.id.charCodeAt(0) % 2 ? "rotate-[1deg]" : "-rotate-[1deg]"}`}>
      <span aria-hidden className="tape absolute -top-2 left-1/2 z-10 -translate-x-1/2 rotate-[-2deg]" />
      <Link to="/memorial/$slug" params={{ slug: m.slug }} className="block">
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          {img ? (
            <img src={img} alt={m.pet_name} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">🐾</div>
          )}
        </div>
        <div className="px-2 pt-3 text-center">
          <div className="font-hand text-2xl leading-none text-foreground">{m.pet_name}</div>
          <div className="mt-1 font-hand text-base text-muted-foreground">{years || "forever loved"}</div>
          {m.epitaph && <p className="mt-2 line-clamp-2 font-hand text-lg leading-tight text-muted-foreground">“{m.epitaph}”</p>}
        </div>
      </Link>

      {/* Engagement — members only; guests are invited to sign in */}
      <div className="mt-1 flex items-center justify-center gap-1 border-t border-border/60 px-2 pb-2 pt-1">
        {user ? (
          <CandleDialog target={{ kind: "memorial", memorial_id: m.id, pet_name: m.pet_name, slug: m.slug }} trigger={lampButton} />
        ) : (
          <span onClick={() => onGate("light a paw lamp")}>{lampButton}</span>
        )}
        <button
          type="button"
          onClick={sendLove}
          aria-label={`Send love to ${m.pet_name}`}
          className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-primary transition hover:bg-muted"
        >
          <Heart className="h-3.5 w-3.5" /> Love
        </button>
        <button
          type="button"
          onClick={share}
          aria-label={`Share ${m.pet_name}'s memorial`}
          className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-primary transition hover:bg-muted"
        >
          <Share2 className="h-3.5 w-3.5" /> Share
        </button>
      </div>
    </article>
  );
}

/* ────────── Info cards: the old landing story, condensed ────────── */

const infoCards = [
  {
    to: "/about",
    icon: Info,
    title: "About Rememfur",
    body: "Why we built a gentle space for remembering the pets who made us whole.",
  },
  {
    to: "/grief-support",
    icon: LifeBuoy,
    title: "Gentle support",
    body: "Hotlines, first-day words, and people who understand pet loss.",
  },
  {
    to: "/marketplace",
    icon: Gift,
    title: "Keepsakes & tributes",
    body: "Ideas for holding their memory close — in their name.",
  },
];

function InfoCards() {
  return (
    <section className="mx-auto mt-16 max-w-5xl">
      <h2 className="text-center font-display text-2xl md:text-3xl">More of the garden</h2>
      <div className="mt-6 grid gap-5 px-1 sm:grid-cols-3">
        {infoCards.map(({ to, icon: Icon, title, body }) => (
          <Link
            key={to}
            to={to}
            className="group rounded-3xl border border-border bg-card p-6 soft-shadow transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-muted text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-display text-xl text-foreground">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            <span className="link-gold mt-3 inline-block text-sm">Open →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ────────── Page ────────── */

function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [species, setSpecies] = useState("all");
  const [q, setQ] = useState("");
  const [gate, setGate] = useState<string | null>(null);

  const fetchList = useServerFn(listGardenMemorials);
  const fetchCount = useServerFn(countCandlesThisWeek);

  const { data, isLoading } = useQuery({
    queryKey: ["home-garden", species, q],
    queryFn: () => fetchList({ data: { species, q } }),
  });
  const { data: lampsThisWeek = 0 } = useQuery({
    queryKey: ["lamps-this-week"],
    queryFn: async () => (await fetchCount()).count,
    staleTime: 60_000,
  });

  return (
    <div className="warm-platform min-h-screen bg-background paper-grain">
      <IntroSequence />
      <SiteHeader />

      <main className="pb-16">
        <GardenBanner lampsThisWeek={lampsThisWeek} />

        <div className="mx-auto max-w-6xl px-5">
          {/* Search + filters */}
          <div className="mx-auto mt-10 flex max-w-2xl flex-col items-center gap-4">
            <div className="flex w-full items-center gap-2 rounded-full border border-border bg-card px-4 py-2 soft-shadow">
              <Search className="h-4 w-4 shrink-0 text-primary" />
              <Input
                placeholder="Search by name…"
                aria-label="Search memorials by name"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="h-8 border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
              />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {filters.map((f) => (
                <Button
                  key={f.key}
                  onClick={() => setSpecies(f.key)}
                  variant={species === f.key ? "default" : "outline"}
                  className={`rounded-full border px-4 py-1.5 text-sm transition ${
                    species === f.key
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:bg-muted"
                  }`}
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Garden grid */}
          <section className="mt-10" aria-label="Memorial garden">
            {isLoading ? (
              <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] animate-pulse rounded-3xl bg-muted" />
                ))}
              </div>
            ) : (data?.length ?? 0) === 0 ? (
              <div className="rounded-3xl border border-dashed border-border bg-card/60 p-16 text-center">
                <p className="font-display text-2xl text-foreground">The garden is just beginning.</p>
                <p className="mt-2 text-muted-foreground">Be the first to plant a memory.</p>
                <Link to={user ? "/create/memorial" : "/signup"} className="mt-6 inline-block">
                  <Button className="rounded-full bg-sage-deep text-primary-foreground hover:bg-sage-deep/90">Write a memorial</Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {(data as GardenMemorial[]).map((m) => (
                  <GardenCard key={m.id} m={m} onGate={setGate} />
                ))}
              </div>
            )}
          </section>

          <InfoCards />
        </div>
      </main>

      <SiteFooter />

      <AuthGateDialog
        open={gate !== null}
        onOpenChange={(open) => !open && setGate(null)}
        title="Join the garden to continue"
        subtitle={gate ? `Create a free account to ${gate} — it takes a moment.` : undefined}
        oauthRedirectPath="/"
        onAuthed={() => navigate({ to: "/" })}
      />
    </div>
  );
}
