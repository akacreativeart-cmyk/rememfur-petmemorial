import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getMyProfile, updateMyProfile, deleteMyAccount } from "@/lib/profile.functions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Upload, User, KeyRound, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Settings — Rememfur" }] }),
});

function SettingsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fetchProfile = useServerFn(getMyProfile);
  const fetchUpdate = useServerFn(updateMyProfile);
  const fetchDelete = useServerFn(deleteMyAccount);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => fetchProfile(),
    enabled: !!user,
  });

  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  const [purge, setPurge] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? "");
      setAvatarUrl(profile.avatar_url ?? null);
    }
  }, [profile]);

  const save = useMutation({
    mutationFn: () =>
      fetchUpdate({
        data: {
          display_name: displayName.trim() || null,
          avatar_url: avatarUrl,
        },
      }),
    onSuccess: () => {
      toast.success("Profile saved.");
      qc.invalidateQueries({ queryKey: ["my-profile"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleAvatar = async (file: File) => {
    if (!user) return;
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("pet-photos")
      .upload(path, file, { contentType: file.type, upsert: true });
    setUploading(false);
    if (error) return toast.error(error.message);
    const { data } = supabase.storage.from("pet-photos").getPublicUrl(path);
    setAvatarUrl(data.publicUrl);
    toast.success("Avatar uploaded — don't forget to save.");
  };

  const changePassword = async () => {
    if (pw1.length < 8) return toast.error("Please choose at least 8 characters.");
    if (pw1 !== pw2) return toast.error("Passwords don't match.");
    setPwSaving(true);
    const { error } = await supabase.auth.updateUser({ password: pw1 });
    setPwSaving(false);
    if (error) return toast.error(error.message);
    setPw1(""); setPw2("");
    toast.success("Password updated.");
  };

  const del = useMutation({
    mutationFn: () => fetchDelete({ data: { purge_memorials: purge } }),
    onSuccess: async () => {
      await supabase.auth.signOut();
      qc.clear();
      toast.success("Your account has been closed. Take care of yourself.");
      navigate({ to: "/", replace: true });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const initials = (displayName || user?.email || "?")
    .split(/\s+/)
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-4xl text-foreground">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        How you appear when you light a paw lamp or leave a kind word.
      </p>

      <div className="mt-8 space-y-6">
        <section className="rounded-3xl border border-border/60 bg-card p-7 soft-shadow">
          <h2 className="flex items-center gap-2 font-display text-2xl text-foreground">
            <User className="h-5 w-5 text-sage-deep" /> Profile
          </h2>

          {isLoading ? (
            <div className="mt-6 h-40 animate-pulse rounded-2xl bg-muted" />
          ) : (
            <div className="mt-6 grid gap-6 md:grid-cols-[160px_1fr]">
              <div className="flex flex-col items-center gap-3">
                <Avatar className="h-28 w-28 ring-4 ring-cream">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
                  <AvatarFallback className="bg-sage/20 font-display text-2xl text-sage-deep">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground transition hover:bg-muted">
                  <Upload className="h-3.5 w-3.5" />
                  {uploading ? "Uploading…" : "Change photo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      e.target.files?.[0] && handleAvatar(e.target.files[0])
                    }
                  />
                </label>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="dn">Display name</Label>
                  <Input
                    id="dn"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="How you'd like to be known"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={user?.email ?? ""} disabled className="mt-1 bg-muted/40" />
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() => save.mutate()}
                    disabled={save.isPending}
                    className="rounded-full bg-sage-deep text-primary-foreground hover:bg-sage-deep/90"
                  >
                    {save.isPending ? "Saving…" : "Save changes"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-border/60 bg-card p-7 soft-shadow">
          <h2 className="flex items-center gap-2 font-display text-2xl text-foreground">
            <KeyRound className="h-5 w-5 text-sage-deep" /> Change password
          </h2>
          <div className="mt-4 grid gap-3 md:max-w-md">
            <div>
              <Label htmlFor="pw1">New password</Label>
              <Input id="pw1" type="password" value={pw1} onChange={(e) => setPw1(e.target.value)} placeholder="At least 8 characters" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="pw2">Confirm new password</Label>
              <Input id="pw2" type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} className="mt-1" />
            </div>
            <div className="flex justify-start">
              <Button
                onClick={changePassword}
                disabled={pwSaving || !pw1 || !pw2}
                variant="outline"
                className="rounded-full"
              >
                {pwSaving ? "Updating…" : "Update password"}
              </Button>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-border/60 bg-card p-7 soft-shadow">
          <h2 className="font-display text-2xl text-foreground">Account</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign out of this device. Your memorials and tributes are kept safe.
          </p>
          <Button
            variant="outline"
            className="mt-4 rounded-full"
            onClick={async () => {
              await signOut();
              qc.clear();
              navigate({ to: "/", replace: true });
            }}
          >
            Sign out
          </Button>
        </section>

        <section className="rounded-3xl border border-destructive/30 bg-destructive/5 p-7">
          <h2 className="flex items-center gap-2 font-display text-2xl text-foreground">
            <AlertTriangle className="h-5 w-5 text-destructive" /> Close account
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            By default, the memorials you've created will remain online in loving memory — they just won't be editable anymore.
            You can also choose to remove everything.
          </p>
          <label className="mt-4 flex items-start gap-2 text-sm">
            <Checkbox
              checked={purge}
              onCheckedChange={(v) => setPurge(v === true)}
              className="mt-0.5"
            />
            <span className="text-foreground/85">
              Also delete every memorial I've created, along with their paw lamps, messages, and photos.
              <span className="mt-0.5 block text-xs text-muted-foreground">This cannot be undone.</span>
            </span>
          </label>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="mt-5 rounded-full border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                Close my account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="font-display text-2xl">
                  Close your Rememfur account?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {purge
                    ? "This will remove your account and every memorial you created — paw lamps, messages, and photos included."
                    : "This will close your account. The memorials you created will stay online in loving memory, but no one will be able to edit them anymore."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-full">Not yet</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => del.mutate()}
                  disabled={del.isPending}
                  className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {del.isPending ? "Closing…" : "Yes, close my account"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </section>
      </div>
    </div>
  );
}
