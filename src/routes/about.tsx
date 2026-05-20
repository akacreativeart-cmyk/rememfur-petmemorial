import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import candleImg from "@/assets/candle.jpg";

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({
    meta: [
      { title: "About Rememfur — Why we built it" },
      { name: "description", content: "Rememfur is a gentle pet memorial platform built around a 4-step ritual: photo, transform, tribute, candle." },
    ],
  }),
});

function About() {
  return (
    <div className="min-h-screen bg-background paper-grain">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-16">
        <div className="text-xs uppercase tracking-[0.2em] text-sage-deep">About</div>
        <h1 className="mt-3 font-display text-5xl text-foreground">Grief deserves a beautiful home.</h1>
        <p className="mt-6 text-lg text-muted-foreground">
          When we lose a pet, the world often asks us to move on quickly. Rememfur was built to do the opposite —
          to slow down, to honor what was real, and to give your love a place to live.
        </p>

        <figure className="my-12 overflow-hidden rounded-3xl border border-border/60 soft-shadow">
          <img src={candleImg} alt="A memorial candle" width={1024} height={1024} loading="lazy" className="w-full" />
        </figure>

        <h2 className="font-display text-3xl text-foreground">The ritual</h2>
        <p className="mt-3 text-muted-foreground">
          Every memorial is created through the same gentle four-step ceremony. It takes about ten minutes,
          and it's designed to feel like lighting a candle — quiet, sacred, complete.
        </p>
        <ol className="mt-5 space-y-3 text-foreground">
          <li><strong className="font-medium text-sage-deep">1. Photo.</strong> Choose an image that feels like them.</li>
          <li><strong className="font-medium text-sage-deep">2. Transform.</strong> AI paints a soft portrait in the style of your choosing.</li>
          <li><strong className="font-medium text-sage-deep">3. Tribute.</strong> Write what you most want remembered.</li>
          <li><strong className="font-medium text-sage-deep">4. Candle.</strong> Light the first flame. It stays lit for as long as you wish.</li>
        </ol>

        <h2 className="mt-12 font-display text-3xl text-foreground">Who it's for</h2>
        <p className="mt-3 text-muted-foreground">
          Anyone whose grief feels bigger than the room it's in. Dogs, cats, rabbits, horses, birds — every species,
          every story. Whether your loss was yesterday or twenty years ago, you are welcome here.
        </p>

        <div className="mt-12 rounded-3xl bg-cream/60 p-8 text-center">
          <p className="font-display text-2xl italic text-sage-deep">
            "Love leaves paw prints on the heart."
          </p>
        </div>

        <div className="mt-10 text-center">
          <Link to="/signup" className="inline-flex items-center justify-center rounded-full bg-sage-deep px-6 py-3 text-sm text-primary-foreground hover:bg-sage-deep/90">
            Begin a memorial
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
