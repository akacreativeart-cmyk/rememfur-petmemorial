import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PawIcon } from "@/components/site/PawIcon";
import { Heart, Flower2, Users, BookOpen, HandHeart, Sparkles, Feather } from "lucide-react";

// Warm, storybook-feel photography
const heroImg = "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1920&q=80";
const candleImg = "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=1024&q=80";
const pet1 = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=768&q=80";
const pet2 = "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=768&q=80";
const pet3 = "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=768&q=80";
const pet4 = "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=768&q=80";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "Rememfur — A storybook for the pets we loved" },
      { name: "description", content: "Turn every paw print into a page. Create a hand-crafted storybook memorial for your pet — chapters, portraits, candles, and a garden that remembers." },
    ],
  }),
});

const chapters = [
  { n: "I",   title: "The Day We Met", body: "Every great story begins with a first hello — a small wet nose, an unexpected friend." },
  { n: "II",  title: "Little Rituals", body: "Morning walks, the favorite blanket, the spot on the couch that became theirs." },
  { n: "III", title: "Adventures", body: "Beaches, road trips, snowy mornings. The chapters that filled the photo albums." },
  { n: "IV",  title: "The Long Goodbye", body: "A soft place to land when the hardest page arrives. You do not turn it alone." },
  { n: "V",   title: "Ever After", body: "Memories, candles, anniversaries — love that keeps writing itself." },
];

const ecosystem = [
  { icon: Sparkles,  title: "Hand-Painted Portraits", body: "A photo becomes a storybook illustration." },
  { icon: BookOpen,  title: "Their Story, Bound",     body: "Chapters, photos, your words — kept forever." },
  { icon: Flower2,   title: "The Memorial Garden",    body: "A quiet meadow where every story blooms." },
  { icon: Users,     title: "A Reading Circle",       body: "Kind hearts who know exactly what this feels like." },
  { icon: HandHeart, title: "Pages That Give Back",   body: "Support a shelter in their name." },
  { icon: Feather,   title: "Anniversary Letters",    body: "Gentle reminders, written with care." },
];

