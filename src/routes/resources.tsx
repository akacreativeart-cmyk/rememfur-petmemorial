import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PageHero } from "@/components/site/PageHero";
import { Heart, Phone, BookOpen, Users } from "lucide-react";

export const Route = createFileRoute("/resources")({
  component: Resources,
  head: () => ({
    meta: [
      { title: "Grief resources — Rememfur" },
      { name: "description", content: "Pet loss helplines, articles, and support communities to help you through grief." },
    ],
  }),
});

const helplines = [
  { name: "ASPCA Pet Loss Hotline", detail: "(877) 474-3310 — Mon–Fri", href: "https://www.aspca.org" },
  { name: "Lap of Love Pet Loss Support", detail: "Free weekly support groups", href: "https://www.lapoflove.com/pet-loss-support" },
  { name: "Pet Compassion Careline", detail: "24/7 grief support, USA", href: "https://www.petcompassioncareline.com" },
];

const articles = [
  { title: "What to do in the first 72 hours", body: "Practical, gentle steps for the days right after loss." },
  { title: "Helping children grieve a pet", body: "Age-appropriate ways to support a child's first loss." },
  { title: "When the home feels too quiet", body: "Small rituals that help fill the silence with meaning." },
  { title: "Caring for a surviving pet", body: "How to support another animal who is also grieving." },
];

function Resources() {
  return (
    <div className="min-h-screen bg-background paper-grain">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-5 py-10 pb-24">
        <PageHero
          eyebrow="the little library"
          title="You don't have to walk this alone."
          handwritten="words for the hardest days"
          intro="A small library of helplines, articles, and communities for the days that hurt the most."
        />

        <section>
          <h2 className="flex items-center gap-2 font-display text-2xl text-foreground">
            <Phone className="h-5 w-5 text-amber-300" /> Helplines & support
          </h2>
          <ul className="mt-5 grid gap-3 md:grid-cols-2">
            {helplines.map((h) => (
              <li key={h.name} className="rounded-2xl border border-border/60 bg-card p-5 soft-shadow">
                <a href={h.href} target="_blank" rel="noreferrer" className="font-display text-lg text-foreground hover:text-amber-200">{h.name}</a>
                <p className="mt-1 text-sm text-muted-foreground">{h.detail}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14">
          <h2 className="flex items-center gap-2 font-display text-2xl text-foreground">
            <BookOpen className="h-5 w-5 text-amber-300" /> Gentle reading
          </h2>
          <ul className="mt-5 grid gap-3 md:grid-cols-2">
            {articles.map((a) => (
              <li key={a.title} className="rounded-2xl border border-border/60 bg-card p-5 soft-shadow">
                <div className="font-display text-lg text-foreground">{a.title}</div>
                <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14 rounded-3xl bg-white/[0.04] p-8 text-center">
          <Users className="mx-auto h-6 w-6 text-amber-200" />
          <h2 className="mt-3 font-display text-2xl text-foreground">Join the Memorial Garden</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            See how others are honoring their pets. Light a paw lamp. Leave a kind word.
          </p>
          <a href="/garden" className="btn-gold-sm mt-5">
            <Heart className="h-4 w-4 fill-current" /> Visit the garden
          </a>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
