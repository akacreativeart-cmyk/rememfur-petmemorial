import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/feed/PostCard";
import { PawLamp } from "@/components/site/PawLamp";
import { getUserProfile, listUserPosts, toggleFollow } from "@/lib/feed.functions";
import { listUserActivity, listUserCandles, listUserMemorials } from "@/lib/profile-activity.functions";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";


export const Route = createFileRoute("/u/$userId")({
  component: UserProfilePage,
  head: () => ({ meta: [{ title: "Profile — Rememfur" }] }),
});

function UserProfilePage() {
  const { userId } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const profileFn = useServerFn(getUserProfile);
  const postsFn = useServerFn(listUserPosts);
  const followFn = useServerFn(toggleFollow);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["user-profile", userId, user?.id ?? "anon"],
    queryFn: () => profileFn({ data: { userId } }),
  });

  const { data: posts } = useQuery({
    queryKey: ["user-posts", userId, user?.id ?? "anon"],
    queryFn: () => postsFn({ data: { userId } }),
  });

  const [tab, setTab] = useState<"posts" | "memorials" | "lamps" | "activity">("posts");
  const memorialsFn = useServerFn(listUserMemorials);
  const candlesFn = useServerFn(listUserCandles);
  const activityFn = useServerFn(listUserActivity);

  const { data: memorials } = useQuery({
    queryKey: ["user-memorials", userId],
    queryFn: () => memorialsFn({ data: { userId } }),
    enabled: tab === "memorials",
  });
  const { data: lamps } = useQuery({
    queryKey: ["user-lamps", userId],
    queryFn: () => candlesFn({ data: { userId } }),
    enabled: tab === "lamps",
  });
  const { data: activity } = useQuery({
    queryKey: ["user-activity", userId],
    queryFn: () => activityFn({ data: { userId } }),
    enabled: tab === "activity",
  });

  const follow = useMutation({
    mutationFn: () => followFn({ data: { user_id: userId } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user-profile", userId] }),
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background paper-grain">
        <SiteHeader />
        <main className="mx-auto max-w-2xl px-5 py-16 text-center text-muted-foreground">Loading…</main>
      </div>
    );
  }
  if (!profile) {
    return (
      <div className="min-h-screen bg-background paper-grain">
        <SiteHeader />
        <main className="mx-auto max-w-2xl px-5 py-16 text-center">
          <p className="font-display text-2xl">Profile not found.</p>
          <Link to="/community" className="mt-4 inline-block text-sage-deep underline">Back to Community</Link>
        </main>
      </div>
    );
  }

  const initials = (profile.display_name || "?").split(/\s+/).map((s: string) => s[0]).slice(0, 2).join("").toUpperCase();
  const isMe = user?.id === profile.id;

  return (
    <div className="min-h-screen bg-background paper-grain">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-5 py-10">
        <header className="mb-8 flex items-center gap-5">
          <Avatar className="h-20 w-20 md:h-24 md:w-24">
            {profile.avatar_url && <AvatarImage src={profile.avatar_url} alt="" />}
            <AvatarFallback className="bg-sage/20 text-2xl text-sage-deep">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="font-display text-3xl text-foreground">{profile.display_name ?? "Anonymous"}</h1>
            <div className="mt-2 flex gap-5 text-sm text-muted-foreground">
              <span><b className="text-foreground">{profile.post_count}</b> posts</span>
              <span><b className="text-foreground">{profile.followers}</b> followers</span>
              <span><b className="text-foreground">{profile.following}</b> following</span>
            </div>
            {!isMe && user && (
              <Button
                size="sm"
                onClick={() => follow.mutate()}
                className={`mt-3 ${profile.followed_by_me ? "bg-muted text-foreground hover:bg-muted/80" : "bg-sage-deep text-primary-foreground hover:bg-sage-deep/90"}`}
              >
                {profile.followed_by_me ? "Following" : "Follow"}
              </Button>
            )}
            {isMe && (
              <div className="mt-3 flex flex-wrap gap-2">
                <Link to="/pets">
                  <Button size="sm" variant="outline" className="rounded-full">🐾 My pets</Button>
                </Link>
                <Link to="/dashboard">
                  <Button size="sm" variant="outline" className="rounded-full">My memorials</Button>
                </Link>
              </div>
            )}
          </div>
        </header>

        <div className="mb-6 flex gap-1 overflow-x-auto border-b border-border/70">
          {([
            ["posts", "Posts"],
            ["memorials", "Memorials"],
            ["lamps", "Paw lamps"],
            ["activity", "Activity"],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`-mb-px shrink-0 border-b-2 px-3 py-2 text-sm transition ${
                tab === key
                  ? "border-[var(--cta)] text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "posts" && (
          <div className="space-y-6">
            {(posts ?? []).length === 0 && <Empty>No posts yet.</Empty>}
            {(posts ?? []).map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        )}

        {tab === "memorials" && (
          <div className="grid gap-4 sm:grid-cols-2">
            {(memorials ?? []).length === 0 && <Empty>No memorials yet.</Empty>}
            {(memorials ?? []).map((m) => (
              <Link
                key={m.id}
                to="/memorial/$slug"
                params={{ slug: m.slug }}
                className="flex gap-3 rounded-2xl border border-border/60 bg-card p-3 transition hover:border-[var(--cta)]/50"
              >
                {m.hero_image_url ? (
                  <img src={m.hero_image_url} alt="" className="h-16 w-16 rounded-xl object-cover" />
                ) : (
                  <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted"><PawLamp size={28} /></span>
                )}
                <div className="min-w-0">
                  <div className="font-display text-lg text-foreground">{m.pet_name}</div>
                  <p className="line-clamp-2 text-xs text-muted-foreground">{m.epitaph ?? m.species}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {tab === "lamps" && (
          <div className="space-y-3">
            {(lamps ?? []).length === 0 && <Empty>No paw lamps lit yet.</Empty>}
            {(lamps ?? []).map((c) => (
              <div key={c.id} className="flex gap-3 rounded-2xl border border-border/60 bg-card p-4">
                <PawLamp size={26} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">
                    Lit a paw lamp for{" "}
                    <Link to="/memorial/$slug" params={{ slug: c.memorial_slug }} className="link-gold">
                      {c.memorial_pet_name}
                    </Link>
                  </p>
                  {c.message && <p className="mt-1 text-sm text-muted-foreground">{c.message}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "activity" && (
          <div className="space-y-3">
            {(activity ?? []).length === 0 && <Empty>Nothing here yet.</Empty>}
            {(activity ?? []).map((a) => (
              <div key={`${a.kind}-${a.id}`} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4">
                {a.post_image && <img src={a.post_image} alt="" className="h-12 w-12 rounded-lg object-cover" />}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">
                    {a.kind === "comment" ? "Commented" : "Liked a post"}
                    {a.post_caption ? <span className="text-muted-foreground"> · {a.post_caption}</span> : null}
                  </p>
                  {a.body && <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground sm:col-span-2">
      {children}
    </div>
  );
}
