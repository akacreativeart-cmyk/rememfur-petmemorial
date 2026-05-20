import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

export function SiteHeader() {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="" width={32} height={32} className="h-8 w-8" />
          <span className="font-display text-xl text-foreground">Rememfur</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <Link to="/" className="hover:text-foreground" activeProps={{ className: "text-foreground" }}>Home</Link>
          <Link to="/community" className="hover:text-foreground" activeProps={{ className: "text-foreground" }}>Community</Link>
          <Link to="/garden" className="hover:text-foreground" activeProps={{ className: "text-foreground" }}>Memorial Garden</Link>
          <Link to="/about" className="hover:text-foreground" activeProps={{ className: "text-foreground" }}>About</Link>
          <Link to="/resources" className="hover:text-foreground" activeProps={{ className: "text-foreground" }}>Resources</Link>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">My memorials</Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => signOut()}>Sign out</Button>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden sm:block">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="bg-sage-deep text-primary-foreground hover:bg-sage-deep/90">
                  Join for free
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
