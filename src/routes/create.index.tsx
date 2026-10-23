import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Heart, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/create/")({
  validateSearch: (s: Record<string, unknown>): { type?: string } => {
    const t = typeof s.type === "string" ? s.type : undefined;
    return t ? { type: t } : {};
  },

  beforeLoad: ({ search }) => {
    if (search.type === "memorial") throw redirect({ to: "/create/memorial" });
    if (search.type === "post") throw redirect({ to: "/create/post" });
  },
  component: CreateChooser,
  head: () => ({
    meta: [
      { title: "Create — Rememfur" },
      { name: "description", content: "Write a memorial for a pet you loved, or share a memory with the community." },
    ],
  }),
});

function CreateChooser() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14 md:py-20">
      <div className="text-center">
        <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">Create</p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-foreground md:text-5xl">
          What do you want to share?
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground md:text-base">
          A quiet place for their memorial, or a moment for the community — both matter.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <Link
          to="/create/memorial"
          className="group flex flex-col rounded-3xl border border-amber-400/30 bg-gradient-to-br from-amber-400/10 via-transparent to-transparent p-7 transition hover:border-amber-400/60 hover:bg-amber-400/10"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-200 ring-1 ring-amber-400/30">
            <Heart className="h-5 w-5" />
          </div>
          <h2 className="mt-5 font-display text-2xl text-foreground">Write a memorial</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Photo, story, the small things. A page that stays — for the pet you loved, and for the people who loved them too.
          </p>
          <span className="mt-6 text-sm font-medium text-amber-200 group-hover:text-amber-100">
            Begin their memorial →
          </span>
        </Link>

        <Link
          to="/create/post"
          className="group flex flex-col rounded-3xl border border-border/60 bg-card p-7 transition hover:border-sage/50 hover:bg-card/80"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sage/15 text-sage-deep ring-1 ring-sage/30">
            <MessageSquare className="h-5 w-5" />
          </div>
          <h2 className="mt-5 font-display text-2xl text-foreground">Post to the community</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            A memory, a question, a photo, a hard day. Share it with people who understand — no performance, no pressure.
          </p>
          <span className="mt-6 text-sm font-medium text-sage-deep group-hover:text-sage">
            Write a post →
          </span>
        </Link>
      </div>
    </div>
  );
}
