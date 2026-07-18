import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Gentle caption helper. Callers may pass `pronouns`, `nickname` and
 * `species` so the model never falls back to "it" for a beloved companion.
 */
export const assistCaption = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      draft: z.string().max(2000).optional().default(""),
      tone: z.enum(["tender", "celebratory", "honest", "short"]).default("tender"),
      petName: z.string().max(80).optional().nullable(),
      nickname: z.string().max(80).optional().nullable(),
      species: z.string().max(40).optional().nullable(),
      pronouns: z.string().max(40).optional().nullable(),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI is not configured");

    const nameForModel = (data.nickname?.trim() || data.petName?.trim() || "").trim();
    const pronouns = (data.pronouns || "they/them").trim();
    const species = (data.species || "beloved companion").trim();

    const sys = [
      "You help people write short, heartfelt captions for a pet-memorial site.",
      "Tone: warm, gentle, never saccharine. 1–3 sentences. No hashtags. No emojis unless the draft has one.",
      `Refer to the pet by name (${nameForModel || "the pet"}) or by the provided pronouns (${pronouns}).`,
      "NEVER refer to the pet as \"it\" — they were family.",
    ].join(" ");

    const context = [
      nameForModel ? `Name: ${nameForModel}` : null,
      species ? `Species: ${species}` : null,
      pronouns ? `Pronouns: ${pronouns}` : null,
    ].filter(Boolean).join(" · ");

    const user = data.draft.trim()
      ? `Polish this draft (tone: ${data.tone}). Keep the user's voice. ${context ? `Context — ${context}. ` : ""}Return only the caption:\n\n${data.draft}`
      : `Write a ${data.tone} short memorial caption. ${context ? `Context — ${context}. ` : ""}Return only the caption.`;

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
