import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Bell, Flame, MessageCircle, PawPrint, UserPlus, Mail, CheckCheck } from "lucide-react";
import { PawLamp } from "@/components/site/PawLamp";
import { Button } from "@/components/ui/button";
import {
  listNotifications,
  markAllNotificationsRead,
} from "@/lib/notifications.functions";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authenticated/notifications")({
  component: NotificationsPage,
  head: () => ({ meta: [{ title: "Notifications — Rememfur" }] }),
});

const ICONS: Record<string, any> = {
  candle: Flame,
  paw: PawPrint,
  comment: MessageCircle,
  message: Mail,
  follow: UserPlus,
};

const VERBS: Record<string, string> = {
  candle: "lit a paw lamp",
  paw: "left a paw",
  comment: "commented",
  message: "wrote on the memorial",
  follow: "started following you",
};

function NotificationsPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listNotifications);
  const markFn = useServerFn(markAllNotificationsRead);

  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ["notif-list-full"],
    queryFn: () => listFn(),
  });

  const markAll = useMutation({
    mutationFn: () => markFn(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notif-list-full"] });
      qc.invalidateQueries({ queryKey: ["notif-count"] });
      qc.invalidateQueries({ queryKey: ["notif-list"] });
    },
  });

  const unreadCount = items.filter((n: any) => !n.read_at).length;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-foreground">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every paw lamp lit, every kind word left — quietly gathered here.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
          >
            <CheckCheck className="mr-1.5 h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      <div className="mt-8 overflow-hidden rounded-3xl border border-border/60 bg-card soft-shadow">
        {isLoading ? (
          <div className="space-y-1 p-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : error ? (
          <div className="px-6 py-10 text-center text-sm text-destructive">
            Couldn't load notifications. Please refresh.
          </div>
        ) : items.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cream/60 text-muted-foreground">
              <Bell className="h-6 w-6" />
            </div>
            <p className="mt-4 font-display text-2xl text-foreground">Quiet for now</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              When friends light a paw lamp, leave a message, or follow you, their kindness will land here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {items.map((n: any) => {
              const Icon = ICONS[n.type] ?? Bell;
              const verb = VERBS[n.type] ?? "interacted";
              const actor = n.actor_name || "Someone";
              const slug = n.memorial?.slug;
              const petName = n.memorial?.pet_name;
              const content = (
                <div className={`flex gap-3 px-5 py-4 transition ${n.read_at ? "" : "bg-amber-400/5"} hover:bg-cream/40`}>
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--cta)]/10 text-[var(--cta)]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-foreground">
                      <span className="font-medium">{actor}</span>{" "}
                      <span className="text-muted-foreground">{verb}</span>
                      {petName && (
                        <>
                          {" "}on <span className="font-medium">{petName}</span>
                        </>
                      )}
                    </div>
                    {n.preview && (
                      <div className="mt-0.5 truncate text-xs italic text-muted-foreground">
                        "{n.preview}"
                      </div>
                    )}
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </div>
                  </div>
                  {!n.read_at && (
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--cta)]" />
                  )}
                </div>
              );
              return (
                <li key={n.id}>
                  {slug ? (
                    <Link to="/memorial/$slug" params={{ slug }}>
                      {content}
                    </Link>
                  ) : (
                    content
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
