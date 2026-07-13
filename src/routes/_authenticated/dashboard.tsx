import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { listMyMemorials } from "@/lib/memorials.functions";
import { sinceYouWereAway } from "@/lib/notifications.functions";
import { useAuth } from "@/hooks/use-auth";
import { consumePostAuthIntent } from "@/lib/post-auth-intent";
import { Plus, Flame, MessageCircle, Heart, X } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "My memorials — Rememfur" }] }),
});

const TYPE_LABEL: Record<string, { verb: string; icon: typeof Flame }> = {
  candle: { verb: "paw lamps were lit", icon: Flame },
  candle_lit: { verb: "paw lamps were lit", icon: Flame },
  comment: { verb: "new messages", icon: MessageCircle },
  message: { verb: "new messages", icon: MessageCircle },
  like: { verb: "hearts", icon: Heart },
  paw: { verb: "hearts", icon: Heart },
};

function phrase(count: number, type: string, petName: string) {
  const meta = TYPE_LABEL[type] ?? { verb: "moments", icon: Flame };
  if (meta.verb === "paw lamps were lit") {
    return count === 1 ? `A paw lamp was lit for ${petName} while you were away` : `${count} paw lamps were lit for ${petName} while you were away`;
  }
  if (meta.verb === "new messages") {
    return count === 1 ? `A new message was left for ${petName}` : `${count} new messages were left for ${petName}`;
  }
  if (meta.verb === "hearts") {
    return count === 1 ? `Someone left a heart for ${petName}` : `${count} people left hearts for ${petName}`;
  }
  return count === 1 ? `A new moment for ${petName}` : `${count} new moments for ${petName}`;
}

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fetchMine = useServerFn(listMyMemorials);
  const fetchSince = useServerFn(sinceYouWereAway);

  const { data, isLoading } = useQuery({
    queryKey: ["my-memorials"],
    queryFn: () => fetchMine(),
    enabled: !!user,
  });

  // Honor the post-auth intent set on /signup or /login (only when no ?redirect was used).
  // "welcome" → route new signup into the create flow with the welcome hero.
  useEffect(() => {
    const intent = consumePostAuthIntent();
    if (intent === "welcome") {
      navigate({ to: "/create", search: { welcome: 1 } as never, replace: true });
    }
  }, [navigate]);

  const memorialsCount = data?.length ?? 0;
  const hasNoMemorials = !isLoading && memorialsCount === 0;

  // Only fetch the homecoming summary when the user actually has memorials to greet them about.
  const { data: since } = useQuery({
    queryKey: ["since-you-were-away"],
    queryFn: () => fetchSince(),
    enabled: !!user && memorialsCount > 0,
    staleTime: 60_000,
  });

  const [dismissed, setDismissed] = useState(false);
  const banner = !dismissed && (since?.length ?? 0) > 0 ? since! : [];

  if (hasNoMemorials) {
    return <ZeroStateWelcome />;
  }

  return (
    <div>
      {banner.length > 0 && (
        <div className="mb-6 overflow-hidden rounded-3xl border border-amber-400/30 bg-gradient-to-br from-amber-400/15 via-amber-300/10 to-transparent p-5 soft-shadow">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-amber-300">
              <Flame className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="font-display text-lg text-foreground">While you were away…</div>
              <ul className="mt-2 space-y-1.5">
                {banner.map((b) => (
                  <li key={`${b.memorial_id}:${b.type}`}>
                    <Link
                      to="/memorial/$slug"
                      params={{ slug: b.memorial!.slug }}
                      className="group flex items-center gap-2 text-sm text-foreground/85 hover:text-foreground"
                    >
                      <span className="inline-flex h-1.5 w-1.5 rounded-full bg-amber-300/80" />
                      <span>{phrase(b.count, b.type, b.memorial!.pet_name)}</span>
                      <span className="text-xs text-amber-300/80 opacity-0 transition group-hover:opacity-100">Visit →</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => setDismissed(true)}
              aria-label="Dismiss"
              className="rounded-full p-1.5 text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

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

function ZeroStateWelcome() {
  return (
    <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-card via-card/80 to-transparent p-10 text-center soft-shadow md:p-14">
      <p className="font-display text-3xl text-foreground md:text-4xl">Welcome. Who are we remembering?</p>
      <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
        Take your time. We'll keep everything safe as you go — you can pause, come back, and finish whenever feels right.
      </p>
      <Link to="/create" search={{ welcome: 1 } as never} className="mt-6 inline-block">
        <Button className="rounded-full bg-amber-400 px-6 text-navy hover:bg-amber-300">
          <Plus className="mr-1.5 h-4 w-4" /> Begin a memorial
        </Button>
      </Link>
    </div>
  );
}
