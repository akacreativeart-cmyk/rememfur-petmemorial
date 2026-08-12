import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Submit a claim to become the keeper of an owner-less memorial. */
export const submitMemorialClaim = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { memorial_id: string; message?: string | null }) =>
    z.object({
      memorial_id: z.string().uuid(),
      message: z.string().max(1000).nullable().optional(),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("memorial_claims").insert({
      memorial_id: data.memorial_id,
      claimant_id: context.userId,
      message: data.message ?? null,
      status: "pending",
    });
    if (error) {
      if (error.code === "23505") throw new Error("You already have a claim waiting on this memorial.");
      throw new Error(error.message);
    }
    return { ok: true };
  });

/** The signed-in user's claim on a memorial, if any. */
export const myMemorialClaim = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { memorial_id: string }) => z.object({ memorial_id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { data: row } = await context.supabase
      .from("memorial_claims")
      .select("id, status, created_at")
      .eq("memorial_id", data.memorial_id)
      .eq("claimant_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return row ?? null;
  });

/** Admin: pending claims with memorial + claimant detail. */
export const listPendingClaims = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: rows, error } = await context.supabase
      .from("memorial_claims")
      .select("id, memorial_id, claimant_id, message, status, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const list = rows ?? [];
    if (!list.length) return [];

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: mems }, { data: profs }] = await Promise.all([
      supabaseAdmin
        .from("memorials")
        .select("id, slug, pet_name, owner_id")
        .in("id", Array.from(new Set(list.map((r) => r.memorial_id)))),
      supabaseAdmin
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", Array.from(new Set(list.map((r) => r.claimant_id)))),
    ]);
    const memMap = new Map(((mems ?? []) as any[]).map((m) => [m.id, m]));
    const profMap = new Map(((profs ?? []) as any[]).map((p) => [p.id, p]));
    return list.map((r) => ({
      ...r,
      memorial_slug: memMap.get(r.memorial_id)?.slug ?? null,
      memorial_pet_name: memMap.get(r.memorial_id)?.pet_name ?? null,
      memorial_has_owner: !!memMap.get(r.memorial_id)?.owner_id,
      claimant_name: profMap.get(r.claimant_id)?.display_name ?? "Someone",
      claimant_avatar: profMap.get(r.claimant_id)?.avatar_url ?? null,
    }));
  });

/** Admin: approve or reject a claim (the database function enforces admin). */
export const reviewMemorialClaim = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { claim_id: string; approve: boolean }) =>
    z.object({ claim_id: z.string().uuid(), approve: z.boolean() }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("review_memorial_claim", {
      _claim_id: data.claim_id,
      _approve: data.approve,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
