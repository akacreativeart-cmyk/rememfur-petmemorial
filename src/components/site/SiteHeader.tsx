import { Link, useRouter, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { ChevronLeft, LogOut, ShoppingBag, Menu, Home, Flower2, Users, BookOpen, PlusCircle, User as UserIcon, Settings, HeartHandshake, Info, HandHeart, Stethoscope, LifeBuoy } from "lucide-react";
import logo from "@/assets/logo.png";
import { NotificationBell } from "@/components/site/NotificationBell";
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
    { to: "/grief-support", label: "Grief Support", icon: LifeBuoy },
    { to: "/adoption", label: "Adoption", icon: HandHeart },
    { to: "/medical", label: "Medical", icon: Stethoscope },
    { to: "/resources", label: "Grief Resources", icon: BookOpen },
    { to: "/about", label: "About", icon: Info },
  ];

  const authItems = user
    ? [
        { to: "/create", label: "Create memorial", icon: PlusCircle },
        { to: "/dashboard", label: "My dashboard", icon: UserIcon },
        { to: "/journal", label: "My journal", icon: HeartHandshake },
        { to: `/u/${user.id}`, label: "Profile", icon: UserIcon },
        { to: "/settings", label: "Settings", icon: Settings },
      ]
    : [];

  return (
    <header
      className="sticky top-0 z-40 glass-strong"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto flex h-[54px] max-w-md items-center justify-between gap-2 px-5">
        <div className="flex min-w-0 items-center gap-2">
          {!isHome ? (
            <button
              type="button"
              onClick={() => router.history.back()}
              aria-label="Back"
              className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-[var(--cr2)] hover:bg-white/[0.06]"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          ) : (
            <img src={logo} alt="" width={24} height={24} className="h-6 w-6 opacity-90" />
          )}
          <Link
            to="/"
            className="font-display text-[18px] font-semibold text-[var(--cr)]"
            style={{ fontVariant: "small-caps", letterSpacing: "0.12em" }}
          >
            rememfur
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
          <NotificationBell />

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
            <SheetContent
              side="right"
              className="flex w-[86vw] max-w-sm flex-col overflow-y-auto overscroll-contain paper-bg paper-grain border-l border-border/60 text-foreground"
              style={{
                paddingTop: "calc(env(safe-area-inset-top) + 1.5rem)",
                paddingBottom: "calc(env(safe-area-inset-bottom) + 6rem)",
              }}
            >
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
                      <a
                        key={to}
                        href={to}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-base text-foreground hover:bg-cream/70"
                      >
                        <Icon className="h-5 w-5 text-sage-deep" />
                        {label}
                      </a>
                    ))}
                  </nav>
                </>
              )}

              {!user && (
                <div className="mt-4 grid gap-2">
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center rounded-full border border-ink/15 bg-cream/80 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-cream"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center rounded-full bg-[var(--cta)] px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
                  >
                    Create a free account
                  </Link>
                </div>
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
