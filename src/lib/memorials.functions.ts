import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { slugify, withRandomSuffix } from "./slug";

const createSchema = z.object({
  pet_name: z.string().min(1).max(80),
  species: z.enum(["dog", "cat", "other"]),
  birth_date: z.string().nullable().optional(),
  passing_date: z.string().nullable().optional(),
  epitaph: z.string().max(200).nullable().optional(),
  story: z.string().max(5000).nullable().optional(),
  hero_image_url: z.string().url().nullable().optional(),
  transformed_image_url: z.string().url().nullable().optional(),
  transform_style: z.string().nullable().optional(),
  is_public: z.boolean().default(true),
});

export const createMemorial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => createSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const slug = withRandomSuffix(slugify(data.pet_name));
    const { data: row, error } = await supabase
      .from("memorials")
      .insert({ ...data, owner_id: userId, slug })
      .select("id, slug")
      .single();
    if (error) throw new Error(error.message);
    return row!;
  });

export const listGardenMemorials = createServerFn({ method: "GET" })
  .inputValidator((input: { species?: string; q?: string } | undefined) => input ?? {})
  .handler(async ({ data }) => {
    let q = supabaseAdmin
      .from("memorials")
      .select("id, slug, pet_name, species, birth_date, passing_date, epitaph, hero_image_url, transformed_image_url, created_at")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(60);
    if (data.species && data.species !== "all") q = q.eq("species", data.species);
    if (data.q) q = q.ilike("pet_name", `%${data.q}%`);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    // attach candle counts
    const ids = (rows ?? []).map((r) => r.id);
    let counts: Record<string, number> = {};
    if (ids.length) {
      const { data: candleRows } = await supabaseAdmin
        .from("candles")
        .select("memorial_id")
        .eq("is_hidden", false)
        .in("memorial_id", ids);
      (candleRows ?? []).forEach((c) => {
        counts[c.memorial_id] = (counts[c.memorial_id] ?? 0) + 1;
      });
    }
    return (rows ?? []).map((r) => ({ ...r, candle_count: counts[r.id] ?? 0 }));
  });

export const getMemorialBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const { data: memorial, error } = await supabaseAdmin
      .from("memorials")
      .select("*")
      .eq("slug", data.slug)
      .eq("is_public", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!memorial) return null;

    const [{ data: photos }, { data: candles }, { data: messages }] = await Promise.all([
      supabaseAdmin.from("memorial_photos").select("*").eq("memorial_id", memorial.id).order("created_at"),
      supabaseAdmin.from("candles").select("id, lit_by_name, message, created_at").eq("memorial_id", memorial.id).order("created_at", { ascending: false }),
      supabaseAdmin.from("messages").select("id, body, author_id, created_at").eq("memorial_id", memorial.id).order("created_at", { ascending: false }),
    ]);

    // author display names
    const authorIds = Array.from(new Set((messages ?? []).map((m) => m.author_id)));
    let nameMap: Record<string, string> = {};
    if (authorIds.length) {
      const { data: profs } = await supabaseAdmin.from("profiles").select("id, display_name").in("id", authorIds);
      (profs ?? []).forEach((p) => { nameMap[p.id] = p.display_name ?? "A friend"; });
    }

    return {
      memorial,
      photos: photos ?? [],
      candles: candles ?? [],
      messages: (messages ?? []).map((m) => ({ ...m, author_name: nameMap[m.author_id] ?? "A friend" })),
    };
  });

export const listMyMemorials = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("memorials")
      .select("id, slug, pet_name, species, passing_date, hero_image_url, transformed_image_url, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const updateSchema = z.object({
  slug: z.string().min(1),
  pet_name: z.string().min(1).max(80),
  species: z.enum(["dog", "cat", "other"]),
  birth_date: z.string().nullable().optional(),
  passing_date: z.string().nullable().optional(),
  epitaph: z.string().max(200).nullable().optional(),
  story: z.string().max(5000).nullable().optional(),
  is_public: z.boolean(),
});

export const getMyMemorialBySlug = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { slug: string }) =>
    z.object({ slug: z.string().min(1) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("memorials")
      .select("*")
      .eq("slug", data.slug)
      .eq("owner_id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const updateMemorial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => updateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { slug, ...patch } = data;
    const { error } = await supabase
      .from("memorials")
      .update(patch)
      .eq("slug", slug)
      .eq("owner_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteMemorial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("memorials")
      .delete()
      .eq("id", data.id)
      .eq("owner_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
