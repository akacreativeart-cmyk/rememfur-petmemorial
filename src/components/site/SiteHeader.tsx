import { Link, useRouter, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { ChevronLeft, LogOut, ShoppingBag } from "lucide-react";
import logo from "@/assets/logo.png";

export function SiteHeader() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  return (
    <header
      className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto flex h-14 max-w-md items-center justify-between gap-2 px-4">
        <div className="flex min-w-0 items-center gap-2">
          {!isHome ? (
            <button
              type="button"
              onClick={() => router.history.back()}
              aria-label="Back"
              className="-ml-1 flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          ) : (
            <img src={logo} alt="" width={28} height={28} className="h-7 w-7" />
          )}
          <Link to="/" className="font-display text-lg tracking-tight text-foreground">
            Rememfur
          </Link>
        </div>
        <div className="flex items-center gap-1">
          <Link
            to="/marketplace"
            aria-label="Marketplace"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <ShoppingBag className="h-4 w-4" />
          </Link>
          {user ? (
            <button
              onClick={() => signOut()}
              aria-label="Sign out"
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
            >
              <LogOut className="h-4 w-4" />
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-full px-3 py-1.5 text-xs font-medium text-sage-deep hover:bg-sage/10"
            >
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
