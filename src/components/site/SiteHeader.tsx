import { Link, useRouter, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { ChevronLeft, LogOut, ShoppingBag, Menu, Home, Flower2, Users, BookOpen, PlusCircle, User as UserIcon, Settings, HeartHandshake, Info } from "lucide-react";
import logo from "@/assets/logo.png";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function SiteHeader() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const [open, setOpen] = useState(false);

  const navItems: { to: string; label: string; icon: any }[] = [
    { to: "/", label: "Home", icon: Home },
    { to: "/garden", label: "Memory Garden", icon: Flower2 },
    { to: "/community", label: "Community", icon: Users },
    { to: "/marketplace", label: "Marketplace", icon: ShoppingBag },
    { to: "/resources", label: "Grief Resources", icon: BookOpen },
    { to: "/about", label: "About", icon: Info },
  ];

  const authItems = user
    ? [
        { to: "/create", label: "Create memorial", icon: PlusCircle },
        { to: "/dashboard", label: "My dashboard", icon: UserIcon },
        { to: "/journal", label: "My journal", icon: HeartHandshake },
        { to: "/settings", label: "Settings", icon: Settings },
      ]
    : [];

  return (
    <header
      className="sticky top-3 z-40 mx-3 mt-3 glass-strong rounded-full"
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

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                aria-label="Open menu"
                className="flex h-9 w-9 items-center justify-center rounded-full text-foreground hover:bg-muted"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[86vw] max-w-sm paper-bg paper-grain border-l border-border/60">
              <SheetHeader className="text-left">
                <SheetTitle className="font-display text-2xl text-[var(--ink)]">
                  Rememfur
                </SheetTitle>
                <p className="font-hand text-lg text-[var(--terracotta)]">a sanctuary, always open</p>
              </SheetHeader>

              <nav className="mt-6 space-y-1">
                {navItems.map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-base text-foreground hover:bg-cream/70"
                  >
                    <Icon className="h-5 w-5 text-[var(--terracotta)]" />
                    {label}
                  </Link>
                ))}
              </nav>

              {authItems.length > 0 && (
                <>
                  <div className="my-4 h-px bg-border/60" />
                  <nav className="space-y-1">
                    {authItems.map(({ to, label, icon: Icon }) => (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-base text-foreground hover:bg-cream/70"
                      >
                        <Icon className="h-5 w-5 text-sage-deep" />
                        {label}
                      </Link>
                    ))}
                  </nav>
                </>
              )}

              <div className="mt-6 rounded-2xl bg-cream/60 p-4">
                <p className="font-hand text-lg text-[var(--ink)]">
                  "Grief is love with nowhere to go. Here, it has somewhere to go."
                </p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
