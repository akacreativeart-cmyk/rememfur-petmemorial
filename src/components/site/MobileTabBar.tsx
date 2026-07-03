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
      className="ios-tabbar fixed inset-x-0 bottom-0 z-50 px-3 md:hidden"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 10px)", paddingTop: "8px" }}
    >
      <ul className="ios-tabbar-inner mx-auto flex max-w-md items-stretch justify-between px-2">

        {tabs.map(({ to, label, icon: Icon, match }) => {
          const active = match ? match(pathname) : pathname === to || pathname.startsWith(to + "/");
          const isCreate = label === "Create";
          return (
            <li key={label} className="flex-1">
              <Link
                to={to}
                aria-label={label}
                className={`ios-tappable flex flex-col items-center justify-center gap-1 pt-2 pb-1.5 text-[10px] font-medium tracking-tight transition-colors ${
                  isCreate ? "text-amber-300" : active ? "text-white" : "text-neutral-400"
                }`}
              >
                {isCreate ? (
                  <span
                    className="-mt-8 mb-0.5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-b from-amber-300 to-amber-500 text-[#1a1200] ring-4 ring-[#05070f] shadow-[0_0_28px_-2px_rgba(251,191,36,0.75),0_10px_30px_-8px_rgba(251,191,36,0.55)]"
                  >
                    <Icon className="h-8 w-8" strokeWidth={2.25} />
                  </span>
                ) : (
                  <Icon
                    className="h-[26px] w-[26px]"
                    strokeWidth={active ? 2.25 : 1.8}
                  />
                )}
                <span className={isCreate ? "uppercase tracking-[0.18em] text-[9px]" : ""}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
