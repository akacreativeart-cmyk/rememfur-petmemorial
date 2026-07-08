import { toast } from "sonner";

export async function shareOrCopy(data: { title?: string; text?: string; url: string }): Promise<void> {
  if (typeof navigator === "undefined") return;
  const nav = navigator as Navigator;
  try {
    if ("share" in nav && typeof nav.share === "function") {
      await nav.share(data);
      return;
    }
  } catch {
    /* user cancelled or unsupported */
    return;
  }
  try {
    await nav.clipboard.writeText(`${data.text ? data.text + " " : ""}${data.url}`);
    toast.success("Link copied");
  } catch {
    toast.error("Couldn't share this link");
  }
}
