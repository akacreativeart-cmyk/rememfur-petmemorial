import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Archive, ArrowLeft, ArrowRight, PawPrint, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PawLamp } from "@/components/site/PawLamp";
import { browseArchive } from "@/lib/archive.functions";
import { archiveSchema, defaultArchiveFilters, type ArchiveFilters } from "@/lib/archive";

const archiveQuery = (filters: ArchiveFilters) => queryOptions({ queryKey: ["memorial-archive", filters], queryFn: () => browseArchive({ data: filters }) });

export const Route = createFileRoute("/archive")({
  loader: ({ context }) => context.queryClient.ensureQueryData(archiveQuery(defaultArchiveFilters)),
  component: ArchivePage,
  head: () => ({ meta: [
    { title: "Memorial Archive — Rememfur" },
    { name: "description", content: "Remember every companion. Browse public pet memorials by pet, passing date and paw lamps." },
    { property: "og:title", content: "Memorial Archive — Rememfur" },
    { property: "og:description", content: "A photograph, a name, a lifetime of love. Find and visit pet memorials." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
});

function ArchivePage() {
  const [draft, setDraft] = useState(defaultArchiveFilters);
  const [filters, setFilters] = useState(defaultArchiveFilters);
  const [error, setError] = useState("");
  const { data } = useSuspenseQuery(archiveQuery(filters));
  const pages = Math.max(1, Math.ceil(data.total / 24));
  function update(key: keyof ArchiveFilters, value: string | number | null) { setDraft((prev) => ({ ...prev, [key]: value })); }
  function reset() { setDraft(defaultArchiveFilters); setFilters(defaultArchiveFilters); setError(""); }
  return (
    <div className="warm-platform min-h-screen bg-background text-foreground paper-grain">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
        <header className="border-b border-border pb-8">
          <div className="flex items-center gap-2 text-primary"><Archive className="h-4 w-4" /><span className="font-hand text-2xl">love, kept here</span></div>
          <h1 className="mt-2 font-display text-4xl md:text-5xl">Memorial archive</h1>
          <p className="mt-3 text-muted-foreground">Every name holds a lifetime.</p>
        </header>
        <form className="grid gap-4 border-b border-border py-6 sm:grid-cols-2 lg:grid-cols-4" onSubmit={(e) => {
          e.preventDefault();
          const parsed = archiveSchema.safeParse({ ...draft, page: 1 });
          if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Check your filters."); return; }
          setError(""); setFilters(parsed.data);
        }}>
          <div className="space-y-2"><label htmlFor="archive-name" className="text-sm font-semibold">Pet name</label><Input id="archive-name" placeholder="Find a companion…" value={draft.name} maxLength={80} onChange={(e) => update("name", e.target.value)} /></div>
          <div className="space-y-2"><label htmlFor="archive-pet" className="text-sm font-semibold">Pet</label><Select value={draft.species} onValueChange={(v) => update("species", v)}><SelectTrigger id="archive-pet"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All pets</SelectItem><SelectItem value="dog">Dogs</SelectItem><SelectItem value="cat">Cats</SelectItem><SelectItem value="other">Other companions</SelectItem></SelectContent></Select></div>
          <div className="space-y-2"><label htmlFor="archive-from" className="text-sm font-semibold">Passed away from</label><Input id="archive-from" type="date" value={draft.from} onChange={(e) => update("from", e.target.value)} /></div>
          <div className="space-y-2"><label htmlFor="archive-to" className="text-sm font-semibold">Passed away through</label><Input id="archive-to" type="date" value={draft.to} onChange={(e) => update("to", e.target.value)} /></div>
          <div className="space-y-2"><label htmlFor="archive-min" className="text-sm font-semibold">Minimum paw lamps</label><Input id="archive-min" type="number" min={0} max={1000000} value={draft.min} onChange={(e) => update("min", Number(e.target.value))} /></div>
          <div className="space-y-2"><label htmlFor="archive-max" className="text-sm font-semibold">Maximum paw lamps</label><Input id="archive-max" type="number" min={0} max={1000000} placeholder="Any number" value={draft.max ?? ""} onChange={(e) => update("max", e.target.value === "" ? null : Number(e.target.value))} /></div>
          <div className="space-y-2"><label htmlFor="archive-sort" className="text-sm font-semibold">Sort by</label><Select value={draft.sort} onValueChange={(v) => update("sort", v)}><SelectTrigger id="archive-sort"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="newest">Newest memorials</SelectItem><SelectItem value="oldest">Oldest memorials</SelectItem><SelectItem value="passing">Most recent passing</SelectItem><SelectItem value="lamps">Most paw lamps</SelectItem></SelectContent></Select></div>
          <div className="flex items-end gap-2"><Button type="submit" className="flex-1"><Search /> Apply filters</Button><Button type="button" variant="outline" size="icon" title="Clear filters" aria-label="Clear filters" onClick={reset}><RotateCcw /></Button></div>
          {error && <p role="alert" className="text-sm text-destructive sm:col-span-2 lg:col-span-4">{error}</p>}
        </form>
        <div className="flex items-center justify-between py-6"><p role="status" className="text-sm text-muted-foreground">{data.total} {data.total === 1 ? "memorial" : "memorials"}</p><Link to="/garden" className="text-sm text-primary underline underline-offset-4">Visit the garden</Link></div>
        {data.rows.length === 0 ? <div className="py-16 text-center"><PawPrint className="mx-auto h-8 w-8 text-primary" /><h2 className="mt-4 font-display text-2xl">No memorials found</h2><Button variant="outline" className="mt-5" onClick={reset}>Clear filters</Button></div> :
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {data.rows.map((m) => <Link key={m.id} to="/memorial/$slug" params={{ slug: m.slug }} className="polaroid garden-polaroid group block transition-transform hover:-translate-y-1">
              <div className="aspect-square overflow-hidden bg-muted">{m.hero_image_url ? <img src={m.hero_image_url} alt={m.pet_name} loading="lazy" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><PawPrint className="h-12 w-12 text-muted-foreground" /></div>}</div>
              <div className="px-2 py-3 text-center"><h2 className="break-words font-hand text-2xl text-foreground">{m.pet_name}</h2><p className="mt-1 font-hand text-base text-muted-foreground">{[m.birth_date?.slice(0,4),m.passing_date?.slice(0,4)].filter(Boolean).join(" – ") || "forever loved"}</p>{m.epitaph && <p className="mt-2 line-clamp-2 font-hand text-lg text-foreground">“{m.epitaph}”</p>}<div className="mt-3 flex items-center justify-center gap-2 text-sm text-primary"><PawLamp size={16} glow={false} />{m.paw_lamp_count} {m.paw_lamp_count === 1 ? "paw lamp" : "paw lamps"}</div></div>
            </Link>)}
          </div>}
        {pages > 1 && <nav aria-label="Archive pages" className="mt-10 flex items-center justify-center gap-4"><Button variant="outline" size="icon" aria-label="Previous page" disabled={filters.page <= 1} onClick={() => setFilters((v) => ({ ...v, page: v.page - 1 }))}><ArrowLeft /></Button><span className="text-sm">Page {filters.page} of {pages}</span><Button variant="outline" size="icon" aria-label="Next page" disabled={filters.page >= pages} onClick={() => setFilters((v) => ({ ...v, page: v.page + 1 }))}><ArrowRight /></Button></nav>}
      </main>
      <SiteFooter />
    </div>
  );
}