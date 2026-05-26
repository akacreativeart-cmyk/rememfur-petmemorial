import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const assistCaption = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      draft: z.string().max(2000).optional().default(""),
      tone: z.enum(["tender", "celebratory", "honest", "short"]).default("tender"),
    }).parse(input)
  )
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI is not configured");

    const sys =
      "You help people write short, heartfelt captions for posts on a pet-loss community. " +
      "Tone: warm, gentle, never saccharine. 1-3 sentences. No hashtags. No emojis unless the draft has one.";

    const user = data.draft.trim()
      ? `Polish this draft (tone: ${data.tone}). Keep the user's voice. Return only the caption:\n\n${data.draft}`
      : `Write a ${data.tone} caption for a memorial post about a beloved pet. Return only the caption.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: user },
        ],
      }),
    });

    if (!res.ok) {
      if (res.status === 429) throw new Error("AI rate limit reached. Try again in a moment.");
      if (res.status === 402) throw new Error("AI credits exhausted.");
      throw new Error("AI request failed");
    }
    const json = await res.json();
    const text: string = json?.choices?.[0]?.message?.content ?? "";
    return { caption: text.trim().replace(/^["']|["']$/g, "") };
  });
