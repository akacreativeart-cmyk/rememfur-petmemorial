import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import {
  Gift,
  HeartHandshake,
  Stethoscope,
  Home as HomeIcon,
  Flame,
  Scissors,
  GraduationCap,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/marketplace")({
  component: MarketplacePage,
  head: () => ({
    meta: [
      { title: "Marketplace — Rememfur" },
      { name: "description", content: "A curated directory of memory gifts, vetted pet products, and trusted services — funeral care, vets, shelters, training and more." },
      { property: "og:title", content: "Rememfur Marketplace — Curated with care" },
      { property: "og:description", content: "Memory gifts, vetted products and trusted services for pet parents." },
    ],
  }),
});

type Section = {
  id: string;
  title: string;
  blurb: string;
  icon: any;
  accent: string;
  items: { name: string; tag: string; price?: string; note?: string }[];
};

const sections: Section[] = [
  {
    id: "memory",
    title: "Memory Gifts",
    blurb: "Tangible keepsakes to hold the love close.",
    icon: Gift,
    accent: "bg-terracotta/15 text-terracotta",
    items: [
      { name: "Engraved name tag", tag: "Keepsake", price: "from $24" },
      { name: "Framed portrait print", tag: "Keepsake", price: "from $48" },
      { name: "Cushion with their photo", tag: "Home", price: "from $36" },
      { name: "Paw-print key chain", tag: "Pocket", price: "from $18" },
      { name: "Replica plush of your pet", tag: "Custom", price: "from $89" },
      { name: "Hand-painted watercolor", tag: "Art", price: "from $120" },
    ],
  },
  {
    id: "condolences",
    title: "Condolence Cards",
    blurb: "Send a kind word — digital or printed and mailed.",
    icon: HeartHandshake,
    accent: "bg-mauve/20 text-ink",
    items: [
      { name: "Digital candle card", tag: "Free", note: "Sent instantly" },
      { name: "Printed sympathy card", tag: "Mailed", price: "from $6" },
      { name: "Tribute donation card", tag: "Giving back", price: "from $15" },
    ],
  },
  {
    id: "funeral",
    title: "Funeral & Aftercare",
    blurb: "Compassionate cremation, burial and ceremony services.",
    icon: Flame,
    accent: "bg-sage/20 text-sage-deep",
    items: [
      { name: "Private cremation", tag: "Service", note: "Same-day urn return" },
      { name: "Communal cremation", tag: "Service", note: "Eco-friendly" },
      { name: "Memorial urns", tag: "Product", price: "from $65" },
      { name: "Burial plot directory", tag: "Directory" },
      { name: "Home ceremony kit", tag: "Ritual", price: "from $40" },
    ],
  },
  {
    id: "vet",
    title: "Medical & Vet Care",
    blurb: "Trusted vets, clinics and end-of-life support.",
    icon: Stethoscope,
    accent: "bg-cream text-ink border border-border/60",
    items: [
      { name: "Find a local vet", tag: "Directory" },
      { name: "Tele-vet consult", tag: "Service", price: "from $29" },
      { name: "Hospice & palliative care", tag: "Care" },
      { name: "Home euthanasia", tag: "Care" },
      { name: "Pet health insurance", tag: "Coverage" },
    ],
  },
  {
    id: "adoption",
    title: "Adoption & Shelters",
    blurb: "When you're ready — meet pets looking for love.",
    icon: HomeIcon,
    accent: "bg-sage/15 text-sage-deep",
    items: [
      { name: "Browse adoptable pets", tag: "Directory" },
      { name: "Partner shelters near you", tag: "Directory" },
      { name: "Foster programs", tag: "Volunteer" },
      { name: "Donate in their memory", tag: "Giving back" },
    ],
  },
  {
    id: "food",
    title: "Food & Supplements",
    blurb: "Vetted nutrition that meets our health & safety bar.",
    icon: ShoppingBag,
    accent: "bg-terracotta/10 text-terracotta",
    items: [
      { name: "Fresh meal subscriptions", tag: "Subscription" },
      { name: "Senior-pet nutrition", tag: "Specialty" },
      { name: "Joint & mobility supplements", tag: "Wellness" },
      { name: "Calming chews", tag: "Wellness" },
    ],
  },
  {
    id: "grooming",
    title: "Grooming & Care",
    blurb: "Gentle grooming and at-home essentials.",
    icon: Scissors,
    accent: "bg-mauve/15 text-ink",
    items: [
      { name: "Mobile groomers", tag: "Service" },
      { name: "Sensitive-skin shampoo", tag: "Product" },
      { name: "Brushing kits", tag: "Product" },
    ],
  },
  {
    id: "training",
    title: "Training & Behavior",
    blurb: "Build trust and rhythm with kind, modern methods.",
    icon: GraduationCap,
    accent: "bg-sage/10 text-sage-deep",
    items: [
      { name: "Puppy foundations (online)", tag: "Course", price: "from $39" },
      { name: "Reactive-dog programs", tag: "1:1" },
      { name: "Cat enrichment guides", tag: "Guide", note: "Free" },
    ],
  },
];

