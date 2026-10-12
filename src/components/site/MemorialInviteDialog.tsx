import { useState } from "react";
import { Copy, Mail, Share2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { memorialInviteEmail, memorialInviteUrl } from "@/lib/memorial-invite";

export function MemorialInviteDialog({ slug, petName }: { slug: string; petName: string }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const url = memorialInviteUrl(slug);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Invitation link copied.");
    } catch {
      setError("Please select and copy the invitation link below.");
    }
  }

  async function shareLink() {
    if (!navigator.share) return copyLink();
    try {
      await navigator.share({ title: `Remember ${petName} with me`, text: `Join me in remembering ${petName}.`, url });
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      await copyLink();
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><UserPlus /> Invite friends</Button>
      </DialogTrigger>
      <DialogContent className="warm-platform max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-lg border-border bg-background text-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="pr-6 font-display text-2xl">Remember {petName} together</DialogTitle>
          <DialogDescription>Invite someone who loved them, too.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <label htmlFor="memorial-invite-link" className="text-sm font-medium">Invitation link</label>
          <Input id="memorial-invite-link" readOnly value={url} onFocus={(event) => event.target.select()} />
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={copyLink}><Copy /> Copy link</Button>
            <Button variant="outline" size="sm" onClick={shareLink}><Share2 /> Share</Button>
          </div>
        </div>
        <form className="space-y-4 border-t border-border pt-4" onSubmit={(event) => {
          event.preventDefault();
          setError("");
          try {
            window.location.href = memorialInviteEmail(email, petName, slug, message);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Couldn't prepare the invitation.");
          }
        }}>
          <div className="space-y-2">
            <label htmlFor="memorial-invite-email" className="text-sm font-medium">Friend’s email</label>
            <Input id="memorial-invite-email" type="email" required maxLength={254} autoComplete="email" placeholder="friend@example.com" value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          <div className="space-y-2">
            <label htmlFor="memorial-invite-message" className="text-sm font-medium">A personal note <span className="text-muted-foreground">(optional)</span></label>
            <Textarea id="memorial-invite-message" rows={3} maxLength={1000} value={message} onChange={(event) => setMessage(event.target.value)} />
          </div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full"><Mail /> Open email invitation</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}