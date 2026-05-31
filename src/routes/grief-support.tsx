import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PageHero } from "@/components/site/PageHero";
import { Phone, MessageCircle, Users, Heart } from "lucide-react";

export const Route = createFileRoute("/grief-support")({
  component: GriefSupport,
  head: () => ({
    meta: [
      { title: "Grief Support — Rememfur" },
      { name: "description", content: "Talk to someone who understands pet loss. Helplines, counselors, and support circles." },
    ],
  }),
});

const lines = [
  { name: "Pet Loss Helpline (24/7)", detail: "Confidential, free, anytime", href: "tel:+18774743310", icon: Phone },
  { name: "Text a grief counselor", detail: "Text PAWS to 741741", href: "sms:741741", icon: MessageCircle },
  { name: "Weekly support circle", detail: "Sundays · online · free", href: "/community", icon: Users },
];

function GriefSupport() {
  return (
    <div className="min-h-screen bg-background paper-grain">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-5 py-10 pb-32">
        <PageHero
          eyebrow="chapter four"
          title="Grief Support"
          handwritten="you are not alone in this"
          intro="Pet grief is real grief. Reach out — someone is waiting to listen."
        />

        <ul className="space-y-3">
          {lines.map(({ name, detail, href, icon: Icon }) => (
            <li key={name}>
              <a href={href} className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-5 soft-shadow hover:bg-cream/40">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--cta)_12%,transparent)] text-[var(--cta)]">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <div className="font-display text-lg text-foreground">{name}</div>
                  <div className="text-sm text-muted-foreground">{detail}</div>
                </div>
              </a>
            </li>
          ))}
        </ul>

        <section className="mt-10 rounded-3xl bg-cream/60 p-7">
          <Heart className="h-5 w-5 text-[var(--terracotta)]" />
          <p className="mt-3 font-hand text-xl text-[var(--ink)]">
            "Grief is love with nowhere to go. Here, it has somewhere to go."
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
