import { Link, useLocation } from "@tanstack/react-router";
import { Home, Flower2, PlusCircle, Users, User as UserIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

type Tab = { to: string; label: string; icon: any; match?: (p: string) => boolean };

export function MobileTabBar() {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const tabs: Tab[] = [
    { to: "/", label: "Home", icon: Home, match: (p) => p === "/" },
    { to: "/garden", label: "Garden", icon: Flower2 },
    { to: user ? "/create" : "/signup", label: "Create", icon: PlusCircle },
    { to: "/community", label: "Feed", icon: Users },
    { to: user ? "/dashboard" : "/login", label: user ? "Me" : "Sign in", icon: UserIcon },
  ];

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-3 bottom-3 z-50 glass-strong rounded-full"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {tabs.map(({ to, label, icon: Icon, match }) => {
          const active = match ? match(pathname) : pathname === to || pathname.startsWith(to + "/");
          const isCreate = label === "Create";
          return (
            <li key={label} className="flex-1">
              <Link
                to={to}
                className={`flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] tracking-wide transition ${
                  active ? "text-sage-deep" : "text-muted-foreground"
                }`}
              >
                {isCreate ? (
                  <span className="-mt-5 mb-0.5 flex h-12 w-12 items-center justify-center rounded-full bg-sage-deep text-primary-foreground soft-shadow">
                    <Icon className="h-6 w-6" />
                  </span>
                ) : (
                  <Icon className={`h-5 w-5 ${active ? "fill-sage/20" : ""}`} />
                )}
                <span className={active ? "font-medium" : ""}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
