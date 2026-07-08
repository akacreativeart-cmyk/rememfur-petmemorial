import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SubmitInput = z.object({
  message: z.string().trim().min(3).max(4000),
  email: z.string().trim().email().max(200).optional().nullable(),
  page_path: z.string().max(400).optional().nullable(),
});

export const submitBetaFeedback = createServerFn({ method: "POST" })
  .inputValidator((v: unknown) => SubmitInput.parse(v))
  .handler(async ({ data }) => {
    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );
    const { error } = await supabase.from("beta_feedback").insert({
      message: data.message,
      email: data.email ?? null,
      page_path: data.page_path ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export type BetaFeedbackRow = {
  id: string;
  message: string;
  email: string | null;
  page_path: string | null;
  user_id: string | null;
  created_at: string;
};

export const listBetaFeedback = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<BetaFeedbackRow[]> => {
    const { data, error } = await context.supabase
      .from("beta_feedback")
      .select("id, message, email, page_path, user_id, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const deleteBetaFeedback = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => z.object({ id: z.string().uuid() }).parse(v))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("beta_feedback").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
