import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const memoryFields = {
  title: z.string().min(1).max(160),
  content: z.string().max(5000).nullable().optional(),
  memory_date: z.string(),
  photo_url: z.string().url().nullable().optional(),
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
    return rows ?? [];
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
    const { data: row, error } = await context.supabase
      .from("memories")
      .insert({ ...data, user_id: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return row!;
  });

export const updateMemory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid(), ...memoryFields }).parse(i))
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data;
    const { error } = await context.supabase.from("memories").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
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
