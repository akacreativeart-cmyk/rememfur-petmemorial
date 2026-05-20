import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PostCard } from "@/components/feed/PostCard";
import { ComposePost } from "@/components/feed/ComposePost";
import { listFeed } from "@/lib/feed.functions";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/community")({
  component: CommunityPage,
  head: () => ({
    meta: [
      { title: "Community — Rememfur" },
      { name: "description", content: "Share photos and memories of beloved pets with a supportive community." },
      { property: "og:title", content: "Community — Rememfur" },
      { property: "og:description", content: "Share photos and memories of beloved pets." },
    ],
  }),
});

function CommunityPage() {
  const { user } = useAuth();
  const [scope, setScope] = useState<"all" | "following">("all");
  const feedFn = useServerFn(listFeed);

  const { data: posts, isLoading } = useQuery({
    queryKey: ["feed", scope, user?.id ?? "anon"],
    queryFn: () => feedFn({ data: { scope, viewerId: user?.id ?? null } }),
  });

  return (
    <div className="min-h-screen bg-background paper-grain">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-5 py-10">
        <header className="mb-8 text-center">
          <h1 className="font-display text-4xl text-foreground md:text-5xl">Community</h1>
          <p className="mt-2 text-muted-foreground">A gentle place to share memories, photos, and kind words.</p>
        </header>

        {user ? (
          <div className="mb-6"><ComposePost /></div>
        ) : (
          <div className="mb-6 rounded-2xl border border-border/60 bg-card p-5 text-center soft-shadow">
            <p className="text-sm text-muted-foreground">Sign in to share memories and join the conversation.</p>
            <div className="mt-3 flex justify-center gap-2">
              <Link to="/login"><Button variant="outline" size="sm">Log in</Button></Link>
              <Link to="/signup"><Button size="sm" className="bg-sage-deep text-primary-foreground hover:bg-sage-deep/90">Join</Button></Link>
            </div>
          </div>
        )}

        {user && (
          <div className="mb-6 flex gap-2 rounded-full border border-border/60 bg-card p-1 text-sm">
            <button
              onClick={() => setScope("all")}
              className={`flex-1 rounded-full px-4 py-1.5 transition ${scope === "all" ? "bg-sage/20 text-sage-deep" : "text-muted-foreground"}`}
            >
              For you
            </button>
            <button
              onClick={() => setScope("following")}
              className={`flex-1 rounded-full px-4 py-1.5 transition ${scope === "following" ? "bg-sage/20 text-sage-deep" : "text-muted-foreground"}`}
            >
              Following
            </button>
          </div>
        )}

        <div className="space-y-6">
          {isLoading && <div className="text-center text-sm text-muted-foreground">Loading…</div>}
          {!isLoading && (posts ?? []).length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
              <p className="font-display text-xl text-foreground">It's quiet here.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {scope === "following" ? "Follow people to fill your feed." : "Be the first to share a memory."}
              </p>
            </div>
          )}
          {(posts ?? []).map((p) => <PostCard key={p.id} post={p} />)}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
