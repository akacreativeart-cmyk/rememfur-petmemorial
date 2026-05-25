import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PawIcon } from "@/components/site/PawIcon";
import { Heart, Feather, Flame, Users, PenLine, ImagePlus, MessageCircleHeart } from "lucide-react";

// Warm, vintage pet photography
const pet1 = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80";
const pet2 = "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80";
const pet3 = "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=600&q=80";
const pet4 = "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=600&q=80";
const pet5 = "https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=600&q=80";
const pet6 = "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?auto=format&fit=crop&w=600&q=80";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "Rememfur — A sanctuary for pet loss & grief" },
      {
        name: "description",
        content:
          "A gentle place to grieve, remember, and be held by a community that understands. Pin a memory, write an obituary, and let your love be seen.",
      },
    ],
  }),
});

type Pin = {
  kind: "photo" | "note";
  img?: string;
  name?: string;
  years?: string;
  note: string;
  rot: number;
  top: string;
  left: string;
  tint?: string; // for note cards
};

// Scattered pins for the memory wall hero
const wallPins: Pin[] = [
  { kind: "photo", img: pet1, name: "Luna",     years: "2012 – 2024", note: "my shadow, always", rot: -6, top: "6%",  left: "4%" },
  { kind: "note",  note: "you were the best part\nof every single day", rot: 4,  top: "10%", left: "30%", tint: "oklch(0.94 0.05 78)" },
  { kind: "photo", img: pet2, name: "Marigold", years: "2010 – 2023", note: "queen of the porch", rot: 5, top: "4%",  left: "55%" },
  { kind: "photo", img: pet3, name: "Milo",     years: "2015 – 2024", note: "thunder-cuddler",   rot: -3, top: "8%",  left: "78%" },
  { kind: "note",  note: "thank you for\nfourteen good years",        rot: -5, top: "44%", left: "2%",  tint: "oklch(0.93 0.05 350)" },
  { kind: "photo", img: pet4, name: "Bella",    years: "2011 – 2024", note: "sunbeam stealer",    rot: 3,  top: "46%", left: "22%" },
  { kind: "photo", img: pet5, name: "Oliver",   years: "2009 – 2023", note: "soft & loud",        rot: -4, top: "48%", left: "52%" },
  { kind: "note",  note: "i still set out\ntwo bowls.",                rot: 6,  top: "52%", left: "74%", tint: "oklch(0.94 0.05 145)" },
  { kind: "photo", img: pet6, name: "Cooper",   years: "2014 – 2024", note: "first to the door",  rot: 4,  top: "78%", left: "10%" },
  { kind: "note",  note: "you mattered.\nyou still do.",               rot: -2, top: "82%", left: "38%", tint: "oklch(0.95 0.04 78)" },
  { kind: "photo", img: pet1, name: "Daisy",    years: "2013 – 2023", note: "tiny heart, huge",   rot: -5, top: "80%", left: "62%" },
  { kind: "note",  note: "rest, sweet one.",                            rot: 3,  top: "84%", left: "84%", tint: "oklch(0.93 0.05 350)" },
];

const steps = [
  { icon: ImagePlus,         title: "Share a photo & a name", body: "Bring their face to the wall. A single picture is enough to begin." },
  { icon: PenLine,           title: "Write what you need to say", body: "An obituary, a letter, a memory you've been carrying. Long or short — all of it belongs." },
  { icon: Flame,             title: "Pin it to the wall", body: "Your tribute joins a quiet wall of others who have loved and lost." },
  { icon: MessageCircleHeart, title: "Be held by the community", body: "People who understand will light a candle, leave a word, and sit with you." },
];

const feed = [
  { name: "Hazel",  years: "2010 – 2024", from: "Priya",  body: "She slept on my feet for fourteen winters. The bed is so cold now.", candles: 124 },
  { name: "Biscuit", years: "2008 – 2023", from: "Marcus", body: "He waited for me at the window every single day. I keep looking for him there.", candles: 88 },
  { name: "Pepper", years: "2016 – 2024", from: "Anya",   body: "Three months in and I still buy the wrong treats at the store.", candles: 201 },
];

