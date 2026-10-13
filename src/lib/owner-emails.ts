// Server-only: emails the memorial owner when someone lights a paw lamp or
// leaves a message/comment. Never import from client components.

type Kind = "paw-lamp" | "comment";

/**
 * Notify the memorial's owner by email. Fire-and-forget safe: any failure is
 * swallowed so the triggering action (lighting a lamp, posting a message)
 * never breaks because of email.
 */
export async function notifyMemorialOwner(opts: {
  memorialId: string;
  kind: Kind;
  actorId?: string | null;
  actorName?: string | null;
  preview?: string | null;
  /** Unique event id (e.g. the candle/comment row id) for send dedupe. */
  eventId: string;
}): Promise<void> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: m } = await supabaseAdmin
      .from("memorials")
      .select("owner_id, pet_name, slug")
      .eq("id", opts.memorialId)
      .maybeSingle();
    if (!m?.owner_id) return;
    if (opts.actorId && opts.actorId === m.owner_id) return;

    const [{ data: ownerUser }, { data: ownerProfile }] = await Promise.all([
      supabaseAdmin.auth.admin.getUserById(m.owner_id),
      supabaseAdmin.from("profiles").select("display_name").eq("id", m.owner_id).maybeSingle(),
    ]);
    const email = ownerUser?.user?.email;
    if (!email) return;

    const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
    const memorialUrl = `https://rememfur.com/memorial/${m.slug}`;
    const templateName = opts.kind === "paw-lamp" ? "paw-lamp-lit" : "memorial-comment";
    await sendTemplateEmail(templateName, email, {
      idempotencyKey: `${templateName}-${opts.eventId}`,
      templateData: {
        ownerName: ownerProfile?.display_name ?? undefined,
        petName: m.pet_name,
        litByName: opts.actorName ?? undefined,
        authorName: opts.actorName ?? undefined,
        message: opts.preview ?? undefined,
        comment: opts.preview ?? undefined,
        memorialUrl,
      },
    });
  } catch (err) {
    console.error("owner email notification failed", err);
  }
}
