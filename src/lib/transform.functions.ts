import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const STYLE_PROMPTS: Record<string, string> = {
  painting: "Reimagine this pet as a soft oil painting portrait with warm sage and cream tones, painterly brushstrokes, gentle dreamy background of wildflowers, memorial mood. Keep the pet's features and colors faithful.",
  storybook: "Reimagine this pet in a whimsical children's storybook illustration style, with soft pastels, cute proportions, hand-painted texture, and a charming background. Keep the pet recognizable.",
  sketch: "Reimagine this pet as a delicate pencil sketch portrait on cream paper, fine cross-hatching, soft graphite, minimal background. Keep the pet's likeness.",
  watercolor: "Reimagine this pet as a soft watercolor portrait with flowing pigment edges, pastel palette of mauve and cream, dreamy bokeh background. Keep the pet recognizable.",
};

const dataUrlToBytes = (dataUrl: string): { bytes: Uint8Array; mime: string } => {
  const m = dataUrl.match(/^data:(.+?);base64,(.*)$/);
  if (!m) throw new Error("invalid data url");
  const mime = m[1];
  const b64 = m[2];
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { bytes, mime };
};

export const transformPortrait = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      source_image_url: z.string().url(),
      style: z.enum(["painting", "storybook", "sketch", "watercolor"]),
    }).parse(input)
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI is not configured");

    const prompt = STYLE_PROMPTS[data.style];

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: data.source_image_url } },
            ],
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      if (res.status === 429) throw new Error("AI rate limit reached. Please try again in a moment.");
      if (res.status === 402) throw new Error("AI credits exhausted. Please add credits in workspace settings.");
      throw new Error(`AI request failed: ${txt.slice(0, 200)}`);
    }

    const json = await res.json();
    const imgUrl: string | undefined =
      json?.choices?.[0]?.message?.images?.[0]?.image_url?.url ??
      json?.choices?.[0]?.message?.images?.[0]?.url;
    if (!imgUrl) throw new Error("AI did not return an image");

    const { bytes, mime } = dataUrlToBytes(imgUrl);
    const ext = mime.includes("png") ? "png" : "jpg";
    const path = `${userId}/${Date.now()}-${data.style}.${ext}`;
    const { error: upErr } = await supabaseAdmin.storage
      .from("transformed")
      .upload(path, bytes, { contentType: mime, upsert: false });
    if (upErr) throw new Error(`Upload failed: ${upErr.message}`);
    const { data: pub } = supabaseAdmin.storage.from("transformed").getPublicUrl(path);
    return { url: pub.publicUrl };
  });
