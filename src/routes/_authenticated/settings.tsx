import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getMyProfile, updateMyProfile } from "@/lib/profile.functions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Upload, User } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Settings — Rememfur" }] }),
});

function SettingsPage() {
  const { user, signOut } = useAuth();
  const qc = useQueryClient();
  const fetchProfile = useServerFn(getMyProfile);
  const fetchUpdate = useServerFn(updateMyProfile);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => fetchProfile(),
    enabled: !!user,
  });

  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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
        How you appear when you light a candle or leave a kind word.
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
          <h2 className="font-display text-2xl text-foreground">Account</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign out of this device. Your memorials and tributes are kept safe.
          </p>
          <Button
            variant="outline"
            className="mt-4 rounded-full"
            onClick={() => signOut()}
          >
            Sign out
          </Button>
        </section>
      </div>
    </div>
  );
}
