import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { HandHeart, MapPin } from "lucide-react";

export const Route = createFileRoute("/adoption")({
  component: Adoption,
  head: () => ({
    meta: [
      { title: "Adoption — Rememfur" },
      { name: "description", content: "When you're ready, honor their memory by giving another soul a home." },
    ],
  }),
});

const pets = [
  { name: "Mango", species: "Tabby kitten · 4 mo", city: "Austin, TX", img: "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=600" },
  { name: "Biscuit", species: "Beagle mix · 2 yr", city: "Portland, OR", img: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600" },
  { name: "Luna", species: "Black lab · 5 yr", city: "Brooklyn, NY", img: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600" },
  { name: "Pixel", species: "Bunny · 1 yr", city: "Seattle, WA", img: "https://images.unsplash.com/photo-1535241749838-299277b6305f?w=600" },
];

function Adoption() {
  return (
    <div className="min-h-screen bg-background paper-grain">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-12 pb-32">
        <div className="text-xs uppercase tracking-[0.2em] text-[var(--cta)]">When you're ready</div>
        <h1 className="mt-3 font-display text-4xl text-foreground">Adoption</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          A new companion never replaces the one you lost — they continue the love your pet taught you to give.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
          {pets.map((p) => (
            <article key={p.name} className="overflow-hidden rounded-2xl border border-border/60 bg-card soft-shadow">
              <img src={p.img} alt={p.name} className="h-40 w-full object-cover" loading="lazy" />
              <div className="p-3">
                <div className="font-display text-lg text-foreground">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.species}</div>
                <div className="mt-1 flex items-center gap-1 text-xs text-[var(--cta)]">
                  <MapPin className="h-3 w-3" /> {p.city}
                </div>
              </div>
            </article>
          ))}
        </div>

        <section className="mt-10 rounded-3xl bg-cream/60 p-7 text-center">
          <HandHeart className="mx-auto h-6 w-6 text-[var(--cta)]" />
          <h2 className="mt-2 font-display text-2xl">Partner shelters near you</h2>
          <p className="mt-1 text-sm text-muted-foreground">We work with verified rescues across the country.</p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
