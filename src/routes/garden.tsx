import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { listGardenMemorials } from "@/lib/memorials.functions";
import { Search } from "lucide-react";
import { PawLamp } from "@/components/site/PawLamp";

export const Route = createFileRoute("/garden")({
  component: GardenPage,
  head: () => ({
    meta: [
      { title: "Memorial Garden — Rememfur" },
      { name: "description", content: "Browse memorials lovingly created for the pets we miss — dogs, cats and every other companion. Light a paw lamp, leave a word, and remember together." },
      { property: "og:title", content: "The Memorial Garden — Rememfur" },
      { property: "og:description", content: "A shared garden of pet memorials. Wander among the dogs, cats and companions others are remembering, light a paw lamp and leave a gentle word." },
      { property: "og:url", content: "https://rememfur.com/garden" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://rememfur.com/garden" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Memorial Garden",
          description: "A collection of pet memorials created on Rememfur.",
          url: "https://rememfur.com/garden",
          isPartOf: { "@type": "WebSite", name: "Rememfur", url: "https://rememfur.com" },
        }),
      },
    ],
  }),
});

const filters = [
  { key: "all", label: "All pets" },
  { key: "dog", label: "Dogs" },
  { key: "cat", label: "Cats" },
  { key: "other", label: "Others" },
];

function GardenPage() {
  const [species, setSpecies] = useState("all");
  const [q, setQ] = useState("");
  const fetchList = useServerFn(listGardenMemorials);
  const { data, isLoading } = useQuery({
    queryKey: ["garden", species, q],
    queryFn: () => fetchList({ data: { species, q } }),
  });

  return (
    <div className="warm-platform min-h-screen bg-background paper-grain">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-14">
        <div className="border-b border-border px-1 pb-8 text-center md:text-left">
          <p className="font-hand text-2xl text-primary">each photograph holds a whole life</p>
          <h1 className="mt-1 font-display text-4xl md:text-5xl">Memorial Garden</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">A place where love lives on. Wander, remember, light a paw lamp.</p>

          <div className="mt-7 flex flex-wrap items-center gap-2">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setSpecies(f.key)}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${
                  species === f.key
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:bg-muted"
                }`}
              >
                {f.label}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5">
              <Search className="h-4 w-4 text-primary" />
              <Input
                placeholder="Search by name…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="h-7 border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
              />
            </div>
          </div>
        </div>

        <section className="mt-10">
          {isLoading ? (
            <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[3/4] animate-pulse rounded-3xl bg-muted" />
              ))}
            </div>
          ) : (data?.length ?? 0) === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card/60 p-16 text-center">
              <p className="font-display text-2xl text-foreground">The garden is just beginning.</p>
              <p className="mt-2 text-muted-foreground">Be the first to plant a memory.</p>
              <Link to="/signup" className="mt-6 inline-block">
                <Button className="rounded-full bg-sage-deep text-primary-foreground hover:bg-sage-deep/90">Create a memorial</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {data!.map((m) => {
                const img = m.transformed_image_url ?? m.hero_image_url;
                const years = [m.birth_date?.slice(0, 4), m.passing_date?.slice(0, 4)].filter(Boolean).join(" – ");
                return (
                  <Link
                    key={m.id}
                    to="/memorial/$slug"
                    params={{ slug: m.slug }}
                    className={`polaroid garden-polaroid group block transition hover:-translate-y-1 ${m.id.charCodeAt(0) % 2 ? "rotate-[1deg]" : "-rotate-[1deg]"}`}
                  >
                    <span aria-hidden className="tape absolute -top-2 left-1/2 z-10 -translate-x-1/2 rotate-[-2deg]" />
                    <div className="relative aspect-square w-full overflow-hidden bg-muted">
                      {img ? (
                        <img src={img} alt={m.pet_name} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">🐾</div>
                      )}
                    </div>
                    <div className="px-2 pb-1 pt-3 text-center">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="font-hand text-2xl leading-none text-foreground">{m.pet_name}</div>
                          <div className="mt-1 font-hand text-base text-muted-foreground">{years || "forever loved"}</div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-primary" aria-label={`${m.candle_count} paw lamps`}>
                          <PawLamp size={15} /> {m.candle_count}
                        </div>
                      </div>
                      {m.epitaph && <p className="mt-2 line-clamp-2 font-hand text-lg leading-tight text-muted-foreground">“{m.epitaph}”</p>}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
