export function PostSkeleton() {
  return (
    <article className="overflow-hidden rounded-2xl border border-border/60 bg-card soft-shadow animate-pulse">
      <header className="flex items-center gap-3 px-4 py-3">
        <div className="h-10 w-10 rounded-full bg-muted" />
        <div className="space-y-2">
          <div className="h-3 w-24 rounded bg-muted" />
          <div className="h-2 w-16 rounded bg-muted" />
        </div>
      </header>
      <div className="aspect-square w-full bg-muted" />
      <div className="space-y-2 px-4 py-3">
        <div className="h-3 w-3/4 rounded bg-muted" />
        <div className="h-3 w-1/2 rounded bg-muted" />
        <div className="flex gap-2 pt-2">
          <div className="h-8 w-20 rounded-full bg-muted" />
          <div className="h-8 w-20 rounded-full bg-muted" />
        </div>
      </div>
    </article>
  );
}
