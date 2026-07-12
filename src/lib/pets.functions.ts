import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const petSchema = z.object({
  name: z.string().min(1).max(80),
  species: z.enum(["dog", "cat", "bird", "rabbit", "reptile", "fish", "other"]).default("other"),
  breed: z.string().max(120).nullable().optional(),
  birthdate: z.string().nullable().optional(),
  adoption_date: z.string().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  avatar_url: z.string().url().nullable().optional(),
});

const recordKinds = ["health", "vaccination", "grooming", "insurance", "birthday", "other"] as const;
const recordSchema = z.object({
  pet_id: z.string().uuid(),
  kind: z.enum(recordKinds),
  title: z.string().min(1).max(160),
  notes: z.string().max(2000).nullable().optional(),
  date: z.string(),
  next_due_date: z.string().nullable().optional(),
  attachment_url: z.string().url().nullable().optional(),
});

export const listMyPets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("pets")
      .select("id, name, species, breed, birthdate, adoption_date, avatar_url, notes, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getMyPet = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { pet_id: string }) => z.object({ pet_id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const [{ data: pet, error: pErr }, { data: records, error: rErr }] = await Promise.all([
      context.supabase
        .from("pets")
        .select("id, name, species, breed, birthdate, adoption_date, notes, avatar_url, created_at, updated_at")
        .eq("id", data.pet_id)
        .maybeSingle(),
      context.supabase
        .from("pet_records")
        .select("id, kind, title, notes, date, next_due_date, attachment_url, created_at")
        .eq("pet_id", data.pet_id)
        .order("date", { ascending: false }),
    ]);
    if (pErr) throw new Error(pErr.message);
    if (rErr) throw new Error(rErr.message);
    return { pet, records: records ?? [] };
  });

export const createPet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => petSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("pets")
      .insert({ ...data, owner_id: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return row!;
  });

export const updatePet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => petSchema.extend({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data;
    const { error } = await context.supabase.from("pets").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deletePet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string }) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("pets").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const addPetRecord = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => recordSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("pet_records").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deletePetRecord = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string }) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("pet_records").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
