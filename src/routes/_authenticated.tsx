import { createFileRoute, Outlet, redirect, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { LayoutDashboard, Sparkles, BookOpen, Heart } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      throw redirect({ to: "/login", search: { redirect: location.href } as never });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <div className="min-h-screen bg-background paper-grain">
      <SiteHeader />
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 md:grid-cols-[220px_1fr]">
        <aside className="md:sticky md:top-24 md:self-start">
          <nav className="space-y-1 rounded-2xl border border-border/60 bg-card p-3 soft-shadow">
            <SideLink to="/dashboard" icon={LayoutDashboard} label="My memorials" />
            <SideLink to="/create" icon={Sparkles} label="Create memorial" />
            <SideLink to="/journal" icon={BookOpen} label="Memory journal" />
            <SideLink to="/garden" icon={Heart} label="Memorial Garden" />
          </nav>
        </aside>
        <main>
          <Outlet />
        </main>
      </div>
      <SiteFooter />
    </div>
  );
}

function SideLink({ to, icon: Icon, label }: { to: string; icon: any; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
      activeProps={{ className: "bg-sage/15 text-sage-deep" }}
    >
      <Icon className="h-4 w-4" /> {label}
    </Link>
  );
}
