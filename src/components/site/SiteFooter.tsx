import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-cream/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="font-display text-2xl text-foreground">Rememfur</div>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            A gentle place to honor, remember, and celebrate the bond you shared.
          </p>
        </div>
        <div>
          <div className="text-sm font-medium text-foreground">Explore</div>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/garden" className="hover:text-foreground">Memorial Garden</Link></li>
            <li><Link to="/about" className="hover:text-foreground">About</Link></li>
            <li><Link to="/resources" className="hover:text-foreground">Grief resources</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-medium text-foreground">Get started</div>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/signup" className="hover:text-foreground">Create a memorial</Link></li>
            <li><Link to="/login" className="hover:text-foreground">Sign in</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        Made with care · Love leaves paw prints on the heart
      </div>
    </footer>
  );
}
