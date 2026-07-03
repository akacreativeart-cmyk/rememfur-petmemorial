import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const schema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  item_name: z.string().trim().min(1).max(120),
  section: z.string().trim().min(1).max(60),
});

/**
 * Marketplace "Notify me" — open to anyone (no auth).
 * Duplicate (email + item) is a friendly no-op.
 */
export const joinWaitlist = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data }) => {
    const { data: existing } = await supabaseAdmin
      .from("marketplace_waitlist")
      .select("id")
      .eq("email", data.email)
      .eq("item_name", data.item_name)
      .maybeSingle();

    if (existing) return { ok: true, duplicate: true as const };

    const { error } = await supabaseAdmin.from("marketplace_waitlist").insert({
      email: data.email,
      item_name: data.item_name,
      section: data.section,
    });
    if (error) throw new Error(error.message);
    return { ok: true, duplicate: false as const };
  });
