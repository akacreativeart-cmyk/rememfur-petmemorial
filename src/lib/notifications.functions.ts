import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("notifications")
      .select("id, type, actor_id, actor_name, memorial_id, post_id, preview, read_at, created_at")
      .eq("recipient_id", userId)
      .order("created_at", { ascending: false })
      .limit(40);
    if (error) throw new Error(error.message);

    const memorialIds = Array.from(
      new Set((data ?? []).map((n) => n.memorial_id).filter(Boolean) as string[]),
    );
    let slugMap: Record<string, { slug: string; pet_name: string }> = {};
    if (memorialIds.length) {
      const { data: mems } = await supabase
        .from("memorials")
        .select("id, slug, pet_name")
        .in("id", memorialIds);
      (mems ?? []).forEach((m) => {
        slugMap[m.id] = { slug: m.slug, pet_name: m.pet_name };
      });
    }
    return (data ?? []).map((n) => ({
      ...n,
      memorial: n.memorial_id ? slugMap[n.memorial_id] ?? null : null,
    }));
  });

export const countUnreadNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { count, error } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("recipient_id", userId)
      .is("read_at", null);
    if (error) throw new Error(error.message);
    return count ?? 0;
  });

export const markAllNotificationsRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("recipient_id", userId)
      .is("read_at", null);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const markNotificationRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("recipient_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/**
 * Aggregate unread notifications grouped by memorial + type for the "since you
 * were away" homecoming banner. Returns rows like:
 *   { memorial_id, memorial_slug, pet_name, type, count }
 */
export const sinceYouWereAway = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("notifications")
      .select("type, memorial_id")
      .eq("recipient_id", userId)
      .is("read_at", null)
      .not("memorial_id", "is", null)
      .limit(200);
    if (error) throw new Error(error.message);

    const buckets = new Map<string, { memorial_id: string; type: string; count: number }>();
    for (const n of data ?? []) {
      if (!n.memorial_id) continue;
      const key = `${n.memorial_id}:${n.type}`;
      const cur = buckets.get(key);
      if (cur) cur.count += 1;
      else buckets.set(key, { memorial_id: n.memorial_id, type: n.type, count: 1 });
    }

    const memorialIds = Array.from(new Set(Array.from(buckets.values()).map((b) => b.memorial_id)));
    let slugMap: Record<string, { slug: string; pet_name: string }> = {};
    if (memorialIds.length) {
      const { data: mems } = await supabase
        .from("memorials")
        .select("id, slug, pet_name")
        .in("id", memorialIds);
      (mems ?? []).forEach((m) => {
        slugMap[m.id] = { slug: m.slug, pet_name: m.pet_name };
      });
    }

    return Array.from(buckets.values())
      .map((b) => ({
        memorial_id: b.memorial_id,
        type: b.type,
        count: b.count,
        memorial: slugMap[b.memorial_id] ?? null,
      }))
      .filter((b) => b.memorial)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  });

