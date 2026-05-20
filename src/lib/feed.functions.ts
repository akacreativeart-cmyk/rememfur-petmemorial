import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type FeedPost = {
  id: string;
  author_id: string;
  author_name: string;
  author_avatar: string | null;
  image_url: string | null;
  caption: string | null;
  memorial_id: string | null;
  memorial_slug: string | null;
  memorial_pet_name: string | null;
  created_at: string;
  like_count: number;
  comment_count: number;
  liked_by_me: boolean;
};

async function hydratePosts(rows: any[], viewerId: string | null): Promise<FeedPost[]> {
  if (!rows.length) return [];
  const ids = rows.map((r) => r.id);
  const authorIds = Array.from(new Set(rows.map((r) => r.author_id)));
  const memorialIds = Array.from(new Set(rows.map((r) => r.memorial_id).filter(Boolean)));

  const [profsRes, likesRes, commentsRes, memorialsRes, myLikesRes] = await Promise.all([
    supabaseAdmin.from("profiles").select("id, display_name, avatar_url").in("id", authorIds),
    supabaseAdmin.from("post_likes").select("post_id").in("post_id", ids),
    supabaseAdmin.from("post_comments").select("post_id").in("post_id", ids),
    memorialIds.length
      ? supabaseAdmin.from("memorials").select("id, slug, pet_name").in("id", memorialIds)
      : Promise.resolve({ data: [] as any[] }),
    viewerId
      ? supabaseAdmin.from("post_likes").select("post_id").eq("user_id", viewerId).in("post_id", ids)
      : Promise.resolve({ data: [] as any[] }),
  ]);
  const profs = profsRes.data ?? [];
  const likes = likesRes.data ?? [];
  const comments = commentsRes.data ?? [];
  const memorials = (memorialsRes as any).data ?? [];
  const myLikes = (myLikesRes as any).data ?? [];

  const profMap = new Map(profs.map((p: any) => [p.id, p]));
  const memMap = new Map((memorials as any[]).map((m: any) => [m.id, m]));
  const likeCounts: Record<string, number> = {};
  (likes as any[]).forEach((l: any) => { likeCounts[l.post_id] = (likeCounts[l.post_id] ?? 0) + 1; });
  const commentCounts: Record<string, number> = {};
  (comments as any[]).forEach((c: any) => { commentCounts[c.post_id] = (commentCounts[c.post_id] ?? 0) + 1; });
  const myLikeSet = new Set((myLikes as any[]).map((l: any) => l.post_id));

  return rows.map((r) => {
    const p = profMap.get(r.author_id) as any;
    const m = r.memorial_id ? (memMap.get(r.memorial_id) as any) : null;
    return {
      id: r.id,
      author_id: r.author_id,
      author_name: p?.display_name ?? "A friend",
      author_avatar: p?.avatar_url ?? null,
      image_url: r.image_url,
      caption: r.caption,
      memorial_id: r.memorial_id,
      memorial_slug: m?.slug ?? null,
      memorial_pet_name: m?.pet_name ?? null,
      created_at: r.created_at,
      like_count: likeCounts[r.id] ?? 0,
      comment_count: commentCounts[r.id] ?? 0,
      liked_by_me: myLikeSet.has(r.id),
    };
  });
}

export const listFeed = createServerFn({ method: "GET" })
  .inputValidator((input: { scope?: "all" | "following"; viewerId?: string } | undefined) =>
    z.object({
      scope: z.enum(["all", "following"]).default("all"),
      viewerId: z.string().uuid().nullish(),
    }).parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    let authorFilter: string[] | null = null;
    if (data.scope === "following" && data.viewerId) {
      const { data: f } = await supabaseAdmin
        .from("follows")
        .select("following_id")
        .eq("follower_id", data.viewerId);
      authorFilter = (f ?? []).map((r: any) => r.following_id);
      if (authorFilter.length === 0) return [];
    }
    let q = supabaseAdmin
      .from("posts")
      .select("id, author_id, image_url, caption, memorial_id, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (authorFilter) q = q.in("author_id", authorFilter);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return hydratePosts(rows ?? [], data.viewerId ?? null);
  });

