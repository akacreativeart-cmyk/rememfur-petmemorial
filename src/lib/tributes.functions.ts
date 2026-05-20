import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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
    const { error } = await supabase.from("candles").insert({
      memorial_id: data.memorial_id,
      lit_by: userId,
      message: data.message ?? null,
      lit_by_name: data.lit_by_name ?? null,
    });
    if (error) throw new Error(error.message);
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
    const { error } = await supabase.from("messages").insert({
      memorial_id: data.memorial_id,
      author_id: userId,
      body: data.body,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
