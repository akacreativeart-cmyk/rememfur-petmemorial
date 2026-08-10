import { supabase } from "@/integrations/supabase/client";

/** Upload an image to the public `pet-photos` bucket under the signed-in user's folder. */
export async function uploadPetPhoto(file: File): Promise<string> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) throw new Error("Please sign in to upload a photo.");
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${uid}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("pet-photos").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || "image/jpeg",
  });
  if (error) throw new Error(error.message);
  return supabase.storage.from("pet-photos").getPublicUrl(path).data.publicUrl;
}
