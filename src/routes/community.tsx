import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PageHero } from "@/components/site/PageHero";
import { PostCard } from "@/components/feed/PostCard";
import { PostSkeleton } from "@/components/feed/PostSkeleton";
import { ComposePost } from "@/components/feed/ComposePost";
import { Flame, PlusCircle } from "lucide-react";
import { listFeed } from "@/lib/feed.functions";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/community")({
  component: CommunityPage,
  head: () => ({
    meta: [
      { title: "Community \u2014 Rememfur" },
      { name: "description", content: "Share photos and memories of beloved pets with a supportive community." },
      { property: "og:title", content: "Community \u2014 Rememfur" },
      { property: "og:description", content: "Share photos and memories of beloved pets." },
    ],
  }),
});

function CommunityPage() {
  const { user } = useAuth();
  const [scope, setScope] = useState<"all" | "following">("all");
  const feedFn = useServerFn(listFeed);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["feed", scope, user?.id ?? "anon"],
    queryFn: ({ pageParam }) =>
      feedFn({ data: { scope, cursor: pageParam, limit: 10 } }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => {
      if (lastPage.length < 10) return undefined;
      return lastPage[lastPage.length - 1].created_at;
    },
    staleTime: 30_000,
  });

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const posts = data?.pages.flat() ?? [];

  return (
    <div className="min-h-screen bg-background paper-grain">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-5 py-10">
        <PageHero
          eyebrow="chapter two"
          title="The Memory Wall"
          handwritten="share a story, light a paw lamp"
          intro="A gentle place to share memories, photos, and kind words with people who understand."
        />

        {user ? (
          <div className="mb-6"><ComposePost /></div>
        ) : (
          <div className="mb-6 rounded-2xl border border-border/60 bg-card p-5 text-center soft-shadow">
            <p className="text-sm text-muted-foreground">Sign in to share memories and join the conversation.</p>
            <div className="mt-3 flex justify-center gap-2">
              <Link to="/login"><Button variant="outline" size="sm">Log in</Button></Link>
              <Link to="/signup" className="btn-gold-sm">Join</Link>
            </div>
          </div>
        )}

        {user && (
          <div className="mb-6 flex gap-2 rounded-full border border-border/60 bg-card p-1 text-sm">
            <button
              onClick={() => setScope("all")}
              className={`flex-1 rounded-full px-4 py-1.5 transition ${scope === "all" ? "bg-white/10 text-amber-200" : "text-muted-foreground"}`}
            >
              For you
            </button>
            <button
              onClick={() => setScope("following")}
              className={`flex-1 rounded-full px-4 py-1.5 transition ${scope === "following" ? "bg-white/10 text-amber-200" : "text-muted-foreground"}`}
            >
              Following
            </button>
          </div>
        )}

        <div className="space-y-6">
          {isLoading && (
            <>
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
            </>
          )}
          {!isLoading && posts.length === 0 && (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
              <span className="hero-candle scale-90" aria-hidden>
                <span className="flame" />
              </span>
              <p className="mt-4 font-display text-xl text-foreground">
                Be among the first to share a memory
              </p>
              <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                {scope === "following"
                  ? "Follow people whose stories move you and their memories will land here."
                  : "This is a quiet, tender room. A photo, a sentence, a small story — anything is welcome."}
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <Link to={user ? "/create" : "/signup"} search={user ? undefined : ({ redirect: "/create" } as never)} className="btn-gold-sm">
                  <PlusCircle className="h-4 w-4" /> Create a post
                </Link>
                <Link to="/">
                  <Button size="sm" variant="outline" className="rounded-full">
                    <Flame className="mr-2 h-4 w-4" /> Light a paw lamp
                  </Button>
                </Link>
              </div>
            </div>
          )}
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}


          <div ref={sentinelRef} className="h-1" aria-hidden="true" />

          {isFetchingNextPage && (
            <div className="flex items-center justify-center gap-2 py-4">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-sage-deep border-t-transparent" />
              <span className="text-sm text-muted-foreground">Loading more memories&hellip;</span>
            </div>
          )}

          {!hasNextPage && posts.length > 0 && (
            <div className="py-6 text-center text-xs text-muted-foreground">
              You&apos;re all caught up
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
