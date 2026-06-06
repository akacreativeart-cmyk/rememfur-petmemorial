import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Two short lines max — keep candles tender, not essays.
const messageSchema = z
  .string()
  .trim()
  .max(180)
  .refine((s) => s.split(/\r?\n/).length <= 2, { message: "Keep it to two lines" })
  .optional()
  .nullable();

const nameSchema = z.string().trim().min(1).max(40).optional().nullable();

export const lightCandleGuest = createServerFn({ method: "POST" })
  .inputValidator((input: { memorial_id: string; name?: string | null; message?: string | null }) =>
    z.object({
      memorial_id: z.string().uuid(),
      name: nameSchema,
      message: messageSchema,
    }).parse(input),
  )
  .handler(async ({ data }) => {
    // Confirm the memorial is public before letting an unauthenticated visitor write.
    const { data: m } = await supabaseAdmin
      .from("memorials")
      .select("id, is_public")
      .eq("id", data.memorial_id)
      .maybeSingle();
    if (!m || !m.is_public) throw new Error("This memorial isn't open to visitors.");

    const { error } = await supabaseAdmin.from("candles").insert({
      memorial_id: data.memorial_id,
      lit_by: null,
      lit_by_name: data.name?.trim() || "A friend",
      message: data.message?.trim() || null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const lightCandleGuestOnPost = createServerFn({ method: "POST" })
  .inputValidator((input: { post_id: string; name?: string | null; message?: string | null }) =>
    z.object({
      post_id: z.string().uuid(),
      name: nameSchema,
      message: messageSchema,
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const { data: post } = await supabaseAdmin
      .from("posts")
      .select("memorial_id")
      .eq("id", data.post_id)
      .maybeSingle();
    if (!post?.memorial_id) throw new Error("This post isn't linked to a memorial yet.");

    const { data: m } = await supabaseAdmin
      .from("memorials")
      .select("is_public")
      .eq("id", post.memorial_id)
      .maybeSingle();
    if (!m?.is_public) throw new Error("This memorial isn't open to visitors.");

    const { error } = await supabaseAdmin.from("candles").insert({
      memorial_id: post.memorial_id,
      lit_by: null,
      lit_by_name: data.name?.trim() || "A friend",
      message: data.message?.trim() || null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listRecentCandles = createServerFn({ method: "GET" })
  .inputValidator((input: { limit?: number } | undefined) =>
    z.object({ limit: z.number().int().min(1).max(60).default(24) }).parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    const { data: rows } = await supabaseAdmin
      .from("candles")
      .select("id, lit_by_name, message, created_at, memorial_id, memorials!inner(slug, pet_name, is_public)")
      .eq("memorials.is_public", true)
      .order("created_at", { ascending: false })
      .limit(data.limit);
    return (rows ?? []).map((r: any) => ({
      id: r.id as string,
      lit_by_name: r.lit_by_name as string | null,
      message: r.message as string | null,
      created_at: r.created_at as string,
      memorial_id: r.memorial_id as string,
      memorial_slug: r.memorials?.slug as string | null,
      pet_name: r.memorials?.pet_name as string | null,
    }));
  });

export const pickFeaturedMemorial = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data } = await supabaseAdmin
      .from("memorials")
      .select("id, slug, pet_name, hero_image_url, transformed_image_url, epitaph, birth_date, passing_date")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return data;
  });

export const countCandlesThisWeek = createServerFn({ method: "GET" })
  .handler(async () => {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count } = await supabaseAdmin
      .from("candles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", since);
    return { count: count ?? 0 };
  });

