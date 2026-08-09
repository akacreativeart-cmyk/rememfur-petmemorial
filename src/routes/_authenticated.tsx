import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site/SiteHeader";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      throw redirect({ to: "/login", search: { redirect: location.href } as never });
    }
  },
  // Never leave a blank screen while the session is being checked.
  pendingMs: 0,
  pendingComponent: AuthenticatedPending,
  component: AuthenticatedLayout,
});

function AuthenticatedPending() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background paper-grain">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
        <span className="text-[11px] uppercase tracking-[0.22em]">Opening your space…</span>
      </div>
    </div>
  );
}

function AuthenticatedLayout() {
  return (
    <div className="min-h-screen bg-background paper-grain">
      <SiteHeader />
      <main className="mx-auto max-w-md px-4 py-6 md:max-w-3xl md:px-8 md:py-10">
        <Outlet />
      </main>
    </div>
  );
}
