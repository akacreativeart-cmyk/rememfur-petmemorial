import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const contentType = z.enum(["candle", "message", "post", "comment"]);
const tableFor: Record<z.infer<typeof contentType>, string> = {
  candle: "candles",
  message: "messages",
  post: "posts",
  comment: "post_comments",
};

/**
 * Anyone (signed in or not) can flag content. Reports are only readable by admins.
 * We deliberately do not surface whether the content exists to prevent enumeration.
 */
export const reportContent = createServerFn({ method: "POST" })
  .inputValidator((input: { content_type: string; content_id: string; reason?: string | null }) =>
    z.object({
      content_type: contentType,
      content_id: z.string().uuid(),
      reason: z.string().trim().max(500).nullable().optional(),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    await supabaseAdmin.from("reports").insert({
      content_type: data.content_type,
      content_id: data.content_id,
      reason: data.reason ?? null,
    });
    return { ok: true };
  });

/**
 * Admin-only: hide or unhide any moderated content type.
 */
export const setContentHidden = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { content_type: string; content_id: string; hidden: boolean }) =>
    z.object({
      content_type: contentType,
      content_id: z.string().uuid(),
      hidden: z.boolean(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: prof } = await context.supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", context.userId)
      .maybeSingle();
    if (!prof?.is_admin) throw new Error("Not authorized.");

    const table = tableFor[data.content_type as z.infer<typeof contentType>];
    const { error } = await supabaseAdmin
      .from(table)
      .update({ is_hidden: data.hidden })
      .eq("id", data.content_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
