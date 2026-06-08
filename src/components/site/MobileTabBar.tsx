import { Link, useLocation } from "@tanstack/react-router";
import { Home, Flower2, PlusCircle, Users, ShoppingBag } from "lucide-react";
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
    { to: "/marketplace", label: "Shop", icon: ShoppingBag },
  ];

  return (
    <nav
      aria-label="Primary"
      className="ios-tabbar fixed inset-x-0 bottom-0 z-50"
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
                className={`ios-tappable flex flex-col items-center justify-center gap-1 pt-2 pb-1.5 text-[10px] font-medium tracking-tight transition-colors ${
                  active ? "text-[var(--cta)]" : "text-muted-foreground"
                }`}
              >
                {isCreate ? (
                  <span className="-mt-6 mb-0.5 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--cta)] text-[var(--cta-foreground)] shadow-[0_8px_20px_-6px_color-mix(in_oklab,var(--cta)_55%,transparent)]">
                    <Icon className="h-6 w-6" strokeWidth={2.25} />
                  </span>
                ) : (
                  <Icon
                    className="h-[26px] w-[26px]"
                    strokeWidth={active ? 2.25 : 1.8}
                  />
                )}
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
