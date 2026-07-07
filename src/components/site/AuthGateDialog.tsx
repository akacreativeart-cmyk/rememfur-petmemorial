import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/use-auth";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  /** Called before OAuth redirect (persist any draft). */
  beforeOAuthRedirect?: () => void;
  /** Called when the user becomes authenticated while this dialog is open. */
  onAuthed?: () => void;
  /** Where OAuth should return to. Defaults to current pathname. */
  oauthRedirectPath?: string;
};

const GoogleLogo = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.1z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

export function AuthGateDialog({ open, onOpenChange, title, subtitle, beforeOAuthRedirect, onAuthed, oauthRedirectPath }: Props) {
  const { user } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  // Auto-continue when the user becomes authenticated while the dialog is open.
  useEffect(() => {
    if (open && user) {
      onAuthed?.();
      onOpenChange(false);
    }
  }, [open, user, onAuthed, onOpenChange]);

  const redirectPath = oauthRedirectPath ?? (typeof window !== "undefined" ? window.location.pathname : "/");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // onAuthed will fire from the effect once the session lands.
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + redirectPath,
            data: name ? { display_name: name } : undefined,
          },
        });
        if (error) throw error;
        toast.success("Check your email to confirm — we've kept everything you wrote.");
        onOpenChange(false);
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    beforeOAuthRedirect?.();
    const r = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + redirectPath,
    });
    if (r.error) toast.error("Could not sign in with Google");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{title}</DialogTitle>
          {subtitle && <DialogDescription>{subtitle}</DialogDescription>}
        </DialogHeader>

        <div className="mt-2 grid gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={google}
            className="w-full gap-2 rounded-full"
          >
            <GoogleLogo /> Continue with Google
          </Button>
        </div>

        <div className="my-3 flex items-center gap-3 text-[11px] uppercase tracking-widest text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
        </div>

        <div className="mb-2 inline-flex self-center rounded-full border border-border bg-muted/40 p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`rounded-full px-3 py-1 ${mode === "signin" ? "bg-[var(--cta)] text-[var(--cta-foreground)]" : "text-muted-foreground"}`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`rounded-full px-3 py-1 ${mode === "signup" ? "bg-[var(--cta)] text-[var(--cta-foreground)]" : "text-muted-foreground"}`}
          >
            Create account
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <div>
              <Label htmlFor="ag-name">Your name</Label>
              <Input id="ag-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex" />
            </div>
          )}
          <div>
            <Label htmlFor="ag-email">Email</Label>
            <Input id="ag-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="ag-pass">Password</Label>
            <Input id="ag-pass" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-[var(--cta)] text-[var(--cta-foreground)] hover:opacity-90"
          >
            {busy ? "Just a moment…" : mode === "signin" ? "Sign in & continue" : "Create account"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