function LandingPage() {
  return (
    <div className="min-h-screen paper-bg paper-grain text-foreground">
      <SiteHeader />

      {/* Cover */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-5 pt-8 pb-14 md:pt-14">
          {/* Spine / book frame */}
          <div className="relative overflow-hidden rounded-[1.25rem] border border-[color-mix(in_oklab,var(--ink)_18%,transparent)] book-card">
            <div className="relative">
              <img
                src={heroImg}
                alt="A child and her golden retriever walking through a sunlit wildflower meadow"
                width={1920} height={1080}
                className="h-[520px] w-full object-cover md:h-[620px] sepia-[.08] saturate-[.95]"
              />
              {/* Vignette + warm wash */}
              <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.18_0.04_40/0.7)] via-[oklch(0.2_0.04_40/0.25)] to-[oklch(0.18_0.04_40/0.5)]" />
              <div className="absolute inset-0 [box-shadow:inset_0_0_140px_40px_oklch(0.18_0.04_40/0.55)]" />

              {/* Title plate */}
              <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                <div className="font-hand text-2xl text-[oklch(0.95_0.05_75)] md:text-3xl">— a story of —</div>
                <h1 className="mt-2 max-w-3xl font-display text-5xl text-[oklch(0.98_0.02_80)] md:text-7xl md:leading-[1.02]">
                  the love that <span className="italic font-normal">followed you home</span>
                </h1>
                <div className="mt-5 flex items-center gap-3 text-[oklch(0.95_0.04_75)]/85">
                  <span className="h-px w-10 bg-[oklch(0.95_0.05_75)]/50" />
                  <span className="text-xs uppercase tracking-[0.35em]">Rememfur</span>
                  <span className="h-px w-10 bg-[oklch(0.95_0.05_75)]/50" />
                </div>
                <p className="mt-6 max-w-xl font-serif text-lg italic text-[oklch(0.95_0.04_75)]/90 md:text-xl">
                  "Every paw print is a page. Every page, a chapter. Every chapter, a love story."
                </p>

                <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
                  <Link to="/signup">
                    <Button size="lg" className="rounded-full px-7">
                      <BookOpen className="mr-2 h-4 w-4" /> Begin their story
                    </Button>
                  </Link>
                  <Link to="/garden">
                    <Button size="lg" variant="outline" className="rounded-full px-7">
                      Read other stories
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Tagline under cover */}
          <p className="mt-6 text-center font-hand text-2xl text-[color-mix(in_oklab,var(--ink)_70%,transparent)]">
            a keepsake storybook for the pets we loved
          </p>
        </div>
      </section>

      {/* Chapter divider */}
      <section className="mx-auto max-w-3xl px-6">
        <div className="chapter-rule">
          <PawIcon className="h-5 w-5 text-[var(--terracotta)]" />
          <span className="font-display text-sm uppercase tracking-[0.4em]">The Chapters</span>
          <PawIcon className="h-5 w-5 text-[var(--terracotta)]" />
        </div>
      </section>

      {/* Chapters — the journey */}
      <section className="mx-auto max-w-5xl px-5 py-14">
        <div className="space-y-10">
          {chapters.map((c, i) => {
            const flip = i % 2 === 1;
            const img = [heroImg, pet1, pet2, candleImg, pet3][i];
            return (
              <article
                key={c.n}
                className={`grid items-center gap-8 md:grid-cols-12 ${flip ? "md:[direction:rtl]" : ""}`}
              >
                <div className={`md:col-span-5 [direction:ltr] ${flip ? "md:pl-6" : "md:pr-6"}`}>
                  <div className="relative inline-block polaroid rotate-[-1.5deg]">
                    <span className="tape left-1/2 -top-2 -translate-x-1/2 rotate-[-3deg]" />
                    <img src={img} alt="" className="block h-64 w-64 object-cover sepia-[.08] md:h-72 md:w-72" loading="lazy" />
                    <div className="mt-2 text-center font-hand text-xl text-[color-mix(in_oklab,var(--ink)_70%,transparent)]">
                      chapter {c.n.toLowerCase()}
                    </div>
                  </div>
                </div>
                <div className="md:col-span-7 [direction:ltr]">
                  <div className="text-xs uppercase tracking-[0.4em] text-[var(--terracotta)]">Chapter {c.n}</div>
                  <h2 className="mt-2 font-display text-4xl text-[var(--ink)] md:text-5xl">
                    {c.title}
                  </h2>
                  <p className="mt-4 font-serif text-lg leading-relaxed text-[color-mix(in_oklab,var(--ink)_78%,transparent)]">
                    <span className="float-left mr-2 font-display text-6xl leading-[0.85] text-[var(--terracotta)]">
                      {c.body.charAt(0)}
                    </span>
                    {c.body.slice(1)}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Pull-quote spread */}
      <section className="mx-auto max-w-4xl px-5">
        <div className="book-card rounded-2xl p-10 text-center md:p-14">
          <div className="mx-auto mb-4 h-10 w-10 text-[var(--terracotta)]">
            <PawIcon className="h-full w-full" />
          </div>
          <p className="font-display text-3xl italic text-[var(--ink)] md:text-4xl">
            "Love leaves paw prints on the heart."
          </p>
          <div className="mt-4 font-hand text-xl text-[color-mix(in_oklab,var(--ink)_60%,transparent)]">
            — every reader who has ever said goodbye
          </div>
        </div>
      </section>

      {/* What's in the book */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="text-center">
          <div className="chapter-rule mx-auto max-w-md">
            <span className="font-display text-sm uppercase tracking-[0.4em]">What's inside</span>
          </div>
          <h2 className="mt-4 font-display text-4xl text-[var(--ink)] md:text-5xl">
            Everything a story needs
          </h2>
          <p className="mt-3 mx-auto max-w-xl font-serif text-lg text-[color-mix(in_oklab,var(--ink)_72%,transparent)]">
            Beautiful pages, gentle tools, and a community of fellow readers — all in one keepsake.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {ecosystem.map(({ icon: Icon, title, body }, idx) => (
            <div key={title} className="book-card rounded-2xl p-6 transition hover:-translate-y-1">
              <div className="flex items-center gap-3">
                <div className="font-hand text-3xl text-[var(--terracotta)]">{idx + 1}.</div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--terracotta)_14%,transparent)] text-[var(--terracotta)]">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <h3 className="mt-4 font-display text-2xl text-[var(--ink)]">{title}</h3>
              <p className="mt-2 font-serif text-base text-[color-mix(in_oklab,var(--ink)_72%,transparent)]">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The ritual / writing the book */}
      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="grid items-center gap-12 book-card rounded-2xl p-8 md:grid-cols-2 md:p-14">
          <div>
            <div className="text-xs uppercase tracking-[0.4em] text-[var(--terracotta)]">The writing ritual</div>
            <h2 className="mt-3 font-display text-4xl text-[var(--ink)] md:text-5xl">
              Four pages, ten quiet minutes
            </h2>
            <p className="mt-4 max-w-md font-serif text-lg text-[color-mix(in_oklab,var(--ink)_72%,transparent)]">
              A small ceremony — a photo, a painting, a paragraph, a candle. The first chapter writes itself.
            </p>
            <ol className="mt-7 space-y-4">
              {[
                "Choose a photo that feels like them",
                "Watch it become a storybook portrait",
                "Write a tribute in your own hand",
                "Light their very first candle",
              ].map((step, i) => (
                <li key={step} className="flex items-start gap-4">
                  <span className="font-display text-3xl leading-none text-[var(--terracotta)]">{i+1}</span>
                  <span className="font-serif text-lg text-[var(--ink)]/90">{step}</span>
                </li>
              ))}
            </ol>
            <Link to="/signup" className="mt-8 inline-block">
              <Button className="rounded-full">Open the first page</Button>
            </Link>
          </div>
          <div className="relative">
            <div className="polaroid rotate-[2deg] inline-block">
              <span className="tape left-6 -top-2 rotate-[-8deg]" />
              <img src={candleImg} alt="A memorial candle" width={520} height={520} loading="lazy" className="block aspect-square w-full max-w-md object-cover candle-glow sepia-[.1]" />
              <div className="mt-2 text-center font-hand text-xl text-[color-mix(in_oklab,var(--ink)_70%,transparent)]">
                one small light
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Garden — wall of stories */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.4em] text-[var(--terracotta)]">The Library</div>
            <h2 className="mt-2 font-display text-4xl text-[var(--ink)]">Stories on the shelf</h2>
          </div>
          <Link to="/garden" className="hidden text-sm font-medium text-[var(--cta)] hover:underline md:block">
            Browse the library →
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            { img: pet1, name: "Luna",     years: "2012 – 2024", note: "ate every sock" },
            { img: pet2, name: "Marigold", years: "2010 – 2023", note: "queen of the porch" },
            { img: pet3, name: "Milo",     years: "2015 – 2024", note: "thunder-cuddler" },
            { img: pet4, name: "Bella",    years: "2011 – 2024", note: "sunbeam stealer" },
          ].map((p, i) => (
            <div key={p.name} className={`polaroid ${i % 2 ? "-rotate-1" : "rotate-1"}`}>
              <img src={p.img} alt={p.name} width={768} height={768} loading="lazy" className="aspect-square w-full object-cover sepia-[.08]" />
              <div className="mt-2 px-1 text-center">
                <div className="font-display text-xl text-[var(--ink)]">{p.name}</div>
                <div className="text-xs uppercase tracking-widest text-[color-mix(in_oklab,var(--ink)_55%,transparent)]">{p.years}</div>
                <div className="mt-1 font-hand text-lg text-[color-mix(in_oklab,var(--ink)_70%,transparent)]">{p.note}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final page / closing */}
      <section className="mx-auto max-w-3xl px-5 pt-10 pb-6 text-center">
        <div className="chapter-rule mx-auto max-w-xs">
          <span className="font-display text-xs uppercase tracking-[0.4em]">The End — for now</span>
        </div>
        <h2 className="mt-6 font-display text-4xl text-[var(--ink)] md:text-5xl">
          Begin their <span className="italic">storybook</span> today
        </h2>
        <p className="mt-3 font-serif text-lg text-[color-mix(in_oklab,var(--ink)_72%,transparent)]">
          Free, always. Made with the same care you gave them.
        </p>
        <Link to="/signup" className="mt-7 inline-block">
          <Button size="lg" className="rounded-full px-8">
            <Heart className="mr-2 h-4 w-4 fill-current" /> Write the first chapter
          </Button>
        </Link>
        <div className="mt-8 font-hand text-2xl text-[color-mix(in_oklab,var(--ink)_55%,transparent)]">
          with love, always ♡
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
