import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { getMemorialBySlug } from "@/lib/memorials.functions";
import { lightCandle, postMessage } from "@/lib/tributes.functions";
import { useAuth } from "@/hooks/use-auth";
import { Flame, Heart, MessageCircle, Share2, Pencil, Gift } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/memorial/$slug")({
  component: MemorialPage,
  loader: async ({ params }) => {
    const data = await getMemorialBySlug({ data: { slug: params.slug } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Memorial — Rememfur" }] };
    const m = loaderData.memorial;
    const img = m.transformed_image_url ?? m.hero_image_url;
    return {
      meta: [
        { title: `${m.pet_name} — A Rememfur memorial` },
        { name: "description", content: m.epitaph ?? `Honoring ${m.pet_name}, forever loved.` },
        { property: "og:title", content: `${m.pet_name} — Forever loved` },
        { property: "og:description", content: m.epitaph ?? `Honoring ${m.pet_name}.` },
        ...(img ? [{ property: "og:image", content: img }, { name: "twitter:image", content: img }] : []),
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
});

function MemorialPage() {
  const data = Route.useLoaderData();
  const { memorial: m, photos, candles, messages } = data;
  const { user } = useAuth();
  const qc = useQueryClient();
  const fetchMemorial = useServerFn(getMemorialBySlug);
  const fetchLightCandle = useServerFn(lightCandle);
  const fetchPostMessage = useServerFn(postMessage);

  const { data: fresh } = useQuery({
    queryKey: ["memorial", m.slug],
    queryFn: () => fetchMemorial({ data: { slug: m.slug } }),
    initialData: data,
  });
  const current = fresh ?? data;

  const candleMut = useMutation({
    mutationFn: (vars: { message?: string }) =>
      fetchLightCandle({ data: { memorial_id: m.id, message: vars.message ?? null } }),
    onSuccess: () => {
      toast.success("Candle lit. Their light glows on.");
      setCandleMsg("");
      qc.invalidateQueries({ queryKey: ["memorial", m.slug] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const msgMut = useMutation({
    mutationFn: (vars: { body: string }) => fetchPostMessage({ data: { memorial_id: m.id, body: vars.body } }),
    onSuccess: () => {
      toast.success("Message shared.");
      setBody("");
      qc.invalidateQueries({ queryKey: ["memorial", m.slug] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const [candleMsg, setCandleMsg] = useState("");
  const [body, setBody] = useState("");

  const hero = m.transformed_image_url ?? m.hero_image_url;
  const years = [m.birth_date?.slice(0, 4), m.passing_date?.slice(0, 4)].filter(Boolean).join(" – ");

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: `${m.pet_name} — Rememfur`, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    }
  };

  return (
    <div className="min-h-screen bg-background paper-grain">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-10">
        <div className="overflow-hidden rounded-[2rem] border border-border/60 soft-shadow">
          <div className="relative">
            {hero ? (
              <img src={hero} alt={m.pet_name} className="h-[420px] w-full object-cover md:h-[520px]" />
            ) : (
              <div className="flex h-[400px] items-center justify-center bg-muted text-6xl">🐾</div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 flex flex-wrap items-end justify-between gap-3 p-8">
              <div>
                <h1 className="font-display text-5xl text-ink md:text-6xl">{m.pet_name}</h1>
                <div className="mt-1 text-sm text-ink/70">{years || "Forever loved"}</div>
                {m.epitaph && <p className="mt-3 max-w-xl font-display text-xl italic text-ink/80">"{m.epitaph}"</p>}
              </div>
              <div className="flex items-center gap-4 text-sm text-ink/80">
                <div className="flex items-center gap-1"><Flame className="h-4 w-4 text-terracotta" /> {current.candles.length} candles</div>
                <div className="flex items-center gap-1"><MessageCircle className="h-4 w-4 text-sage-deep" /> {current.messages.length} messages</div>
                <Button variant="outline" size="sm" onClick={share} className="rounded-full border-ink/15 bg-cream/80">
                  <Share2 className="mr-1.5 h-3.5 w-3.5" /> Share
                </Button>
                {user?.id === m.owner_id && (
                  <Link to="/memorial/$slug/edit" params={{ slug: m.slug }}>
                    <Button variant="outline" size="sm" className="rounded-full border-ink/15 bg-cream/80">
                      <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-3">
          <div className="space-y-8 md:col-span-2">
            {m.story && (
              <section className="rounded-3xl border border-border/60 bg-card p-7 soft-shadow">
                <h2 className="font-display text-2xl text-foreground">About {m.pet_name}</h2>
                <p className="mt-3 whitespace-pre-line leading-relaxed text-foreground/90">{m.story}</p>
              </section>
            )}

            {photos.length > 0 && (
              <section className="rounded-3xl border border-border/60 bg-card p-7 soft-shadow">
                <h2 className="font-display text-2xl text-foreground">Gallery</h2>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {photos.map((p: any) => (
                    <img key={p.id} src={p.image_url} alt={p.caption ?? m.pet_name} loading="lazy" className="aspect-square rounded-2xl object-cover" />
                  ))}
                </div>
              </section>
            )}

            <section className="rounded-3xl border border-border/60 bg-card p-7 soft-shadow">
              <h2 className="flex items-center gap-2 font-display text-2xl text-foreground">
                <MessageCircle className="h-5 w-5 text-sage-deep" /> Messages
              </h2>
              {user ? (
                <div className="mt-4 space-y-2">
                  <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder={`Share a memory of ${m.pet_name}…`} rows={3} />
                  <div className="flex justify-end">
                    <Button onClick={() => body.trim() && msgMut.mutate({ body: body.trim() })} disabled={msgMut.isPending || !body.trim()} className="rounded-full bg-sage-deep text-primary-foreground hover:bg-sage-deep/90">
                      Share message
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground"><Link to="/login" className="text-sage-deep hover:underline">Sign in</Link> to leave a message.</p>
              )}
              <ul className="mt-6 space-y-4">
                {current.messages.length === 0 && <li className="text-sm italic text-muted-foreground">Be the first to leave a kind word.</li>}
                {current.messages.map((msg: any) => (
                  <li key={msg.id} className="rounded-2xl bg-cream/60 p-4">
                    <div className="text-xs text-muted-foreground">{msg.author_name} · {format(new Date(msg.created_at), "MMM d, yyyy")}</div>
                    <p className="mt-1 whitespace-pre-line text-sm text-foreground">{msg.body}</p>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="rounded-3xl border border-border/60 bg-card p-6 text-center soft-shadow">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-terracotta/15">
                <Flame className="h-7 w-7 text-terracotta" />
              </div>
              <h3 className="mt-4 font-display text-xl text-foreground">Light a candle</h3>
              <p className="mt-1 text-xs text-muted-foreground">Keep their memory shining bright.</p>
              {user ? (
                <div className="mt-4 space-y-2 text-left">
                  <Textarea value={candleMsg} onChange={(e) => setCandleMsg(e.target.value)} placeholder="A few words (optional)" rows={2} />
                  <Button onClick={() => candleMut.mutate({ message: candleMsg.trim() || undefined })} disabled={candleMut.isPending} className="w-full rounded-full bg-terracotta text-accent-foreground hover:bg-terracotta/90">
                    <Heart className="mr-1.5 h-4 w-4 fill-current" /> Light candle
                  </Button>
                </div>
              ) : (
                <Link to="/login" className="mt-4 inline-block">
                  <Button variant="outline" className="rounded-full">Sign in to light</Button>
                </Link>
              )}
            </div>

            {current.candles.length > 0 && (
              <div className="rounded-3xl border border-border/60 bg-card p-6 soft-shadow">
                <h3 className="font-display text-lg text-foreground">Recent candles</h3>
                <ul className="mt-3 space-y-3 text-sm">
                  {current.candles.slice(0, 8).map((c: any) => (
                    <li key={c.id} className="flex gap-2">
                      <Flame className="mt-0.5 h-3.5 w-3.5 shrink-0 text-terracotta" />
                      <div>
                        <div className="text-foreground">{c.lit_by_name ?? "Someone"}</div>
                        {c.message && <div className="text-xs italic text-muted-foreground">"{c.message}"</div>}
                        <div className="text-[10px] text-muted-foreground">{format(new Date(c.created_at), "MMM d, yyyy")}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
