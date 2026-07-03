import { createServerFn } from "@tanstack/react-start";
import { getRequest, getRequestIP } from "@tanstack/react-start/server";
import { createHash } from "crypto";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Hash a stable client identifier (IP + UA) so we can throttle without storing raw IPs.
function clientHash(): string {
  let ip = "";
  try { ip = getRequestIP({ xForwardedFor: true }) ?? ""; } catch { /* ignore */ }
  let ua = "";
  try { ua = getRequest()?.headers?.get("user-agent") ?? ""; } catch { /* ignore */ }
  return createHash("sha256").update(`${ip}::${ua}`).digest("hex");
}

// Gentle rate-limit: max `perScope` candles for `scope_id` and `perGlobal` overall per hour.
async function assertCandleLimit(scopeId: string | null) {
  const hash = clientHash();
  if (!hash || hash.length === 0) return;
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const [scoped, overall] = await Promise.all([
    scopeId
      ? supabaseAdmin.from("rate_limits").select("id", { count: "exact", head: true })
          .eq("bucket", "candle_guest").eq("client_hash", hash).eq("scope_id", scopeId).gte("created_at", since)
      : Promise.resolve({ count: 0 } as any),
    supabaseAdmin.from("rate_limits").select("id", { count: "exact", head: true })
      .eq("bucket", "candle_guest").eq("client_hash", hash).gte("created_at", since),
  ]);
  if (scopeId && (scoped as any).count && (scoped as any).count >= 3) {
    throw new Error("Take a breath — you can light another candle in a little while.");
  }
  if ((overall as any).count && (overall as any).count >= 10) {
    throw new Error("Take a breath — you can light another candle in a little while.");
  }
  await supabaseAdmin.from("rate_limits").insert({ bucket: "candle_guest", client_hash: hash, scope_id: scopeId });
}

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

    await assertCandleLimit(data.memorial_id);

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

    await assertCandleLimit(post.memorial_id);

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

/**
 * Memorials with at least one candle lit in the past 24h, grouped with a count
 * and the most recent message. Powers the "Candles burning right now" wall.
 */
export const listBurningMemorials = createServerFn({ method: "GET" })
  .inputValidator((input: { limit?: number } | undefined) =>
    z.object({ limit: z.number().int().min(1).max(60).default(24) }).parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: rows } = await supabaseAdmin
      .from("candles")
      .select("id, lit_by_name, message, created_at, memorial_id, memorials!inner(slug, pet_name, is_public)")
      .eq("memorials.is_public", true)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(500);

    const grouped = new Map<
      string,
      {
        memorial_id: string;
        memorial_slug: string | null;
        pet_name: string | null;
        count: number;
        latest_message: string | null;
        latest_name: string | null;
        latest_at: string;
      }
    >();
    for (const r of rows ?? []) {
      const key = r.memorial_id as string;
      const existing = grouped.get(key);
      if (existing) {
        existing.count += 1;
        if (!existing.latest_message && r.message) {
          existing.latest_message = r.message as string;
          existing.latest_name = (r.lit_by_name as string | null) ?? existing.latest_name;
        }
      } else {
        grouped.set(key, {
          memorial_id: key,
          memorial_slug: (r as any).memorials?.slug ?? null,
          pet_name: (r as any).memorials?.pet_name ?? null,
          count: 1,
          latest_message: (r.message as string | null) ?? null,
          latest_name: (r.lit_by_name as string | null) ?? null,
          latest_at: r.created_at as string,
        });
      }
    }
    return Array.from(grouped.values())
      .sort((a, b) => b.count - a.count || (b.latest_at > a.latest_at ? 1 : -1))
      .slice(0, data.limit);
  });

