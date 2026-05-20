import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/use-auth";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import heroImg from "@/assets/hero-meadow.jpg";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Sign in — Rememfur" }] }),
});

function LoginPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/dashboard" });
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) toast.error(error.message);
    else navigate({ to: "/dashboard" });
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
    if (r.error) toast.error("Could not sign in with Google");
  };

  return (
    <div className="min-h-screen bg-background paper-grain">
      <SiteHeader />
      <main className="mx-auto grid max-w-5xl gap-10 px-5 py-12 md:grid-cols-2 md:py-20">
        <div className="hidden overflow-hidden rounded-3xl border border-border/60 soft-shadow md:block">
          <img src={heroImg} alt="" width={900} height={1100} className="h-full w-full object-cover" />
        </div>
        <div className="flex items-center">
          <form onSubmit={submit} className="w-full rounded-3xl border border-border/60 bg-card p-8 soft-shadow">
            <h1 className="font-display text-3xl text-foreground">Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to your Rememfur space.</p>

            <Button type="button" variant="outline" onClick={google} className="mt-6 w-full rounded-full">
              Continue with Google
            </Button>
            <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
            </div>
            <div className="space-y-3">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </div>
            <Button type="submit" disabled={busy} className="mt-5 w-full rounded-full bg-sage-deep text-primary-foreground hover:bg-sage-deep/90">
              {busy ? "Signing in…" : "Sign in"}
            </Button>
            <p className="mt-5 text-center text-sm text-muted-foreground">
              New here? <Link to="/signup" className="text-sage-deep hover:underline">Create an account</Link>
            </p>
          </form>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
