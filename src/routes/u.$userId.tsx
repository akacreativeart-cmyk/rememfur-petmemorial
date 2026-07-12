import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/feed/PostCard";
import { getUserProfile, listUserPosts, toggleFollow } from "@/lib/feed.functions";
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

        <div className="space-y-6">
          {(posts ?? []).length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">No posts yet.</div>
          )}
          {(posts ?? []).map((p) => <PostCard key={p.id} post={p} />)}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
