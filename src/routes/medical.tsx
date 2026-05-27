import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Stethoscope, Heart, Clock, BookOpen } from "lucide-react";

export const Route = createFileRoute("/medical")({
  component: Medical,
  head: () => ({
    meta: [
      { title: "Medical & End-of-Life Care — Rememfur" },
      { name: "description", content: "Hospice, euthanasia guidance, and trusted veterinary resources for your pet." },
    ],
  }),
});

const cards = [
  { title: "Knowing when it's time", body: "Quality-of-life scales and gentle guidance from veterinary hospice specialists.", icon: Heart },
  { title: "In-home euthanasia", body: "Find certified mobile vets in your area for a peaceful goodbye at home.", icon: Clock },
  { title: "Aftercare options", body: "Cremation, burial, aquamation — what to expect and how to choose.", icon: BookOpen },
  { title: "Talk to a vet", body: "Connect with on-call veterinarians for medical questions, 24/7.", icon: Stethoscope },
];

function Medical() {
  return (
    <div className="min-h-screen bg-background paper-grain">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-12 pb-32">
        <div className="text-xs uppercase tracking-[0.2em] text-[var(--cta)]">Compassionate care</div>
        <h1 className="mt-3 font-display text-4xl text-foreground">Medical & End-of-Life</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Trusted resources for the hardest decisions, made a little softer.
        </p>

        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {cards.map(({ title, body, icon: Icon }) => (
            <li key={title} className="rounded-2xl border border-border/60 bg-card p-6 soft-shadow">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--cta)_12%,transparent)] text-[var(--cta)]">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-xl text-foreground">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </div>
  );
}
