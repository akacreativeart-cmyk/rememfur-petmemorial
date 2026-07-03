import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { format } from "date-fns";
import { EyeOff, Eye, Trash2, ShieldCheck, ChevronLeft } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Button } from "@/components/ui/button";
import { listReports, dismissReport, getMyAdminStatus, type AdminReport } from "@/lib/admin.functions";
import { setContentHidden } from "@/lib/moderation.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Rememfur" }] }),
  beforeLoad: async () => {
    try {
      const res = await getMyAdminStatus();
      if (!res?.is_admin) throw redirect({ to: "/" });
    } catch (e: any) {
      // Not signed in or not admin — send home.
      throw redirect({ to: "/" });
    }
  },
  component: AdminPage,
});

const LABELS: Record<AdminReport["content_type"], string> = {
  candle: "Candle",
  message: "Message",
  post: "Post",
  comment: "Comment",
};

function ContentPreview({ r }: { r: AdminReport }) {
  const c = r.content;
  if (!c) {
    return <p className="text-sm italic text-white/50">Content no longer exists.</p>;
  }
  const body =
    (c.message as string | undefined) ??
    (c.body as string | undefined) ??
    (c.caption as string | undefined) ??
    null;
  const image = c.image_url as string | undefined;
  return (
    <div className="space-y-2">
      {c.lit_by_name && (
        <div className="text-xs text-white/60">From: {c.lit_by_name}</div>
      )}
      {body && (
        <p className="whitespace-pre-line rounded-lg bg-white/[0.04] p-3 text-sm text-white/90 ring-1 ring-white/10">
          {body}
        </p>
      )}
      {image && (
        <img
          src={image}
          alt=""
          className="max-h-48 rounded-lg object-cover ring-1 ring-white/10"
        />
      )}
      <div className="text-[11px] text-white/45">
        {c.is_hidden ? "Currently hidden" : "Currently visible"} · content ID {r.content_id.slice(0, 8)}
      </div>
    </div>
  );
}

function AdminPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listReports);
  const hideFn = useServerFn(setContentHidden);
  const dismissFn = useServerFn(dismissReport);

  const { data: reports, isLoading } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: () => listFn(),
  });

  const hideMut = useMutation({
    mutationFn: (v: { content_type: AdminReport["content_type"]; content_id: string; hidden: boolean }) =>
      hideFn({ data: v }),
    onSuccess: (_r, v) => {
      toast.success(v.hidden ? "Content hidden." : "Content restored.");
      qc.invalidateQueries({ queryKey: ["admin-reports"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const dismissMut = useMutation({
    mutationFn: (id: string) => dismissFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Report dismissed.");
      qc.invalidateQueries({ queryKey: ["admin-reports"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="min-h-screen bg-[#05070f] text-white">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-5 pt-6 pb-24">
        <Link to="/" className="inline-flex items-center gap-1 text-xs text-white/60 hover:text-white">
          <ChevronLeft className="h-3.5 w-3.5" /> Back
        </Link>
        <div className="mt-3 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-200/15 text-amber-200">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <div>
            <h1 className="font-display text-3xl">Moderation</h1>
            <p className="text-xs text-white/60">Reports newest first. Handle with care.</p>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {isLoading && (
            <div className="rounded-2xl bg-white/[0.05] p-6 text-sm text-white/60 ring-1 ring-white/10">
              Loading reports…
            </div>
          )}
          {!isLoading && (!reports || reports.length === 0) && (
            <div className="rounded-2xl bg-white/[0.05] p-8 text-center text-sm text-white/60 ring-1 ring-white/10">
              No open reports. Everything's quiet.
            </div>
          )}
          {(reports ?? []).map((r) => {
            const hidden = !!r.content?.is_hidden;
            return (
              <article
                key={r.id}
                className="rounded-2xl bg-white/[0.05] p-5 ring-1 ring-white/10"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-amber-200/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-amber-200">
                      {LABELS[r.content_type]}
                    </span>
                    {hidden && (
                      <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-red-300">
                        Hidden
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-white/45">
                    {format(new Date(r.created_at), "MMM d, yyyy · h:mm a")}
                  </div>
                </div>
                {r.reason && (
                  <p className="mt-3 rounded-lg bg-amber-200/10 p-3 text-sm italic text-amber-100/90 ring-1 ring-amber-200/20">
                    "{r.reason}"
                  </p>
                )}
                <div className="mt-3">
                  <ContentPreview r={r} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {r.content && !hidden && (
                    <Button
                      size="sm"
                      onClick={() =>
                        hideMut.mutate({
                          content_type: r.content_type,
                          content_id: r.content_id,
                          hidden: true,
                        })
                      }
                      className="rounded-full bg-red-500/90 text-white hover:bg-red-500"
                    >
                      <EyeOff className="mr-1.5 h-3.5 w-3.5" /> Hide
                    </Button>
                  )}
                  {r.content && hidden && (
                    <Button
                      size="sm"
                      onClick={() =>
                        hideMut.mutate({
                          content_type: r.content_type,
                          content_id: r.content_id,
                          hidden: false,
                        })
                      }
                      className="rounded-full bg-emerald-500/90 text-white hover:bg-emerald-500"
                    >
                      <Eye className="mr-1.5 h-3.5 w-3.5" /> Unhide
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => dismissMut.mutate(r.id)}
                    className="rounded-full text-white/70 hover:bg-white/10 hover:text-white"
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Dismiss report
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
