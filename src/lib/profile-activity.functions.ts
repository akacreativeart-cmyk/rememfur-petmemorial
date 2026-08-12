import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const userInput = (input: { userId: string }) => z.object({ userId: z.string().uuid() }).parse(input);

/** Ids of public, non-deleted memorials among the given ids. */
async function publicMemorials(ids: string[]) {
  if (!ids.length) return new Map<string, { id: string; slug: string; pet_name: string }>();
  const { data } = await supabaseAdmin
    .from("memorials")
    .select("id, slug, pet_name, is_public, deleted_at")
    .in("id", ids);
  return new Map(
    ((data ?? []) as any[])
      .filter((m) => m.is_public === true && !m.deleted_at)
      .map((m) => [m.id, { id: m.id, slug: m.slug, pet_name: m.pet_name }]),
  );
}

/** Public memorials this person created. */
export const listUserMemorials = createServerFn({ method: "GET" })
  .inputValidator(userInput)
  .handler(async ({ data }) => {
    const { data: rows } = await supabaseAdmin
      .from("memorials")
      .select("id, slug, pet_name, species, hero_image_url, passing_date, epitaph, created_at")
      .eq("owner_id", data.userId)
      .eq("is_public", true)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(60);
    return rows ?? [];
  });

/** Paw lamps this person lit, on memorials that are publicly visible. */
export const listUserCandles = createServerFn({ method: "GET" })
  .inputValidator(userInput)
  .handler(async ({ data }) => {
    const { data: rows } = await supabaseAdmin
      .from("candles")
      .select("id, memorial_id, message, created_at")
      .eq("lit_by", data.userId)
      .eq("is_hidden", false)
      .order("created_at", { ascending: false })
      .limit(60);
    const list = rows ?? [];
    const mems = await publicMemorials(Array.from(new Set(list.map((r) => r.memorial_id))));
    return list
      .filter((r) => mems.has(r.memorial_id))
      .map((r) => ({
        id: r.id,
        message: r.message,
        created_at: r.created_at,
        memorial_slug: mems.get(r.memorial_id)!.slug,
        memorial_pet_name: mems.get(r.memorial_id)!.pet_name,
      }));
  });

export type ProfileActivity = {
  kind: "comment" | "like";
  id: string;
  post_id: string;
  body: string | null;
  created_at: string;
  post_caption: string | null;
  post_image: string | null;
};

/** Recent comments left and posts liked — public posts only. */
export const listUserActivity = createServerFn({ method: "GET" })
  .inputValidator(userInput)
  .handler(async ({ data }): Promise<ProfileActivity[]> => {
    const [{ data: comments }, { data: likes }] = await Promise.all([
      supabaseAdmin
        .from("post_comments")
        .select("id, post_id, body, created_at")
        .eq("author_id", data.userId)
        .eq("is_hidden", false)
        .order("created_at", { ascending: false })
        .limit(30),
      supabaseAdmin
        .from("post_likes")
        .select("post_id, created_at")
        .eq("user_id", data.userId)
        .order("created_at", { ascending: false })
        .limit(30),
    ]);

    const postIds = Array.from(
      new Set([...(comments ?? []).map((c) => c.post_id), ...(likes ?? []).map((l) => l.post_id)]),
    );
    if (!postIds.length) return [];

    const { data: posts } = await supabaseAdmin
      .from("posts")
      .select("id, caption, image_url, memorial_id, is_hidden")
      .in("id", postIds);
    const visibleMems = await publicMemorials(
      Array.from(new Set(((posts ?? []) as any[]).map((p) => p.memorial_id).filter(Boolean))),
    );
    const postMap = new Map(
      ((posts ?? []) as any[])
        .filter((p) => !p.is_hidden && (!p.memorial_id || visibleMems.has(p.memorial_id)))
        .map((p) => [p.id, p]),
    );

    const out: ProfileActivity[] = [
      ...(comments ?? [])
        .filter((c) => postMap.has(c.post_id))
        .map((c) => ({
          kind: "comment" as const,
          id: c.id,
          post_id: c.post_id,
          body: c.body,
          created_at: c.created_at,
          post_caption: postMap.get(c.post_id)?.caption ?? null,
          post_image: postMap.get(c.post_id)?.image_url ?? null,
        })),
      ...(likes ?? [])
        .filter((l) => postMap.has(l.post_id))
        .map((l) => ({
          kind: "like" as const,
          id: `like-${l.post_id}`,
          post_id: l.post_id,
          body: null,
          created_at: l.created_at,
          post_caption: postMap.get(l.post_id)?.caption ?? null,
          post_image: postMap.get(l.post_id)?.image_url ?? null,
        })),
    ];
    return out.sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).slice(0, 40);
  });
