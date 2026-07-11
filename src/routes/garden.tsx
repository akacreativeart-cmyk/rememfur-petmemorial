import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { listGardenMemorials } from "@/lib/memorials.functions";
import { Flame, Search } from "lucide-react";

export const Route = createFileRoute("/garden")({
  component: GardenPage,
  head: () => ({
    meta: [
      { title: "Memorial Garden — Rememfur" },
      { name: "description", content: "Browse memorials lovingly created for the pets we miss. Release a star, leave a word." },
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
    <div className="min-h-screen bg-background paper-grain">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-14">
        <div className="rounded-[2rem] bg-navy/95 p-8 text-cream md:p-12">
          <h1 className="font-display text-4xl md:text-5xl">Memorial Garden</h1>
          <p className="mt-2 max-w-xl text-cream/75">A place where love lives on. Wander, remember, release a star.</p>

          <div className="mt-7 flex flex-wrap items-center gap-2">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setSpecies(f.key)}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${
                  species === f.key
                    ? "border-cream bg-cream text-navy"
                    : "border-cream/30 text-cream/80 hover:bg-cream/10"
                }`}
              >
                {f.label}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2 rounded-full bg-cream/10 px-3 py-1.5">
              <Search className="h-4 w-4 text-cream/70" />
              <Input
                placeholder="Search by name…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="h-7 border-0 bg-transparent text-cream placeholder:text-cream/50 focus-visible:ring-0"
              />
            </div>
          </div>
        </div>

        <section className="mt-10">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
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
                    className="group overflow-hidden rounded-3xl border border-border/60 bg-card soft-shadow transition hover:-translate-y-0.5"
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-muted">
                      {img ? (
                        <img src={img} alt={m.pet_name} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">🐾</div>
                      )}
                    </div>
                    <div className="px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-display text-lg text-foreground">{m.pet_name}</div>
                          <div className="text-xs text-muted-foreground">{years || "Forever loved"}</div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-terracotta">
                          <Flame className="h-3.5 w-3.5" /> {m.candle_count}
                        </div>
                      </div>
                      {m.epitaph && <p className="mt-2 line-clamp-2 text-xs italic text-muted-foreground">"{m.epitaph}"</p>}
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
