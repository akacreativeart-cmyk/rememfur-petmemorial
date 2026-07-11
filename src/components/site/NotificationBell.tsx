import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Flame, MessageCircle, PawPrint, UserPlus, Mail } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/hooks/use-auth";
import {
  listNotifications,
  countUnreadNotifications,
  markAllNotificationsRead,
} from "@/lib/notifications.functions";
import { formatDistanceToNow } from "date-fns";

const ICONS: Record<string, any> = {
  candle: Flame,
  paw: PawPrint,
  comment: MessageCircle,
  message: Mail,
  follow: UserPlus,
};

const VERBS: Record<string, string> = {
  candle: "released a star",
  paw: "left a paw",
  comment: "commented",
  message: "wrote on the memorial",
  follow: "started following you",
};

export function NotificationBell() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const fetchCount = useServerFn(countUnreadNotifications);
  const fetchList = useServerFn(listNotifications);
  const markAll = useServerFn(markAllNotificationsRead);

  const { data: unread = 0 } = useQuery({
    queryKey: ["notif-count"],
    queryFn: () => fetchCount(),
    enabled: !!user,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  const { data: items = [] } = useQuery({
    queryKey: ["notif-list"],
    queryFn: () => fetchList(),
    enabled: !!user && open,
  });

  const markMutation = useMutation({
    mutationFn: () => markAll(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notif-count"] });
      qc.invalidateQueries({ queryKey: ["notif-list"] });
    },
  });

  if (!user) return null;

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o && unread > 0) markMutation.mutate();
      }}
    >
      <PopoverTrigger asChild>
        <button
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--cta)] px-1 text-[10px] font-semibold text-primary-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-[90vw] max-w-sm overflow-hidden p-0"
      >
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <div className="font-display text-lg text-foreground">Notifications</div>
          <span className="text-xs text-muted-foreground">{unread > 0 ? `${unread} new` : "All caught up"}</span>
        </div>
        <div className="max-h-[70vh] overflow-y-auto">
          {items.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              No notifications yet. When friends release a star or leave a paw,
              you'll find their love here.
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
                  <div className="flex gap-3 px-4 py-3 hover:bg-cream/40">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--cta)]/10 text-[var(--cta)]">
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
                      <Link
                        to="/memorial/$slug"
                        params={{ slug }}
                        onClick={() => setOpen(false)}
                      >
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
        <div className="border-t border-border/60 bg-cream/30 px-4 py-2 text-center">
          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            className="text-xs font-medium text-sage-deep hover:underline"
          >
            See all notifications →
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}

