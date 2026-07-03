import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { WaitlistDialog } from "@/components/site/WaitlistDialog";
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
  LifeBuoy,
  Shield,
  Medal,
  Bell,
} from "lucide-react";

export const Route = createFileRoute("/marketplace")({
  component: MarketplacePage,
  head: () => ({
    meta: [
      { title: "Marketplace — Rememfur" },
      { name: "description", content: "Curated memory gifts, vetted pet products, trusted services — plus grief support, adoption listings, hero & service pets." },
      { property: "og:title", content: "Rememfur Marketplace — Curated with care" },
      { property: "og:description", content: "Memory gifts, vetted products and trusted services for pet parents." },
    ],
  }),
});

type Item = { name: string; tag: string; price?: string; note?: string; img: string };

type Section = {
  id: string;
  title: string;
  blurb: string;
  icon: any;
  accent: string;
  items: Item[];
};

const u = (id: string, w = 400) => `https://images.unsplash.com/${id}?w=${w}&q=70&auto=format&fit=crop`;

const sections: Section[] = [
  {
    id: "memory",
    title: "Memory Gifts",
    blurb: "Tangible keepsakes to hold the love close.",
    icon: Gift,
    accent: "bg-terracotta/15 text-terracotta",
    items: [
      { name: "Engraved name tag", tag: "Keepsake", price: "from $24", img: u("photo-1601758228041-f3b2795255f1") },
      { name: "Framed portrait print", tag: "Keepsake", price: "from $48", img: u("photo-1583337130417-3346a1be7dee") },
      { name: "Cushion with their photo", tag: "Home", price: "from $36", img: u("photo-1591946614720-90a587da4a36") },
      { name: "Paw-print key chain", tag: "Pocket", price: "from $18", img: u("photo-1518791841217-8f162f1e1131") },
      { name: "Replica plush of your pet", tag: "Custom", price: "from $89", img: u("photo-1535268647677-300dbf3d78d1") },
      { name: "Hand-painted watercolor", tag: "Art", price: "from $120", img: u("photo-1561948955-570b270e7c36") },
    ],
  },
  {
    id: "condolences",
    title: "Condolence Cards",
    blurb: "Send a kind word — digital or printed and mailed.",
    icon: HeartHandshake,
    accent: "bg-mauve/20 text-ink",
    items: [
      { name: "Digital candle card", tag: "Free", note: "Sent instantly", img: u("photo-1606293459339-aa5d34a7b0e1") },
      { name: "Printed sympathy card", tag: "Mailed", price: "from $6", img: u("photo-1512314889357-e157c22f938d") },
      { name: "Tribute donation card", tag: "Giving back", price: "from $15", img: u("photo-1518770660439-4636190af475") },
    ],
  },
  {
    id: "funeral",
    title: "Funeral & Aftercare",
    blurb: "Compassionate cremation, burial and ceremony services.",
    icon: Flame,
    accent: "bg-sage/20 text-sage-deep",
    items: [
      { name: "Private cremation", tag: "Service", note: "Same-day urn return", img: u("photo-1518709268805-4e9042af2176") },
      { name: "Communal cremation", tag: "Service", note: "Eco-friendly", img: u("photo-1469474968028-56623f02e42e") },
      { name: "Memorial urns", tag: "Product", price: "from $65", img: u("photo-1578319439584-104c94d37305") },
      { name: "Burial plot directory", tag: "Directory", img: u("photo-1500382017468-9049fed747ef") },
      { name: "Home ceremony kit", tag: "Ritual", price: "from $40", img: u("photo-1602938749384-44f6a92acab9") },
    ],
  },
  {
    id: "vet",
    title: "Medical & Vet Care",
    blurb: "Trusted vets, clinics and end-of-life support.",
    icon: Stethoscope,
    accent: "bg-cream text-ink border border-border/60",
    items: [
      { name: "Find a local vet", tag: "Directory", img: u("photo-1628009368231-7bb7cfcb0def") },
      { name: "Tele-vet consult", tag: "Service", price: "from $29", img: u("photo-1581888227599-779811939961") },
      { name: "Hospice & palliative care", tag: "Care", img: u("photo-1450778869180-41d0601e046e") },
      { name: "Home euthanasia", tag: "Care", img: u("photo-1583511655826-05700d52f4d9") },
      { name: "Pet health insurance", tag: "Coverage", img: u("photo-1450778869180-41d0601e046e") },
    ],
  },
  {
    id: "grief",
    title: "Grief Support",
    blurb: "Helplines, counselors and circles for pet parents.",
    icon: LifeBuoy,
    accent: "bg-mauve/20 text-ink",
    items: [
      { name: "Pet Loss Helpline (24/7)", tag: "Free", note: "Confidential", img: u("photo-1573497019940-1c28c88b4f3e") },
      { name: "1:1 grief counselor", tag: "Service", price: "from $45/session", img: u("photo-1573497019418-b400bb3ab074") },
      { name: "Weekly support circle", tag: "Community", note: "Sundays · online", img: u("photo-1529156069898-49953e39b3ac") },
      { name: "Grief journaling kit", tag: "Product", price: "from $22", img: u("photo-1455390582262-044cdead277a") },
    ],
  },
  {
    id: "adoption",
    title: "Adoption Listings",
    blurb: "Pets near you, waiting for a soft place to land.",
    icon: HomeIcon,
    accent: "bg-sage/15 text-sage-deep",
    items: [
      { name: "Mango · tabby kitten", tag: "Austin, TX", note: "4 months", img: u("photo-1574144611937-0df059b5ef3e") },
      { name: "Biscuit · beagle mix", tag: "Portland, OR", note: "2 years", img: u("photo-1543466835-00a7907e9de1") },
      { name: "Luna · black lab", tag: "Brooklyn, NY", note: "5 years", img: u("photo-1583337130417-3346a1be7dee") },
      { name: "Pixel · bunny", tag: "Seattle, WA", note: "1 year", img: u("photo-1535241749838-299277b6305f") },
      { name: "Olive · senior cat", tag: "Denver, CO", note: "10 years", img: u("photo-1514888286974-6c03e2ca1dba") },
      { name: "Browse all shelters", tag: "Directory", img: u("photo-1450778869180-41d0601e046e") },
    ],
  },
  {
    id: "hero",
    title: "Hero Pets",
    blurb: "Honoring search, rescue and working pups who saved lives.",
    icon: Medal,
    accent: "bg-terracotta/15 text-terracotta",
    items: [
      { name: "Search & rescue K-9s", tag: "Tribute", img: u("photo-1552053831-71594a27632d") },
      { name: "Avalanche dogs", tag: "Tribute", img: u("photo-1583511655857-d19b40a7a54e") },
      { name: "Therapy dogs of 9/11", tag: "Memorial", img: u("photo-1587300003388-59208cc962cb") },
      { name: "Nominate a hero pet", tag: "Submit", note: "Community-curated", img: u("photo-1601758228041-f3b2795255f1") },
    ],
  },
  {
    id: "service",
    title: "Service Pets",
    blurb: "Guide, assistance and emotional-support partners.",
    icon: Shield,
    accent: "bg-sage/15 text-sage-deep",
    items: [
      { name: "Guide dogs", tag: "Working", img: u("photo-1561037404-61cd46aa615b") },
      { name: "Mobility assistance dogs", tag: "Working", img: u("photo-1517849845537-4d257902454a") },
      { name: "Diabetic alert dogs", tag: "Medical", img: u("photo-1587300003388-59208cc962cb") },
      { name: "ESA registration help", tag: "Service", price: "from $35", img: u("photo-1583337130417-3346a1be7dee") },
      { name: "Training partners directory", tag: "Directory", img: u("photo-1450778869180-41d0601e046e") },
    ],
  },
  {
    id: "food",
    title: "Food & Supplements",
    blurb: "Vetted nutrition that meets our health & safety bar.",
    icon: ShoppingBag,
    accent: "bg-terracotta/10 text-terracotta",
    items: [
      { name: "Fresh meal subscriptions", tag: "Subscription", img: u("photo-1568640347023-a616a30bc3bd") },
      { name: "Senior-pet nutrition", tag: "Specialty", img: u("photo-1589924691995-400dc9ecc119") },
      { name: "Joint & mobility supplements", tag: "Wellness", img: u("photo-1559757175-5700dde675bc") },
      { name: "Calming chews", tag: "Wellness", img: u("photo-1583337130417-3346a1be7dee") },
    ],
  },
  {
    id: "grooming",
    title: "Grooming & Care",
    blurb: "Gentle grooming and at-home essentials.",
    icon: Scissors,
    accent: "bg-mauve/15 text-ink",
    items: [
      { name: "Mobile groomers", tag: "Service", img: u("photo-1591946614720-90a587da4a36") },
      { name: "Sensitive-skin shampoo", tag: "Product", img: u("photo-1535268647677-300dbf3d78d1") },
      { name: "Brushing kits", tag: "Product", img: u("photo-1601758228041-f3b2795255f1") },
    ],
  },
  {
    id: "training",
    title: "Training & Behavior",
    blurb: "Build trust and rhythm with kind, modern methods.",
    icon: GraduationCap,
    accent: "bg-sage/10 text-sage-deep",
    items: [
      { name: "Puppy foundations (online)", tag: "Course", price: "from $39", img: u("photo-1587300003388-59208cc962cb") },
      { name: "Reactive-dog programs", tag: "1:1", img: u("photo-1552053831-71594a27632d") },
      { name: "Cat enrichment guides", tag: "Guide", note: "Free", img: u("photo-1514888286974-6c03e2ca1dba") },
    ],
  },
];

