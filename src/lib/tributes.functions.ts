import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { notifyMemorialOwner } from "@/lib/owner-emails";

export const lightCandle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      memorial_id: z.string().uuid(),
      message: z.string().max(500).nullable().optional(),
      lit_by_name: z.string().max(80).nullable().optional(),
    }).parse(input)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: candle, error } = await supabase.from("candles").insert({
      memorial_id: data.memorial_id,
      lit_by: userId,
      message: data.message ?? null,
      lit_by_name: data.lit_by_name ?? null,
    }).select("id").single();
    if (error) throw new Error(error.message);
    void notifyMemorialOwner({
      memorialId: data.memorial_id,
      kind: "paw-lamp",
      actorId: userId,
      actorName: data.lit_by_name ?? null,
      preview: data.message ?? null,
      eventId: candle?.id ?? crypto.randomUUID(),
    });
    return { ok: true };
  });

export const postMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      memorial_id: z.string().uuid(),
      body: z.string().min(1).max(2000),
    }).parse(input)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: msg, error } = await supabase.from("messages").insert({
      memorial_id: data.memorial_id,
      author_id: userId,
      body: data.body,
    }).select("id").single();
    if (error) throw new Error(error.message);
    const { data: prof } = await supabase
      .from("profiles").select("display_name").eq("id", userId).maybeSingle();
    void notifyMemorialOwner({
      memorialId: data.memorial_id,
      kind: "comment",
      actorId: userId,
      actorName: prof?.display_name ?? null,
      preview: data.body.slice(0, 140),
      eventId: msg?.id ?? crypto.randomUUID(),
    });
    return { ok: true };
  });

export const leaveFlower = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      memorial_id: z.string().uuid(),
      flower: z.enum(["rose", "lily", "daisy", "sunflower", "tulip"]).default("rose"),
      message: z.string().max(300).nullable().optional(),
    }).parse(input)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: prof } = await supabase
      .from("profiles").select("display_name").eq("id", userId).maybeSingle();
    const { error } = await supabase.from("memorial_flowers").insert({
      memorial_id: data.memorial_id,
      left_by: userId,
      left_by_name: prof?.display_name ?? null,
      flower: data.flower,
      message: data.message?.trim() || null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
