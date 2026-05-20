import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mx-auto max-w-md px-5 pb-6 pt-10 text-center text-xs text-muted-foreground">
      <div className="font-display text-base text-foreground">Rememfur</div>
      <p className="mt-1">Love leaves paw prints on the heart.</p>
      <div className="mt-3 flex justify-center gap-4">
        <Link to="/about" className="hover:text-foreground">About</Link>
        <Link to="/resources" className="hover:text-foreground">Resources</Link>
        <Link to="/garden" className="hover:text-foreground">Garden</Link>
      </div>
    </footer>
  );
}