export const listUserPosts = createServerFn({ method: "GET" })
  .inputValidator((input: { userId: string; viewerId?: string }) =>
    z.object({ userId: z.string().uuid(), viewerId: z.string().uuid().nullish() }).parse(input),
  )
  .handler(async ({ data }) => {
    const { data: rows, error } = await supabaseAdmin
      .from("posts")
      .select("id, author_id, image_url, caption, memorial_id, created_at")
      .eq("author_id", data.userId)
      .order("created_at", { ascending: false })
      .limit(60);
    if (error) throw new Error(error.message);
    return hydratePosts(rows ?? [], data.viewerId ?? null);
  });

export const getUserProfile = createServerFn({ method: "GET" })
  .inputValidator((input: { userId: string; viewerId?: string }) =>
    z.object({ userId: z.string().uuid(), viewerId: z.string().uuid().nullish() }).parse(input),
  )
  .handler(async ({ data }) => {
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, display_name, avatar_url, created_at")
      .eq("id", data.userId)
      .maybeSingle();
    if (!profile) return null;
    const [{ count: followers }, { count: following }, { count: posts }, viewerFollow] = await Promise.all([
      supabaseAdmin.from("follows").select("*", { count: "exact", head: true }).eq("following_id", data.userId),
      supabaseAdmin.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", data.userId),
      supabaseAdmin.from("posts").select("*", { count: "exact", head: true }).eq("author_id", data.userId),
      data.viewerId
        ? supabaseAdmin.from("follows").select("follower_id").eq("follower_id", data.viewerId).eq("following_id", data.userId).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);
    return {
      ...profile,
      followers: followers ?? 0,
      following: following ?? 0,
      post_count: posts ?? 0,
      followed_by_me: !!(viewerFollow as any)?.data,
    };
  });

export const createPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      image_url: z.string().url().nullable().optional(),
      caption: z.string().max(2000).nullable().optional(),
      memorial_id: z.string().uuid().nullable().optional(),
    }).refine((d) => !!d.image_url || !!d.caption, { message: "Image or caption required" }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("posts")
      .insert({ ...data, author_id: userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return row!;
  });

export const deletePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("posts").delete().eq("id", data.id).eq("author_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const toggleLike = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { post_id: string }) => z.object({ post_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: existing } = await supabase
      .from("post_likes").select("post_id").eq("post_id", data.post_id).eq("user_id", userId).maybeSingle();
    if (existing) {
      await supabase.from("post_likes").delete().eq("post_id", data.post_id).eq("user_id", userId);
      return { liked: false };
    }
    const { error } = await supabase.from("post_likes").insert({ post_id: data.post_id, user_id: userId });
    if (error) throw new Error(error.message);
    return { liked: true };
  });

export const toggleFollow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { user_id: string }) => z.object({ user_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (data.user_id === userId) throw new Error("Cannot follow yourself");
    const { data: existing } = await supabase
      .from("follows").select("follower_id").eq("follower_id", userId).eq("following_id", data.user_id).maybeSingle();
    if (existing) {
      await supabase.from("follows").delete().eq("follower_id", userId).eq("following_id", data.user_id);
      return { following: false };
    }
    const { error } = await supabase.from("follows").insert({ follower_id: userId, following_id: data.user_id });
    if (error) throw new Error(error.message);
    return { following: true };
  });

export const listComments = createServerFn({ method: "GET" })
  .inputValidator((input: { post_id: string }) => z.object({ post_id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { data: rows, error } = await supabaseAdmin
      .from("post_comments")
      .select("id, body, author_id, created_at")
      .eq("post_id", data.post_id)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    const authorIds = Array.from(new Set((rows ?? []).map((r) => r.author_id)));
    let map: Record<string, any> = {};
    if (authorIds.length) {
      const { data: profs } = await supabaseAdmin.from("profiles").select("id, display_name, avatar_url").in("id", authorIds);
      (profs ?? []).forEach((p) => { map[p.id] = p; });
    }
    return (rows ?? []).map((r) => ({
      ...r,
      author_name: map[r.author_id]?.display_name ?? "A friend",
      author_avatar: map[r.author_id]?.avatar_url ?? null,
    }));
  });

export const addComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ post_id: z.string().uuid(), body: z.string().min(1).max(1000) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("post_comments")
      .insert({ post_id: data.post_id, author_id: context.userId, body: data.body });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
