import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { listMyMemorials } from "@/lib/memorials.functions";
import { useAuth } from "@/hooks/use-auth";
import { Plus } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "My memorials — Rememfur" }] }),
});

function Dashboard() {
  const { user } = useAuth();
  const fetchMine = useServerFn(listMyMemorials);
  const { data, isLoading } = useQuery({
    queryKey: ["my-memorials"],
    queryFn: () => fetchMine(),
    enabled: !!user,
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-foreground">My memorials</h1>
          <p className="mt-1 text-sm text-muted-foreground">A private space for the bonds you've honored.</p>
        </div>
        <Link to="/create">
          <Button className="rounded-full bg-sage-deep text-primary-foreground hover:bg-sage-deep/90">
            <Plus className="mr-1.5 h-4 w-4" /> Create memorial
          </Button>
        </Link>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(2)].map((_, i) => <div key={i} className="h-44 animate-pulse rounded-3xl bg-muted" />)}
          </div>
        ) : (data?.length ?? 0) === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card/60 p-14 text-center">
            <p className="font-display text-2xl text-foreground">No memorials yet.</p>
            <p className="mt-2 text-sm text-muted-foreground">When you're ready, begin with one breath and one photo.</p>
            <Link to="/create" className="mt-5 inline-block">
              <Button className="rounded-full bg-sage-deep text-primary-foreground hover:bg-sage-deep/90">Begin the ritual</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {data!.map((m: any) => {
              const img = m.transformed_image_url ?? m.hero_image_url;
              return (
                <Link key={m.id} to="/memorial/$slug" params={{ slug: m.slug }} className="group flex gap-4 overflow-hidden rounded-3xl border border-border/60 bg-card p-3 soft-shadow transition hover:-translate-y-0.5">
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-muted">
                    {img ? <img src={img} alt={m.pet_name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-2xl">🐾</div>}
                  </div>
                  <div className="flex flex-col py-1">
                    <div className="font-display text-xl text-foreground">{m.pet_name}</div>
                    <div className="text-xs text-muted-foreground capitalize">{m.species}{m.passing_date ? ` · Angel day ${format(new Date(m.passing_date), "MMM d")}` : ""}</div>
                    <div className="mt-auto text-xs text-sage-deep group-hover:underline">View memorial →</div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
