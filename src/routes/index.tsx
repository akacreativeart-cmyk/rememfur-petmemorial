import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PawIcon } from "@/components/site/PawIcon";
// Classy, free-to-use photography from Unsplash
const heroImg = "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1920&q=80";
const candleImg = "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=1024&q=80";
const pet1 = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=768&q=80";
const pet2 = "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=768&q=80";
const pet3 = "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=768&q=80";
const pet4 = "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=768&q=80";
import { Heart, Flower2, Users, BookOpen, HandHeart, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "Rememfur — A gentle pet memorial, made with love" },
      { name: "description", content: "Create a beautiful AI-illustrated memorial for your pet. Light candles, share tributes, and join a community that understands grief." },
    ],
  }),
});

const ecosystem = [
  { icon: Sparkles, title: "Memorial Creation", body: "Create a beautiful tribute with AI portraits & memories." },
  { icon: Flower2, title: "Memorial Garden", body: "A peaceful place to honor and remember together." },
  { icon: Users, title: "Community Connection", body: "Share love, send support, never feel alone." },
  { icon: BookOpen, title: "Memory Tools", body: "Journals, anniversaries, prints & keepsakes." },
  { icon: HandHeart, title: "Giving Back", body: "Support animal shelters in their memory." },
];

const journey = [
  { title: "Arrive & Feel Safe", body: "Warm welcome and emotional safety." },
  { title: "Create a Memorial", body: "Upload, transform, write, light a candle." },
  { title: "Share in the Garden", body: "Be part of a community that understands." },
  { title: "Return & Remember", body: "Anniversaries, journal, memories keep alive." },
  { title: "Give & Heal Together", body: "Support others, donate, be part of something bigger." },
];

function LandingPage() {
  return (
    <div className="min-h-screen mesh-bg text-foreground">
      <SiteHeader />

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-5 pt-10 pb-16 md:pt-14">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 soft-shadow">
            <img
              src={heroImg}
              alt="A young woman in a wildflower meadow at twilight beside her golden retriever under a vivid aurora sky"
              width={1920}
              height={1080}
              className="h-[560px] w-full object-cover md:h-[640px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/40" />
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
              <h1 className="max-w-3xl font-display text-5xl text-white md:text-7xl md:leading-[1.02]">
                Your love mattered.<br />
                <span className="bg-gradient-to-r from-[oklch(0.78_0.14_240)] to-[oklch(0.72_0.18_265)] bg-clip-text text-transparent">Your grief is welcome here.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base text-white/85 md:text-lg">
                A gentle place to honor, remember, and celebrate the bond you shared.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
                <Link to="/signup">
                  <Button size="lg" className="rounded-full px-7 py-6 text-base">
                    <Heart className="mr-2 h-4 w-4 fill-current" /> Create a memorial
                  </Button>
                </Link>
                <Link to="/garden">
                  <Button size="lg" variant="outline" className="rounded-full px-7 py-6 text-base">
                    Visit Memorial Garden
                  </Button>
                </Link>
              </div>
              <div className="mt-7 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs text-white/85">
                <Heart className="h-3 w-3 fill-[oklch(0.70_0.18_260)] text-[oklch(0.70_0.18_260)]" />
                A community that understands
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote band */}
      <section className="mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-2xl glass rounded-3xl px-8 py-10 text-center">
          <p className="font-display text-3xl text-white/90 md:text-4xl tracking-tight">
            "Love leaves paw prints on the heart."
          </p>
        </div>
      </section>

      {/* Ecosystem */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs uppercase tracking-[0.25em] text-white/60">An ecosystem of remembrance</div>
          <h2 className="mt-3 font-display text-4xl text-white md:text-5xl">Everything love asks for</h2>
          <p className="mt-4 text-white/70">
            From the first candle to anniversaries years later, Rememfur holds the bond gently.
          </p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ecosystem.map(({ icon: Icon, title, body }) => (
            <div key={title} className="group glass gloss rounded-3xl p-6 transition hover:-translate-y-0.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-xl text-white">{title}</h3>
              <p className="mt-2 text-sm text-white/70">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Ritual preview */}
      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="grid items-center gap-12 glass gloss rounded-[2rem] p-8 md:grid-cols-2 md:p-14">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-[oklch(0.78_0.16_250)]">The ritual</div>
            <h2 className="mt-3 font-display text-4xl text-white md:text-5xl">A four-step act of love</h2>
            <p className="mt-4 max-w-md text-white/70">
              Photo. Transform. Tribute. Candle. A quiet ceremony, end-to-end, in about ten minutes.
            </p>
            <ol className="mt-6 space-y-3 text-sm">
              {["Upload a photo that feels like them", "Choose an AI-painted transformation", "Write a tribute in your own words", "Light their first candle"].map((step, i) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[oklch(0.65_0.20_250)] to-[oklch(0.55_0.22_275)] text-xs text-white">{i+1}</span>
                  <span className="text-white/90">{step}</span>
                </li>
              ))}
            </ol>
            <Link to="/signup" className="mt-7 inline-block">
              <Button className="rounded-full">Begin the ritual</Button>
            </Link>
          </div>
          <div className="relative">
            <img src={candleImg} alt="A glowing memorial candle surrounded by eucalyptus under an aurora" width={1024} height={1024} loading="lazy" className="rounded-3xl object-cover candle-glow" />
          </div>
        </div>
      </section>

      {/* Garden preview */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-white/60">Memorial Garden</div>
            <h2 className="mt-3 font-display text-4xl text-white">A place where love lives on</h2>
          </div>
          <Link to="/garden" className="hidden text-sm text-white/80 hover:text-white hover:underline md:block">Visit the garden →</Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { img: pet1, name: "Luna", years: "2012 – 2024" },
            { img: pet2, name: "Marigold", years: "2010 – 2023" },
            { img: pet3, name: "Milo", years: "2015 – 2024" },
            { img: pet4, name: "Bella", years: "2011 – 2024" },
          ].map((p) => (
            <div key={p.name} className="overflow-hidden glass rounded-3xl">
              <img src={p.img} alt={`Painterly portrait of ${p.name}`} width={768} height={768} loading="lazy" className="aspect-square w-full object-cover" />
              <div className="px-4 py-3">
                <div className="font-display text-lg text-white">{p.name}</div>
                <div className="text-xs text-white/60">{p.years}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Journey */}
      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.25em] text-white/60">Your journey</div>
          <h2 className="mt-3 font-display text-4xl text-white">From the first tear to the next bloom</h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-5">
          {journey.map((s, i) => (
            <div key={s.title} className="glass rounded-2xl p-5 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white">
                <PawIcon className="h-5 w-5" />
              </div>
              <div className="mt-3 font-display text-base text-white">{i+1}. {s.title}</div>
              <div className="mt-1 text-xs text-white/60">{s.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-5 pt-14 pb-4 text-center">
        <h2 className="font-display text-4xl text-white md:text-5xl">Begin their memorial today</h2>
        <p className="mt-3 text-white/70">Free, always. Made with care.</p>
        <Link to="/signup" className="mt-7 inline-block">
          <Button size="lg" className="rounded-full px-8 py-6 text-base">
            <Heart className="mr-2 h-4 w-4 fill-current" /> Create a memorial
          </Button>
        </Link>
      </section>

      <SiteFooter />
    </div>
  );
}