function MarketplacePage() {
  const [active, setActive] = useState<string>("all");
  const visible = active === "all" ? sections : sections.filter((s) => s.id === active);

  return (
    <div className="min-h-screen bg-background paper-grain">
      <SiteHeader />
      <main className="mx-auto max-w-md px-4 pt-4 pb-12 md:max-w-3xl">
        <header className="rounded-3xl bg-cream/60 px-5 py-6 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-sage/15 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-sage-deep">
            <ShieldCheck className="h-3 w-3" /> Curated with care
          </div>
          <h1 className="mt-3 font-display text-3xl text-foreground md:text-4xl">Marketplace</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Memory gifts, vetted products and trusted services — chosen for health, safety and heart.
          </p>
        </header>

        <nav className="mt-5 -mx-1 flex gap-2 overflow-x-auto pb-2">
          {[{ id: "all", title: "All" }, ...sections].map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs transition ${
                active === s.id
                  ? "bg-sage-deep text-primary-foreground"
                  : "border border-border/60 bg-card text-foreground/80 hover:bg-accent/10"
              }`}
            >
              {s.title}
            </button>
          ))}
        </nav>

        <div className="mt-5 space-y-7">
          {visible.map(({ id, title, blurb, icon: Icon, accent, items }) => (
            <section key={id} id={id} className="rounded-3xl border border-border/60 bg-card p-5 soft-shadow">
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${accent}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h2 className="font-display text-xl text-foreground">{title}</h2>
                  <p className="text-xs text-muted-foreground">{blurb}</p>
                </div>
              </div>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {items.map((it) => (
                  <li
                    key={it.name}
                    className="flex items-start justify-between gap-3 rounded-2xl bg-cream/50 px-3.5 py-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-foreground">{it.name}</div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <span className="rounded-full bg-background px-1.5 py-0.5">{it.tag}</span>
                        {it.note && <span className="italic">{it.note}</span>}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      {it.price && <div className="text-xs font-medium text-sage-deep">{it.price}</div>}
                      <button
                        disabled
                        className="mt-1 rounded-full border border-border/60 bg-background px-2.5 py-0.5 text-[10px] text-muted-foreground"
                      >
                        Soon
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-8 rounded-3xl bg-sage-deep/95 px-5 py-6 text-center text-primary-foreground">
          <Sparkles className="mx-auto h-5 w-5" />
          <h3 className="mt-2 font-display text-xl">A curated ecosystem, opening soon</h3>
          <p className="mt-1 text-xs text-primary-foreground/85">
            We're onboarding partners that meet our health & safety bar. Create a memorial today — your space will be ready when the marketplace opens.
          </p>
          <Link to="/create" className="mt-4 inline-block">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cream px-4 py-2 text-xs font-medium text-ink">
              Begin a memorial
            </span>
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