function MarketplacePage() {
  const [active, setActive] = useState<string>("all");
  const visible = active === "all" ? sections : sections.filter((s) => s.id === active);

  return (
    <div className="min-h-screen bg-[#05070f] text-white">
      <SiteHeader />
      <main className="mx-auto max-w-md px-4 pt-4 pb-32 md:max-w-3xl">
        <header className="rounded-3xl bg-white/[0.05] px-5 py-6 text-center ring-1 ring-white/10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-200/15 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-amber-200">
            <ShieldCheck className="h-3 w-3" /> Curated with care
          </div>
          <h1 className="mt-3 font-display text-3xl text-white md:text-4xl">Marketplace</h1>
          <p className="mt-2 text-sm text-white/70">
            Memory gifts, vetted products, trusted services — plus grief support, adoption, hero & service pets.
          </p>
        </header>

        <nav className="mt-5 -mx-1 flex gap-2 overflow-x-auto pb-2">
          {[{ id: "all", title: "All" }, ...sections].map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs transition ${
                active === s.id
                  ? "bg-amber-300 text-[#1a1200]"
                  : "border border-white/10 bg-white/[0.05] text-white/80 hover:bg-white/[0.1]"
              }`}
            >
              {s.title}
            </button>
          ))}
        </nav>

        <div className="mt-5 space-y-7">
          {visible.map(({ id, title, blurb, icon: Icon, items }) => (
            <section key={id} id={id} className="rounded-3xl border border-white/10 bg-white/[0.05] p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-200/15 text-amber-200">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h2 className="font-display text-xl text-white">{title}</h2>
                  <p className="text-xs text-white/60">{blurb}</p>
                </div>
              </div>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {items.map((it) => (
                  <li
                    key={it.name}
                    className="flex gap-3 rounded-2xl bg-white/[0.04] p-2.5 ring-1 ring-white/10"
                  >
                    <img
                      src={it.img}
                      alt={it.name}
                      loading="lazy"
                      className="h-20 w-20 shrink-0 rounded-xl object-cover"
                    />
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-white">{it.name}</div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px] text-white/60">
                          <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-white/80">{it.tag}</span>
                          {it.note && <span className="italic text-white/55">{it.note}</span>}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        {it.price ? (
                          <div className="text-xs font-medium text-amber-200">{it.price}</div>
                        ) : <span />}
                        <WaitlistDialog
                          itemName={it.name}
                          section={id}
                          trigger={
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 rounded-full border border-amber-200/40 bg-amber-200/10 px-2.5 py-0.5 text-[10px] font-medium text-amber-100 transition hover:bg-amber-200/20"
                            >
                              <Bell className="h-3 w-3" /> Notify me
                            </button>
                          }
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-8 rounded-3xl bg-amber-300 px-5 py-6 text-center text-[#1a1200]">
          <Sparkles className="mx-auto h-5 w-5" />
          <h3 className="mt-2 font-display text-xl">A curated ecosystem, opening soon</h3>
          <p className="mt-1 text-xs opacity-85">
            We're onboarding partners that meet our health & safety bar. Create a memorial today — your space will be ready when the marketplace opens.
          </p>
          <Link to="/create" className="mt-4 inline-block">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1a1200] px-4 py-2 text-xs font-medium text-amber-200">
              Begin a memorial
            </span>
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
