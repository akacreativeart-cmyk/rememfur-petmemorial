import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function assertAdmin(userId: string) {
  const { data: prof } = await supabaseAdmin
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .maybeSingle();
  if (!prof?.is_admin) throw new Error("Not authorized.");
}

const tableFor: Record<string, string> = {
  candle: "candles",
  message: "messages",
  post: "posts",
  comment: "post_comments",
};

const previewColumns: Record<string, string> = {
  candle: "id, lit_by_name, message, is_hidden, created_at",
  message: "id, body, is_hidden, created_at",
  post: "id, caption, image_url, is_hidden, created_at",
  comment: "id, body, is_hidden, created_at",
};

export type AdminReport = {
  id: string;
  content_type: "candle" | "message" | "post" | "comment";
  content_id: string;
  reason: string | null;
  created_at: string;
  content: Record<string, any> | null;
};

/** Admin only: list all reports newest first, with a preview of the reported content. */
export const listReports = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminReport[]> => {
    await assertAdmin(context.userId);

    const { data: reports, error } = await supabaseAdmin
      .from("reports")
      .select("id, content_type, content_id, reason, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);

    // Fetch content previews in one round-trip per type
    const buckets: Record<string, string[]> = {};
    for (const r of reports ?? []) {
      (buckets[r.content_type] ??= []).push(r.content_id);
    }
    const previewByKey: Record<string, any> = {};
    for (const [type, ids] of Object.entries(buckets)) {
      const table = tableFor[type];
      const cols = previewColumns[type];
      if (!table || !ids.length) continue;
      const { data: rows } = await (supabaseAdmin as any)
        .from(table)
        .select(cols)
        .in("id", ids);
      for (const row of rows ?? []) previewByKey[`${type}:${row.id}`] = row;
    }

    return (reports ?? []).map((r) => ({
      ...r,
      content_type: r.content_type as AdminReport["content_type"],
      content: previewByKey[`${r.content_type}:${r.content_id}`] ?? null,
    }));
  });

/** Admin only: dismiss (delete) a single report row. */
export const dismissReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin.from("reports").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Lightweight check the client can call to render the admin link. */
export const getMyAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await supabaseAdmin
      .from("profiles")
      .select("is_admin")
      .eq("id", context.userId)
      .maybeSingle();
    return { is_admin: !!data?.is_admin };
  });
