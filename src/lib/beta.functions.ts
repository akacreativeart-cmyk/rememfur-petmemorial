import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const schema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  note: z.string().trim().max(500).optional().nullable(),
  source: z.string().trim().min(1).max(80),
});

/**
 * Beta invite request — open to anyone (no auth).
 * Duplicate email (case-insensitive) is treated as a friendly no-op success.
 */
export const requestBetaInvite = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data }) => {
    const email = data.email;
    const { data: existing } = await supabaseAdmin
      .from("beta_invites")
      .select("id")
      .ilike("email", email)
      .maybeSingle();

    if (existing) return { ok: true, duplicate: true as const };

    const { error } = await supabaseAdmin.from("beta_invites").insert({
      email,
      note: data.note?.trim() ? data.note.trim() : null,
      source: data.source,
    });
    // Race-safe on unique index: swallow duplicate
    if (error) {
      const msg = error.message ?? "";
      if (/duplicate|unique/i.test(msg)) return { ok: true, duplicate: true as const };
      throw new Error(msg);
    }
    return { ok: true, duplicate: false as const };
  });
