import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const memoryFields = {
  title: z.string().min(1).max(160),
  content: z.string().max(5000).nullable().optional(),
  memory_date: z.string(),
  photo_url: z.string().url().nullable().optional(),
  photo_urls: z.array(z.string().url()).max(6).optional(),
};

const SELECT = "id, pet_id, title, content, memory_date, photo_url, created_at";

export const listMemories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { pet_id: string }) => z.object({ pet_id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("memories")
      .select(SELECT)
      .eq("pet_id", data.pet_id)
      .order("memory_date", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const list = rows ?? [];
    if (!list.length) return [];
    const { data: photos } = await context.supabase
      .from("memory_photos")
      .select("memory_id, url, position")
      .in("memory_id", list.map((m) => m.id))
      .order("position");
    const byMemory: Record<string, string[]> = {};
    (photos ?? []).forEach((p) => { (byMemory[p.memory_id] ??= []).push(p.url); });
    return list.map((m) => ({
      ...m,
      photos: byMemory[m.id] ?? (m.photo_url ? [m.photo_url] : []),
    }));
  });

/** Pets + memory counts + a few recent memories, for the Memory Keeper dashboard. */
export const memoryKeeperOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [{ data: pets, error: pErr }, { data: memories, error: mErr }] = await Promise.all([
      context.supabase
        .from("pets")
        .select("id, name, species, breed, birthdate, passing_date, avatar_url, story, created_at")
        .eq("owner_id", context.userId)
        .order("created_at", { ascending: false }),
      context.supabase
        .from("memories")
        .select("id, pet_id, title, memory_date, photo_url")
        .eq("user_id", context.userId)
        .order("memory_date", { ascending: false })
        .limit(200),
    ]);
    if (pErr) throw new Error(pErr.message);
    if (mErr) throw new Error(mErr.message);
    const all = memories ?? [];
    return {
      pets: (pets ?? []).map((p) => ({
        ...p,
        memory_count: all.filter((m) => m.pet_id === p.id).length,
      })),
      recent: all.slice(0, 5),
    };
  });

export const createMemory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ pet_id: z.string().uuid(), ...memoryFields }).parse(i))
  .handler(async ({ data, context }) => {
    const { photo_urls, ...rest } = data;
    const urls = (photo_urls ?? []).slice(0, 6);
    const { data: row, error } = await context.supabase
      .from("memories")
      .insert({ ...rest, photo_url: rest.photo_url ?? urls[0] ?? null, user_id: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    if (urls.length) {
      const { error: pErr } = await context.supabase
        .from("memory_photos")
        .insert(urls.map((url, position) => ({ memory_id: row!.id, url, position })));
      if (pErr) throw new Error(pErr.message);
    }
    return row!;
  });

export const updateMemory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid(), ...memoryFields }).parse(i))
  .handler(async ({ data, context }) => {
    const { id, photo_urls, ...patch } = data;
    const urls = (photo_urls ?? []).slice(0, 6);
    const { error } = await context.supabase
      .from("memories")
      .update({ ...patch, photo_url: patch.photo_url ?? urls[0] ?? null })
      .eq("id", id);
    if (error) throw new Error(error.message);
    await context.supabase.from("memory_photos").delete().eq("memory_id", id);
    if (urls.length) {
      const { error: pErr } = await context.supabase
        .from("memory_photos")
        .insert(urls.map((url, position) => ({ memory_id: id, url, position })));
      if (pErr) throw new Error(pErr.message);
    }
    return { ok: true };
  });

export const deleteMemory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string }) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("memories").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
