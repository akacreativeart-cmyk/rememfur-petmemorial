import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PawIcon } from "@/components/site/PawIcon";
import heroImg from "@/assets/hero-meadow.jpg";
import candleImg from "@/assets/candle.jpg";
import pet1 from "@/assets/pet-1.jpg";
import pet2 from "@/assets/pet-2.jpg";
import pet3 from "@/assets/pet-3.jpg";
import pet4 from "@/assets/pet-4.jpg";
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
    <div className="min-h-screen bg-background paper-grain">
      <SiteHeader />

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-5 pt-10 pb-16 md:pt-14">
          <div className="relative overflow-hidden rounded-[2rem] border border-border/60 soft-shadow">
            <img
              src={heroImg}
              alt="A young woman sitting in a wildflower meadow beside her golden retriever, looking out at a misty lake at sunset"
              width={1920}
              height={1080}
              className="h-[560px] w-full object-cover md:h-[640px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cream/85 via-cream/20 to-cream/40" />
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
              <h1 className="max-w-3xl font-display text-4xl text-ink md:text-6xl md:leading-[1.05]">
                Your love mattered.<br />
                <span className="italic text-sage-deep">Your grief is welcome here.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base text-ink/80 md:text-lg">
                A gentle place to honor, remember, and celebrate the bond you shared.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
                <Link to="/signup">
                  <Button size="lg" className="rounded-full bg-sage-deep px-7 py-6 text-base text-primary-foreground hover:bg-sage-deep/90">
                    <Heart className="mr-2 h-4 w-4 fill-current" /> Create a memorial
                  </Button>
                </Link>
                <Link to="/garden">
                  <Button size="lg" variant="outline" className="rounded-full border-ink/15 bg-cream/80 px-7 py-6 text-base text-ink hover:bg-cream">
                    Visit Memorial Garden
                  </Button>
                </Link>
              </div>
              <div className="mt-7 inline-flex items-center gap-2 rounded-full bg-cream/70 px-4 py-1.5 text-xs text-ink/70 backdrop-blur">
                <Heart className="h-3 w-3 fill-terracotta text-terracotta" />
                A community that understands
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote band */}
      <section className="mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-2xl rounded-3xl bg-cream/60 px-8 py-10 text-center">
          <p className="font-display text-3xl italic text-sage-deep md:text-4xl">
            "Love leaves paw prints on the heart."
          </p>
        </div>
      </section>

      {/* Ecosystem */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs uppercase tracking-[0.2em] text-sage-deep">An ecosystem of remembrance</div>
          <h2 className="mt-3 font-display text-4xl text-foreground md:text-5xl">Everything love asks for</h2>
          <p className="mt-4 text-muted-foreground">
            From the first candle to anniversaries years later, Rememfur holds the bond gently.
          </p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ecosystem.map(({ icon: Icon, title, body }) => (
            <div key={title} className="group rounded-3xl border border-border/60 bg-card p-6 soft-shadow transition hover:border-sage/40">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sage/15 text-sage-deep">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-xl text-foreground">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Ritual preview */}
      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="grid items-center gap-12 rounded-[2rem] bg-cream/60 p-8 md:grid-cols-2 md:p-14">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-terracotta">The ritual</div>
            <h2 className="mt-3 font-display text-4xl text-foreground md:text-5xl">A four-step act of love</h2>
            <p className="mt-4 max-w-md text-muted-foreground">
              Photo. Transform. Tribute. Candle. A quiet ceremony, end-to-end, in about ten minutes.
            </p>
            <ol className="mt-6 space-y-3 text-sm">
              {["Upload a photo that feels like them", "Choose an AI-painted transformation", "Write a tribute in your own words", "Light their first candle"].map((step, i) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-sage-deep text-xs text-primary-foreground">{i+1}</span>
                  <span className="text-foreground">{step}</span>
                </li>
              ))}
            </ol>
            <Link to="/signup" className="mt-7 inline-block">
              <Button className="rounded-full bg-sage-deep text-primary-foreground hover:bg-sage-deep/90">Begin the ritual</Button>
            </Link>
          </div>
          <div className="relative">
            <img src={candleImg} alt="A glowing memorial candle surrounded by eucalyptus" width={800} height={800} loading="lazy" className="rounded-3xl object-cover candle-glow" />
          </div>
        </div>
      </section>

      {/* Garden preview */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-sage-deep">Memorial Garden</div>
            <h2 className="mt-3 font-display text-4xl text-foreground">A place where love lives on</h2>
          </div>
          <Link to="/garden" className="hidden text-sm text-sage-deep hover:underline md:block">Visit the garden →</Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { img: pet1, name: "Luna", years: "2012 – 2024" },
            { img: pet2, name: "Marigold", years: "2010 – 2023" },
            { img: pet3, name: "Milo", years: "2015 – 2024" },
            { img: pet4, name: "Bella", years: "2011 – 2024" },
          ].map((p) => (
            <div key={p.name} className="overflow-hidden rounded-3xl border border-border/60 bg-card soft-shadow">
              <img src={p.img} alt={`Painterly portrait of ${p.name}`} width={500} height={500} loading="lazy" className="aspect-square w-full object-cover" />
              <div className="px-4 py-3">
                <div className="font-display text-lg text-foreground">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.years}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Journey */}
      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.2em] text-sage-deep">Your journey</div>
          <h2 className="mt-3 font-display text-4xl text-foreground">From the first tear to the next bloom</h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-5">
          {journey.map((s, i) => (
            <div key={s.title} className="rounded-2xl border border-border/60 bg-card p-5 text-center soft-shadow">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-sage/15 text-sage-deep">
                <PawIcon className="h-5 w-5" />
              </div>
              <div className="mt-3 font-display text-base text-foreground">{i+1}. {s.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">{s.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-5 pt-14 pb-4 text-center">
        <h2 className="font-display text-4xl text-foreground md:text-5xl">Begin their memorial today</h2>
        <p className="mt-3 text-muted-foreground">Free, always. Made with care.</p>
        <Link to="/signup" className="mt-7 inline-block">
          <Button size="lg" className="rounded-full bg-sage-deep px-8 py-6 text-base text-primary-foreground hover:bg-sage-deep/90">
            <Heart className="mr-2 h-4 w-4 fill-current" /> Create a memorial
          </Button>
        </Link>
      </section>

      <SiteFooter />
    </div>
  );
}
