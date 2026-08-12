import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { HandHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { myMemorialClaim, submitMemorialClaim } from "@/lib/claims.functions";
import { toast } from "sonner";

/**
 * Shown only on memorials that have no keeper. Lets the real person ask to
 * become the owner; an admin reviews the request.
 */
export function ClaimMemorialPanel({
  memorialId,
  petName,
  hasOwner,
}: {
  memorialId: string;
  petName: string;
  hasOwner: boolean;
}) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [message, setMessage] = useState("");
  const claimFn = useServerFn(myMemorialClaim);
  const submitFn = useServerFn(submitMemorialClaim);

  const { data: claim } = useQuery({
    queryKey: ["my-claim", memorialId, user?.id ?? "anon"],
    queryFn: () => claimFn({ data: { memorial_id: memorialId } }),
    enabled: !!user && !hasOwner,
  });

  const submit = useMutation({
    mutationFn: () => submitFn({ data: { memorial_id: memorialId, message: message.trim() || null } }),
    onSuccess: () => {
      toast.success("Claim submitted — we’ll review it soon.");
      qc.invalidateQueries({ queryKey: ["my-claim", memorialId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (hasOwner) return null;

  return (
    <section className="mt-10 rounded-3xl border border-[var(--cta)]/30 bg-[color-mix(in_oklab,var(--cta)_7%,transparent)] p-5">
      <div className="flex items-start gap-3">
        <HandHeart className="mt-0.5 h-5 w-5 shrink-0 text-[var(--cta)]" />
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl text-foreground">This memorial has no keeper</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Someone lit this page for {petName}. If {petName} was yours, you can ask to become their keeper —
            you’ll be able to edit the page, add photos and read every message.
          </p>

          {!user && (
            <p className="mt-3 text-sm">
              <Link to="/login" className="link-gold">Sign in</Link> to claim this memorial.
            </p>
          )}

          {user && claim?.status === "pending" && (
            <p className="mt-3 rounded-xl bg-background/60 px-3 py-2 text-sm text-muted-foreground">
              Claim submitted — we’ll review it and let you know.
            </p>
          )}
          {user && claim?.status === "rejected" && (
            <p className="mt-3 rounded-xl bg-background/60 px-3 py-2 text-sm text-muted-foreground">
              Your previous claim wasn’t approved. Get in touch if you think that’s a mistake.
            </p>
          )}

          {user && claim?.status !== "pending" && (
            <div className="mt-3 space-y-2">
              <Textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Tell us why ${petName} is yours — anything that helps us be sure.`}
              />
              <Button
                className="btn-gold-sm"
                disabled={submit.isPending}
                onClick={() => submit.mutate()}
              >
                {submit.isPending ? "Sending…" : "Claim this memorial"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default ClaimMemorialPanel;
