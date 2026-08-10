import { Link, useRouter, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useIsAdmin } from "@/hooks/use-admin";
import { ChevronLeft, LogOut, ShoppingBag, Menu, Home, Flower2, Users, BookOpen, PlusCircle, Feather, User as UserIcon, Settings, HeartHandshake, Info, HandHeart, Stethoscope, LifeBuoy, ShieldCheck, Download, MessageSquare } from "lucide-react";
import logo from "@/assets/logo.png";
import { NotificationBell } from "@/components/site/NotificationBell";
import { FeedbackDialog } from "@/components/site/FeedbackDialog";
import { InstallAppDialog } from "@/components/site/InstallAppDialog";
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
  const isAdmin = useIsAdmin();
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

  const desktopNav: { to: string; label: string }[] = [
    { to: "/", label: "Home" },
    { to: "/garden", label: "Garden" },
    { to: "/community", label: "Feed" },
    { to: "/marketplace", label: "Shop" },
  ];

  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(to + "/");

  return (
    <header
      className="sticky top-0 z-40 glass-strong"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      {/* Mobile header */}
      <div className="mx-auto flex h-[54px] max-w-md items-center justify-between gap-2 px-5 md:hidden">
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
          <Link to="/" className="brand-wordmark">rememfur</Link>
          <span className="hidden text-[9px] font-semibold uppercase tracking-[0.18em] text-white/40 xs:inline sm:inline">BETA</span>
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
              className="rounded-full px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/10 hover:text-white"
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
              className="flex w-[86vw] max-w-sm flex-col overflow-y-auto overscroll-contain border-l border-white/10 text-white"
              style={{
                paddingTop: "calc(env(safe-area-inset-top) + 1.5rem)",
                paddingBottom: "calc(env(safe-area-inset-bottom) + 6rem)",
                background: "linear-gradient(180deg,#0B1122,#080d1f)",
              }}
            >
              <SheetHeader className="text-left">
                <SheetTitle className="brand-wordmark text-2xl text-white">rememfur</SheetTitle>
                <p className="font-hand text-lg text-[#E8B96D]/80">a sanctuary, always open</p>
              </SheetHeader>

              <nav className="mt-6 space-y-1">
                {navItems.map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-base text-white/85 hover:bg-white/5"
                  >
                    <Icon className="h-5 w-5 text-[#E8B96D]" />
                    {label}
                  </Link>
                ))}
              </nav>

              {authItems.length > 0 && (
                <>
                  <div className="my-4 h-px bg-white/10" />
                  <nav className="space-y-1">
                    {authItems.map(({ to, label, icon: Icon }) => (
                      <a
                        key={to}
                        href={to}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-base text-white/85 hover:bg-white/5"
                      >
                        <Icon className="h-5 w-5 text-[#E8B96D]" />
                        {label}
                      </a>
                    ))}
                    {isAdmin && (
                      <a
                        href="/admin"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-base text-white/85 hover:bg-white/5"
                      >
                        <ShieldCheck className="h-5 w-5 text-[#E8B96D]" />
                        Admin · Moderation
                      </a>
                    )}
                  </nav>
                </>
              )}

              <div className="my-4 h-px bg-white/10" />
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => { setOpen(false); window.dispatchEvent(new CustomEvent("rememfur:open-install")); }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-base text-white/85 hover:bg-white/5"
                >
                  <Download className="h-5 w-5 text-[#E8B96D]" />
                  Add Rememfur to your home screen
                </button>
                <FeedbackDialog
                  trigger={
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-base text-white/85 hover:bg-white/5"
                    >
                      <MessageSquare className="h-5 w-5 text-[#E8B96D]" />
                      Share feedback
                    </button>
                  }
                />
              </div>

              {!user && (
                <div className="mt-4 grid gap-2">
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/85 hover:bg-white/10"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setOpen(false)}
                    className="btn-gold-sm w-full"
                  >
                    Create a free account
                  </Link>
                </div>
              )}

              <div className="mt-6 rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10">
                <p className="font-hand text-lg text-white/80">
                  "Grief is love with nowhere to go. Here, it has somewhere to go."
                </p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop header */}
      <div className="mx-auto hidden h-16 max-w-[1200px] items-center justify-between gap-4 px-6 md:flex lg:gap-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="" width={28} height={28} className="h-7 w-7 opacity-90" />
          <span className="brand-wordmark text-xl">rememfur</span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">BETA</span>
        </Link>

        <nav className="flex items-center gap-1">
          {desktopNav.map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`rounded-full px-2.5 py-1.5 text-sm transition lg:px-3.5 ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5 md:gap-2">
          <Link
            to={user ? "/create" : "/signup"}
            search={user ? undefined : ({ redirect: "/create" } as never)}
            className="btn-gold-sm ios-tappable hidden whitespace-nowrap md:inline-flex"
          >
            <Feather className="h-4 w-4" strokeWidth={2} />
            <span>Write a memorial</span>
          </Link>
          <NotificationBell />
          {user ? (
            <button
              onClick={() => signOut()}
              aria-label="Sign out"
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-full px-3 py-1.5 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white"
            >
              Log in
            </Link>
          )}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                aria-label="Open menu"
                className="flex h-9 w-9 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex w-[380px] max-w-sm flex-col overflow-y-auto overscroll-contain border-l border-white/10 text-white"
              style={{ paddingTop: "1.5rem", paddingBottom: "2rem", background: "linear-gradient(180deg,#0B1122,#080d1f)" }}
            >
              <SheetHeader className="text-left">
                <SheetTitle className="brand-wordmark text-2xl text-white">rememfur</SheetTitle>
                <p className="font-hand text-lg text-[#E8B96D]/80">a sanctuary, always open</p>
              </SheetHeader>
              <nav className="mt-6 space-y-1">
                {navItems.map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-base text-white/85 hover:bg-white/5"
                  >
                    <Icon className="h-5 w-5 text-[#E8B96D]" />
                    {label}
                  </Link>
                ))}
              </nav>
              {authItems.length > 0 && (
                <>
                  <div className="my-4 h-px bg-white/10" />
                  <nav className="space-y-1">
                    {authItems.map(({ to, label, icon: Icon }) => (
                      <a
                        key={to}
                        href={to}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-base text-white/85 hover:bg-white/5"
                      >
                        <Icon className="h-5 w-5 text-[#E8B96D]" />
                        {label}
                      </a>
                    ))}
                    {isAdmin && (
                      <a
                        href="/admin"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-base text-white/85 hover:bg-white/5"
                      >
                        <ShieldCheck className="h-5 w-5 text-[#E8B96D]" />
                        Admin · Moderation
                      </a>
                    )}
                  </nav>
                </>
              )}
              <div className="my-4 h-px bg-white/10" />
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => { setOpen(false); window.dispatchEvent(new CustomEvent("rememfur:open-install")); }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-base text-white/85 hover:bg-white/5"
                >
                  <Download className="h-5 w-5 text-[#E8B96D]" />
                  Add Rememfur to your home screen
                </button>
                <FeedbackDialog
                  trigger={
                    <button type="button" className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-base text-white/85 hover:bg-white/5">
                      <MessageSquare className="h-5 w-5 text-[#E8B96D]" />
                      Share feedback
                    </button>
                  }
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
