import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const lightCandleOnPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { post_id: string; message?: string | null }) =>
    z.object({
      post_id: z.string().uuid(),
      message: z.string().max(500).nullable().optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // Find the memorial attached to this post
    const { data: post, error: pErr } = await supabaseAdmin
      .from("posts")
      .select("memorial_id")
      .eq("id", data.post_id)
      .maybeSingle();
    if (pErr) throw new Error(pErr.message);
    if (!post?.memorial_id) {
      throw new Error("This post isn't linked to a memorial yet.");
    }
    // Get display name for the candle
    const { data: prof } = await supabaseAdmin
      .from("profiles")
      .select("display_name")
      .eq("id", userId)
      .maybeSingle();
    const { error } = await supabase.from("candles").insert({
      memorial_id: post.memorial_id,
      lit_by: userId,
      lit_by_name: prof?.display_name ?? null,
      message: data.message ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const countCandlesForPost = createServerFn({ method: "GET" })
  .inputValidator((input: { post_id: string }) =>
    z.object({ post_id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    const { data: post } = await supabaseAdmin
      .from("posts")
      .select("memorial_id")
      .eq("id", data.post_id)
      .maybeSingle();
    if (!post?.memorial_id) return { count: 0 };
    const { count } = await supabaseAdmin
      .from("candles")
      .select("*", { count: "exact", head: true })
      .eq("memorial_id", post.memorial_id);
    return { count: count ?? 0 };
  });

export const listCandlesForPost = createServerFn({ method: "GET" })
  .inputValidator((input: { post_id: string; limit?: number }) =>
    z.object({
      post_id: z.string().uuid(),
      limit: z.number().int().min(1).max(20).default(5),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const { data: post } = await supabaseAdmin
      .from("posts")
      .select("memorial_id")
      .eq("id", data.post_id)
      .maybeSingle();
    if (!post?.memorial_id) return { candles: [], count: 0 };
    const [{ data: rows }, { count }] = await Promise.all([
      supabaseAdmin
        .from("candles")
        .select("id, lit_by_name, message, created_at")
        .eq("memorial_id", post.memorial_id)
        .order("created_at", { ascending: false })
        .limit(data.limit),
      supabaseAdmin
        .from("candles")
        .select("*", { count: "exact", head: true })
        .eq("memorial_id", post.memorial_id),
    ]);
    return { candles: rows ?? [], count: count ?? 0 };
  });