function LandingPage() {
  return (
    <div className="min-h-screen paper-bg paper-grain text-foreground">
      <SiteHeader />

      {/* ─────────────────────────── HERO — Wall of Memory ─────────────────────────── */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 pt-6 pb-12 md:pt-10">
          <div className="memory-wall relative overflow-hidden rounded-[1.5rem] border border-[color-mix(in_oklab,var(--ink)_18%,transparent)]">
            {/* Scattered pins layer */}
            <div className="pointer-events-none absolute inset-0 hidden md:block">
              {wallPins.map((p, i) => (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    top: p.top,
                    left: p.left,
                    transform: `rotate(${p.rot}deg)`,
                    width: p.kind === "photo" ? "150px" : "150px",
                  }}
                >
                  {p.kind === "photo" ? (
                    <div className="polaroid relative">
                      <span className="tape left-1/2 -top-2 -translate-x-1/2 rotate-[-4deg]" />
                      <img
                        src={p.img}
                        alt={p.name}
                        loading="lazy"
                        className="block h-32 w-32 object-cover sepia-[.12] saturate-[.9]"
                      />
                      <div className="mt-1 px-1 text-center">
                        <div className="font-display text-sm leading-tight text-[var(--ink)]">{p.name}</div>
                        <div className="text-[9px] uppercase tracking-widest text-[color-mix(in_oklab,var(--ink)_55%,transparent)]">
                          {p.years}
                        </div>
                        <div className="font-hand text-sm text-[color-mix(in_oklab,var(--ink)_72%,transparent)]">
                          {p.note}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="note-card relative"
                      style={{ background: p.tint }}
                    >
                      <span className="tape left-1/2 -top-2 -translate-x-1/2 rotate-[3deg]" />
                      <p className="whitespace-pre-line font-hand text-lg leading-snug text-[color-mix(in_oklab,var(--ink)_82%,transparent)]">
                        {p.note}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile: a tighter scattered strip at top */}
            <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center gap-2 md:hidden">
              {wallPins.slice(0, 5).map((p, i) => (
                <div key={i} style={{ transform: `rotate(${p.rot}deg)` }} className="shrink-0">
                  {p.kind === "photo" ? (
                    <div className="polaroid">
                      <img src={p.img} alt="" className="block h-16 w-16 object-cover sepia-[.12]" />
                    </div>
                  ) : (
                    <div className="note-card" style={{ background: p.tint, width: 80, minHeight: 60 }}>
                      <p className="font-hand text-[11px] leading-tight text-[var(--ink)]/80 whitespace-pre-line">{p.note}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Centered title plate */}
            <div className="relative z-10 mx-auto flex min-h-[600px] max-w-2xl flex-col items-center justify-center px-6 py-32 text-center md:min-h-[680px] md:py-40">
              <div className="rounded-2xl bg-[color-mix(in_oklab,var(--paper)_82%,transparent)] px-6 py-8 backdrop-blur-md md:px-10 md:py-10 border border-[color-mix(in_oklab,var(--ink)_10%,transparent)] shadow-[0_30px_60px_-30px_oklch(0.3_0.05_40/0.35)]">
                <div className="font-hand text-2xl text-[var(--terracotta)] md:text-3xl">a sanctuary for pet loss</div>
                <h1 className="mt-3 font-display text-4xl text-[var(--ink)] md:text-6xl md:leading-[1.04]">
                  Your memory <span className="italic">deserves a wall.</span>
                </h1>
                <p className="mt-5 font-serif text-base text-[color-mix(in_oklab,var(--ink)_78%,transparent)] md:text-lg">
                  A gentle place to grieve, remember, and be held by people who understand.
                  Pin a photo. Write what you need to say. Light a candle for someone you loved.
                </p>
                <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <Link to="/signup">
                    <Button size="lg" className="rounded-full px-7">
                      <Heart className="mr-2 h-4 w-4 fill-current" /> Pin their memory
                    </Button>
                  </Link>
                  <Link to="/garden">
                    <Button size="lg" variant="outline" className="rounded-full px-7">
                      Read the wall
                    </Button>
                  </Link>
                </div>
                <div className="mt-5 font-hand text-lg text-[color-mix(in_oklab,var(--ink)_60%,transparent)]">
                  free, always · no pressure, no timeline
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────── Emotional promise strip ─────────────────────────── */}
      <section className="mx-auto max-w-5xl px-5 py-8">
        <div className="grid gap-4 text-center md:grid-cols-3">
          {[
            { hand: "your grief", serif: "is welcome here." },
            { hand: "your companion", serif: "will be recognized." },
            { hand: "you are", serif: "not alone in this." },
          ].map((b) => (
            <div key={b.serif} className="book-card rounded-2xl px-5 py-6">
              <div className="font-hand text-2xl text-[var(--terracotta)]">{b.hand}</div>
              <div className="mt-1 font-display text-2xl italic text-[var(--ink)]">{b.serif}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────── How it works ─────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="text-center">
          <div className="chapter-rule mx-auto max-w-md">
            <PawIcon className="h-5 w-5 text-[var(--terracotta)]" />
            <span className="font-display text-sm uppercase tracking-[0.4em]">Let it out, gently</span>
            <PawIcon className="h-5 w-5 text-[var(--terracotta)]" />
          </div>
          <h2 className="mt-5 font-display text-4xl text-[var(--ink)] md:text-5xl">
            Four small steps. <span className="italic">No rush.</span>
          </h2>
          <p className="mt-3 mx-auto max-w-xl font-serif text-lg text-[color-mix(in_oklab,var(--ink)_72%,transparent)]">
            Grief doesn't follow a calendar. Take a breath, take a minute, take a week — and come back when you're ready.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, title, body }, i) => (
            <div key={title} className="book-card rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <div className="font-hand text-3xl text-[var(--terracotta)]">{i + 1}.</div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--terracotta)_14%,transparent)] text-[var(--terracotta)]">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <h3 className="mt-4 font-display text-xl text-[var(--ink)]">{title}</h3>
              <p className="mt-2 font-serif text-base text-[color-mix(in_oklab,var(--ink)_72%,transparent)]">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────── Obituary spotlight ─────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid items-center gap-12 book-card rounded-3xl p-6 md:grid-cols-2 md:p-12">
          {/* Mock obituary card */}
          <div className="relative">
            <div className="polaroid rotate-[-2deg]">
              <span className="tape left-6 -top-2 rotate-[-6deg]" />
              <img
                src={pet2}
                alt="Marigold"
                loading="lazy"
                className="block aspect-square w-full max-w-sm object-cover sepia-[.1]"
              />
              <div className="mt-3 px-3 pb-2 text-center">
                <div className="text-xs uppercase tracking-[0.35em] text-[var(--terracotta)]">In loving memory</div>
                <div className="mt-1 font-display text-3xl text-[var(--ink)]">Marigold</div>
                <div className="text-xs uppercase tracking-widest text-[color-mix(in_oklab,var(--ink)_55%,transparent)]">
                  2010 – 2023
                </div>
                <p className="mt-3 font-serif text-base italic text-[color-mix(in_oklab,var(--ink)_75%,transparent)]">
                  "She was thirteen pounds of opinion and the softest heart I've ever known.
                  The porch is empty without her queen."
                </p>
                <div className="mt-3 flex items-center justify-center gap-2 text-[var(--terracotta)]">
                  <Flame className="h-4 w-4" />
                  <span className="font-hand text-lg">142 candles lit</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.4em] text-[var(--terracotta)]">The obituary</div>
            <h2 className="mt-3 font-display text-4xl text-[var(--ink)] md:text-5xl">
              Write their <span className="italic">obituary.</span><br />Let the grief out.
            </h2>
            <p className="mt-4 font-serif text-lg text-[color-mix(in_oklab,var(--ink)_75%,transparent)]">
              Some feelings only leave when you give them words. Write a full obituary, a short tribute,
              or just a name and a date — whatever you can manage today is enough.
            </p>
            <ul className="mt-6 space-y-3 font-serif text-base text-[var(--ink)]/85">
              <li className="flex gap-3"><Feather className="mt-1 h-4 w-4 shrink-0 text-[var(--terracotta)]" /> A guided template, or a blank page if you'd rather pour it out.</li>
              <li className="flex gap-3"><Heart className="mt-1 h-4 w-4 shrink-0 text-[var(--terracotta)]" /> Photos, dates, the small things only you remember.</li>
              <li className="flex gap-3"><Users className="mt-1 h-4 w-4 shrink-0 text-[var(--terracotta)]" /> Shared to the wall and the community — or kept private. You choose.</li>
            </ul>
            <Link to="/signup" className="mt-8 inline-block">
              <Button size="lg" className="rounded-full px-7">
                <PenLine className="mr-2 h-4 w-4" /> Write their obituary
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────── Community feed preview ─────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.4em] text-[var(--terracotta)]">The community</div>
          <h2 className="mt-3 font-display text-4xl text-[var(--ink)] md:text-5xl">
            A circle that <span className="italic">understands.</span>
          </h2>
          <p className="mt-3 mx-auto max-w-xl font-serif text-lg text-[color-mix(in_oklab,var(--ink)_72%,transparent)]">
            No advice you didn't ask for. No "it was just a pet." Just people who know exactly what your heart is doing right now.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {feed.map((p) => (
            <article key={p.name} className="book-card rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-display text-xl text-[var(--ink)]">{p.name}</div>
                  <div className="text-[10px] uppercase tracking-widest text-[color-mix(in_oklab,var(--ink)_55%,transparent)]">{p.years}</div>
                </div>
                <div className="flex items-center gap-1 text-[var(--terracotta)]">
                  <Flame className="h-4 w-4" />
                  <span className="font-hand text-lg">{p.candles}</span>
                </div>
              </div>
              <p className="mt-4 font-serif text-base italic text-[color-mix(in_oklab,var(--ink)_80%,transparent)]">"{p.body}"</p>
              <div className="mt-4 font-hand text-lg text-[color-mix(in_oklab,var(--ink)_60%,transparent)]">— {p.from}</div>
              <div className="mt-4 border-t border-[color-mix(in_oklab,var(--ink)_12%,transparent)] pt-3 font-hand text-base text-[var(--sage-deep)]">
                ♡ sending love · holding you · he sounds wonderful
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link to="/community">
            <Button variant="outline" size="lg" className="rounded-full px-7">
              <Users className="mr-2 h-4 w-4" /> Sit with the community
            </Button>
          </Link>
          <div className="mt-3 font-hand text-lg text-[color-mix(in_oklab,var(--ink)_60%,transparent)]">
            2,418 candles lit this week
          </div>
        </div>
      </section>

      {/* ─────────────────────────── Pull quote ─────────────────────────── */}
      <section className="mx-auto max-w-4xl px-5 py-10">
        <div className="book-card rounded-3xl px-8 py-14 text-center md:px-14">
          <PawIcon className="mx-auto h-10 w-10 text-[var(--terracotta)]" />
          <p className="mt-4 font-display text-3xl italic text-[var(--ink)] md:text-4xl md:leading-tight">
            "Grief is love with nowhere to go.<br />
            <span className="text-[var(--terracotta)]">Here, it has somewhere to go.</span>"
          </p>
        </div>
      </section>

      {/* ─────────────────────────── Closing CTA ─────────────────────────── */}
      <section className="mx-auto max-w-3xl px-5 pt-8 pb-16 text-center">
        <div className="chapter-rule mx-auto max-w-xs">
          <span className="font-display text-xs uppercase tracking-[0.4em]">For someone you loved</span>
        </div>
        <h2 className="mt-6 font-display text-4xl text-[var(--ink)] md:text-5xl">
          Their name <span className="italic">belongs here.</span>
        </h2>
        <p className="mt-3 font-serif text-lg text-[color-mix(in_oklab,var(--ink)_72%,transparent)]">
          Free, always. Made with the same tenderness you gave them.
        </p>
        <Link to="/signup" className="mt-7 inline-block">
          <Button size="lg" className="rounded-full px-8">
            <Heart className="mr-2 h-4 w-4 fill-current" /> Pin their memory
          </Button>
        </Link>
        <div className="mt-10 font-hand text-2xl text-[color-mix(in_oklab,var(--ink)_55%,transparent)]">
          with love, always ♡
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
