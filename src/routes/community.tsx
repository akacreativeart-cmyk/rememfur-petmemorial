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
import { DummyPosts } from "@/components/feed/DummyPosts";
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
      feedFn({ data: { scope, viewerId: user?.id ?? undefined, cursor: pageParam, limit: 10 } }),
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
          handwritten="share a story, light a candle"
          intro="A gentle place to share memories, photos, and kind words with people who understand."
        />

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
          {isLoading && (
            <>
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
            </>
          )}
          {!isLoading && posts.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-card/50 p-6 text-center">
              <p className="font-display text-xl text-foreground">It&apos;s quiet here.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {scope === "following" ? "Follow people to fill your feed." : "Be the first to share a memory — or scroll a few stories from the community."}
              </p>
            </div>
          )}
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}

          <DummyPosts />

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
