import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Home, Flower2, Heart, Users, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { PawIcon } from "@/components/site/PawIcon";

type Tab = { to: string; label: string; icon: any; match?: (p: string) => boolean };

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  return reduced;
}

function PawHeartMorph({ forceHeart }: { forceHeart?: boolean }) {
  const reduced = usePrefersReducedMotion();
  const [isHeart, setIsHeart] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setIsHeart((v) => !v), 4000);
    return () => window.clearInterval(id);
  }, [reduced]);

  const showHeart = forceHeart || (!reduced && isHeart);

  return (
    <span className="relative block h-8 w-8">
      <PawIcon
        className={`absolute inset-0 h-8 w-8 transition-all duration-[1400ms] ease-in-out ${
          showHeart ? "opacity-0 scale-90" : "opacity-100 scale-100"
        }`}
      />
      <Heart
        className={`absolute inset-0 h-8 w-8 transition-all duration-[1400ms] ease-in-out ${
          showHeart ? "opacity-100 scale-100" : "opacity-0 scale-90"
        }`}
        strokeWidth={2.25}
        fill="currentColor"
      />
    </span>
  );
}

export function MobileTabBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const reduced = usePrefersReducedMotion();
  const [tapHeart, setTapHeart] = useState(false);

  const createTo = user ? "/create" : "/signup";

  const tabs: Tab[] = [
    { to: "/", label: "Home", icon: Home, match: (p) => p === "/" },
    { to: "/garden", label: "Garden", icon: Flower2 },
    { to: createTo, label: "Create", icon: Home }, // placeholder, custom render below
    { to: "/community", label: "Feed", icon: Users },
    { to: "/marketplace", label: "Shop", icon: ShoppingBag },
  ];

  const handleCreateTap = (e: React.MouseEvent) => {
    e.preventDefault();
    setTapHeart(true);
    window.setTimeout(() => {
      navigate({ to: createTo });
    }, 220);
  };

  return (
    <nav
      aria-label="Primary"
      className="ios-tabbar fixed inset-x-0 bottom-0 z-50 md:hidden"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)", paddingTop: "8px", paddingLeft: "16px", paddingRight: "16px" }}
    >
      <ul className="ios-tabbar-inner mx-auto flex max-w-md items-stretch justify-between rounded-full px-2">
        {tabs.map(({ to, label, icon: Icon, match }) => {
          const active = match ? match(pathname) : pathname === to || pathname.startsWith(to + "/");
          const isCreate = label === "Create";
          const activeColor = active ? "text-[#6D3F62]" : "text-[#746865]";

          if (isCreate) {
            return (
              <li key={label} className="flex-1">
                <a
                  href={to}
                  onClick={handleCreateTap}
                  aria-label="Create a memorial"
                  className="ios-tappable relative flex flex-col items-center justify-center gap-1 pt-2 pb-1.5 text-[10px] font-medium tracking-tight"
                >
                  <span className="relative -mt-8 mb-0.5 flex h-16 w-16 items-center justify-center">
                    {!reduced && (
                      <span
                        aria-hidden
                        className="pointer-events-none absolute -inset-4 rounded-full"
                        style={{
                          background:
                            "radial-gradient(circle, rgba(255,246,224,0.55) 0%, rgba(255,238,200,0.28) 40%, transparent 72%)",
                          animation: "candle-halo 3s ease-in-out infinite",
                          filter: "blur(6px)",
                        }}
                      />
                    )}
                    <span
                      className="relative flex h-16 w-16 items-center justify-center rounded-full text-[#fffaf6] ring-1 ring-[#6D3F62]/20"
                      style={{
                        background:
                          "linear-gradient(145deg, #7A496F, #603555)",
                        boxShadow:
                          "0 10px 30px -12px rgba(109,63,98,0.65), inset 0 1px 0 rgba(255,255,255,0.2)",
                        backdropFilter: "blur(14px)",
                        WebkitBackdropFilter: "blur(14px)",
                      }}
                    >
                      <PawHeartMorph forceHeart={tapHeart} />
                    </span>
                  </span>
                  <span className={`uppercase tracking-[0.18em] text-[9px] ${activeColor}`}>{label}</span>
                </a>
              </li>
            );
          }

          return (
            <li key={label} className="flex-1">
              <Link
                to={to}
                aria-label={label}
                className={`ios-tappable flex flex-col items-center justify-center gap-1 pt-2 pb-1.5 text-[10px] font-medium tracking-tight transition-colors ${activeColor}`}
              >
                <Icon className="h-[26px] w-[26px]" strokeWidth={active ? 2.25 : 1.8} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
