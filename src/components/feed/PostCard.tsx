import { Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient, InfiniteData } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Trash2, Flower2, Flame } from "lucide-react";
import { PawIcon } from "@/components/site/PawIcon";
import { useAuth } from "@/hooks/use-auth";
import {
  addComment,
  deletePost,
  listComments,
  toggleLike,
  type FeedPost,
} from "@/lib/feed.functions";
import { lightCandleOnPost, listCandlesForPost } from "@/lib/post-candle.functions";
import { lightCandleGuestOnPost } from "@/lib/candle-guest.functions";
import { CandleDialog } from "@/components/site/CandleDialog";
import { CandleCountdown } from "@/components/site/CandleCountdown";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";


export function PostCard({ post }: { post: FeedPost }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [commentBody, setCommentBody] = useState("");

  const likeFn = useServerFn(toggleLike);
  const deleteFn = useServerFn(deletePost);
  const commentsFn = useServerFn(listComments);
  const addCommentFn = useServerFn(addComment);
  const candleFn = useServerFn(lightCandleOnPost);
  const candleGuestFn = useServerFn(lightCandleGuestOnPost);
  const candlesListFn = useServerFn(listCandlesForPost);

  const { data: candleData } = useQuery({
    queryKey: ["post-candles", post.id],
    queryFn: () => candlesListFn({ data: { post_id: post.id, limit: 5 } }),
    enabled: !!post.memorial_slug,
  });

  const [bursts, setBursts] = useState<Array<{ id: number; bx: number; by: number }>>([]);
  const [popKey, setPopKey] = useState(0);
  const burstIdRef = useRef(0);

  const candle = useMutation({
    mutationFn: () =>
      user
        ? candleFn({ data: { post_id: post.id, message: null } })
        : candleGuestFn({ data: { post_id: post.id, name: null, message: null } }),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["post-candles", post.id] });
      const prev = qc.getQueryData<{ candles: unknown[]; count: number }>(["post-candles", post.id]);
      qc.setQueryData(["post-candles", post.id], (old: { candles: unknown[]; count: number } | undefined) => ({
        candles: old?.candles ?? [],
        count: (old?.count ?? 0) + 1,
      }));
      setPopKey((k) => k + 1);
      return { prev };
    },
    onSuccess: () => {
      toast.success("Candle lit 🕯️ — they would have felt it.");
      qc.invalidateQueries({ queryKey: ["post-candles", post.id] });
      qc.invalidateQueries({ queryKey: ["candles-this-week"] });
    },
    onError: (e: Error, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["post-candles", post.id], ctx.prev);
      toast.error(e.message);
    },
  });

  function triggerBurst() {
    const next = Array.from({ length: 5 }).map(() => ({
      id: ++burstIdRef.current,
      bx: -50 + (Math.random() * 80 - 40),
      by: -40 - Math.random() * 30,
    }));
    setBursts((b) => [...b, ...next]);
    setTimeout(() => {
      setBursts((b) => b.filter((x) => !next.find((n) => n.id === x.id)));
    }, 950);
  }

  function quickLight() {
    if (!post.memorial_slug) return;
    triggerBurst();
    candle.mutate();
  }

  const like = useMutation({
    mutationFn: () => likeFn({ data: { post_id: post.id } }),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["feed"] });
      qc.setQueriesData<InfiniteData<FeedPost[]>>({ queryKey: ["feed"] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) =>
            page.map((p) =>
              p.id === post.id
                ? { ...p, liked_by_me: !p.liked_by_me, like_count: p.like_count + (p.liked_by_me ? -1 : 1) }
                : p,
            ),
          ),
        };
      });
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["feed"] }),
  });

  const del = useMutation({
    mutationFn: () => deleteFn({ data: { id: post.id } }),
    onSuccess: () => {
      toast.success("Post removed.");
      qc.invalidateQueries({ queryKey: ["feed"] });
    },
  });

  const { data: comments } = useQuery({
    queryKey: ["comments", post.id],
    queryFn: () => commentsFn({ data: { post_id: post.id } }),
    enabled: showComments,
  });

  const submitComment = useMutation({
    mutationFn: () => addCommentFn({ data: { post_id: post.id, body: commentBody.trim() } }),
    onSuccess: () => {
      setCommentBody("");
      qc.invalidateQueries({ queryKey: ["comments", post.id] });
      qc.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const isOwner = user?.id === post.author_id;
  const initials = (post.author_name || "?").split(/\s+/).map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <article className="overflow-hidden rounded-2xl border border-border/60 bg-card soft-shadow">
      <header className="flex items-center justify-between px-4 py-3">
        <Link to="/u/$userId" params={{ userId: post.author_id }} className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            {post.author_avatar && <AvatarImage src={post.author_avatar} alt="" />}
            <AvatarFallback className="bg-sage/20 text-sage-deep text-sm">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-foreground text-sm">{post.author_name}</div>
            <div className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </div>
          </div>
        </Link>
        {isOwner && (
          <Button variant="ghost" size="icon" onClick={() => del.mutate()} aria-label="Delete">
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
      </header>

      {post.image_url && (
        <div className="aspect-square w-full bg-muted">
          <img src={post.image_url} alt="" className="h-full w-full object-cover" loading="lazy" />
        </div>
      )}

      <div className="space-y-3 px-4 py-3">
        {post.caption && <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{post.caption}</p>}

        {post.memorial_slug && (
          <Link
            to="/memorial/$slug"
            params={{ slug: post.memorial_slug }}
            className="inline-flex items-center gap-1.5 rounded-full bg-sage/10 px-3 py-1 text-xs text-sage-deep hover:bg-sage/20"
          >
            <Flower2 className="h-3 w-3" /> In memory of {post.memorial_pet_name}
          </Link>
        )}

        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={() => user ? like.mutate() : toast.error("Sign in to send a paw")}
            aria-label="Send a paw"
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition ${
              post.liked_by_me
                ? "bg-terracotta/15 text-terracotta"
                : "bg-muted/60 text-muted-foreground hover:bg-terracotta/10 hover:text-terracotta"
            }`}
          >
            <PawIcon className={`h-4 w-4 ${post.liked_by_me ? "fill-terracotta" : ""}`} />
            {post.like_count} {post.like_count === 1 ? "paw" : "paws"}
          </button>
          <button
            onClick={() => setShowComments((s) => !s)}
            className="flex items-center gap-1.5 rounded-full bg-muted/60 px-3 py-1.5 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <MessageCircle className="h-4 w-4" />
            {post.comment_count}
          </button>
          {post.memorial_slug ? (
            <div className="relative inline-flex items-center">
              <button
                onClick={quickLight}
                disabled={candle.isPending}
                aria-label="Light a candle"
                className="candle-pulse relative flex items-center gap-1.5 rounded-full bg-[color-mix(in_oklab,var(--cta)_14%,transparent)] px-3 py-1.5 text-sm font-medium text-[var(--cta)] transition hover:bg-[color-mix(in_oklab,var(--cta)_24%,transparent)] active:scale-95"
              >
                <Flame className="h-4 w-4 flame-flicker" />
                <span key={popKey} className="count-pop tabular-nums">
                  {candleData?.count ?? 0}
                </span>
                <span>burning</span>
                {/* burst overlay */}
                {bursts.map((b) => (
                  <span
                    key={b.id}
                    className="candle-burst"
                    style={{ ["--bx" as string]: `${b.bx}%`, ["--by" as string]: `${b.by}px` }}
                    aria-hidden
                  >
                    🕯️
                  </span>
                ))}
              </button>
              <CandleDialog
                target={{ kind: "post", post_id: post.id }}
                onLit={() => {
                  qc.invalidateQueries({ queryKey: ["feed"] });
                  qc.invalidateQueries({ queryKey: ["post-candles", post.id] });
                  qc.invalidateQueries({ queryKey: ["candles-this-week"] });
                }}
                trigger={
                  <button
                    aria-label="Light a candle with a note"
                    className="ml-1 rounded-full px-2 py-1.5 text-xs text-[var(--cta)] hover:bg-[color-mix(in_oklab,var(--cta)_12%,transparent)]"
                  >
                    + note
                  </button>
                }
              />
            </div>
          ) : (
            <span
              aria-label="Candles burning"
              className="flex items-center gap-1.5 rounded-full bg-muted/60 px-3 py-1.5 text-sm text-muted-foreground"
            >
              <Flame className="h-4 w-4" />
              0 burning
            </span>
          )}

          <div className="ml-auto flex gap-1 text-base" aria-label="React">
            {["🐾", "🦴", "❤️", "🐶", "🐱"].map((e) => (
              <button
                key={e}
                onClick={() => user ? like.mutate() : toast.error("Sign in to react")}
                className="rounded-full px-1.5 py-0.5 transition hover:bg-cream/80"
                aria-label={`React ${e}`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {post.memorial_slug && candleData && candleData.candles.length > 0 && (
          <div className="rounded-xl border border-[color-mix(in_oklab,var(--cta)_25%,transparent)] bg-[color-mix(in_oklab,var(--cta)_6%,transparent)] p-3">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-[var(--cta)]">
              <Flame className="h-3.5 w-3.5" />
              Candles lit {candleData.count > candleData.candles.length ? `(showing ${candleData.candles.length} of ${candleData.count})` : `(${candleData.count})`}
            </div>
            <ul className="space-y-2">
              {candleData.candles.map((c) => (
                <li key={c.id} className="flex gap-2 text-sm">
                  <span aria-hidden className="mt-0.5 text-base leading-none">🕯️</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-foreground">{c.lit_by_name ?? "A friend"}</div>
                    {c.message && (
                      <div className="whitespace-pre-line text-sm leading-snug text-foreground/85">{c.message}</div>
                    )}
                    <CandleCountdown litAt={c.created_at} className="mt-1" />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}


        {showComments && (
          <div className="space-y-3 border-t border-border/60 pt-3">
            {(comments ?? []).map((c) => {
              const ci = (c.author_name || "?").split(/\s+/).map((s: string) => s[0]).slice(0, 2).join("").toUpperCase();
              return (
                <div key={c.id} className="flex gap-2">
                  <Avatar className="h-7 w-7">
                    {c.author_avatar && <AvatarImage src={c.author_avatar} alt="" />}
                    <AvatarFallback className="bg-sage/20 text-[10px] text-sage-deep">{ci}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 rounded-xl bg-muted/50 px-3 py-2">
                    <div className="text-xs font-medium text-foreground">{c.author_name}</div>
                    <div className="text-sm text-foreground/90">{c.body}</div>
                  </div>
                </div>
              );
            })}
            {user && (
              <div className="flex gap-2">
                <Textarea
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  placeholder="Share a kind word…"
                  rows={1}
                  className="min-h-[40px] resize-none"
                />
                <Button
                  size="sm"
                  disabled={!commentBody.trim() || submitComment.isPending}
                  onClick={() => submitComment.mutate()}
                  className="bg-sage-deep text-primary-foreground hover:bg-sage-deep/90"
                >
                  Post
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
